import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const BB_BASE = "https://api.bannerbear.com/v2";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const BANNERBEAR_API_KEY = Deno.env.get("BANNERBEAR_API_KEY");
    if (!BANNERBEAR_API_KEY) throw new Error("BANNERBEAR_API_KEY not configured");

    // Fetch all templates from Bannerbear
    const res = await fetch(`${BB_BASE}/templates`, {
      headers: { "Authorization": `Bearer ${BANNERBEAR_API_KEY}` },
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Bannerbear templates error:", res.status, text);
      return new Response(JSON.stringify({ error: `Bannerbear error: ${res.status}` }), {
        status: res.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const bbTemplates = await res.json();

    // Map Bannerbear templates to our format
    const templates = (Array.isArray(bbTemplates) ? bbTemplates : []).map((t: any) => {
      const layers = t.available_modifications || [];
      const imageSlots = layers.filter((l: any) => l.type === "image").length || 1;
      const textFields = layers
        .filter((l: any) => l.type === "text")
        .map((l: any) => l.name);

      return {
        id: t.uid,
        name: t.name || "Untitled",
        image_slots: imageSlots,
        thumbnail: t.preview_url || null,
        preview_url: t.preview_url || null,
        fields: textFields,
        layers, // pass full layer info for the frontend
      };
    });

    return new Response(JSON.stringify(templates), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ad-templates error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
