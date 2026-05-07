import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: "OPENAI_API_KEY is not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;

    const userClient = createClient(SUPABASE_URL, ANON, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userRes, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userRes?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = userRes.user.id;

    const { prompt: userPrompt } = await req.json();
    if (!userPrompt || typeof userPrompt !== "string" || userPrompt.trim().length < 3) {
      return new Response(JSON.stringify({ error: "Describe what poster you want" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    const { data: profile } = await admin
      .from("profiles")
      .select("store_name, whatsapp_number, accent_color")
      .eq("id", userId).maybeSingle();

    const accent = profile?.accent_color || "#F97316";
    const storeName = profile?.store_name || "";
    const phone = profile?.whatsapp_number?.trim() || "";

    const fullPrompt = [
      "Design a PREMIUM EDITORIAL ADVERTISING POSTER, 1:1 square, gallery-grade — must clearly read as a real ad, not just an illustration.",
      `User brief: ${userPrompt.trim()}`,
      "Compose like a high-end magazine ad: strong grid, intentional negative space, premium background (soft gradient, paper grain, or subtle solid). Clean modern sans-serif typography with TIGHT hierarchy. NO MISSPELLINGS, NO GIBBERISH letters.",
      `Use ${accent} as a tasteful brand accent (thin line, dot, chip, underline). Restrained palette. No clutter, no emojis, no fake badges or stars, no neon.`,
      "Render ALL of the following text elements crisply:",
      "1. TITLE (large, bold hero word/phrase that fits the brief).",
      "2. SUBTITLE / TAGLINE (one short punchy line, max 6 words, that you invent to fit the brief).",
      phone
        ? `3. CTA BUTTON (pill-shaped, ${accent} background, white text): "Order on WhatsApp" with "${phone}" beside or below it, plus a tiny WhatsApp glyph.`
        : `3. CTA BUTTON (pill-shaped, ${accent} background, white text): "Shop Now" or "Order Now".`,
      `4. ALWAYS visible bottom-corner mark: "Designed by Afristall" — small, refined, low-contrast but clearly readable. NEVER omit this.`,
      storeName ? `5. Small store name "${storeName}" near a corner.` : "",
      "Layout rule: clear focal hero, title + subtitle balanced with negative space, CTA button visibly tappable. Everything aligned to a grid.",
      "Strictly avoid: paragraphs, watermarks across artwork, decorative emojis, hashtags, lorem ipsum, broken letters, multiple CTAs.",
      "Final result must look like a high-end Apple / Nike / fashion-house advertisement.",
    ].filter(Boolean).join("\n");

    const openaiResp = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-image-2",
        prompt: fullPrompt,
        size: "1024x1024",
        quality: "medium",
        n: 1,
      }),
    });

    if (!openaiResp.ok) {
      const errText = await openaiResp.text();
      console.error("OpenAI error:", openaiResp.status, errText);
      let msg = "Image generation failed";
      if (openaiResp.status === 401) msg = "OpenAI API key is invalid";
      else if (openaiResp.status === 429) msg = "OpenAI is rate-limiting requests. Try again in a moment.";
      else if (errText.toLowerCase().includes("billing")) msg = "OpenAI billing limit reached.";
      else if (errText.toLowerCase().includes("verified")) msg = "Your OpenAI organization needs verification for gpt-image-2.";
      else if (errText.toLowerCase().includes("safety") || errText.toLowerCase().includes("policy")) msg = "OpenAI safety system blocked this. Try a different prompt.";
      return new Response(JSON.stringify({ error: msg, detail: errText }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const openaiJson = await openaiResp.json();
    const b64: string | undefined = openaiJson?.data?.[0]?.b64_json;
    if (!b64) {
      return new Response(JSON.stringify({ error: "No image returned" }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);

    const path = `${userId}/poster-${Date.now()}.png`;
    const { error: upErr } = await admin.storage
      .from("ad-images")
      .upload(path, bytes, { contentType: "image/png", upsert: true });
    if (upErr) {
      return new Response(JSON.stringify({ error: "Upload failed", detail: upErr.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data: pub } = admin.storage.from("ad-images").getPublicUrl(path);

    return new Response(JSON.stringify({ url: pub.publicUrl }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("design-poster-prompt error", e);
    return new Response(JSON.stringify({ error: e?.message || "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});