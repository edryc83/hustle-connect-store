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
    const enhancePrompt = mode === "product"
      ? "Transform this phone photo of a product into a stunning, professional studio product shot. Place the product on a clean, seamless light studio backdrop with beautiful soft studio lighting, gentle shadows, and a polished commercial look — like a high-end e-commerce or magazine product photo. Make it sharp, crisp, vibrant, and beautifully lit. Keep the product itself EXACTLY the same — same shape, same label, same colors, same text, same packaging, same proportions. Do not redesign the product, do not change the label, do not alter the logo or text. Only improve the lighting, background, sharpness, and overall photo quality. No added text, watermarks, badges, or borders."
      : "Transform this phone photo into a stunning, professional studio-quality photograph. Improve lighting, sharpness, clarity, and color so it looks like it was shot with a high-end camera in a beautiful studio. Clean up the background and remove distractions while keeping the subject and scene exactly as they are. Keep every person and object faithful to the original — same faces, same clothes, same poses, same items. No added text, watermarks, badges, or borders.";

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
