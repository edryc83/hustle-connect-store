import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
  const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

  const authHeader = req.headers.get("Authorization") || "";
  const userClient = createClient(SUPABASE_URL, ANON, { global: { headers: { Authorization: authHeader } } });
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  const { question } = await req.json().catch(() => ({ question: "" }));
  if (!question) return new Response(JSON.stringify({ error: "Missing question" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
  const [{ data: profile }, { data: settings }, { data: products }] = await Promise.all([
    admin.from("profiles").select("store_name, store_slug, first_name").eq("id", user.id).maybeSingle(),
    admin.from("agent_settings").select("*").eq("user_id", user.id).maybeSingle(),
    admin.from("products").select("name, price, description, category").eq("user_id", user.id).limit(60),
  ]);

  const catalog = (products || []).slice(0, 40).map((p: any) => {
    const price = p.price ? ` — UGX ${Number(p.price).toLocaleString()}` : "";
    return `• ${p.name}${price}${p.description ? ` (${String(p.description).slice(0, 120)})` : ""}`;
  }).join("\n");
  const storeUrl = profile?.store_slug ? `https://afristall.com/${profile.store_slug}` : "";
  const fallback = settings?.fallback_message || "Let me check with the shop owner and get back to you shortly.";
  const system = `You are ${settings?.agent_name || "Concierge"}, the AI assistant for ${profile?.store_name || profile?.first_name || "the shop"} on Afristall.
Tone: ${settings?.tone || "friendly, concise"}. Keep replies under 40 words.
Use ONLY this catalog:
${catalog || "(no products listed)"}
${storeUrl ? `Full store: ${storeUrl}` : ""}
If you can't answer from the catalog, say: "${fallback}"`;

  if (!LOVABLE_API_KEY) {
    return new Response(JSON.stringify({ reply: fallback }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Lovable-API-Key": LOVABLE_API_KEY },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: system },
        { role: "user", content: question },
      ],
    }),
  });
  if (!res.ok) {
    const txt = await res.text();
    return new Response(JSON.stringify({ error: "AI gateway failed", details: txt }), { status: res.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
  const data = await res.json();
  const reply = data.choices?.[0]?.message?.content?.trim() || fallback;
  return new Response(JSON.stringify({ reply }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
});