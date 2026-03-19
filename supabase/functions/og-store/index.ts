import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const APP_URL = "https://afristall.com";
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
    const productId = url.searchParams.get("productId");

    if (!slug) {
      return Response.redirect(APP_URL, 302);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: profile } = await supabase
      .from("profiles")
      .select("store_name, store_bio, profile_picture_url, category, city, country, id")
      .eq("store_slug", slug)
      .single();

    if (!profile) {
      return Response.redirect(`${APP_URL}/${slug}`, 302);
    }

    // Product-level OG
    if (productId) {
      const { data: product } = await supabase
        .from("products")
        .select("name, description, price, discount_price, image_url")
        .eq("id", productId)
        .eq("user_id", profile.id)
        .single();

      if (product) {
        // Try to get first product image
        const { data: imgRow } = await supabase
          .from("product_images")
          .select("image_url")
          .eq("product_id", productId)
          .order("position", { ascending: true })
          .limit(1)
          .single();

        const productUrl = `${APP_URL}/${slug}/${productId}`;
        const price = product.discount_price ?? product.price;
        const title = `${product.name} — ${profile.store_name || slug}`;
        const description = product.description || `${product.name} for ${price}. Order on WhatsApp!`;
        const image = imgRow?.image_url || product.image_url || profile.profile_picture_url || FALLBACK_IMAGE;

        return new Response(buildHtml({ title, description, image, pageUrl: productUrl, storeName: profile.store_name || slug }), {
          headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=300, s-maxage=300" },
        });
      }
    }

    // Store-level OG (fallback)
    const storeUrl = `${APP_URL}/${slug}`;
    const title = `${profile.store_name || slug} — Shop on Afristall`;
    // Parse category — could be a JSON string or plain text
    let categoryLabel = "";
    if (profile.category) {
      try {
        const parsed = JSON.parse(profile.category);
        if (typeof parsed === "object" && parsed !== null) {
          categoryLabel = Object.keys(parsed).join(", ");
        } else {
          categoryLabel = String(parsed);
        }
      } catch {
        categoryLabel = profile.category;
      }
    }
    const description = profile.store_bio ||
      `Check out ${profile.store_name || slug}${categoryLabel ? ` for ${categoryLabel}` : ""}${profile.city ? ` in ${profile.city}` : ""}. Order directly on WhatsApp! 🛒`;
    const image = profile.profile_picture_url || FALLBACK_IMAGE;

    return new Response(buildHtml({ title, description, image, pageUrl: storeUrl, storeName: profile.store_name || slug }), {
      headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=300, s-maxage=300" },
    });
  } catch (error) {
    return Response.redirect(APP_URL, 302);
  }
});

function buildHtml({ title, description, image, pageUrl, storeName }: { title: string; description: string; image: string; pageUrl: string; storeName: string }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />

  <!-- Open Graph -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${pageUrl}" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:image" content="${escapeHtml(image)}" />
  <meta property="og:image:width" content="400" />
  <meta property="og:image:height" content="400" />
  <meta property="og:site_name" content="Afristall" />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="@Afristall" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${escapeHtml(image)}" />

  <!-- Auto-redirect to actual page -->
  <meta http-equiv="refresh" content="0;url=${pageUrl}" />
  <link rel="canonical" href="${pageUrl}" />
</head>
<body>
  <p>Redirecting to <a href="${pageUrl}">${escapeHtml(storeName)}</a>...</p>
  <script>window.location.replace("${pageUrl}");</script>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
