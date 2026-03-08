import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const BB_BASE = "https://api.bannerbear.com/v2";

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const BANNERBEAR_API_KEY = Deno.env.get("BANNERBEAR_API_KEY");
  if (!BANNERBEAR_API_KEY) {
    return new Response(JSON.stringify({ error: "BANNERBEAR_API_KEY not configured" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const bbHeaders = {
    "Authorization": `Bearer ${BANNERBEAR_API_KEY}`,
    "Content-Type": "application/json",
  };

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action"); // "create" or "poll"

    if (action === "poll") {
      const uid = url.searchParams.get("uid");
      if (!uid) {
        return new Response(JSON.stringify({ error: "Missing uid parameter" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const res = await fetch(`${BB_BASE}/images/${uid}`, { headers: { "Authorization": `Bearer ${BANNERBEAR_API_KEY}` } });
      const data = await res.json();
      if (!res.ok) {
        return new Response(JSON.stringify({ error: `Bannerbear poll error [${res.status}]`, details: data }), {
          status: res.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify(data), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Default: create image
    const body = await req.json();
    const res = await fetch(`${BB_BASE}/images`, {
      method: "POST",
      headers: bbHeaders,
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      return new Response(JSON.stringify({ error: `Bannerbear create error [${res.status}]`, details: data }), {
        status: res.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify(data), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
