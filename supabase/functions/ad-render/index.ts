import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const BB_BASE = "https://api.bannerbear.com/v2";
const POLL_INTERVAL = 2000;
const MAX_POLLS = 30; // 60 seconds max

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const BANNERBEAR_API_KEY = Deno.env.get("BANNERBEAR_API_KEY");
    if (!BANNERBEAR_API_KEY) throw new Error("BANNERBEAR_API_KEY not configured");

    const bbHeaders = {
      "Authorization": `Bearer ${BANNERBEAR_API_KEY}`,
      "Content-Type": "application/json",
    };

    const body = await req.json();
    const { template_uid, modifications } = body;

    if (!template_uid || !modifications) {
      return new Response(JSON.stringify({ error: "Missing template_uid or modifications" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Bannerbear request:", JSON.stringify({ template: template_uid, modifications }, null, 2));

    // Step 1: Create image
    const createRes = await fetch(`${BB_BASE}/images`, {
      method: "POST",
      headers: bbHeaders,
      body: JSON.stringify({ template: template_uid, modifications }),
    });

    const createData = await createRes.json();
    console.log("Bannerbear create response:", JSON.stringify(createData, null, 2));
    if (!createRes.ok) {
      console.error("Bannerbear create error:", createData);
      return new Response(JSON.stringify({ error: createData?.message || `Create error ${createRes.status}` }), {
        status: createRes.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const imageUid = createData.uid;
    if (!imageUid) {
      return new Response(JSON.stringify({ error: "No image UID returned from Bannerbear" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Step 2: Poll until completed
    let finalData = createData;
    for (let i = 0; i < MAX_POLLS; i++) {
      if (finalData.status === "completed" && finalData.image_url) break;
      if (finalData.status === "failed") {
        return new Response(JSON.stringify({ error: "Bannerbear rendering failed" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      await new Promise((r) => setTimeout(r, POLL_INTERVAL));

      const pollRes = await fetch(`${BB_BASE}/images/${imageUid}`, {
        headers: { "Authorization": `Bearer ${BANNERBEAR_API_KEY}` },
      });
      finalData = await pollRes.json();
    }

    if (!finalData.image_url) {
      return new Response(JSON.stringify({ error: "Bannerbear timed out" }), {
        status: 504,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Step 3: Download and upload to our storage for permanence
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const imgRes = await fetch(finalData.image_url);
    const buffer = await imgRes.arrayBuffer();
    const path = `renders/${crypto.randomUUID()}.png`;
    const { error: uploadError } = await supabase.storage
      .from("ad-images")
      .upload(path, new Uint8Array(buffer), { contentType: "image/png", upsert: true });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      // Fall back to Bannerbear URL
      return new Response(JSON.stringify({ url: finalData.image_url }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: urlData } = supabase.storage.from("ad-images").getPublicUrl(path);
    return new Response(JSON.stringify({ url: urlData.publicUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ad-render error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
