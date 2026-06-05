import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TOKENS_PER_ENHANCE = 5;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  let tokenDeducted = false;
  let userId: string | null = null;
  let admin: ReturnType<typeof createClient> | null = null;

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY is not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userClient = createClient(SUPABASE_URL, ANON, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userRes, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userRes?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    userId = userRes.user.id;

    const { imageBase64, mimeType, mode } = await req.json();
    if (!imageBase64 || typeof imageBase64 !== "string") {
      return new Response(JSON.stringify({ error: "Missing imageBase64" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const inputType = (typeof mimeType === "string" && mimeType) || "image/jpeg";
    const dataUrl = imageBase64.startsWith("data:")
      ? imageBase64
      : `data:${inputType};base64,${imageBase64}`;

    admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    // Token gate (only when tokens enabled)
    const { data: configRow } = await admin
      .from("app_config").select("value").eq("key", "tokens_enabled").maybeSingle();
    const tokensEnabled = configRow?.value === "true";
    if (tokensEnabled) {
      const { error: deductErr } = await admin.rpc("deduct_tokens", {
        p_user_id: userId,
        p_amount: TOKENS_PER_ENHANCE,
      });
      if (deductErr) {
        return new Response(JSON.stringify({ error: "insufficient_tokens" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      tokenDeducted = true;
    }

    // Build the cleaning / enhancement prompt
    const enhancePrompt = [
      "TASK: High-end professional photo retouching. This is NOT image generation. Treat the input as a RAW phone photo being finished by a top commercial retoucher in Capture One + Photoshop. The goal is MAGAZINE / FLAGSHIP E-COMMERCE QUALITY output of the EXACT SAME scene — never a different photo.",
      mode === "product"
        ? "Goal: deliver a tack-sharp, studio-grade product photograph of the EXACT SAME physical object — full of fine detail, clean micro-contrast, balanced studio-style lighting, and a refined background — while keeping the subject 100% faithful to the input."
        : "Goal: deliver a tack-sharp, studio-grade photograph of the EXACT SAME scene — rich detail, clean lighting, refined background — while keeping every subject 100% faithful to the input.",
      "",
      "QUALITY BAR (push these to the maximum):",
      "- Resolution feel: ultra sharp, high micro-contrast, crisp edges, fine texture preserved (fabric weave, brushed metal, skin pores, leather grain, screen pixels).",
      "- Lighting: clean studio-style key + soft fill that REPLACES harsh phone-flash hot spots and muddy ambient light, but keeps the SAME overall light direction so the subject still looks like itself. Gentle, believable highlights and shadow roll-off. No flat, washed-out look.",
      "- Color: accurate white balance, natural skin tones, true brand colors, deep but not crushed blacks, clean whites. Wide tonal range. No oversaturation, no Instagram filter look, no color shifts.",
      "- Background: keep the SAME background, but make it look intentional — denoise it, smooth distracting texture, gently blur clutter, deepen/clean the tone. Only when the original background is truly unusable, replace it with a simple seamless studio backdrop that matches the existing tone; never invent a new environment.",
      "- Output should be indistinguishable from a high-end commercial product shoot in sharpness, lighting, and finish.",
      "",
      "ABSOLUTE RULES — DO NOT BREAK:",
      "1. DO NOT change, replace, redraw, restyle, or 'idealize' the subject. The product/object/person in the output MUST be pixel-faithful to the input: same exact model, same exact color shade, same exact shape, same exact size, same exact angle, same exact position, same exact reflections, same exact imperfections in shape.",
      "2. DO NOT swap the product for a stock / marketing / render / press version of itself. If the input is a real used iPhone held in a hand, the output must still be THAT real used iPhone in THAT hand — not a clean press-render of an iPhone on a grey backdrop.",
      "3. DO NOT remove, add, move, or re-pose objects, hands, fingers, supporting surfaces, or held items. Keep composition, framing, crop, camera angle, perspective, and zoom IDENTICAL.",
      "4. DO NOT change brand colors, logos, text, labels, packaging, buttons, ports, camera lens layout, screen content, or any physical detail of the product.",
      "5. DO NOT smooth away real product features, real wear, real scratches, real wrinkles, or real skin/material texture. Only remove dust, lint, sensor spots, and noise.",
      "6. If you cannot raise quality without changing the subject, prefer faithfulness. Faithfulness beats prettiness.",
      "",
      "OUTPUT: a single, maximum-quality retouched photograph of the exact same scene. No added text, logos, badges, borders, frames, watermarks, or signatures. It must look like the user's own photo, shot in a professional studio with pro lighting and a pro camera — not a different photo.",
    ].join("\n");

    // Call Lovable AI Gateway with Gemini image-edit model
    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-pro-image-preview",
        modalities: ["image", "text"],
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: enhancePrompt },
              { type: "image_url", image_url: { url: dataUrl } },
            ],
          },
        ],
      }),
    });

    if (!aiResp.ok) {
      const errText = await aiResp.text();
      console.error("AI gateway error:", aiResp.status, errText);
      if (aiResp.status === 429) throw new Error("Too many requests, please try again in a moment");
      if (aiResp.status === 402) throw new Error("AI credits exhausted, please try again later");
      throw new Error(`Photo enhancement failed (${aiResp.status})`);
    }

    const aiData = await aiResp.json();
    const message = aiData.choices?.[0]?.message;
    const resultImageUrl: string | null =
      message?.images?.[0]?.image_url?.url
      || (Array.isArray(message?.content)
        ? message.content.find((p: any) => p?.type === "image_url" && p?.image_url?.url)?.image_url?.url
        : null);

    if (!resultImageUrl) throw new Error("No image returned from AI model");

    const dataUrlMatch = resultImageUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
    if (!dataUrlMatch) throw new Error("AI returned an unsupported image format");
    const [, outType, b64] = dataUrlMatch;

    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);

    const ext = outType.includes("png") ? "png" : outType.includes("webp") ? "webp" : "jpg";
    const path = `enhanced/${userId}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
    const { error: upErr } = await admin.storage
      .from("ad-images")
      .upload(path, bytes, { contentType: outType, upsert: true });
    if (upErr) throw upErr;
    const { data: pub } = admin.storage.from("ad-images").getPublicUrl(path);

    return new Response(
      JSON.stringify({ url: pub.publicUrl, tokens_used: tokensEnabled ? TOKENS_PER_ENHANCE : 0 }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("enhance-photo error:", e);
    // Refund tokens if we deducted but failed downstream
    if (tokenDeducted && admin && userId) {
      try {
        await admin.rpc("credit_tokens", {
          p_user_id: userId,
          p_amount: TOKENS_PER_ENHANCE,
        });
      } catch (refundErr) {
        console.error("token refund failed:", refundErr);
      }
    }
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
