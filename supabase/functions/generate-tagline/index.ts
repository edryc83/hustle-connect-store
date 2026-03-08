const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

    const { productName, price, type } = await req.json();

    const systemPrompt = type === 'subtitle'
      ? 'You write short compelling subtitles for African small business product ads. Max 8 words. Focus on benefits, offers, or calls-to-action like "Free delivery", "Limited stock", "Order now on WhatsApp". Do NOT repeat or rephrase the product name. Return ONLY the subtitle text, nothing else.'
      : 'You write ultra-short catchy product taglines for African small business ads. Max 6 words. Punchy, fun, no hashtags. Return ONLY the tagline text, nothing else.';

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-lite',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Product: ${productName}${price ? `, Price: ${price}` : ''}` },
        ],
      }),
    });

    if (!response.ok) {
      const t = await response.text();
      console.error('AI error:', response.status, t);
      throw new Error('AI error');
    }

    const data = await response.json();
    const tagline = data.choices?.[0]?.message?.content?.trim() || '';

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
