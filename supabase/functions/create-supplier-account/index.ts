import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function tempPassword() {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let s = "";
  for (let i = 0; i < 10; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s + "!9";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;

    const userClient = createClient(SUPABASE_URL, ANON, { global: { headers: { Authorization: authHeader } } });
    const { data: userRes } = await userClient.auth.getUser();
    const caller = userRes?.user;
    if (!caller) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    // Caller must be admin OR agent
    const { data: isAdmin } = await admin.rpc("is_admin", { _user_id: caller.id });
    const { data: isAgent } = await admin.rpc("is_agent", { _user_id: caller.id });
    if (!isAdmin && !isAgent) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const body = await req.json();
    const { email, business_name, country, currency, contact_name, whatsapp, bio, lead_time_days, bank_details } = body;

    if (!email || !business_name || !country || !["UK","UAE"].includes(country)) {
      return new Response(JSON.stringify({ error: "Missing/invalid fields" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const password = tempPassword();

    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { is_supplier: true, business_name },
    });
    if (createErr || !created?.user) {
      return new Response(JSON.stringify({ error: createErr?.message || "Could not create account" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const newUserId = created.user.id;

    // Grant supplier role
    await admin.from("user_roles").insert({ user_id: newUserId, role: "supplier" });

    // Generate supplier code
    const { data: seq } = await admin.rpc("nextval" as any, { seq_name: "supplier_code_seq" } as any).catch(() => ({ data: null } as any));
    // Fallback: use a select if rpc nextval not exposed
    let supplierCode = "";
    {
      const { data: nextRow } = await admin.from("suppliers").select("supplier_code").order("created_at", { ascending: false }).limit(1);
      const lastNum = nextRow?.[0]?.supplier_code?.match(/(\d+)$/)?.[1];
      const n = (lastNum ? parseInt(lastNum) : 0) + 1;
      supplierCode = `SUP-${country}-${String(n).padStart(4, "0")}`;
    }

    const { data: supplier, error: supErr } = await admin.from("suppliers").insert({
      user_id: newUserId,
      supplier_code: supplierCode,
      business_name,
      country,
      currency: currency || (country === "UK" ? "GBP" : "AED"),
      contact_name,
      whatsapp,
      email,
      bio,
      lead_time_days: lead_time_days || 14,
      bank_details: bank_details || null,
      created_by_agent: caller.id,
    }).select().single();

    if (supErr) {
      // rollback auth user
      await admin.auth.admin.deleteUser(newUserId);
      return new Response(JSON.stringify({ error: supErr.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ supplier, temp_password: password }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || "Unknown" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});