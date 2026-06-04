import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// Yo Uganda Instant Payment Notification handler
// Register this URL in your Yo Uganda merchant dashboard:
// https://<supabase-ref>.supabase.co/functions/v1/yo-ipn

Deno.serve(async (req) => {
  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    // Yo Uganda can POST as XML body, form-encoded, or query params — handle all three
    const contentType = req.headers.get("content-type") || "";
    let paymentId = "";
    let txStatus = "";
    let rawBody = "";

    if (req.method === "GET" || req.url.includes("?")) {
      // Query string parameters
      const url = new URL(req.url);
      paymentId = url.searchParams.get("ExternalReference") || url.searchParams.get("external_reference") || "";
      txStatus  = url.searchParams.get("TransactionStatus") || url.searchParams.get("transaction_status") || "";
    } else {
      rawBody = await req.text();
      console.log("Yo IPN raw body:", rawBody);

      if (contentType.includes("xml") || rawBody.trim().startsWith("<")) {
        // XML body
        const refMatch    = rawBody.match(/<ExternalReference>([^<]+)<\/ExternalReference>/i);
        const statusMatch = rawBody.match(/<TransactionStatus>([^<]+)<\/TransactionStatus>/i);
        paymentId = refMatch?.[1]  || "";
        txStatus  = statusMatch?.[1] || "";
      } else {
        // Form-encoded or JSON fallback
        try {
          const params = new URLSearchParams(rawBody);
          paymentId = params.get("ExternalReference") || params.get("external_reference") || "";
          txStatus  = params.get("TransactionStatus")  || params.get("transaction_status")  || "";
          if (!paymentId) {
            const json = JSON.parse(rawBody);
            paymentId = json.ExternalReference || json.external_reference || "";
            txStatus  = json.TransactionStatus  || json.transaction_status  || "";
          }
        } catch {
          // ignore parse errors — already logged rawBody above
        }
      }
    }

    console.log(`Yo IPN: paymentId=${paymentId} status=${txStatus}`);

    if (!paymentId) {
      console.warn("IPN missing ExternalReference — ignoring");
      return new Response("ok", { status: 200 });
    }

    const normalStatus = txStatus.toUpperCase();
    const isSuccess = ["SUCCEEDED", "SUCCESSFUL", "SUCCESS", "COMPLETE", "COMPLETED"].includes(normalStatus);
    const isFailed  = ["FAILED", "CANCELLED", "CANCELED", "REVERSED"].includes(normalStatus);

    if (!isSuccess && !isFailed) {
      // Still in progress — acknowledge and wait for next IPN
      return new Response("ok", { status: 200 });
    }

    const { data: payment, error: fetchErr } = await admin
      .from("token_payments")
      .select("id, user_id, tokens, status")
      .eq("id", paymentId)
      .single();

    if (fetchErr || !payment) {
      console.warn("Payment record not found:", paymentId);
      return new Response("ok", { status: 200 });
    }

    // Idempotency guard
    if (payment.status === "completed") {
      return new Response("ok", { status: 200 });
    }

    if (isFailed) {
      await admin.from("token_payments").update({ status: "failed" }).eq("id", paymentId);
      return new Response("ok", { status: 200 });
    }

    // Credit tokens atomically
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
        description: `Purchased ${payment.tokens} tokens via Yo Uganda`,
        reference_id: paymentId,
      }),
    ]);

    console.log(`Credited ${payment.tokens} tokens to user ${payment.user_id}`);
    return new Response("ok", { status: 200 });
  } catch (e: any) {
    console.error("yo-ipn error:", e);
    return new Response("error", { status: 500 });
  }
});
