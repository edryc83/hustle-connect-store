import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const slug = url.searchParams.get("slug");

    if (!slug) {
      return new Response(JSON.stringify({ error: "Missing slug" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: profile } = await supabase
      .from("profiles")
      .select("store_name, store_bio, profile_picture_url, category, city, country")
      .eq("store_slug", slug)
      .single();

    if (!profile) {
      return new Response(JSON.stringify({ error: "Store not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const title = `${profile.store_name || slug} — Shop on Afristall`;
    const description = profile.store_bio || 
      `Check out ${profile.store_name || slug}${profile.category ? ` for ${profile.category}` : ""}${profile.city ? ` in ${profile.city}` : ""}. Order directly on WhatsApp! 🛒`;
    const image = profile.profile_picture_url || "https://hustle-connect-store.lovable.app/logo-glow.png";

    return new Response(JSON.stringify({ title, description, image }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
