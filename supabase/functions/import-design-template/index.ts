import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

function pickMeta(html: string, names: string[]): string | null {
  for (const name of names) {
    const re = new RegExp(
      `<meta[^>]+(?:property|name)=["']${name}["'][^>]*content=["']([^"']+)["']`,
      "i",
    );
    const m = html.match(re);
    if (m) return m[1];
    const re2 = new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]*(?:property|name)=["']${name}["']`,
      "i",
    );
    const m2 = html.match(re2);
    if (m2) return m2[1];
  }
  return null;
}

async function resolveImageUrl(url: string): Promise<{ imageUrl: string; label: string | null }> {
  // If URL looks like a direct image, use as-is
  if (/\.(png|jpe?g|webp|gif|avif)(\?|$)/i.test(url)) {
    return { imageUrl: url, label: null };
  }
  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "text/html,*/*" } });
  const ct = res.headers.get("content-type") || "";
  if (ct.startsWith("image/")) {
    return { imageUrl: res.url, label: null };
  }
  const html = await res.text();
  const img =
    pickMeta(html, ["og:image:secure_url", "og:image", "twitter:image", "twitter:image:src"]) ||
    null;
  const title =
    pickMeta(html, ["og:title", "twitter:title"]) ||
    (html.match(/<title>([^<]+)<\/title>/i)?.[1] ?? null);
  if (!img) throw new Error("Could not find an image on that page");
  // Resolve relative URLs
  const absolute = new URL(img, res.url).toString();
  return { imageUrl: absolute, label: title?.trim().slice(0, 60) || null };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(SUPABASE_URL, ANON, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userRes, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userRes?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = userRes.user.id;

    const { url } = await req.json();
    if (!url || typeof url !== "string") {
      return new Response(JSON.stringify({ error: "Missing url" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { imageUrl, label } = await resolveImageUrl(url);

    // Download the image
    const imgRes = await fetch(imageUrl, { headers: { "User-Agent": UA, Referer: url } });
    if (!imgRes.ok) throw new Error(`Failed to download image (${imgRes.status})`);
    const ct = imgRes.headers.get("content-type") || "image/jpeg";
    if (!ct.startsWith("image/")) throw new Error("URL did not return an image");
    const buf = new Uint8Array(await imgRes.arrayBuffer());
    if (buf.byteLength > 8 * 1024 * 1024) throw new Error("Image too large (>8MB)");
    const ext = ct.split("/")[1]?.split(";")[0] || "jpg";
    const path = `${userId}/${Date.now()}.${ext}`;

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
    const { error: upErr } = await admin.storage
      .from("design-templates")
      .upload(path, buf, { contentType: ct, upsert: false });
    if (upErr) throw upErr;
    const { data: pub } = admin.storage.from("design-templates").getPublicUrl(path);

    const finalLabel = (label || "Imported template").slice(0, 60);
    const { data: row, error: insErr } = await admin
      .from("user_design_templates")
      .insert({ user_id: userId, label: finalLabel, image_url: pub.publicUrl, prompt: null })
      .select("id, label, image_url, prompt")
      .single();
    if (insErr) throw insErr;

    return new Response(JSON.stringify({ template: row }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || "Failed to import" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});