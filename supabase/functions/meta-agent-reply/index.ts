import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

// Meta AI Concierge webhook
// Handles Messenger + Instagram DM events and Page comments
// Callback URL: https://<project-ref>.supabase.co/functions/v1/meta-agent-reply

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

  // POST: incoming events
  try {
    const body = await req.json();
    console.log("Meta event:", JSON.stringify(body));

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    // Process each entry and messaging event
    for (const entry of body.entry || []) {
      for (const event of entry.messaging || []) {
        const senderId = event.sender?.id;
        const recipientId = event.recipient?.id;
        const message = event.message;
        const postback = event.postback;

        if (!senderId) continue;

        const text = message?.text || postback?.title || "";
        const isEcho = message?.is_echo === true;
        if (isEcho || !text) continue;

        // Determine platform from entry ID / event
        const platform = entry.id === recipientId ? "messenger" : "instagram";

        // TODO: look up seller by page/IG account, fetch catalog + settings,
        // call AI concierge, and send reply via Meta Send API.
        console.log(`Received ${platform} message from ${senderId}: ${text}`);

        // Store the incoming message
        await admin.from("meta_conversations").insert({
          platform,
          external_user_id: senderId,
          page_or_ig_id: recipientId,
          direction: "inbound",
          content: text,
          raw_event: event,
        }).then(({ error }) => {
          if (error) console.error("Failed to store inbound message:", error);
        });
      }
    }

    return new Response("EVENT_RECEIVED", { status: 200, headers: corsHeaders });
  } catch (err) {
    console.error("Meta webhook error:", err);
    return new Response("EVENT_RECEIVED", { status: 200, headers: corsHeaders });
  }
});
