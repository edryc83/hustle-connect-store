import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const { store_slug, messages } = await req.json();

    if (!store_slug || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "store_slug and messages are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(supabaseUrl, supabaseKey);

    // Fetch profile
    const { data: profile, error: profileErr } = await sb
      .from("profiles")
      .select("id, store_name, category, city, whatsapp_number, delivery_areas, currency, store_bio")
      .eq("store_slug", store_slug)
      .single();

    if (profileErr || !profile) {
      return new Response(
        JSON.stringify({ error: "Store not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch products
    const { data: products } = await sb
      .from("products")
      .select("name, price, discount_price, description, attributes, variants_text, image_url, condition, listing_type")
      .eq("user_id", profile.id);

    const catalog = (products ?? []).map((p: any) => ({
      name: p.name,
      price: p.price,
      discount_price: p.discount_price,
      description: p.description,
      variants: p.variants_text,
      attributes: p.attributes,
      condition: p.condition,
      type: p.listing_type,
    }));

    const systemPrompt = `You are a friendly sales assistant for ${profile.store_name || store_slug}, a store on Afristall selling ${profile.category || "various products"} based in ${profile.city || "Africa"}.

You help buyers find products, answer questions about pricing, variants, availability and delivery.

Here is the full product catalog:
${JSON.stringify(catalog, null, 2)}

Store currency: ${profile.currency || "UGX"}
${profile.delivery_areas ? `Delivery areas: ${profile.delivery_areas}` : ""}

Your rules:
- Be warm, short and conversational
- Max 2-3 lines per response
- Sound like a real helpful person, not a robot or corporate brand
- Never invent products or prices not in the catalog
- If asked about delivery, say the seller will confirm on WhatsApp
- When buyer wants to order or says yes to a product, collect:
  1. Their name
  2. Their phone number
  3. Which product + variant they want
  4. Delivery address or pickup
  Then respond with exactly this phrase so the app can detect it:
  "READY_TO_ORDER" followed by a friendly message like "Perfect! Let me connect you with ${profile.store_name || "the seller"} on WhatsApp to confirm your order 🛍️"
- If you don't know something, say "Let me connect you with the seller directly for that!"
- Never mention Claude, Anthropic, Google, OpenAI or any AI company
- You are Afristall AI, nothing else`;

    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({ error: "AI not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiResponse = await fetch(
      "https://api.anthropic.com/v1/messages",
      {
        method: "POST",
        headers: {
          "x-api-key": ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 512,
          system: systemPrompt,
          messages: messages,
        }),
      }
    );

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Too many requests, please try again shortly." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errText = await aiResponse.text();
      console.error("Anthropic API error:", aiResponse.status, errText);
      return new Response(
        JSON.stringify({ error: "AI temporarily unavailable" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await aiResponse.json();
    const reply = data.content?.[0]?.text || "Sorry, I couldn't process that.";

    return new Response(
      JSON.stringify({ reply, whatsapp_number: profile.whatsapp_number, store_name: profile.store_name }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("store-assistant error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
