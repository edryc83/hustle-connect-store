import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// Yo Uganda Mobile Money payment gateway
// Docs: https://www.yo.co.ug/cms/index.php?option=com_content&view=article&id=5
// Register your IPN URL in Yo Uganda merchant dashboard as:
// https://<supabase-ref>.supabase.co/functions/v1/yo-ipn

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PACKAGES: Record<string, { tokens: number; priceUGX: number; name: string }> = {
  starter:  { tokens: 25,  priceUGX: 5_000,  name: "Starter Pack"  },
  hustler:  { tokens: 90,  priceUGX: 15_000, name: "Hustler Pack"  },
  creator:  { tokens: 200, priceUGX: 30_000, name: "Creator Pack"  },
  business: { tokens: 500, priceUGX: 50_000, name: "Business Pack" },
};

function normalisePhone(raw: string): string {
  // Accept: 07XXXXXXXX, 256XXXXXXXXX, +256XXXXXXXXX → always 256XXXXXXXXX
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("256") && digits.length === 12) return digits;
  if (digits.startsWith("0") && digits.length === 10) return "256" + digits.slice(1);
  if (digits.length === 9) return "256" + digits;
  throw new Error("Invalid phone number. Use format: 07XXXXXXXX or 256XXXXXXXXX");
}

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

    // Yo Uganda credentials — set these in Supabase Edge Function secrets:
    // YO_USERNAME  →  your Yo Uganda API username
    // YO_PASSWORD  →  your Yo Uganda API password
    const YO_USERNAME = Deno.env.get("YO_USERNAME")!;
    const YO_PASSWORD = Deno.env.get("YO_PASSWORD")!;
    const YO_API_URL = "https://paymentsapi1.yo.co.ug/ybs/task.php";
    const IPN_URL = `${SUPABASE_URL.replace(".supabase.co", "")}.supabase.co/functions/v1/yo-ipn?apikey=${ANON}`;

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

    const { packageId, phone: rawPhone } = await req.json();

    const pkg = PACKAGES[packageId];
    if (!pkg) {
      return new Response(JSON.stringify({ error: "Invalid package" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let phone: string;
    try {
      phone = normalisePhone(rawPhone || "");
    } catch (e: any) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    // Create pending payment record
    const { data: payment, error: payErr } = await admin
      .from("token_payments")
      .insert({
        user_id: user.id,
        package_id: packageId,
        tokens: pkg.tokens,
        amount_ugx: pkg.priceUGX,
        currency: "UGX",
        status: "pending",
      })
      .select("id")
      .single();
    if (payErr || !payment) throw new Error("Could not create payment record");

    const paymentId: string = payment.id;

    // Build Yo Uganda XML request
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<AutoCreate>
  <Request>
    <APIUsername>${YO_USERNAME}</APIUsername>
    <APIPassword>${YO_PASSWORD}</APIPassword>
    <Method>acdepositfunds</Method>
    <Account>${phone}</Account>
    <Amount>${pkg.priceUGX}</Amount>
    <Narrative>Hustle Connect ${pkg.name} - ${pkg.tokens} tokens</Narrative>
    <ExternalReference>${paymentId}</ExternalReference>
    <InstantPaymentNotificationURL>${IPN_URL}</InstantPaymentNotificationURL>
    <ProviderReferenceText>${paymentId}</ProviderReferenceText>
  </Request>
</AutoCreate>`;

    const abortCtrl = new AbortController();
    const timeoutId = setTimeout(() => abortCtrl.abort(), 25_000);
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
      await admin.from("token_payments").update({ status: "failed" }).eq("id", paymentId);
      const msg = fetchErr?.name === "AbortError"
        ? "Payment gateway timed out. Please try again."
        : `Could not reach payment gateway: ${fetchErr?.message}`;
      return new Response(JSON.stringify({ error: msg }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    clearTimeout(timeoutId);

    const yoText = await yoResp.text();
    console.log("Yo Uganda response:", yoText);

    // Parse status from XML response
    const statusMatch = yoText.match(/<Status>([^<]+)<\/Status>/i);
    const txStatusMatch = yoText.match(/<TransactionStatus>([^<]+)<\/TransactionStatus>/i);
    const msgMatch = yoText.match(/<StatusMessage>([^<]+)<\/StatusMessage>/i);

    const status = statusMatch?.[1]?.toUpperCase();
    const txStatus = txStatusMatch?.[1]?.toUpperCase();
    const msg = msgMatch?.[1] || "Unknown error from payment gateway";

    if (status !== "OK" && txStatus !== "INPROGRESS") {
      await admin.from("token_payments").update({ status: "failed" }).eq("id", paymentId);
      return new Response(JSON.stringify({ error: msg }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Store Yo's transaction reference
    const yoRefMatch = yoText.match(/<TransactionReference>([^<]+)<\/TransactionReference>/i);
    if (yoRefMatch?.[1]) {
      await admin.from("token_payments")
        .update({ eversend_payment_id: yoRefMatch[1] }) // reusing the column for Yo's ref
        .eq("id", paymentId);
    }

    return new Response(JSON.stringify({
      paymentId,
      message: "USSD prompt sent to your phone. Enter your PIN to confirm payment.",
    }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("create-payment error:", e);
    return new Response(JSON.stringify({ error: e?.message || "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
