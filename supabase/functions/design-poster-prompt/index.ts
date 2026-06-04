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

    const {
      prompt: userPrompt,
      inspiration,
      inspirationImage,
      themeColor,
      occasion,
      occasionVibe,
      headlineHint,
      extraCopy,
    } = await req.json();
    const isOccasion = !!occasion && typeof occasion === "string";
    if (!isOccasion && (!userPrompt || typeof userPrompt !== "string" || userPrompt.trim().length < 3)) {
      return new Response(JSON.stringify({ error: "Describe what poster you want" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    // Token gate
    const TOKENS_PER_DESIGN = 10;
    const { data: configRow } = await admin
      .from("app_config").select("value").eq("key", "tokens_enabled").maybeSingle();
    const tokensEnabled = configRow?.value === "true";
    let tokenDeducted = false;

    if (tokensEnabled) {
      const { error: deductErr } = await admin.rpc("deduct_tokens", {
        p_user_id: userId,
        p_amount: TOKENS_PER_DESIGN,
      });
      if (deductErr) {
        return new Response(JSON.stringify({ error: "insufficient_tokens" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      tokenDeducted = true;
    }

    const { data: profile } = await admin
      .from("profiles")
      .select("store_name, whatsapp_number, accent_color")
      .eq("id", userId).maybeSingle();

    const accent = (typeof themeColor === "string" && themeColor) || profile?.accent_color || "#F97316";
    const storeName = profile?.store_name || "";
    const phone = profile?.whatsapp_number?.trim() || "";

    // Pull a real product from the seller's shop so the model is ALWAYS holding
    // an actual store item (not an invented prop).
    const { data: productRows } = await admin
      .from("products")
      .select("id, name, image_url")
      .eq("user_id", userId)
      .not("image_url", "is", null)
      .order("created_at", { ascending: false })
      .limit(12);
    const productPool = (productRows || []).filter((p: any) => !!p.image_url);
    const chosenProduct = productPool.length
      ? productPool[Math.floor(Math.random() * productPool.length)]
      : null;

    // Slightly vary the person each time so posters don't feel identical,
    // while keeping the look on-brand.
    const PERSON_VARIANTS = [
      "warm-smiling young African woman, natural curly hair, soft minimal makeup, modern casual outfit",
      "joyful young African man, short fade haircut, neat beard, smart-casual outfit",
      "cheerful African woman in her late 20s, braided hair, elegant top, confident posture",
      "energetic African man in his 20s, low-cut hair, fitted tee, relaxed friendly stance",
      "radiant African woman, headwrap or scarf, bright genuine laugh, stylish modern look",
      "stylish young African man, glasses, crisp shirt, calm confident smile",
    ];
    const personDesc = PERSON_VARIANTS[Math.floor(Math.random() * PERSON_VARIANTS.length)];

    const fullPrompt = isOccasion ? [
      "Design a PREMIUM 'POSTER OF THE DAY' social media post, 1:1 square, gallery-grade.",
      `Occasion: ${occasion}.`,
      `Vibe: ${occasionVibe || "joyful, warm, premium"}.`,
      extraCopy ? `Extra copy/context to weave in: ${extraCopy}` : "",
      `MUST FEATURE a happy, jolly real-looking person — specifically: ${personDesc}. Warm friendly smile, African / global-south appeal, clearly visible in the composition. The person should radiate genuine joy and energy that fits the occasion.`,
      chosenProduct
        ? `THE PERSON MUST BE HOLDING / PRESENTING THIS EXACT PRODUCT FROM THE SHOP: "${chosenProduct.name}". A reference photo of this product is attached — reproduce it FAITHFULLY in their hands (same colors, same shape, same packaging, same label text). Do NOT invent a different product. The product should be clearly visible and well-lit.`
        : "The person should be holding a single tasteful product prop relevant to the occasion.",
      inspirationImage
        ? "The FIRST attached image is a STRICT STYLE & LAYOUT TEMPLATE. Match its EXACT composition, proportions, background treatment, color palette, typography hierarchy, headline placement and energy. Match the SAME number of text blocks and approximately the SAME word count per block, and the SAME relative size of every element. DO NOT copy any of the template's products, photos, logos, watermarks, brand names, phone numbers or text — only borrow the skeleton."
        : "",
      inspiration ? `Inspiration / style direction: ${inspiration}` : "",
      "Compose like a high-end magazine ad: strong grid, intentional negative space, premium background. Clean modern sans-serif typography with TIGHT hierarchy. NO MISSPELLINGS, NO GIBBERISH letters.",
      `Use ${accent} as a tasteful brand accent. Restrained palette. No clutter, no emojis, no fake badges or stars, no neon.`,
      "STRICT TEXT SCHEMA — every poster MUST contain exactly these four text blocks, in these exact sizes, no more no less, all spelled PERFECTLY:",
      `1. HEADLINE — the EXACT words "${headlineHint || occasion}" character-for-character. Largest text on the canvas. Bold sans-serif. Same size and same placement every time. Do NOT paraphrase, translate, add or remove words.`,
      "2. TAGLINE — exactly 4 words, punchy, lowercase or sentence-case, sits directly under the headline at ~30% of headline size. Same size every time.",
      phone
        ? `3. CTA BUTTON — ONE pill-shaped button, ${accent} background, crisp white text reading EXACTLY the 3 words "Order on WhatsApp" (no other wording), with "${phone}" as a small clean line directly beneath the pill. Tiny WhatsApp glyph inside the pill. Rounded-full corners. Same size every time. No duplicate buttons.`
        : `3. CTA BUTTON — ONE pill-shaped button, ${accent} background, crisp white text reading EXACTLY the 2 words "Order Now". Rounded-full corners. Same size every time. No duplicate buttons.`,
      `4. MANDATORY LOGO LOCKUP at the bottom: the EXACT phrase "Powered by Afristall" rendered in POPPINS BOLD (or visually identical geometric sans-serif at Bold weight ~700). The word "Afristall" MUST be the Afristall wordmark in Poppins Bold, the SAME size and SAME weight as "Powered by" (no size jump). The whole lockup should be SMALL and refined — about ~2.5-3% of canvas height — perfectly horizontal, perfectly centered along the bottom safe-zone, in pure high-contrast color (pure white on dark backgrounds, pure black on light backgrounds). It must read as a clean tasteful credit line — never script, never thin, never italic, never blurred, never omitted, never cropped, nothing overlapping it. Same size and same position every time.`,
      storeName ? `Optional small store name "${storeName}" tucked in a top corner — much smaller than the Powered by Afristall lockup.` : "",
      "Layout rule: clear focal hero (the joyful person + product), headline + tagline balanced with negative space, CTA button visibly tappable. Everything aligned to a grid.",
      "Strictly avoid: paragraphs, watermarks across artwork, decorative emojis, hashtags, lorem ipsum, broken letters, multiple CTAs, multiple people unless the template clearly shows a group.",
      "Final result must look like a high-end Apple / Nike / fashion-house 'day of the week' campaign post.",
    ].filter(Boolean).join("\n") : [
      "Design a PREMIUM EDITORIAL ADVERTISING POSTER, 1:1 square, gallery-grade — must clearly read as a real ad, not just an illustration.",
      `User brief: ${userPrompt.trim()}`,
      `If a person is depicted, they should be: ${personDesc}.`,
      chosenProduct
        ? `If a product is depicted, IT MUST BE THIS EXACT SHOP PRODUCT: "${chosenProduct.name}". A reference photo of this product is attached — reproduce it FAITHFULLY (same colors, shape, packaging, label). Do NOT invent a different product.`
        : "",
      inspirationImage
        ? "The FIRST attached image is a STRICT STYLE & LAYOUT TEMPLATE. Treat it as a PERFECT REPLICA target: match its EXACT composition, proportions, background, color palette, typography hierarchy, headline placement, accent shapes, CTA style and overall energy. Match the SAME number of text blocks and same relative sizes. DO NOT copy any of the template's products, photos, logos, watermarks, brand names, phone numbers or text — only borrow the skeleton."
        : "",
      inspiration ? `Inspiration / style direction: ${inspiration}` : "",
      "Compose like a high-end magazine ad: strong grid, intentional negative space, premium background (soft gradient, paper grain, or subtle solid). Clean modern sans-serif typography with TIGHT hierarchy. NO MISSPELLINGS, NO GIBBERISH letters.",
      `Use ${accent} as a tasteful brand accent (thin line, dot, chip, underline). Restrained palette. No clutter, no emojis, no fake badges or stars, no neon.`,
      "STRICT TEXT SCHEMA — every poster MUST contain exactly these four text blocks, in these exact sizes:",
      "1. TITLE — bold hero phrase of EXACTLY 3 words that fits the brief. Largest text on the canvas. Same size every time.",
      "2. TAGLINE — EXACTLY 4 words, sits under the title at ~30% of title size. Same size every time.",
      phone
        ? `3. CTA BUTTON — ONE pill-shaped button, ${accent} background, crisp white text reading EXACTLY the 3 words "Order on WhatsApp", with "${phone}" as a small clean line directly beneath the pill. Tiny WhatsApp glyph inside the pill, left of the text. Rounded-full corners. Same size every time. No duplicate buttons.`
        : `3. CTA BUTTON — ONE pill-shaped button, ${accent} background, crisp white text reading EXACTLY the 2 words "Order Now". Rounded-full corners. Same size every time. No duplicate buttons.`,
      `4. MANDATORY LOGO LOCKUP at the bottom: the EXACT phrase "Powered by Afristall" rendered in POPPINS BOLD (or visually identical geometric sans-serif at Bold weight ~700). The word "Afristall" MUST be the Afristall wordmark in Poppins Bold, the SAME size and SAME weight as "Powered by" (no size jump). The whole lockup should be SMALL and refined — about ~2.5-3% of canvas height — perfectly horizontal, perfectly centered along the bottom safe-zone, in pure high-contrast color (white on dark, black on light). It must read as a clean tasteful credit line — never script, never thin, never italic, never blurred, never omitted, never cropped, nothing overlapping it. Same size and position every time.`,
      storeName ? `Optional small store name "${storeName}" tucked in a top corner — much smaller than the Powered by Afristall lockup.` : "",
      "Layout rule: clear focal hero, title + subtitle balanced with negative space, CTA button visibly tappable. Everything aligned to a grid.",
      "Strictly avoid: paragraphs, watermarks across artwork, decorative emojis, hashtags, lorem ipsum, broken letters, multiple CTAs.",
      "Final result must look like a high-end Apple / Nike / fashion-house advertisement.",
    ].filter(Boolean).join("\n");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    const fetchAsFile = async (url: string, filename: string): Promise<File | null> => {
      try {
        const r = await fetch(url);
        if (!r.ok) return null;
        const buf = await r.arrayBuffer();
        const type = r.headers.get("content-type") || "image/jpeg";
        return new File([buf], filename, { type });
      } catch {
        return null;
      }
    };

    // Build the strict expected schema once so generator + validator agree.
    const expectedHeadline = isOccasion ? (headlineHint || occasion) : null;
    const expectedTagline = null; // exact tagline copy is generated by the model
    const expectedCta = phone ? "Order on WhatsApp" : "Order Now";
    const expectedLogo = "Powered by Afristall";

    const callOpenAI = async (): Promise<Response> => {
      if (refFiles.length > 0) {
        const form = new FormData();
        form.append("model", "gpt-image-2");
        form.append("prompt", fullPrompt);
        form.append("size", "1024x1024");
        form.append("quality", "medium");
        form.append("n", "1");
        for (const f of refFiles) form.append("image[]", f);
        return await fetch("https://api.openai.com/v1/images/edits", {
          method: "POST",
          headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
          body: form,
        });
      }
      return await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "gpt-image-2", prompt: fullPrompt, size: "1024x1024", quality: "medium", n: 1 }),
      });
    };

    /**
     * Use Lovable AI (vision) to read the rendered poster and structurally
     * verify the four required text blocks are present, correctly spelled,
     * and inside their safe zones.
     */
    const validatePoster = async (
      imageB64: string,
    ): Promise<{ ok: boolean; reasons: string[] }> => {
      if (!LOVABLE_API_KEY) {
        // No validator available — accept silently.
        return { ok: true, reasons: [] };
      }
      try {
        const validatorPrompt = [
          "You are a strict QA reviewer for a generated 1:1 poster image.",
          "Read every visible text element on the poster, then judge whether it satisfies the schema below. Be conservative — if a block is missing, misspelled, cropped, illegible, or in the wrong position, mark it failed.",
          "Required schema:",
          expectedHeadline
            ? `1. HEADLINE: must read EXACTLY "${expectedHeadline}" (case-insensitive match), placed in the upper portion of the canvas, must be the dominant text on the poster.`
            : `1. HEADLINE/TITLE: a bold hero phrase of about 3 words placed in the upper portion of the canvas, must be the dominant text on the poster.`,
          "2. TAGLINE: a single short line (~3-6 words) immediately below the headline, clearly smaller than the headline.",
          `3. CTA BUTTON: ONE pill-shaped button containing EXACTLY the words "${expectedCta}" (case-insensitive, no extra/missing words), positioned in the lower-middle area of the canvas.`,
          phone
            ? `   3b. The phone number "${phone}" appears as a small line directly beneath the CTA pill.`
            : "",
          `4. LOGO LOCKUP: the EXACT three words "${expectedLogo}" appear along the BOTTOM of the canvas in Poppins Bold (or visually identical geometric sans-serif Bold), small and refined (~2.5-3% of canvas height), with "Powered by" and "Afristall" at the SAME size and SAME weight, perfectly horizontal, centered, not cropped, not in script, nothing overlapping it.`,
          "Also check that no required block is overlapped by photography, that none is cropped at any edge, and that there are NO duplicate CTAs or duplicate logos.",
          "Return your verdict via the report_validation tool only.",
        ].filter(Boolean).join("\n");

        const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [
              {
                role: "user",
                content: [
                  { type: "text", text: validatorPrompt },
                  { type: "image_url", image_url: { url: `data:image/png;base64,${imageB64}` } },
                ],
              },
            ],
            tools: [
              {
                type: "function",
                function: {
                  name: "report_validation",
                  description: "Report whether the poster passes the strict text/safe-zone schema.",
                  parameters: {
                    type: "object",
                    properties: {
                      headline_ok: { type: "boolean" },
                      tagline_ok: { type: "boolean" },
                      cta_ok: { type: "boolean" },
                      logo_ok: { type: "boolean" },
                      safe_zones_ok: { type: "boolean", description: "True if no required block is cropped or overlapped." },
                      no_duplicates: { type: "boolean", description: "True if there are no duplicate CTAs or logos." },
                      issues: {
                        type: "array",
                        items: { type: "string" },
                        description: "Short human-readable list of any problems found.",
                      },
                    },
                    required: ["headline_ok", "tagline_ok", "cta_ok", "logo_ok", "safe_zones_ok", "no_duplicates", "issues"],
                    additionalProperties: false,
                  },
                },
              },
            ],
            tool_choice: { type: "function", function: { name: "report_validation" } },
          }),
        });
        if (!resp.ok) {
          console.warn("validator non-OK:", resp.status, await resp.text().catch(() => ""));
          return { ok: true, reasons: [] }; // fail open
        }
        const j = await resp.json();
        const args = j?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
        if (!args) return { ok: true, reasons: [] };
        const parsed = typeof args === "string" ? JSON.parse(args) : args;
        const ok =
          !!parsed.headline_ok &&
          !!parsed.tagline_ok &&
          !!parsed.cta_ok &&
          !!parsed.logo_ok &&
          !!parsed.safe_zones_ok &&
          !!parsed.no_duplicates;
        return { ok, reasons: Array.isArray(parsed.issues) ? parsed.issues : [] };
      } catch (e) {
        console.warn("validator error:", e);
        return { ok: true, reasons: [] }; // fail open
      }
    };

    let openaiResp: Response;
    const refFiles: File[] = [];
    if (inspirationImage && typeof inspirationImage === "string") {
      const f = await fetchAsFile(inspirationImage, "inspiration.jpg");
      if (f) refFiles.push(f);
    }
    if (chosenProduct?.image_url) {
      const f = await fetchAsFile(chosenProduct.image_url, "product.jpg");
      if (f) refFiles.push(f);
    }

    // Generate + validate, with up to 1 regeneration if validation fails.
    let b64: string | undefined;
    let validation: { ok: boolean; reasons: string[] } = { ok: true, reasons: [] };
    const MAX_ATTEMPTS = 2;
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      openaiResp = await callOpenAI();
      if (!openaiResp.ok) {
        const errText = await openaiResp.text();
        console.error("OpenAI error:", openaiResp.status, errText);
        if (tokenDeducted) await admin.rpc("credit_tokens", { p_user_id: userId, p_amount: TOKENS_PER_DESIGN });
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
      const candidate: string | undefined = openaiJson?.data?.[0]?.b64_json;
      if (!candidate) {
        if (tokenDeducted) await admin.rpc("credit_tokens", { p_user_id: userId, p_amount: TOKENS_PER_DESIGN });
        return new Response(JSON.stringify({ error: "No image returned" }), {
          status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      b64 = candidate;
      validation = await validatePoster(candidate);
      console.log(`poster attempt ${attempt} validation:`, validation);
      if (validation.ok) break;
    }
    if (!b64) {
      if (tokenDeducted) await admin.rpc("credit_tokens", { p_user_id: userId, p_amount: TOKENS_PER_DESIGN });
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

    return new Response(JSON.stringify({
      url: pub.publicUrl,
      validation: { ok: validation.ok, issues: validation.reasons },
    }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("design-poster-prompt error", e);
    return new Response(JSON.stringify({ error: e?.message || "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});