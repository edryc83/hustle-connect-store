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

    const { prompt: userPrompt, inspiration, inspirationImage, themeColor } = await req.json();
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

    const accent = (typeof themeColor === "string" && themeColor) || profile?.accent_color || "#F97316";
    const storeName = profile?.store_name || "";
    const phone = profile?.whatsapp_number?.trim() || "";

    const fullPrompt = [
      "Design a PREMIUM EDITORIAL ADVERTISING POSTER, 1:1 square, gallery-grade — must clearly read as a real ad, not just an illustration.",
      `User brief: ${userPrompt.trim()}`,
      inspirationImage
        ? "A reference image is attached as a STRICT STYLE & LAYOUT TEMPLATE. Treat it as a PERFECT REPLICA target: match its EXACT composition, proportions, background treatment, color palette, typography hierarchy, headline placement, accent shapes, CTA style and overall energy. CRITICALLY: match the SAME NUMBER OF TEXT BLOCKS and approximately the SAME WORD COUNT per block as the template (if the template headline is 3 words, yours must be ~3 words; same for subtitle, CTA, contact line). Match the SAME RELATIVE SIZE of every element. DO NOT copy any of the template's products, photos, logos, watermarks, brand names, phone numbers or text — invent fresh visuals that fit the user's brief while keeping the exact skeleton."
        : "",
      inspiration ? `Inspiration / style direction: ${inspiration}` : "",
      "Compose like a high-end magazine ad: strong grid, intentional negative space, premium background (soft gradient, paper grain, or subtle solid). Clean modern sans-serif typography with TIGHT hierarchy. NO MISSPELLINGS, NO GIBBERISH letters.",
      `Use ${accent} as a tasteful brand accent (thin line, dot, chip, underline). Restrained palette. No clutter, no emojis, no fake badges or stars, no neon.`,
      "Render ALL of the following text elements crisply:",
      "1. TITLE (large, bold hero word/phrase that fits the brief).",
      "2. SUBTITLE / TAGLINE (one short punchy line, max 6 words, that you invent to fit the brief).",
      phone
        ? `3. CTA BUTTON — ONE single clean pill-shaped button, ${accent} background, crisp white text reading EXACTLY "Order on WhatsApp", with "${phone}" as a small clean line directly beneath the pill. Tiny WhatsApp glyph inside the pill, left of the text. Rounded-full corners, generous padding, no gradients, no duplicate buttons.`
        : `3. CTA BUTTON — ONE single clean pill-shaped button, ${accent} background, crisp white text reading EXACTLY "Order Now". Rounded-full corners, generous padding, no gradients, no duplicate buttons.`,
      `4. MANDATORY VISIBLE SIGNATURE: render the exact text "Designed by Afristall" in a bottom corner (bottom-right preferred). Small but CLEARLY LEGIBLE at thumbnail size — minimum ~2.2% of canvas height, high enough contrast to read easily. Never omit, never crop, never blur.`,
      storeName ? `5. Small store name "${storeName}" near a corner.` : "",
      "Layout rule: clear focal hero, title + subtitle balanced with negative space, CTA button visibly tappable. Everything aligned to a grid.",
      "Strictly avoid: paragraphs, watermarks across artwork, decorative emojis, hashtags, lorem ipsum, broken letters, multiple CTAs.",
      "Final result must look like a high-end Apple / Nike / fashion-house advertisement.",
    ].filter(Boolean).join("\n");

    let openaiResp: Response;
    if (inspirationImage && typeof inspirationImage === "string") {
      // Use the edits endpoint with the inspiration image as a visual reference.
      try {
        const inspResp = await fetch(inspirationImage);
        if (!inspResp.ok) throw new Error(`inspiration fetch ${inspResp.status}`);
        const inspBuf = await inspResp.arrayBuffer();
        const inspType = inspResp.headers.get("content-type") || "image/jpeg";
        const inspFile = new File([inspBuf], "inspiration.jpg", { type: inspType });
        const form = new FormData();
        form.append("model", "gpt-image-2");
        form.append("prompt", fullPrompt);
        form.append("size", "1024x1024");
        form.append("quality", "medium");
        form.append("n", "1");
        form.append("image[]", inspFile);
        openaiResp = await fetch("https://api.openai.com/v1/images/edits", {
          method: "POST",
          headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
          body: form,
        });
      } catch (e) {
        console.warn("inspiration image unavailable, falling back to text-only:", e);
        openaiResp = await fetch("https://api.openai.com/v1/images/generations", {
          method: "POST",
          headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({ model: "gpt-image-2", prompt: fullPrompt, size: "1024x1024", quality: "medium", n: 1 }),
        });
      }
    } else {
      openaiResp = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "gpt-image-2", prompt: fullPrompt, size: "1024x1024", quality: "medium", n: 1 }),
      });
    }

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