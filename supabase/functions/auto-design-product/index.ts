import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function formatPrice(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `${currency} ${Math.round(amount).toLocaleString("en-US")}`;
  }
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

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: "OPENAI_API_KEY is not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;

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

    const { productId } = await req.json();
    if (!productId || typeof productId !== "string") {
      return new Response(JSON.stringify({ error: "productId required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    const { data: product, error: pErr } = await admin
      .from("products")
      .select("id, name, price, discount_price, image_url, description, user_id")
      .eq("id", productId).maybeSingle();
    if (pErr || !product) {
      console.error("Product fetch error", pErr, "productId:", productId);
      return new Response(JSON.stringify({ error: "Product not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (product.user_id !== userId) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!product.image_url) {
      return new Response(JSON.stringify({ error: "Product has no image. Add a product photo first." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: profile } = await admin
      .from("profiles")
      .select("store_name, whatsapp_number, accent_color")
      .eq("id", userId).maybeSingle();

    const currency = profile?.currency || "UGX";
    const priceNum = (product as any).discount_price ?? product.price;
    const priceStr = formatPrice(Number(priceNum), currency);
    const phone = profile?.whatsapp_number?.trim() || "";
    const accent = profile?.accent_color || "#F97316";
    const storeName = profile?.store_name || "";

    const prompt = [
      "Design a PREMIUM, MINIMAL editorial product poster, 1:1 square, gallery-grade.",
      "Use the supplied product image as the hero subject. Keep the real product photo clean, color-graded, with a soft realistic shadow.",
      "Lots of negative space. Calm, sophisticated background — soft gradient, paper texture, or subtle solid color. No clutter, no stickers, no emojis, no fake badges, no stars, no busy patterns.",
      `Use ${accent} as a tasteful brand accent color (small accents only — a thin line, dot, or small price chip). Keep the overall palette restrained and premium.`,
      "Typography: clean modern sans-serif. Tight hierarchy. AT MOST these text elements, nothing else:",
      `1. Product title: "${product.name}" (large, bold)`,
      `2. Price: "${priceStr}" (medium, accent color)`,
      phone ? `3. WhatsApp number: "${phone}" (small, with a tiny WhatsApp glyph)` : "3. (no phone number)",
      `4. Tiny mark in a bottom corner: "Designed by Afristall" (very small, low-contrast).`,
      storeName ? `Optional: small store name "${storeName}" near the corner if it fits gracefully.` : "",
      "Strictly avoid: long descriptions, paragraphs, multiple price tags, watermarks across the product, neon, drop shadows on text, decorative emojis, flags, hashtags.",
      "Final output must look like a high-end fashion / Apple-style product poster.",
    ].filter(Boolean).join("\n");

    // Download product image
    const imgResp = await fetch(product.image_url);
    if (!imgResp.ok) {
      return new Response(JSON.stringify({ error: "Could not load product image" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const imgBuf = await imgResp.arrayBuffer();
    const imgType = imgResp.headers.get("content-type") || "image/png";
    const imgFile = new File([imgBuf], "product.png", { type: imgType });

    const form = new FormData();
    form.append("model", "gpt-image-1");
    form.append("prompt", prompt);
    form.append("size", "1024x1024");
    form.append("quality", "high");
    form.append("n", "1");
    form.append("image", imgFile);

    const openaiResp = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
      body: form,
    });

    if (!openaiResp.ok) {
      const errText = await openaiResp.text();
      console.error("OpenAI error:", openaiResp.status, errText);
      let msg = "Image generation failed";
      if (openaiResp.status === 401) msg = "OpenAI API key is invalid";
      else if (openaiResp.status === 429) msg = "OpenAI is rate-limiting requests. Try again in a moment.";
      else if (errText.toLowerCase().includes("verified")) {
        msg = "Your OpenAI organization needs to be verified to use gpt-image-1. Visit platform.openai.com/settings/organization/general.";
      } else if (errText.toLowerCase().includes("safety") || errText.toLowerCase().includes("policy")) {
        msg = "OpenAI's safety system blocked this image. Try a different product photo.";
      }
      return new Response(JSON.stringify({ error: msg, detail: errText }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const openaiJson = await openaiResp.json();
    const b64: string | undefined = openaiJson?.data?.[0]?.b64_json;
    if (!b64) {
      return new Response(JSON.stringify({ error: "No image returned" }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Decode base64 to bytes
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);

    const path = `${userId}/auto-${product.id}-${Date.now()}.png`;
    const { error: upErr } = await admin.storage
      .from("product-images")
      .upload(path, bytes, { contentType: "image/png", upsert: true });
    if (upErr) {
      return new Response(JSON.stringify({ error: "Upload failed", detail: upErr.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data: pub } = admin.storage.from("product-images").getPublicUrl(path);

    return new Response(JSON.stringify({ url: pub.publicUrl, hasPhone: !!phone }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("auto-design-product error", e);
    return new Response(JSON.stringify({ error: e?.message || "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});