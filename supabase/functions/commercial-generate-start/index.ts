import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
const REPLICATE_API_KEY = Deno.env.get("REPLICATE_API_KEY")!;
const GW = "https://connector-gateway.lovable.dev/replicate/v1";
const TOKENS_PER_COMMERCIAL = 80; // 2-3 shots at 40 tokens each

const MODEL_OWNER = "wan-video";
const MODEL_NAME = "wan-2.2-i2v-fast";

// Fires one Replicate prediction per shot in the template. Each shot's webhook
// updates the matching commercial_shots row; the client stitches everything
// together once all shots are ready.
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

    const { imageBase64, mimeType, templateId, shots, productName } = await req.json();
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

      // Create parent job
      const { data: job, error: jobErr } = await admin.from("commercial_jobs").insert({
        user_id: user.id,
        source_image_url: sourceUrl,
        template_id: templateId,
        product_name: productName || null,
        status: "processing",
        tokens_charged: tokensCharged,
        total_shots: shots.length,
      }).select("id").single();
      if (jobErr || !job) throw new Error("job_insert_failed");

      // Create shot rows + fire predictions in parallel
      const shotRows = shots.map((s: { prompt: string }, idx: number) => ({
        job_id: job.id, user_id: user.id, shot_index: idx, prompt: s.prompt, status: "queued",
      }));
      const { data: insertedShots, error: shotErr } = await admin
        .from("commercial_shots").insert(shotRows).select("id, shot_index, prompt");
      if (shotErr || !insertedShots) throw new Error("shots_insert_failed");

      const results = await Promise.all(insertedShots.map(async (row: any) => {
        const webhookUrl = `${SUPABASE_URL}/functions/v1/commercial-shot-webhook?shot_id=${row.id}`;
        const predRes = await fetch(`${GW}/models/${MODEL_OWNER}/${MODEL_NAME}/predictions`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${LOVABLE_API_KEY}`,
            "X-Connection-Api-Key": REPLICATE_API_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            input: { image: sourceUrl, prompt: row.prompt },
            webhook: webhookUrl,
            webhook_events_filter: ["completed"],
          }),
        });
        return { row, status: predRes.status, body: await predRes.text() };
      }));

      const anyPaymentIssue = results.find((r) => r.status === 402);
      const anyFailed = results.find((r) => r.status < 200 || r.status >= 300);
      if (anyPaymentIssue) {
        await refund("provider_credit");
        await admin.from("commercial_jobs").update({ status: "failed", error: "provider_no_credit" }).eq("id", job.id);
        return json({ error: "provider_no_credit", message: "Video provider is out of credit. Please try later." }, 402);
      }
      if (anyFailed) {
        await refund("provider_error");
        await admin.from("commercial_jobs").update({
          status: "failed", error: `provider_${anyFailed.status}: ${anyFailed.body.slice(0, 200)}`,
        }).eq("id", job.id);
        return json({ error: "provider_failed", status: anyFailed.status, details: anyFailed.body }, 502);
      }

      // Attach provider IDs
      await Promise.all(results.map(async (r) => {
        const pred = JSON.parse(r.body);
        await admin.from("commercial_shots").update({
          provider_job_id: pred.id, status: "processing",
        }).eq("id", r.row.id);
      }));

      return json({ jobId: job.id, totalShots: insertedShots.length });
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