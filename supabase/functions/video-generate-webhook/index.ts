import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const url = new URL(req.url);
  const jobId = url.searchParams.get("job_id");
  if (!jobId) return new Response("missing job_id", { status: 400 });

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
  const payload = await req.json().catch(() => ({}));

  const { data: job } = await admin.from("video_jobs").select("id, user_id, tokens_charged, status").eq("id", jobId).single();
  if (!job) return new Response("job not found", { status: 404 });
  if (job.status === "ready" || job.status === "failed") {
    return new Response("already finalized", { status: 200 });
  }

  const status = payload.status;
  if (status === "succeeded") {
    // output can be a string URL or array
    const output = payload.output;
    const remoteUrl = Array.isArray(output) ? output[0] : output;
    if (!remoteUrl) {
      await refund(admin, job);
      await admin.from("video_jobs").update({ status: "failed", error: "no_output", completed_at: new Date().toISOString() }).eq("id", jobId);
      return new Response("no output", { status: 200 });
    }
    // Persist to our bucket (Replicate URLs expire ~1h)
    try {
      const r = await fetch(remoteUrl);
      const ab = await r.arrayBuffer();
      const path = `${job.user_id}/results/${jobId}.mp4`;
      await admin.storage.from("product-videos").upload(path, new Uint8Array(ab), { contentType: "video/mp4", upsert: true });
      const signed = await admin.storage.from("product-videos").createSignedUrl(path, 60 * 60 * 24 * 30);
      const finalUrl = signed.data?.signedUrl || remoteUrl;
      await admin.from("video_jobs").update({
        status: "ready", result_url: finalUrl, completed_at: new Date().toISOString(),
      }).eq("id", jobId);
    } catch (e: any) {
      await refund(admin, job);
      await admin.from("video_jobs").update({ status: "failed", error: "persist_failed: " + (e?.message || ""), completed_at: new Date().toISOString() }).eq("id", jobId);
    }
    return new Response("ok", { status: 200 });
  }

  if (status === "failed" || status === "canceled") {
    await refund(admin, job);
    await admin.from("video_jobs").update({
      status: "failed", error: payload.error || status, completed_at: new Date().toISOString(),
    }).eq("id", jobId);
    return new Response("ok", { status: 200 });
  }

  return new Response("noop", { status: 200 });
});

async function refund(admin: any, job: any) {
  if (!job?.tokens_charged) return;
  await admin.rpc("credit_tokens", { p_user_id: job.user_id, p_amount: job.tokens_charged });
  await admin.from("token_transactions").insert({
    user_id: job.user_id, amount: job.tokens_charged, kind: "refund", note: `video job ${job.id}`,
  });
}