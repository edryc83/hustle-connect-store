const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
    if (!ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY is not configured');

    const { productName, price, description, category, storeName } = await req.json();

    if (!productName || !price) {
      return new Response(
        JSON.stringify({ error: 'productName and price are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `You are a creative copywriter for African small business product flyers. Generate compelling, short marketing copy for product flyers. Your copy should be:
- Punchy and attention-grabbing
- Suitable for social media/WhatsApp sharing
- Culturally relevant for African markets
- Professional but approachable

Always return valid JSON only, no markdown formatting.`;

    const userPrompt = `Generate flyer copy for this product in 3 different styles:

Product: ${productName}
Price: ${price}
${description ? `Description: ${description}` : ''}
${category ? `Category: ${category}` : ''}
Store: ${storeName || 'Shop'}

Create 3 variations:

1. MINIMAL style - Clean, simple, elegant
   - Headline: 2-4 words, sophisticated
   - Tagline: 5-8 words, understated elegance
   - CTA: 2-3 words, subtle

2. BOLD style - Energetic, urgent, eye-catching
   - Headline: 2-4 words, powerful/exciting
   - Tagline: 5-8 words, creates urgency
   - CTA: 2-3 words, action-oriented

3. ELEGANT style - Premium, refined, luxurious
   - Headline: 2-4 words, sophisticated/premium feel
   - Tagline: 5-8 words, emphasizes quality
   - CTA: 2-3 words, refined

Return ONLY this JSON structure:
{"variations":[{"style":"minimal","headline":"...","tagline":"...","cta":"..."},{"style":"bold","headline":"...","tagline":"...","cta":"..."},{"style":"elegant","headline":"...","tagline":"...","cta":"..."}]}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 512,
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

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Flyer content generation error:', error);

    // Return fallback content if AI fails
    const fallback = {
      variations: [
        { style: 'minimal', headline: 'New Arrival', tagline: 'Quality you can trust', cta: 'Shop Now' },
        { style: 'bold', headline: 'Hot Deal!', tagline: 'Don\'t miss out on this offer', cta: 'Get Yours' },
        { style: 'elegant', headline: 'Premium Pick', tagline: 'Elevate your style today', cta: 'Discover' },
      ],
    };

    return new Response(JSON.stringify(fallback), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
