import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Handles completed AI video callbacks. New Studio Commercial jobs return one
// finished MP4 directly; the older per-shot path remains for old in-flight jobs.
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const url = new URL(req.url);
  const jobId = url.searchParams.get("job_id");
  const shotId = url.searchParams.get("shot_id");

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
  const payload = await req.json().catch(() => ({}));

  if (jobId) return handleWholeCommercialWebhook(admin, jobId, payload);
  if (!shotId) return new Response("missing shot_id", { status: 400 });

  const { data: shot } = await admin
    .from("commercial_shots")
    .select("id, job_id, status")
    .eq("id", shotId).single();
  if (!shot) return new Response("shot not found", { status: 404 });
  if (shot.status === "ready" || shot.status === "failed") {
    return new Response("already finalized", { status: 200 });
  }

  const { data: job } = await admin
    .from("commercial_jobs").select("id, user_id, tokens_charged, status, shot_count").eq("id", shot.job_id).single();
  if (!job) return new Response("job not found", { status: 404 });

  const status = payload.status;

  if (status === "succeeded") {
    const output = payload.output;
    const remoteUrl = Array.isArray(output) ? output[0] : output;
    if (!remoteUrl) {
      await failShotAndJob(admin, shot, job, "no_output");
      return new Response("no output", { status: 200 });
    }
    // Persist to our bucket (Replicate URLs expire ~1h)
    try {
      const r = await fetch(remoteUrl);
      const ab = await r.arrayBuffer();
      const path = `${job.user_id}/commercial-shots/${job.id}/${shot.id}.mp4`;
      await admin.storage.from("product-videos").upload(path, new Uint8Array(ab), {
        contentType: "video/mp4", upsert: true,
      });
      const signed = await admin.storage.from("product-videos").createSignedUrl(path, 60 * 60 * 24 * 30);
      const finalUrl = signed.data?.signedUrl || remoteUrl;
      await admin.from("commercial_shots").update({
        status: "ready", video_url: finalUrl, completed_at: new Date().toISOString(),
      }).eq("id", shot.id);

      // If every shot in this job is ready, flip the job to ready.
      const { data: siblings } = await admin
        .from("commercial_shots").select("status").eq("job_id", job.id);
      const allReady = siblings && siblings.length === job.shot_count && siblings.every((s: any) => s.status === "ready");
      if (allReady) {
        await admin.from("commercial_jobs").update({
          status: "ready", completed_at: new Date().toISOString(),
        }).eq("id", job.id);
      }
    } catch (e: any) {
      await failShotAndJob(admin, shot, job, "persist_failed: " + (e?.message || ""));
    }
    return new Response("ok", { status: 200 });
  }

  if (status === "failed" || status === "canceled") {
    await failShotAndJob(admin, shot, job, payload.error || status);
    return new Response("ok", { status: 200 });
  }

  return new Response("noop", { status: 200 });
});

async function failShotAndJob(admin: any, shot: any, job: any, reason: string) {
  await admin.from("commercial_shots").update({
    status: "failed", error: reason, completed_at: new Date().toISOString(),
  }).eq("id", shot.id);
  // Fail the parent job (only once) and refund tokens.
  if (job.status !== "failed") {
    await admin.from("commercial_jobs").update({
      status: "failed", error: reason, completed_at: new Date().toISOString(),
    }).eq("id", job.id);
    if (job.tokens_charged > 0) {
      await admin.rpc("credit_tokens", { p_user_id: job.user_id, p_amount: job.tokens_charged });
      await admin.from("token_transactions").insert({
        user_id: job.user_id, amount: job.tokens_charged, type: "refund",
        description: `commercial job ${job.id}`,
      });
    }
  }
}

async function handleWholeCommercialWebhook(admin: any, jobId: string, payload: any) {
  const { data: job } = await admin
    .from("commercial_jobs")
    .select("id, user_id, tokens_charged, status")
    .eq("id", jobId)
    .single();
  if (!job) return new Response("job not found", { status: 404 });
  if (job.status === "ready" || job.status === "failed") {
    return new Response("already finalized", { status: 200 });
  }

  const status = payload.status;
  if (status === "succeeded") {
    const remoteUrl = extractOutputUrl(payload.output);
    if (!remoteUrl) {
      await failWholeCommercial(admin, job, "no_output");
      return new Response("no output", { status: 200 });
    }

    try {
      const r = await fetch(remoteUrl);
      const ab = await r.arrayBuffer();
      const path = `${job.user_id}/commercial-results/${job.id}.mp4`;
      await admin.storage.from("product-videos").upload(path, new Uint8Array(ab), {
        contentType: "video/mp4", upsert: true,
      });
      const signed = await admin.storage.from("product-videos").createSignedUrl(path, 60 * 60 * 24 * 30);
      const finalUrl = signed.data?.signedUrl || remoteUrl;
      await admin.from("commercial_jobs").update({
        status: "ready", result_url: finalUrl, completed_at: new Date().toISOString(),
      }).eq("id", job.id);
    } catch (e: any) {
      await failWholeCommercial(admin, job, "persist_failed: " + (e?.message || ""));
    }
    return new Response("ok", { status: 200 });
  }

  if (status === "failed" || status === "canceled") {
    await failWholeCommercial(admin, job, payload.error || status);
    return new Response("ok", { status: 200 });
  }

  return new Response("noop", { status: 200 });
}

function extractOutputUrl(output: any): string | null {
  if (typeof output === "string") return output;
  if (Array.isArray(output)) return output.find((item) => typeof item === "string") || null;
  if (output && typeof output.url === "string") return output.url;
  return null;
}

async function failWholeCommercial(admin: any, job: any, reason: string) {
  await admin.from("commercial_jobs").update({
    status: "failed", error: reason, completed_at: new Date().toISOString(),
  }).eq("id", job.id);
  if (job.tokens_charged > 0) {
    await admin.rpc("credit_tokens", { p_user_id: job.user_id, p_amount: job.tokens_charged });
    await admin.from("token_transactions").insert({
      user_id: job.user_id, amount: job.tokens_charged, type: "refund",
      description: `commercial job ${job.id}`,
    });
  }
}