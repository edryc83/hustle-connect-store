import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

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

async function getEversendToken(): Promise<string> {
  // TODO: Replace with your Eversend Client ID and Client Secret from
  // https://business.eversend.co → Settings → API
  const clientId = Deno.env.get("EVERSEND_CLIENT_ID")!;
  const clientSecret = Deno.env.get("EVERSEND_CLIENT_SECRET")!;

  const resp = await fetch("https://api.eversend.co/v1/auth/token", {
    method: "GET",
    headers: {
      "clientId": clientId,
      "clientSecret": clientSecret,
    },
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Eversend auth failed: ${text}`);
  }
  const data = await resp.json();
  return data.token as string;
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
    // App URL used as the redirect after payment — user taps "Return to app"
    const APP_URL = Deno.env.get("APP_URL") || "https://app.afristall.com";

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

    const { packageId } = await req.json();
    const pkg = PACKAGES[packageId];
    if (!pkg) {
      return new Response(JSON.stringify({ error: "Invalid package" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    // Get user profile for customer details
    const { data: profile } = await admin
      .from("profiles")
      .select("store_name, phone, email")
      .eq("id", user.id)
      .maybeSingle();

    // Create a pending payment record in our DB first
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

    // Create Eversend payment link
    const token = await getEversendToken();

    const eversendResp = await fetch("https://api.eversend.co/v1/collections/link", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        currency: "UGX",
        amount: pkg.priceUGX,
        description: `${pkg.name} — ${pkg.tokens} tokens for Hustle Connect`,
        tag: paymentId, // our reference — echoed back in the webhook
        redirectUrl: `${APP_URL}/payment-return?paymentId=${paymentId}`,
        country: "UG",
        firstName: profile?.store_name?.split(" ")[0] || "Customer",
        lastName: profile?.store_name?.split(" ").slice(1).join(" ") || "",
        email: user.email || profile?.email || "",
        phone: profile?.phone || "",
      }),
    });

    if (!eversendResp.ok) {
      const errText = await eversendResp.text();
      console.error("Eversend error:", errText);
      // Mark payment as failed so we don't leave orphan records
      await admin.from("token_payments").update({ status: "failed" }).eq("id", paymentId);
      throw new Error("Payment gateway error — please try again");
    }

    const eversendData = await eversendResp.json();
    const paymentUrl: string = eversendData.paymentLink || eversendData.data?.paymentLink;
    const eversendPaymentId: string = eversendData.token || eversendData.data?.token || "";

    // Update record with Eversend's own ID
    await admin.from("token_payments")
      .update({ eversend_payment_id: eversendPaymentId })
      .eq("id", paymentId);

    return new Response(JSON.stringify({ paymentId, paymentUrl }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("create-payment error:", e);
    return new Response(JSON.stringify({ error: e?.message || "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
