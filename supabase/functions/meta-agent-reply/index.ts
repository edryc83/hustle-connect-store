import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

// Meta AI Concierge webhook
// - GET: webhook verification
// - POST: signature-verified event handler that generates an AI reply from the
//   seller's catalog + agent settings and sends it via the Meta Send API.

const GRAPH = "https://graph.facebook.com/v19.0";

async function verifySignature(rawBody: string, signatureHeader: string | null, appSecret: string) {
  if (!signatureHeader?.startsWith("sha256=")) return false;
  const expected = signatureHeader.slice(7);
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(appSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(rawBody));
  const hex = Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
  return hex === expected;
}

async function generateReply(opts: {
  sellerName: string;
  storeSlug: string | null;
  agentName: string;
  tone: string;
  fallback: string;
  products: Array<{ name: string; price: number | null; description: string | null; category: string | null }>;
  question: string;
}) {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) return opts.fallback;

  const catalog = opts.products.slice(0, 40).map((p) => {
    const price = p.price ? ` — UGX ${Number(p.price).toLocaleString()}` : "";
    return `• ${p.name}${price}${p.description ? ` (${p.description.slice(0, 120)})` : ""}`;
  }).join("\n");

  const storeUrl = opts.storeSlug ? `https://afristall.com/${opts.storeSlug}` : "";
  const system = `You are ${opts.agentName}, the AI assistant for ${opts.sellerName}'s shop on Afristall.
Tone: ${opts.tone}. Reply in the customer's language (default English). Keep replies under 40 words.
If asked about products, use ONLY this catalog:
${catalog || "(no products listed)"}
${storeUrl ? `Full store: ${storeUrl}` : ""}
If the question can't be answered from the catalog, say: "${opts.fallback}"`;

  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": LOVABLE_API_KEY,
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: system },
          { role: "user", content: opts.question },
        ],
      }),
    });
    if (!res.ok) {
      console.error("AI gateway error", res.status, await res.text());
      return opts.fallback;
    }
    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() || opts.fallback;
  } catch (e) {
    console.error("AI reply failed", e);
    return opts.fallback;
  }
}

async function sendMessage(platform: string, pageAccessToken: string, recipientId: string, text: string) {
  const url = `${GRAPH}/me/messages?access_token=${encodeURIComponent(pageAccessToken)}`;
  const body = {
    recipient: { id: recipientId },
    message: { text },
    messaging_type: "RESPONSE",
  };
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    console.error(`Meta send (${platform}) failed`, res.status, await res.text());
    return false;
  }
  return true;
}

async function replyToComment(commentId: string, accessToken: string, text: string) {
  const url = `${GRAPH}/${commentId}/comments?access_token=${encodeURIComponent(accessToken)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: text }),
  });
  if (!res.ok) {
    console.error("Meta comment reply failed", res.status, await res.text());
    return false;
  }
  return true;
}

// Private reply (DM) triggered by a comment. Works for both Messenger (page)
// and Instagram (ig account) via the same endpoint on the connected token.
async function privateReplyToComment(
  ownerId: string,
  accessToken: string,
  commentId: string,
  text: string,
) {
  const url = `${GRAPH}/${ownerId}/messages?access_token=${encodeURIComponent(accessToken)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      recipient: { comment_id: commentId },
      message: { text },
    }),
  });
  if (!res.ok) {
    console.error("Meta private reply failed", res.status, await res.text());
    return false;
  }
  return true;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const VERIFY_TOKEN = Deno.env.get("META_VERIFY_TOKEN");
  const APP_SECRET = Deno.env.get("META_APP_SECRET");
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  // GET: webhook verification
  if (req.method === "GET") {
    const url = new URL(req.url);
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("Meta webhook verified");
      return new Response(challenge, { status: 200 });
    }

    console.warn("Meta webhook verification failed", { mode, token });
    return new Response("Verification failed", { status: 403, headers: corsHeaders });
  }

  // POST: incoming events — verify signature, then process.
  const raw = await req.text();
  if (APP_SECRET) {
    const ok = await verifySignature(raw, req.headers.get("x-hub-signature-256"), APP_SECRET);
    if (!ok) {
      console.warn("Invalid X-Hub-Signature-256");
      return new Response("bad signature", { status: 403 });
    }
  }

  let body: any;
  try { body = JSON.parse(raw); } catch { return new Response("EVENT_RECEIVED", { status: 200 }); }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

  // Ack quickly by processing async — but Deno.serve keeps working; we still await.
  try {
    for (const entry of body.entry || []) {
      const messagingEvents = entry.messaging || entry.standby || [];
      for (const event of messagingEvents) {
        const senderId = event.sender?.id;
        const recipientId = event.recipient?.id;
        const message = event.message;
        const postback = event.postback;
        if (!senderId || !recipientId) continue;

        const text = message?.text || postback?.title || "";
        if (message?.is_echo || !text) continue;

        // The page/IG account receiving the DM is the recipient.
        const pageOrIgId = recipientId;
        const platform = entry.id === pageOrIgId ? "messenger" : "instagram";

        // Find the seller connection.
        const { data: conn } = await admin
          .from("meta_connections")
          .select("user_id, page_access_token, ig_access_token, platform")
          .or(`page_id.eq.${pageOrIgId},ig_account_id.eq.${pageOrIgId}`)
          .eq("is_active", true)
          .maybeSingle();

        await admin.from("meta_conversations").insert({
          user_id: conn?.user_id ?? null,
          platform,
          external_user_id: senderId,
          page_or_ig_id: pageOrIgId,
          direction: "inbound",
          content: text,
          raw_event: event,
        });

        if (!conn) {
          console.warn("No seller connected for page", pageOrIgId);
          continue;
        }

        // Load seller profile, settings, products.
        const [{ data: profile }, { data: settings }, { data: products }] = await Promise.all([
          admin.from("profiles").select("store_name, store_slug, first_name").eq("id", conn.user_id).maybeSingle(),
          admin.from("agent_settings").select("*").eq("user_id", conn.user_id).maybeSingle(),
          admin.from("products").select("name, price, description, category").eq("user_id", conn.user_id).limit(60),
        ]);

        if (settings && settings.auto_reply_enabled === false) {
          continue;
        }

        const reply = await generateReply({
          sellerName: profile?.store_name || profile?.first_name || "our shop",
          storeSlug: profile?.store_slug ?? null,
          agentName: settings?.agent_name || "Concierge",
          tone: settings?.tone || "friendly, concise",
          fallback: settings?.fallback_message || "Let me check with the shop owner and get back to you shortly.",
          products: products || [],
          question: text,
        });

        const token = conn.page_access_token || conn.ig_access_token;
        if (!token) {
          console.warn("No access token stored for connection");
          continue;
        }

        const sent = await sendMessage(platform, token, senderId, reply);
        await admin.from("meta_conversations").insert({
          user_id: conn.user_id,
          platform,
          external_user_id: senderId,
          page_or_ig_id: pageOrIgId,
          direction: "outbound",
          content: reply,
          ai_reply_generated: true,
          raw_event: { sent },
        });
      }

      // ===== Comment events (Facebook Page feed + Instagram comments) =====
      for (const change of entry.changes || []) {
        const field = change.field;
        const value = change.value || {};
        const isFbComment = field === "feed" && value.item === "comment" && value.verb === "add";
        const isIgComment = field === "comments";
        if (!isFbComment && !isIgComment) continue;

        const commentId = value.comment_id || value.id;
        const commentText = value.message || value.text || "";
        const fromId = value.from?.id;
        const pageOrIgId = entry.id;
        const platform = isFbComment ? "messenger" : "instagram";
        if (!commentId || !commentText || !fromId) continue;
        // Skip our own replies to avoid loops.
        if (fromId === pageOrIgId) continue;

        const { data: conn } = await admin
          .from("meta_connections")
          .select("user_id, page_access_token, ig_access_token")
          .or(`page_id.eq.${pageOrIgId},ig_account_id.eq.${pageOrIgId}`)
          .eq("is_active", true)
          .maybeSingle();

        await admin.from("meta_conversations").insert({
          user_id: conn?.user_id ?? null,
          platform,
          external_user_id: fromId,
          page_or_ig_id: pageOrIgId,
          direction: "inbound",
          content: `[comment] ${commentText}`,
          raw_event: change,
        });

        if (!conn) continue;

        const [{ data: profile }, { data: settings }, { data: products }] = await Promise.all([
          admin.from("profiles").select("store_name, store_slug, first_name").eq("id", conn.user_id).maybeSingle(),
          admin.from("agent_settings").select("*").eq("user_id", conn.user_id).maybeSingle(),
          admin.from("products").select("name, price, description, category").eq("user_id", conn.user_id).limit(60),
        ]);

        if (settings && settings.auto_reply_enabled === false) continue;

        const reply = await generateReply({
          sellerName: profile?.store_name || profile?.first_name || "our shop",
          storeSlug: profile?.store_slug ?? null,
          agentName: settings?.agent_name || "Concierge",
          tone: settings?.tone || "friendly, concise",
          fallback: settings?.fallback_message || "Thanks for your comment! We'll DM you shortly.",
          products: products || [],
          question: commentText,
        });

        const token = conn.page_access_token || conn.ig_access_token;
        if (!token) continue;

        // Public reply under the comment (short & friendly).
        const publicReply = reply.length > 240 ? reply.slice(0, 237) + "..." : reply;
        const publicOk = await replyToComment(commentId, token, publicReply);

        // Also send a private DM with the full answer + store link.
        const storeUrl = profile?.store_slug ? `https://afristall.com/${profile.store_slug}` : "";
        const dmText = storeUrl ? `${reply}\n\nBrowse the full shop: ${storeUrl}` : reply;
        const dmOk = await privateReplyToComment(pageOrIgId, token, commentId, dmText);

        await admin.from("meta_conversations").insert({
          user_id: conn.user_id,
          platform,
          external_user_id: fromId,
          page_or_ig_id: pageOrIgId,
          direction: "outbound",
          content: `[comment-reply] ${publicReply}${dmOk ? `\n[dm] ${dmText}` : ""}`,
          ai_reply_generated: true,
          raw_event: { publicOk, dmOk, commentId },
        });
      }
    }
  } catch (err) {
    console.error("Meta webhook processing error:", err);
  }

  return new Response("EVENT_RECEIVED", { status: 200, headers: corsHeaders });
});
