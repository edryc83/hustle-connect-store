const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface TokenConfig {
  type: string;
  label: string;
  default: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
    if (!ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY is not configured');

    const { product, store, tokens } = await req.json();

    if (!product?.name || !tokens) {
      return new Response(
        JSON.stringify({ error: 'product and tokens are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Filter to only text tokens that need AI content
    const textTokens: Record<string, TokenConfig> = {};
    for (const [key, config] of Object.entries(tokens as Record<string, TokenConfig>)) {
      if (config.type === 'text') {
        textTokens[key] = config;
      }
    }

    // Build token descriptions for the AI
    const tokenDescriptions = Object.entries(textTokens)
      .map(([key, config]) => `- "${key}": ${config.label} (example: "${config.default}")`)
      .join('\n');

    const systemPrompt = `You are a creative copywriter for African small business product flyers. Generate compelling, short marketing copy that fits the exact fields provided. Your copy should be:
- Punchy and attention-grabbing
- Suitable for social media/WhatsApp sharing
- Culturally relevant for African markets (use UGX for Uganda, KES for Kenya, etc.)
- Professional but approachable
- CONCISE - match the length of the example defaults

Return ONLY valid JSON with the exact token keys provided. No markdown, no explanation.`;

    const userPrompt = `Generate flyer content for this product:

PRODUCT DETAILS:
- Name: ${product.name}
- Price: ${product.price || 'Not specified'}
- Description: ${product.description || 'No description'}
- Category: ${product.category || 'General'}

STORE DETAILS:
- Store Name: ${store?.name || 'Shop'}
- Store URL: ${store?.slug ? `${store.slug}.afristall.com` : 'shop.afristall.com'}

Generate creative content for these fields:
${tokenDescriptions}

IMPORTANT RULES:
1. TITLE fields should be 1-3 words max, often split across LINE1 and LINE2
2. TAGLINE should be catchy, 4-8 words
3. CTA (call-to-action) should be 2-3 words like "Shop Now", "Order Today"
4. BADGE should be 1-2 words like "NEW", "HOT DEAL", "BEST SELLER"
5. SPEC fields should highlight key features briefly
6. PRICE fields should use the actual price provided
7. STORE_NAME should use the actual store name
8. Keep text SHORT - it must fit on a flyer

Return ONLY a JSON object with the token keys and generated values:
{
  "PLACEHOLDER_TITLE_LINE1": "...",
  "PLACEHOLDER_TITLE_LINE2": "...",
  ...
}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: systemPrompt,
        messages: [
          { role: 'user', content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again shortly.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errText = await response.text();
      console.error('Anthropic error:', response.status, errText);
      throw new Error('AI generation failed');
    }

    const data = await response.json();
    let content = data.content?.[0]?.text || '';

    // Clean up any markdown formatting
    content = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

    const parsed = JSON.parse(content);

    // Ensure we have all required tokens, fill in defaults if missing
    const result: Record<string, string> = {};
    for (const [key, config] of Object.entries(textTokens)) {
      if (parsed[key]) {
        result[key] = parsed[key];
      } else {
        // Use smart defaults based on key patterns
        if (key.includes('STORE_NAME')) {
          result[key] = store?.name?.toUpperCase() || config.default;
        } else if (key.includes('PRICE_VALUE')) {
          result[key] = product.price || config.default;
        } else if (key.includes('BRAND_INITIAL')) {
          result[key] = (store?.name?.[0] || 'S').toUpperCase();
        } else {
          result[key] = config.default;
        }
      }
    }

    return new Response(JSON.stringify({ content: result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Flyer content generation error:', error);

    return new Response(
      JSON.stringify({ error: 'Failed to generate content. Please try again.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
