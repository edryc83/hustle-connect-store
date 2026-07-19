import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
const REPLICATE_API_KEY = Deno.env.get("REPLICATE_API_KEY")!;
const GW = "https://connector-gateway.lovable.dev/replicate/v1";
const TOKENS_PER_COMMERCIAL = 80; // 2-3 shots at 40 tokens each

const MODEL_OWNER = "kwaivgi";
const MODEL_NAME = "kling-v3-video";

// Creates one complete commercial in the video model. This replaces the old
// multi-shot + browser FFmpeg stitching flow, so low-end phones and blocked CDN
// requests no longer break the final edit.
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") || "";
    if (!authHeader) return json({ error: "unauthorized" }, 401);

    const supaAuth = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userRes } = await supaAuth.auth.getUser();
    const user = userRes?.user;
    if (!user) return json({ error: "unauthorized" }, 401);

    const { imageBase64, mimeType, templateId, shots, productName, productId, price, templateLabel, captions } = await req.json();
    if (!imageBase64 || !templateId || !Array.isArray(shots) || shots.length === 0) {
      return json({ error: "missing_input" }, 400);
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    const { data: tokenConfig } = await admin
      .from("app_config").select("value").eq("key", "tokens_enabled").maybeSingle();
    const tokensEnabled = String(tokenConfig?.value || "").trim().toLowerCase() === "true";
    const tokensCharged = tokensEnabled ? TOKENS_PER_COMMERCIAL : 0;

    if (tokensCharged > 0) {
      const { error: deductErr } = await admin.rpc("deduct_tokens", { p_user_id: user.id, p_amount: tokensCharged });
      if (deductErr) {
        return json({
          error: "insufficient_tokens",
          message: `You need ${TOKENS_PER_COMMERCIAL} tokens for a commercial.`,
          required: TOKENS_PER_COMMERCIAL,
        }, 402);
      }
    }

    const refund = async (reason: string) => {
      if (tokensCharged <= 0) return;
      await admin.rpc("credit_tokens", { p_user_id: user.id, p_amount: tokensCharged });
      await admin.from("token_transactions").insert({
        user_id: user.id, amount: tokensCharged, type: "refund", description: `commercial: ${reason}`,
      });
    };

    try {
      // Upload source image once, reuse URL across shots
      const bytes = Uint8Array.from(atob(imageBase64), (c) => c.charCodeAt(0));
      const ext = (mimeType || "image/jpeg").split("/")[1] || "jpg";
      const path = `${user.id}/commercial-sources/${crypto.randomUUID()}.${ext}`;
      const up = await admin.storage.from("product-videos").upload(path, bytes, {
        contentType: mimeType || "image/jpeg", upsert: false,
      });
      if (up.error) throw new Error("upload_failed: " + up.error.message);
      const signed = await admin.storage.from("product-videos").createSignedUrl(path, 60 * 60 * 24);
      if (signed.error || !signed.data) throw new Error("sign_failed");
      const sourceUrl = signed.data.signedUrl;

      // Create parent job. The webhook will persist the final rendered MP4 to result_url.
      const { data: job, error: jobErr } = await admin.from("commercial_jobs").insert({
        user_id: user.id,
        source_image_url: sourceUrl,
        template_id: templateId,
        product_id: productId || null,
        vibe_prompt: productName || null,
        status: "processing",
        tokens_charged: tokensCharged,
        shot_count: shots.length,
      }).select("id").single();
      if (jobErr || !job) throw new Error("job_insert_failed");

      const shotPlan = buildShotPlan(shots);
      const duration = shotPlan.reduce((sum, s) => sum + s.duration, 0);
      const captionLine = buildCaptionLine(captions, productName, price);
      const prompt = buildCommercialPrompt({
        productName,
        templateLabel: templateLabel || templateId,
        shots: shotPlan,
        captionLine,
      });
      const webhookUrl = `${SUPABASE_URL}/functions/v1/commercial-shot-webhook?job_id=${job.id}`;

      const predRes = await fetch(`${GW}/models/${MODEL_OWNER}/${MODEL_NAME}/predictions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${LOVABLE_API_KEY}`,
          "X-Connection-Api-Key": REPLICATE_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: {
            start_image: sourceUrl,
            prompt,
            multi_prompt: JSON.stringify(shotPlan.map((s) => ({ prompt: s.prompt, duration: s.duration }))),
            duration,
            mode: "standard",
            aspect_ratio: "9:16",
            generate_audio: true,
            negative_prompt: "warped product, changed logo, wrong text, unreadable captions, duplicate products, extra fingers, blurry, low quality, watermark",
          },
          webhook: webhookUrl,
          webhook_events_filter: ["completed"],
        }),
      });

      const body = await predRes.text();
      if (predRes.status === 402) {
        await refund("provider_credit");
        await admin.from("commercial_jobs").update({ status: "failed", error: "provider_no_credit" }).eq("id", job.id);
        return json({ error: "provider_no_credit", message: "Video provider is out of credit. Please try later." }, 402);
      }
      if (!predRes.ok) {
        await refund("provider_error");
        await admin.from("commercial_jobs").update({
          status: "failed", error: `provider_${predRes.status}: ${body.slice(0, 200)}`,
        }).eq("id", job.id);
        return json({ error: "provider_failed", status: predRes.status, details: body }, 502);
      }

      const pred = JSON.parse(body);
      await admin.from("commercial_jobs").update({ status: "processing" }).eq("id", job.id);

      return json({ jobId: job.id, providerId: pred.id, totalShots: shotPlan.length });
    } catch (e: any) {
      await refund(e?.message?.slice(0, 80) || "unknown");
      return json({ error: e?.message || "start_failed" }, 500);
    }
  } catch (e: any) {
    return json({ error: e?.message || "unexpected" }, 500);
  }
});

function json(body: any, status = 200) {
  return new Response(JSON.stringify(body), {
    status, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function buildShotPlan(shots: Array<{ prompt?: string; duration?: number }>) {
  const raw = shots.map((s) => Math.max(1, Number(s.duration) || 5));
  const rawTotal = raw.reduce((sum, d) => sum + d, 0) || shots.length * 5;
  const total = Math.max(3, Math.min(15, Math.round(rawTotal)));
  let remaining = total;

  return shots.map((s, index) => {
    const remainingSlots = shots.length - index - 1;
    const duration = index === shots.length - 1
      ? remaining
      : Math.max(1, Math.min(remaining - remainingSlots, Math.round((raw[index] / rawTotal) * total)));
    remaining -= duration;
    return {
      prompt: String(s.prompt || "A polished cinematic product commercial shot with smooth camera movement.").slice(0, 600),
      duration,
    };
  });
}

function buildCaptionLine(captions: any, productName?: string, price?: string) {
  if (!Array.isArray(captions)) return "";
  return captions
    .map((c) => {
      if (c?.text) return c.text;
      if (c?.slot === "name") return productName || "";
      if (c?.slot === "price") return price || "";
      if (c?.slot === "cta") return "Order now";
      if (c?.slot === "hook") return "New";
      return "";
    })
    .filter(Boolean)
    .join(" • ")
    .slice(0, 220);
}

function buildCommercialPrompt(input: {
  productName?: string;
  templateLabel?: string;
  shots: Array<{ prompt: string; duration: number }>;
  captionLine?: string;
}) {
  const scenes = input.shots.map((s, i) => `Scene ${i + 1} (${s.duration}s): ${s.prompt}`).join(" ");
  return [
    `Create a polished vertical social media product commercial for ${input.productName || "this product"}.`,
    "Use the uploaded photo as the hero product reference; keep the product identity, shape, color, material, and branding consistent.",
    `Commercial style: ${input.templateLabel || "premium product ad"}.`,
    scenes,
    input.captionLine ? `Add tasteful, short, readable on-screen marketing captions: ${input.captionLine}.` : "Add tasteful, short, readable on-screen marketing captions.",
    "Smooth cinematic camera movement, premium e-commerce lighting, strong product focus, ready for Instagram Reels, WhatsApp Status, and TikTok. Generate fitting upbeat commercial audio, no watermark.",
  ].filter(Boolean).join("\n").slice(0, 2400);
}