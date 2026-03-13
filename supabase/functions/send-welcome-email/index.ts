import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { storeName, firstName, email, storeSlug } = await req.json();

    if (!email || !storeName) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const storeUrl = `https://afristall.com/${storeSlug || ""}`;
    const displayName = firstName || storeName;

    const subject = `Welcome to Afristall, ${displayName}! 🎉`;

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#1a1a1f;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#1a1a1f;padding:40px 20px;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background-color:#222228;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.06);">

<!-- Header -->
<tr><td style="padding:32px 32px 24px;text-align:center;">
  <img src="https://hustle-connect-store.lovable.app/logo.jpeg" alt="Afristall" width="48" height="48" style="border-radius:12px;margin-bottom:16px;" />
  <h1 style="margin:0;font-size:22px;font-weight:700;color:#ffffff;">
    Welcome to Afri<span style="color:hsl(18,100%,60%);">stall</span>! 🚀
  </h1>
</td></tr>

<!-- Body -->
<tr><td style="padding:0 32px 32px;">
  <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#b0b0b8;">
    Hey ${displayName},
  </p>
  <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#b0b0b8;">
    Your store <strong style="color:#ffffff;">${storeName}</strong> is live on Afristall! 🎉 You're now ready to start adding products and connecting with buyers via WhatsApp.
  </p>

  <!-- CTA -->
  <table width="100%" cellpadding="0" cellspacing="0">
  <tr><td align="center" style="padding:8px 0 24px;">
    <a href="${storeUrl}" target="_blank" style="display:inline-block;padding:12px 32px;background-color:hsl(18,100%,60%);color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;border-radius:8px;">
      View Your Store
    </a>
  </td></tr>
  </table>

  <!-- Quick tips -->
  <div style="background-color:rgba(255,255,255,0.04);border-radius:12px;padding:20px;border:1px solid rgba(255,255,255,0.06);">
    <p style="margin:0 0 12px;font-size:13px;font-weight:600;color:#ffffff;">Quick start tips:</p>
    <p style="margin:0 0 8px;font-size:13px;line-height:1.5;color:#b0b0b8;">📸 Add product photos to attract buyers</p>
    <p style="margin:0 0 8px;font-size:13px;line-height:1.5;color:#b0b0b8;">💬 Share your store link on WhatsApp & socials</p>
    <p style="margin:0;font-size:13px;line-height:1.5;color:#b0b0b8;">🏷️ Set competitive prices with discounts</p>
  </div>
</td></tr>

<!-- Footer -->
<tr><td style="padding:20px 32px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
  <p style="margin:0;font-size:12px;color:#666;">
    ${storeUrl}
  </p>
  <p style="margin:8px 0 0;font-size:11px;color:#555;">
    © ${new Date().getFullYear()} Afristall. All rights reserved.
  </p>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;

    // Enqueue via pgmq for reliable delivery
    const messageId = `welcome-${crypto.randomUUID()}`;

    const { error: enqueueError } = await supabase.rpc("enqueue_email", {
      p_queue_name: "transactional_emails",
      p_message: {
        to: email,
        subject,
        html,
        from_name: "Afristall",
        message_id: messageId,
        template_name: "welcome",
      },
    });

    if (enqueueError) {
      console.error("Enqueue error:", enqueueError);
      throw new Error(`Failed to enqueue email: ${enqueueError.message}`);
    }

    // Log pending status
    await supabase.from("email_send_log").insert({
      message_id: messageId,
      template_name: "welcome",
      recipient_email: email,
      status: "pending",
      metadata: { store_name: storeName, store_slug: storeSlug },
    });

    return new Response(
      JSON.stringify({ success: true, message_id: messageId }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Welcome email error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to send welcome email" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
