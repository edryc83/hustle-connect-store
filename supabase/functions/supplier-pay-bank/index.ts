import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function getRate(admin: any, currency: string) {
  const { data: cached } = await admin.from("app_config").select("value").eq("key", "fx_rates_usd").maybeSingle();
  let payload: any = cached?.value ? JSON.parse(cached.value) : null;
  if (!payload || Date.now() - new Date(payload.fetched_at).getTime() > 60_000) {
    const res = await fetch("https://api.exchangerate.host/latest?base=USD&symbols=UGX,GBP,EUR,AED");
    if (!res.ok) throw new Error("Could not fetch exchange rates");
    const data = await res.json();
    payload = { fetched_at: new Date().toISOString(), rates: data.rates };
    await admin.from("app_config").upsert({ key: "fx_rates_usd", value: JSON.stringify(payload) });
  }
  const ugxPerUsd = Number(payload.rates.UGX);
  return currency === "USD" ? ugxPerUsd : ugxPerUsd / Number(payload.rates[currency]);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Unauthorized");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
    const userClient = createClient(SUPABASE_URL, ANON, { global: { headers: { Authorization: authHeader } } });
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    const { data: userRes } = await userClient.auth.getUser();
    if (!userRes?.user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { supplier_id, supplier_product_id, amount_foreign, currency, bank_proof_url, note } = await req.json();
    const cleanCurrency = String(currency || "").toUpperCase();
    if (!supplier_id || !amount_foreign || !bank_proof_url) throw new Error("Missing payment details");
    if (!["USD", "GBP", "AED", "EUR"].includes(cleanCurrency)) throw new Error("Unsupported currency");

    const amountForeign = Number(amount_foreign);
    if (!Number.isFinite(amountForeign) || amountForeign <= 0) throw new Error("Invalid amount");
    const fxRate = await getRate(admin, cleanCurrency);
    const feePct = 5;
    const amountForeignTotal = amountForeign * (1 + feePct / 100);
    const amountUgx = Math.round(amountForeignTotal * fxRate);
    const now = new Date();
    const lockedUntil = new Date(now.getTime() + 15 * 60 * 1000);

    const { data: payment, error } = await admin.from("supplier_payments").insert({
      buyer_id: userRes.user.id,
      supplier_id,
      supplier_product_id: supplier_product_id || null,
      amount_foreign: amountForeign,
      currency: cleanCurrency,
      fee_pct: feePct,
      amount_foreign_total: amountForeignTotal,
      fx_rate: fxRate,
      fx_locked_at: now.toISOString(),
      fx_locked_until: lockedUntil.toISOString(),
      amount_ugx: amountUgx,
      method: "bank_transfer",
      bank_proof_url,
      status: "pending_review",
      note: note || null,
    }).select("id, amount_ugx, status").single();
    if (error) throw error;

    return new Response(JSON.stringify({ payment }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
