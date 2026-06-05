import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// Yo Uganda Transaction Status Check
// Fallback for when the IPN callback was missed — user clicks "check now"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;

    const YO_USERNAME = Deno.env.get("YO_USERNAME")!;
    const YO_PASSWORD = Deno.env.get("YO_PASSWORD")!;
    const YO_API_URL = "https://paymentsapi1.yo.co.ug/ybs/task.php";

    const userClient = createClient(SUPABASE_URL, ANON, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userRes, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userRes?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const user = userRes.user;

    const { paymentId } = await req.json();
    if (!paymentId) {
      return new Response(JSON.stringify({ error: "Missing paymentId" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    // Look up the payment — must belong to this user
    const { data: payment, error: payErr } = await admin
      .from("token_payments")
      .select("id, user_id, tokens, status, eversend_payment_id")
      .eq("id", paymentId)
      .eq("user_id", user.id)
      .single();

    if (payErr || !payment) {
      return new Response(JSON.stringify({ error: "Payment not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Already completed?
    if (payment.status === "completed") {
      return new Response(JSON.stringify({ status: "completed", tokens: payment.tokens }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // If already failed, no need to check again
    if (payment.status === "failed") {
      return new Response(JSON.stringify({ status: "failed" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Need a Yo transaction reference to check status
    const yoRef = payment.eversend_payment_id;
    if (!yoRef) {
      return new Response(JSON.stringify({ status: "pending", message: "Waiting for gateway reference" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Query Yo Uganda actransactioncheckstatus
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<AutoCreate>
  <Request>
    <APIUsername>${YO_USERNAME}</APIUsername>
    <APIPassword>${YO_PASSWORD}</APIPassword>
    <Method>actransactioncheckstatus</Method>
    <TransactionReference>${yoRef}</TransactionReference>
  </Request>
</AutoCreate>`;

    const abortCtrl = new AbortController();
    const timeoutId = setTimeout(() => abortCtrl.abort(), 15_000);
    let yoResp: Response;
    try {
      yoResp = await fetch(YO_API_URL, {
        method: "POST",
        headers: { "Content-Type": "text/xml; charset=UTF-8" },
        body: xml,
        signal: abortCtrl.signal,
      });
    } catch (fetchErr: any) {
      clearTimeout(timeoutId);
      const msg = fetchErr?.name === "AbortError"
        ? "Gateway timeout"
        : `Gateway error: ${fetchErr?.message}`;
      return new Response(JSON.stringify({ status: "pending", message: msg }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    clearTimeout(timeoutId);

    const yoText = await yoResp.text();
    console.log("Yo check-status response:", yoText);

    // Parse status
    const statusMatch = yoText.match(/<Status>([^<]+)<\/Status>/i);
    const txStatusMatch = yoText.match(/<TransactionStatus>([^<]+)<\/TransactionStatus>/i);
    const msgMatch = yoText.match(/<StatusMessage>([^<]+)<\/StatusMessage>/i);

    const apiStatus = statusMatch?.[1]?.toUpperCase();
    const txStatus = txStatusMatch?.[1]?.toUpperCase() || "";
    const msg = msgMatch?.[1] || "";

    if (apiStatus !== "OK") {
      return new Response(JSON.stringify({ status: "pending", message: msg || "Gateway check failed" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const isSuccess = ["SUCCEEDED", "SUCCESSFUL", "SUCCESS", "COMPLETE", "COMPLETED"].includes(txStatus);
    const isFailed = ["FAILED", "CANCELLED", "CANCELED", "REVERSED"].includes(txStatus);

    if (!isSuccess && !isFailed) {
      return new Response(JSON.stringify({ status: "pending", message: txStatus || "Still processing" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (isFailed) {
      await admin.from("token_payments").update({ status: "failed" }).eq("id", paymentId);
      return new Response(JSON.stringify({ status: "failed" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Success — credit tokens atomically
    const { error: rpcErr } = await admin.rpc("credit_tokens", {
      p_user_id: payment.user_id,
      p_amount: payment.tokens,
    });
    if (rpcErr) {
      console.error("credit_tokens RPC error:", rpcErr);
      return new Response(JSON.stringify({ error: "Could not credit tokens" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
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
        description: `Purchased ${payment.tokens} tokens via Yo Uganda (manual check)`,
        reference_id: paymentId,
      }),
    ]);

    console.log(`Manual check: credited ${payment.tokens} tokens to user ${payment.user_id}`);

    return new Response(JSON.stringify({ status: "completed", tokens: payment.tokens }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("check-payment error:", e);
    return new Response(JSON.stringify({ error: e?.message || "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
