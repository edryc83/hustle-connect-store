import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const APP_URL = "https://hustle-connect-store.lovable.app";
const FALLBACK_IMAGE = `${APP_URL}/logo-glow.png`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const url = new URL(req.url);
    const slug = url.searchParams.get("slug");

    if (!slug) {
      return Response.redirect(APP_URL, 302);
    }

    const storeUrl = `${APP_URL}/${slug}`;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: profile } = await supabase
      .from("profiles")
      .select("store_name, store_bio, profile_picture_url, category, city, country")
      .eq("store_slug", slug)
      .single();

    if (!profile) {
      return Response.redirect(storeUrl, 302);
    }

    const title = `${profile.store_name || slug} — Shop on Afristall`;
    const description = profile.store_bio ||
      `Check out ${profile.store_name || slug}${profile.category ? ` for ${profile.category}` : ""}${profile.city ? ` in ${profile.city}` : ""}. Order directly on WhatsApp! 🛒`;
    const image = profile.profile_picture_url || FALLBACK_IMAGE;
    const location = [profile.city, profile.country].filter(Boolean).join(", ");

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />

  <!-- Open Graph -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${storeUrl}" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:image" content="${escapeHtml(image)}" />
  <meta property="og:image:width" content="400" />
  <meta property="og:image:height" content="400" />
  <meta property="og:site_name" content="Afristall" />
  ${location ? `<meta property="og:locale" content="en_US" />` : ""}

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="@Afristall" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${escapeHtml(image)}" />

  <!-- Auto-redirect to actual store -->
  <meta http-equiv="refresh" content="0;url=${storeUrl}" />
  <link rel="canonical" href="${storeUrl}" />
</head>
<body>
  <p>Redirecting to <a href="${storeUrl}">${escapeHtml(profile.store_name || slug)}</a>...</p>
  <script>window.location.replace("${storeUrl}");</script>
</body>
</html>`;

    return new Response(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=300, s-maxage=300",
      },
    });
  } catch (error) {
    return Response.redirect(APP_URL, 302);
  }
});

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
