const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { productName, price, templateStyle, charLimits } = await req.json();
    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY is not configured");

    const subtitleLimit = charLimits?.subtitle || 50;
    const taglineLimit = charLimits?.tagline || 35;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 512,
        system: `You are a punchy ad copywriter for African businesses. Generate 3 variations of ad copy. Each subtitle must be under ${subtitleLimit} characters. Each tagline must be under ${taglineLimit} characters. Be creative, sales-driven. Never repeat the product name in the copy. Keep it short and impactful. Return ONLY valid JSON with this structure: {"variations":[{"subtitle":"...","tagline":"..."},{"subtitle":"...","tagline":"..."},{"subtitle":"...","tagline":"..."}]}`,
        messages: [
          {
            role: "user",
            content: `Product: ${productName}\nPrice: ${price}\nTemplate style: ${templateStyle || "modern"}\n\nGenerate 3 copy variations. Return JSON only.`,
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("Anthropic error:", response.status, t);
      throw new Error("AI generation failed");
    }

    const data = await response.json();
    let content = data.content?.[0]?.text || "";
    content = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

    try {
      const parsed = JSON.parse(content);
      return new Response(JSON.stringify(parsed), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch {
      // Fallback if JSON parsing fails
      return new Response(JSON.stringify({
        variations: [
          { subtitle: "Premium Quality You Deserve", tagline: "Get Yours Today" },
          { subtitle: "Upgrade Your Everyday Style", tagline: "Shop Now" },
          { subtitle: "Built Different, Made Better", tagline: "Level Up" },
        ],
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (e) {
    console.error("ad-suggest-text error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
