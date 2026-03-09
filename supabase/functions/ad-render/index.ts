import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const API_KEY = Deno.env.get("AFRISTALL_API_KEY");
    if (!API_KEY) throw new Error("AFRISTALL_API_KEY not configured");

    const body = await req.json();

    const res = await fetch("https://afristall.up.railway.app/render", {
      method: "POST",
      headers: {
        "x-api-key": API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Render API error:", res.status, text);
      return new Response(JSON.stringify({ error: text || `Render error ${res.status}` }), {
        status: res.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const contentType = res.headers.get("content-type") || "";

    // If response is an image, upload to storage and return public URL
    if (contentType.includes("image")) {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      const buffer = await res.arrayBuffer();
      const path = `renders/${crypto.randomUUID()}.png`;
      const { error: uploadError } = await supabase.storage
        .from("ad-images")
        .upload(path, new Uint8Array(buffer), { contentType: "image/png", upsert: true });

      if (uploadError) {
        console.error("Storage upload error:", uploadError);
        throw new Error("Failed to store generated image");
      }

      const { data: urlData } = supabase.storage.from("ad-images").getPublicUrl(path);
      return new Response(JSON.stringify({ url: urlData.publicUrl }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // If JSON, pass through
    const data = await res.json();
    return new Response(JSON.stringify(data), {
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
