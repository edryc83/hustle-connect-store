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
    if (!ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not configured');

    const { productName, price, type } = await req.json();

    const systemPrompt = type === 'subtitle'
      ? 'You write short compelling subtitles for African small business product ads. Max 8 words. Focus on benefits, offers, or calls-to-action like "Free delivery", "Limited stock", "Order now on WhatsApp". Do NOT repeat or rephrase the product name. Return ONLY the subtitle text, nothing else.'
      : 'You write ultra-short catchy product taglines for African small business ads. Max 6 words. Punchy, fun, no hashtags. Return ONLY the tagline text, nothing else.';

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 128,
        system: systemPrompt,
        messages: [
          { role: 'user', content: `Product: ${productName}${price ? `, Price: ${price}` : ''}` },
        ],
      }),
    });

    if (!response.ok) {
      const t = await response.text();
      console.error('Anthropic error:', response.status, t);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limited, try again shortly.' }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error('AI error');
    }

    const data = await response.json();
    const tagline = data.content?.[0]?.text?.trim() || '';

    return new Response(JSON.stringify({ tagline }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Tagline error:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate tagline' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
