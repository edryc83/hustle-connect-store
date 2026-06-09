const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Simple in-memory cache per cold start
let cache: { rates: Record<string, number>; ts: number } | null = null;
const CACHE_MS = 60_000;

async function fetchRates(): Promise<Record<string, number>> {
  if (cache && Date.now() - cache.ts < CACHE_MS) return cache.rates;
  // exchangerate.host (free, no key)
  const url = "https://api.exchangerate.host/latest?base=USD&symbols=UGX,GBP,EUR,AED";
  const r = await fetch(url);
  const j = await r.json();
  let rates: Record<string, number> = j?.rates || {};
  // Fallback to open.er-api.com if empty
  if (!rates.UGX) {
    const r2 = await fetch("https://open.er-api.com/v6/latest/USD");
    const j2 = await r2.json();
    rates = j2?.rates || {};
  }
  if (!rates.UGX) throw new Error("FX provider unavailable");
  cache = { rates, ts: Date.now() };
  return rates;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const url = new URL(req.url);
    const from = (url.searchParams.get("from") || "USD").toUpperCase();
    const to = (url.searchParams.get("to") || "UGX").toUpperCase();
    const feePct = Number(url.searchParams.get("fee") || "5"); // default 5%

    const rates = await fetchRates();
    // Convert: amount_from -> amount_to. USD-based rates.
    const usdFrom = from === "USD" ? 1 : (rates[from] ? 1 / rates[from] : null);
    const usdTo = to === "USD" ? 1 : (rates[to] ? rates[to] : null);
    if (!usdFrom || !usdTo) {
      return new Response(JSON.stringify({ error: `Unsupported currency: ${from} or ${to}` }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const rate = usdFrom * usdTo; // 1 unit of `from` in `to`

    const now = Date.now();
    const lockedUntil = now + 15 * 60 * 1000;

    return new Response(JSON.stringify({
      from, to, rate, fee_pct: feePct,
      fetched_at: new Date(now).toISOString(),
      locked_until: new Date(lockedUntil).toISOString(),
    }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || "Unknown" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});