import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
const REPLICATE_API_KEY = Deno.env.get("REPLICATE_API_KEY")!;
const GW = "https://connector-gateway.lovable.dev/replicate/v1";
const TOKENS_PER_VIDEO = 40;

// wan-2.2 image-to-video fast — ~1 min turnarounds
const MODEL_OWNER = "wan-video";
const MODEL_NAME = "wan-2.2-i2v-fast";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") || "";
    const jwt = authHeader.replace("Bearer ", "");
    if (!jwt) return json({ error: "unauthorized" }, 401);

    const supaAuth = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userRes } = await supaAuth.auth.getUser();
    const user = userRes?.user;
    if (!user) return json({ error: "unauthorized" }, 401);

    const { imageBase64, mimeType, template, prompt, cameraPrompt } = await req.json();
    if (!imageBase64 || !template || !cameraPrompt) return json({ error: "missing_input" }, 400);

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    // Deduct tokens
    const { error: deductErr } = await admin.rpc("deduct_tokens", { p_user_id: user.id, p_amount: TOKENS_PER_VIDEO });
    if (deductErr) return json({ error: "insufficient_tokens" }, 402);

    // Refund helper
    const refund = async (reason: string) => {
      await admin.rpc("credit_tokens", { p_user_id: user.id, p_amount: TOKENS_PER_VIDEO });
      await admin.from("token_transactions").insert({
        user_id: user.id, amount: TOKENS_PER_VIDEO, type: "refund", description: `video: ${reason}`,
      });
    };

    try {
      // Upload source image to storage (public via signed URL later, but here we need public URL for Replicate)
      const bytes = Uint8Array.from(atob(imageBase64), (c) => c.charCodeAt(0));
      const ext = (mimeType || "image/jpeg").split("/")[1] || "jpg";
      const path = `${user.id}/sources/${crypto.randomUUID()}.${ext}`;
      const up = await admin.storage.from("product-videos").upload(path, bytes, { contentType: mimeType || "image/jpeg", upsert: false });
      if (up.error) throw new Error("upload_failed: " + up.error.message);

      // Sign the source URL for Replicate (valid 24h)
      const signed = await admin.storage.from("product-videos").createSignedUrl(path, 60 * 60 * 24);
      if (signed.error || !signed.data) throw new Error("sign_failed");
      const sourceUrl = signed.data.signedUrl;

      // Create job row first so webhook can find it
      const { data: job, error: jobErr } = await admin.from("video_jobs").insert({
        user_id: user.id,
        source_image_url: sourceUrl,
        template,
        prompt: prompt || null,
        provider: "replicate",
        status: "queued",
        tokens_charged: TOKENS_PER_VIDEO,
      }).select("id").single();
      if (jobErr || !job) throw new Error("job_insert_failed");

      const fullPrompt = [cameraPrompt, prompt].filter(Boolean).join(" ");
      const webhookUrl = `${SUPABASE_URL}/functions/v1/video-generate-webhook?job_id=${job.id}`;

      const predRes = await fetch(`${GW}/models/${MODEL_OWNER}/${MODEL_NAME}/predictions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${LOVABLE_API_KEY}`,
          "X-Connection-Api-Key": REPLICATE_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: { image: sourceUrl, prompt: fullPrompt },
          webhook: webhookUrl,
          webhook_events_filter: ["completed"],
        }),
      });

      if (predRes.status === 402) {
        await refund("provider_credit");
        await admin.from("video_jobs").update({ status: "failed", error: "provider_no_credit" }).eq("id", job.id);
        return json({ error: "provider_no_credit", message: "Video provider is out of credit. Please try later." }, 402);
      }
      if (!predRes.ok) {
        const body = await predRes.text();
        await refund("provider_error");
        await admin.from("video_jobs").update({ status: "failed", error: `provider_${predRes.status}: ${body.slice(0, 200)}` }).eq("id", job.id);
        return json({ error: "provider_failed", status: predRes.status, details: body }, 502);
      }

      const pred = await predRes.json();
      await admin.from("video_jobs").update({
        provider_job_id: pred.id, status: "processing",
      }).eq("id", job.id);

      return json({ jobId: job.id, providerId: pred.id });
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
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}