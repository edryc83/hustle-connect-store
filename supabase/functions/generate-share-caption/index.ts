const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY is not configured");

    const { productName, price, description, storeName, storeSlug, platform } = await req.json();

    const link = storeSlug ? `afristall.com/${storeSlug}` : "afristall.com";

    const systemPrompt = `You generate ultra-short, catchy social media captions for African small business product shares. 1-2 lines max. Punchy, trendy, relatable. Use 1-2 emojis max. No hashtags. Sound like a real person, not a brand. Always end with the price and shop link on a new line.`;

    const userPrompt = `Write one short caption for sharing this product on ${platform || "WhatsApp"}:

Product: ${productName}
Price: ${price}
${description ? `About: ${description}` : ""}
Store: ${storeName || "my shop"}
Link: ${link}

Return ONLY the caption text, nothing else. Must include the price and link "${link}" at the end.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 256,
        system: systemPrompt,
        messages: [
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("Anthropic error:", response.status, t);
      throw new Error("AI error");
    }

    const data = await response.json();
    const caption = data.content?.[0]?.text?.trim() || "";

    return new Response(JSON.stringify({ caption }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Share caption error:", error);
    return new Response(JSON.stringify({ error: "Failed to generate caption" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
