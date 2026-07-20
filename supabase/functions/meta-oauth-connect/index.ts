import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

// Called from the dashboard after Facebook Login returns a short-lived user token.
// Exchanges it for a long-lived user token, fetches the user's Pages (with page
// access tokens), subscribes each page to our webhook, and stores rows in
// meta_connections for the authenticated seller.

const GRAPH = "https://graph.facebook.com/v19.0";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const APP_ID = Deno.env.get("META_APP_ID");
  const APP_SECRET = Deno.env.get("META_APP_SECRET");
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
  const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  if (!APP_ID || !APP_SECRET) {
    return new Response(JSON.stringify({ error: "Meta app not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const authHeader = req.headers.get("Authorization") || "";
  const userClient = createClient(SUPABASE_URL, ANON, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user }, error: userErr } = await userClient.auth.getUser();
  if (userErr || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: any;
  try { body = await req.json(); } catch { body = {}; }
  const shortToken = body.access_token;
  const action: "list" | "connect" = body.action === "connect" ? "connect" : "list";
  const selectedPageIds: string[] = Array.isArray(body.page_ids) ? body.page_ids : [];
  if (!shortToken) {
    return new Response(JSON.stringify({ error: "Missing access_token" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // 1. Exchange for long-lived user token
    const exchangeUrl = `${GRAPH}/oauth/access_token?grant_type=fb_exchange_token&client_id=${APP_ID}&client_secret=${APP_SECRET}&fb_exchange_token=${encodeURIComponent(shortToken)}`;
    const exchangeRes = await fetch(exchangeUrl);
    const exchange = await exchangeRes.json();
    if (!exchangeRes.ok || !exchange.access_token) {
      return new Response(JSON.stringify({ error: "Token exchange failed", details: exchange }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const longToken = exchange.access_token;

    // 2. Fetch pages with page access tokens (never expire) + linked IG account
    const pagesRes = await fetch(
      `${GRAPH}/me/accounts?fields=id,name,access_token,picture{url},instagram_business_account{id,username,profile_picture_url}&access_token=${encodeURIComponent(longToken)}`,
    );
    const pages = await pagesRes.json();
    if (!pagesRes.ok) {
      return new Response(JSON.stringify({ error: "Failed to fetch pages", details: pages }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Action: list — return pages for the picker without saving anything.
    if (action === "list") {
      const list = (pages.data || []).map((p: any) => ({
        page_id: p.id,
        name: p.name,
        picture: p.picture?.data?.url || null,
        long_token: longToken,
        page_access_token: p.access_token,
        ig_account_id: p.instagram_business_account?.id || null,
        ig_username: p.instagram_business_account?.username || null,
      }));
      return new Response(JSON.stringify({ pages: list }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
    const connected: any[] = [];

    const toConnect = (pages.data || []).filter((p: any) =>
      selectedPageIds.length === 0 ? true : selectedPageIds.includes(p.id),
    );

    for (const page of toConnect) {
      // 3. Subscribe page to webhook
      await fetch(
        `${GRAPH}/${page.id}/subscribed_apps?subscribed_fields=messages,messaging_postbacks,message_reactions,feed&access_token=${encodeURIComponent(page.access_token)}`,
        { method: "POST" },
      ).then(async (r) => {
        if (!r.ok) console.warn("subscribed_apps failed for", page.id, await r.text());
      });

      const igId = page.instagram_business_account?.id || null;

      // Ensure default agent settings exist for this seller
      await admin.from("agent_settings").upsert({
        user_id: user.id,
        agent_name: "Concierge",
        tone: "friendly, concise, professional",
        welcome_message: "Hi! How can I help you today?",
        fallback_message: "Let me check with the shop owner and get back to you shortly.",
        auto_reply_enabled: true,
      }, { onConflict: "user_id" });

      // Upsert connection
      const { data, error } = await admin.from("meta_connections").upsert({
        user_id: user.id,
        platform: igId ? "instagram_and_messenger" : "messenger",
        page_id: page.id,
        ig_account_id: igId,
        page_access_token: page.access_token,
        ig_access_token: igId ? page.access_token : null,
        is_active: true,
        updated_at: new Date().toISOString(),
      }, { onConflict: "page_id" }).select().single();

      if (error) console.error("meta_connections upsert error", error);
      else connected.push({ id: data.id, page_id: page.id, name: page.name, ig_id: igId });
    }

    return new Response(JSON.stringify({ connected }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("meta-oauth-connect error", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});