import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { INSPIRATIONS } from "../_shared/inspirations.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GRAPH = "https://graph.facebook.com/v19.0";

function formatPrice(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `${currency} ${Math.round(amount).toLocaleString("en-US")}`;
  }
}

// On-the-fly Studio poster generation for autopilot posts. Best-effort:
// returns a designed poster URL, or null so the caller falls back to the raw photo.
async function pickInspiration(admin: any, userId: string): Promise<typeof INSPIRATIONS[number]> {
  // Get template_ids used in this user's last N posts, avoid repeating them.
  const AVOID_WINDOW = Math.min(INSPIRATIONS.length - 1, 40);
  const { data: recent } = await admin
    .from("scheduled_posts")
    .select("template_id")
    .eq("user_id", userId)
    .not("template_id", "is", null)
    .order("created_at", { ascending: false })
    .limit(AVOID_WINDOW);
  const used = new Set((recent || []).map((r: any) => r.template_id));
  const pool = INSPIRATIONS.filter((t) => !used.has(t.id));
  const source = pool.length ? pool : INSPIRATIONS;
  return source[Math.floor(Math.random() * source.length)];
}

async function generateDesignedPoster(
  admin: any,
  product: any,
  profile: any,
  inspiration: typeof INSPIRATIONS[number],
): Promise<string | null> {
  const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
  if (!OPENAI_API_KEY || !product?.image_url) {
    (globalThis as any).__lastDesignError = !OPENAI_API_KEY ? "no OPENAI_API_KEY" : "no product image";
    return null;
  }
  try {
    const currency = profile?.currency || "UGX";
    const priceNum = product.discount_price ?? product.price;
    const priceStr = priceNum ? formatPrice(Number(priceNum), currency) : "";
    const phone = profile?.whatsapp_number?.trim() || "";
    const accent = profile?.accent_color || "#F97316";
    const storeName = profile?.store_name || "";

    const prompt = [
      "Design a PREMIUM PRODUCT AD POSTER, 1:1 square, gallery-grade — clearly a real advertisement, not just a product photo.",
      `TEMPLATE STYLE TO EMULATE: ${inspiration.prompt}`,
      "Use the FIRST supplied image as the product hero (subject). Use the SECOND supplied image ONLY as visual style reference for layout, palette, typography and composition — DO NOT copy its subject or text.",
      `Optionally blend in ${accent} as a subtle brand accent where it fits the template.`,
      "Typography: clean modern sans-serif with TIGHT hierarchy. Render ALL of the following text elements crisply and legibly — NO MISSPELLINGS, NO GIBBERISH:",
      `1. TITLE (large, bold, hero): "${product.name}"`,
      `2. SUBTITLE / TAGLINE (medium, one short punchy line you invent that sells this product — max 6 words).`,
      priceStr ? `3. PRICE chip in ${accent}: "${priceStr}"` : "",
      phone
        ? `4. CTA BUTTON — ONE single clean pill-shaped button, ${accent} background, crisp white text reading EXACTLY "Order on WhatsApp", with the phone number "${phone}" rendered as a small clean line directly beneath the pill (not inside it). Include a tiny WhatsApp glyph inside the pill, left of the text. Rounded-full corners, generous padding, no duplicate buttons.`
        : `4. CTA BUTTON — ONE single clean pill-shaped button, ${accent} background, crisp white text reading EXACTLY "Order Now". Rounded-full corners, generous padding, no duplicate buttons.`,
      `5. MANDATORY VISIBLE SIGNATURE: render the exact text "Designed by Afristall" in a bottom corner (bottom-right preferred). SMALL but CLEARLY LEGIBLE at thumbnail size.`,
      storeName ? `6. Small store name "${storeName}" near the top or opposite corner.` : "",
      "Strictly avoid: paragraphs, multiple prices, watermarks across the product, drop shadows on text, decorative emojis, flags, hashtags, lorem ipsum, broken letters.",
    ].filter(Boolean).join("\n");

    const imgResp = await fetch(product.image_url);
    if (!imgResp.ok) return null;
    const imgBuf = await imgResp.arrayBuffer();
    const imgType = imgResp.headers.get("content-type") || "image/png";
    const imgFile = new File([imgBuf], "product.png", { type: imgType });

    // Fetch the template reference image (public URL on afristall.com).
    const tmplUrl = inspiration.image.startsWith("http")
      ? inspiration.image
      : `https://afristall.com${inspiration.image}`;
    let tmplFile: File | null = null;
    try {
      const tr = await fetch(tmplUrl);
      if (tr.ok) {
        const tb = await tr.arrayBuffer();
        const tt = tr.headers.get("content-type") || "image/jpeg";
        tmplFile = new File([tb], "template.jpg", { type: tt });
      }
    } catch { /* non-fatal; proceed without style ref */ }

    const form = new FormData();
    form.append("model", "gpt-image-2");
    form.append("prompt", prompt);
    form.append("size", "1024x1024");
    form.append("quality", "medium");
    form.append("n", "1");
    form.append("image[]", imgFile);
    if (tmplFile) form.append("image[]", tmplFile);

    const openaiResp = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
      body: form,
    });
    if (!openaiResp.ok) {
      const errTxt = await openaiResp.text().catch(() => "");
      console.warn("autopilot design failed", openaiResp.status, errTxt);
      (globalThis as any).__lastDesignError = `openai ${openaiResp.status}: ${errTxt.slice(0, 200)}`;
      return null;
    }
    const j = await openaiResp.json();
    const b64: string | undefined = j?.data?.[0]?.b64_json;
    if (!b64) { (globalThis as any).__lastDesignError = "openai returned no b64"; return null; }
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);

    const path = `${product.user_id}/autopilot-${product.id}-${Date.now()}.png`;
    const { error: upErr } = await admin.storage
      .from("product-images")
      .upload(path, bytes, { contentType: "image/png", upsert: true });
    if (upErr) {
      console.warn("autopilot design upload failed", upErr.message);
      (globalThis as any).__lastDesignError = `upload: ${upErr.message}`;
      return null;
    }
    const { data: pub } = admin.storage.from("product-images").getPublicUrl(path);
    return pub?.publicUrl || null;
  } catch (e: any) {
    console.warn("autopilot design error", e);
    (globalThis as any).__lastDesignError = `exception: ${e?.message || e}`;
    return null;
  }
}

// Return HH:MM in a given IANA timezone.
function localHHMM(tz: string, d = new Date()): string {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: tz, hour: "2-digit", minute: "2-digit", hour12: false,
  });
  return fmt.format(d);
}

function localDateKey(tz: string, d = new Date()): string {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit",
  });
  return fmt.format(d); // YYYY-MM-DD
}

// Convert HH:MM to minutes.
function toMin(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

// Pick the slot whose time is within +/- 15 minutes of current local time.
function pickDueSlot(times: string[], nowHHMM: string): string | null {
  const now = toMin(nowHHMM);
  for (const t of times) {
    if (Math.abs(toMin(t) - now) <= 15) return t;
  }
  return null;
}

async function generateCaption(opts: {
  productName: string; price: number | null; description: string | null;
  storeName: string; storeUrl: string; tone: string; category?: string | null;
}): Promise<string> {
  const toneMap: Record<string, string> = {
    fun: "playful, upbeat, with 1-2 emojis",
    professional: "polished, confident, minimal emojis",
    bold: "punchy, high-energy, urgency-driven",
    friendly: "warm, conversational, one friendly emoji",
  };
  const style = toneMap[opts.tone] || toneMap.friendly;
  const priceLine = opts.price ? `Price: UGX ${Number(opts.price).toLocaleString()}.` : "";
  const system = `You write high-converting social media captions for African small businesses on Facebook & Instagram. Tone: ${style}. Write 2-4 short lines (max 280 chars of body), include the product name, a benefit-led hook, and the store link. Then ONE blank line. Then 6-10 highly relevant lowercase hashtags separated by spaces (e.g. #kampala #uganda #shoplocal + product/category tags). No markdown, no quotes.`;
  const user = `Product: ${opts.productName}\n${priceLine}\nCategory: ${opts.category || "general"}\nShop: ${opts.storeName}\nLink: ${opts.storeUrl}\n${opts.description ? `Notes: ${opts.description.slice(0, 300)}` : ""}`;

  const fallback = () => {
    const slug = (opts.productName || "").toLowerCase().replace(/[^a-z0-9]+/g, "");
    const cat = (opts.category || "").toLowerCase().replace(/[^a-z0-9]+/g, "");
    const priceTxt = opts.price ? ` Just UGX ${Number(opts.price).toLocaleString()}.` : "";
    const tags = ["#afristall", "#shoplocal", "#uganda", "#kampala", "#smallbusiness", "#madeinafrica"];
    if (slug) tags.push(`#${slug}`);
    if (cat && cat !== slug) tags.push(`#${cat}`);
    return `${opts.productName} is here! 🔥${priceTxt}\nOrder now from ${opts.storeName} 👉 ${opts.storeUrl}\n\n${tags.slice(0, 8).join(" ")}`;
  };

  // 1) Try Lovable AI Gateway.
  const lovKey = Deno.env.get("LOVABLE_API_KEY");
  if (lovKey) {
    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Lovable-API-Key": lovKey },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [{ role: "system", content: system }, { role: "user", content: user }],
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const txt = data.choices?.[0]?.message?.content?.trim();
        if (txt) return txt;
      } else {
        console.warn("caption lovable failed", res.status, await res.text().catch(() => ""));
      }
    } catch (e) { console.warn("caption lovable error", e); }
  }

  // 2) Fallback to OpenAI (gpt-4o-mini) if available.
  const oaKey = Deno.env.get("OPENAI_API_KEY");
  if (oaKey) {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${oaKey}` },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "system", content: system }, { role: "user", content: user }],
          temperature: 0.8,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const txt = data.choices?.[0]?.message?.content?.trim();
        if (txt) return txt;
      } else {
        console.warn("caption openai failed", res.status, await res.text().catch(() => ""));
      }
    } catch (e) { console.warn("caption openai error", e); }
  }

  return fallback();
}

async function postToFacebook(pageId: string, token: string, imageUrl: string, caption: string) {
  const res = await fetch(`${GRAPH}/${pageId}/photos?access_token=${encodeURIComponent(token)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: imageUrl, caption, published: true }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`FB post failed: ${JSON.stringify(data)}`);
  return data.post_id || data.id;
}

async function postToInstagram(igId: string, token: string, imageUrl: string, caption: string) {
  // Step 1: create media container
  const createRes = await fetch(`${GRAPH}/${igId}/media?access_token=${encodeURIComponent(token)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image_url: imageUrl, caption }),
  });
  const createData = await createRes.json();
  if (!createRes.ok) throw new Error(`IG media create failed: ${JSON.stringify(createData)}`);
  const creationId = createData.id;
  // Step 2: publish
  const pubRes = await fetch(`${GRAPH}/${igId}/media_publish?access_token=${encodeURIComponent(token)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ creation_id: creationId }),
  });
  const pubData = await pubRes.json();
  if (!pubRes.ok) throw new Error(`IG publish failed: ${JSON.stringify(pubData)}`);
  return pubData.id;
}

async function runForUser(admin: any, s: any, opts: { userId?: string; forceProductId?: string; manual?: boolean }) {
  const tz = s.timezone || "Africa/Kampala";
  const nowHHMM = localHHMM(tz);
  const dateKey = localDateKey(tz);
  const slot = opts.manual ? "manual" : pickDueSlot(s.post_times || [], nowHHMM);
  if (!slot && !opts.manual) return { skipped: "no due slot" };

  // Dedupe: skip if we already posted this slot today (skip for manual).
  if (!opts.manual) {
    const { data: existing } = await admin
      .from("scheduled_posts")
      .select("id")
      .eq("user_id", s.user_id)
      .eq("slot", slot)
      .gte("created_at", `${dateKey}T00:00:00Z`)
      .limit(1);
    if (existing && existing.length) return { skipped: "already posted this slot" };
  }

  // Load Meta connection.
  const { data: conn } = await admin
    .from("meta_connections")
    .select("page_id, page_access_token, ig_account_id, ig_access_token")
    .eq("user_id", s.user_id)
    .eq("is_active", true)
    .maybeSingle();
  if (!conn) {
    await admin.from("scheduled_posts").insert({
      user_id: s.user_id, slot, status: "failed", error: "No Meta account connected",
    });
    return { failed: "no meta connection" };
  }

  // Load profile.
  const { data: profile } = await admin
    .from("profiles")
    .select("store_name, store_slug, first_name, whatsapp_number, accent_color, currency")
    .eq("id", s.user_id)
    .maybeSingle();
  const storeName = profile?.store_name || profile?.first_name || "our shop";
  const storeUrl = profile?.store_slug ? `https://afristall.com/${profile.store_slug}` : "";

  // Pick next product (least recently posted, has image).
  let productQuery = admin
    .from("products")
    .select("id, user_id, name, price, discount_price, description, image_url, category")
    .eq("user_id", s.user_id)
    .not("image_url", "is", null);
  if (opts.forceProductId) productQuery = productQuery.eq("id", opts.forceProductId);
  const { data: products } = await productQuery.limit(50);
  if (!products?.length) {
    await admin.from("scheduled_posts").insert({
      user_id: s.user_id, slot, status: "failed", error: "No products with images",
    });
    return { failed: "no products" };
  }

  // Rotation: pick product least recently posted.
  const productIds = products.map((p: any) => p.id);
  const { data: recent } = await admin
    .from("scheduled_posts")
    .select("product_id, posted_at")
    .eq("user_id", s.user_id)
    .eq("status", "posted")
    .in("product_id", productIds)
    .order("posted_at", { ascending: false });
  const lastPostedMap = new Map<string, string>();
  for (const r of recent || []) if (r.product_id && !lastPostedMap.has(r.product_id)) lastPostedMap.set(r.product_id, r.posted_at);
  const product = opts.forceProductId
    ? products[0]
    : products.sort((a: any, b: any) => {
        const la = lastPostedMap.get(a.id) || "";
        const lb = lastPostedMap.get(b.id) || "";
        return la.localeCompare(lb);
      })[0];

  // On-the-fly Studio poster: prefer designed image, fall back to raw product photo.
  (globalThis as any).__lastDesignError = null;
  const designedUrl = await generateDesignedPoster(admin, product, profile);
  const designError = designedUrl ? null : (globalThis as any).__lastDesignError;
  const imageUrl = designedUrl || product.image_url;
  const caption = await generateCaption({
    productName: product.name, price: product.price, description: product.description,
    storeName, storeUrl, tone: s.tone || "friendly", category: product.category,
  });

  let fbPostId: string | null = null;
  let igPostId: string | null = null;
  let error: string | null = null;

  if (conn.page_id && conn.page_access_token) {
    try { fbPostId = await postToFacebook(conn.page_id, conn.page_access_token, imageUrl, caption); }
    catch (e: any) { error = `FB: ${e.message}`; console.error(error); }
  }
  if (conn.ig_account_id && (conn.ig_access_token || conn.page_access_token)) {
    try {
      igPostId = await postToInstagram(
        conn.ig_account_id,
        conn.ig_access_token || conn.page_access_token,
        imageUrl, caption,
      );
    } catch (e: any) {
      const msg = `IG: ${e.message}`;
      error = error ? `${error} | ${msg}` : msg;
      console.error(msg);
    }
  }

  const status = (fbPostId || igPostId) ? "posted" : "failed";
  const combinedError = [designError ? `design fallback: ${designError}` : null, error]
    .filter(Boolean).join(" | ") || null;
  await admin.from("scheduled_posts").insert({
    user_id: s.user_id, product_id: product.id, slot, status,
    caption, image_url: imageUrl,
    fb_post_id: fbPostId, ig_post_id: igPostId,
    posted_at: status === "posted" ? new Date().toISOString() : null,
    error: combinedError,
  });
  if (!opts.manual) {
    await admin.from("autopilot_settings").update({
      last_run_at: new Date().toISOString(), last_slot: slot,
    }).eq("user_id", s.user_id);
  }
  return { status, product: product.name, fbPostId, igPostId, error };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

  // Optional body: { userId, productId, manual: true } — manual "post now" trigger.
  let bodyIn: any = {};
  try { bodyIn = await req.json(); } catch { /* cron empty body */ }

  if (bodyIn?.manual && bodyIn?.userId) {
    const { data: s } = await admin
      .from("autopilot_settings").select("*").eq("user_id", bodyIn.userId).maybeSingle();
    const settings = s || {
      user_id: bodyIn.userId, post_times: [], tone: "friendly", timezone: "Africa/Kampala",
    };
    const result = await runForUser(admin, settings, { manual: true, forceProductId: bodyIn.productId });
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Cron path: process all enabled sellers.
  const { data: enabled } = await admin
    .from("autopilot_settings").select("*").eq("enabled", true);
  const results: any[] = [];
  for (const s of enabled || []) {
    try {
      const r = await runForUser(admin, s, {});
      results.push({ user_id: s.user_id, ...r });
    } catch (e: any) {
      console.error("autopilot user failed", s.user_id, e);
      results.push({ user_id: s.user_id, error: e.message });
    }
  }

  return new Response(JSON.stringify({ processed: results.length, results }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});