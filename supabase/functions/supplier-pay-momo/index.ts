import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function normalisePhone(raw: string): string {
  const d = raw.replace(/\D/g, "");
  if (d.startsWith("256") && d.length === 12) return d;
  if (d.startsWith("0") && d.length === 10) return "256" + d.slice(1);
  if (d.length === 9) return "256" + d;
  throw new Error("Invalid phone number. Use 07XXXXXXXX or 256XXXXXXXXX");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
    const YO_USERNAME = Deno.env.get("YO_USERNAME")!;
    const YO_PASSWORD = Deno.env.get("YO_PASSWORD")!;

    const userClient = createClient(SUPABASE_URL, ANON, { global: { headers: { Authorization: authHeader } } });
    const { data: userRes } = await userClient.auth.getUser();
    const buyer = userRes?.user;
    if (!buyer) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const body = await req.json();
    const {
      supplier_id, supplier_product_id,
      amount_foreign, currency,
      fee_pct = 5, fx_rate, fx_locked_at,
      phone, note,
    } = body;

    if (!supplier_id || !amount_foreign || !currency || !fx_rate || !phone) {
      return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Validate FX lock not expired (allow 30s clock skew)
    if (fx_locked_at) {
      const lockedAt = new Date(fx_locked_at).getTime();
      if (Date.now() - lockedAt > 15 * 60 * 1000 + 30_000) {
        return new Response(JSON.stringify({ error: "Exchange rate expired. Refresh and try again." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    // Fetch supplier
    const { data: supplier } = await admin.from("suppliers").select("id, business_name, status").eq("id", supplier_id).single();
    if (!supplier || supplier.status !== "active") {
      return new Response(JSON.stringify({ error: "Supplier unavailable" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const amountForeign = Number(amount_foreign);
    const feePctNum = Number(fee_pct);
    const amountForeignTotal = +(amountForeign * (1 + feePctNum / 100)).toFixed(2);
    const amountUgx = Math.round(amountForeignTotal * Number(fx_rate));

    let phoneNorm: string;
    try { phoneNorm = normalisePhone(phone); } catch (e: any) {
      return new Response(JSON.stringify({ error: e.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data: pay, error: payErr } = await admin.from("supplier_payments").insert({
      buyer_id: buyer.id,
      supplier_id,
      supplier_product_id: supplier_product_id || null,
      amount_foreign: amountForeign,
      currency,
      fee_pct: feePctNum,
      amount_foreign_total: amountForeignTotal,
      fx_rate: Number(fx_rate),
      fx_locked_at: fx_locked_at || new Date().toISOString(),
      amount_ugx: amountUgx,
      method: "momo",
      momo_phone: phoneNorm,
      note: note || null,
      status: "pending",
    }).select("id").single();
    if (payErr || !pay) throw new Error(payErr?.message || "Could not create payment");

    const paymentId = pay.id;
    // Reuse the existing token-payments callback. yo-ipn handles supplier payments
    // as a fallback when the ExternalReference does not match a token_payments row.
    const IPN_URL = `${SUPABASE_URL}/functions/v1/yo-ipn`;

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<AutoCreate>
  <Request>
    <APIUsername>${YO_USERNAME}</APIUsername>
    <APIPassword>${YO_PASSWORD}</APIPassword>
    <Method>acdepositfunds</Method>
    <Account>${phoneNorm}</Account>
    <Amount>${amountUgx}</Amount>
    <Narrative>Afristall Import - Pay ${supplier.business_name}</Narrative>
    <ExternalReference>${paymentId}</ExternalReference>
    <InstantPaymentNotificationURL>${IPN_URL}</InstantPaymentNotificationURL>
    <ProviderReferenceText>${paymentId}</ProviderReferenceText>
  </Request>
</AutoCreate>`;

    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), 25_000);
    let yoResp: Response;
    try {
      yoResp = await fetch("https://paymentsapi1.yo.co.ug/ybs/task.php", {
        method: "POST",
        headers: { "Content-Type": "text/xml; charset=UTF-8" },
        body: xml,
        signal: ac.signal,
      });
    } catch (e: any) {
      clearTimeout(t);
      await admin.from("supplier_payments").update({ status: "failed" }).eq("id", paymentId);
      return new Response(JSON.stringify({ error: e?.name === "AbortError" ? "Payment gateway timed out." : "Could not reach payment gateway." }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    clearTimeout(t);

    const yoText = await yoResp.text();
    console.log("Yo response:", yoText);
    const status = yoText.match(/<Status>([^<]+)<\/Status>/i)?.[1]?.toUpperCase();
    const txStatus = yoText.match(/<TransactionStatus>([^<]+)<\/TransactionStatus>/i)?.[1]?.toUpperCase();
    const msg = yoText.match(/<StatusMessage>([^<]+)<\/StatusMessage>/i)?.[1] || "Payment gateway error";

    if (status !== "OK" && txStatus !== "INPROGRESS") {
      await admin.from("supplier_payments").update({ status: "failed" }).eq("id", paymentId);
      return new Response(JSON.stringify({ error: msg }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const yoRef = yoText.match(/<TransactionReference>([^<]+)<\/TransactionReference>/i)?.[1];
    if (yoRef) await admin.from("supplier_payments").update({ yo_ref: yoRef }).eq("id", paymentId);

    return new Response(JSON.stringify({ paymentId, message: "USSD prompt sent to your phone. Enter your PIN to confirm." }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    console.error("supplier-pay-momo error:", e);
    return new Response(JSON.stringify({ error: e?.message || "Unknown" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});