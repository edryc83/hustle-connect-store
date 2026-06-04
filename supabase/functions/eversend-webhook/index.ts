import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// Eversend calls this endpoint when a payment is confirmed.
// Register this URL in your Eversend merchant dashboard under Webhooks:
// https://functions.<your-supabase-ref>.supabase.co/eversend-webhook

Deno.serve(async (req) => {
  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    const body = await req.json();
    console.log("Eversend webhook:", JSON.stringify(body));

    // Eversend sends event type and data — adapt field names if their docs differ
    const event: string = body.event || body.type || "";
    const payload = body.data || body;

    // We store our payment UUID in Eversend's `tag` field
    const paymentId: string = payload.tag || payload.reference || payload.metadata?.paymentId || "";
    const status: string = (payload.status || "").toUpperCase();

    if (!paymentId) {
      console.warn("Webhook missing paymentId tag");
      return new Response("ok", { status: 200 });
    }

    const isSuccess = event.includes("success") || event.includes("complete") ||
      status === "SUCCESSFUL" || status === "SUCCESS" || status === "COMPLETED";
    const isFailed = event.includes("fail") || event.includes("cancel") ||
      status === "FAILED" || status === "CANCELLED";

    if (!isSuccess && !isFailed) {
      // Intermediate state — just acknowledge
      return new Response("ok", { status: 200 });
    }

    // Find the pending payment
    const { data: payment, error: fetchErr } = await admin
      .from("token_payments")
      .select("id, user_id, tokens, status")
      .eq("id", paymentId)
      .single();

    if (fetchErr || !payment) {
      console.warn("Payment not found:", paymentId);
      return new Response("ok", { status: 200 });
    }

    // Idempotency — ignore if already processed
    if (payment.status === "completed") {
      return new Response("ok", { status: 200 });
    }

    if (isFailed) {
      await admin.from("token_payments").update({ status: "failed" }).eq("id", paymentId);
      return new Response("ok", { status: 200 });
    }

    // Credit tokens atomically and log the transaction
    const { error: rpcErr } = await admin.rpc("credit_tokens", {
      p_user_id: payment.user_id,
      p_amount: payment.tokens,
    });

    if (rpcErr) {
      console.error("credit_tokens RPC error:", rpcErr);
      return new Response("error", { status: 500 });
    }

    await Promise.all([
      admin.from("token_payments").update({
        status: "completed",
        completed_at: new Date().toISOString(),
      }).eq("id", paymentId),
      admin.from("token_transactions").insert({
        user_id: payment.user_id,
        type: "purchase",
        amount: payment.tokens,
        description: `Purchased ${payment.tokens} tokens`,
        reference_id: paymentId,
      }),
    ]);

    return new Response("ok", { status: 200 });
  } catch (e: any) {
    console.error("eversend-webhook error:", e);
    return new Response("error", { status: 500 });
  }
});
