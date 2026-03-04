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

    const { storeName, storeSlug, category, productCount } = await req.json().catch(() => ({}));

    const hour = new Date().getHours();
    const day = new Date().getDay();
    const date = new Date().getDate();

    const timeOfDay =
      hour < 6 ? "late night" :
      hour < 12 ? "morning" :
      hour < 17 ? "afternoon" :
      hour < 21 ? "evening" : "late night";

    const dayName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][day];
    const monthVibe = date >= 25 ? "month end / payday energy" : date <= 5 ? "new month fresh start" : "";
    const link = storeSlug ? `afristall.com/${storeSlug}` : "afristall.com/yourname";

    const systemPrompt = `You write very short WhatsApp status captions for African small business sellers. Max 2-3 lines each. Punchy, real, relatable. End every caption with the store link. No hashtags. No emojis overload. Sound human not corporate.`;

    const userPrompt = `Write 3 short WhatsApp status captions for a seller.

Store: ${storeName || "a small business"}
Products: ${productCount ? `${productCount} products` : "various items"}${category ? `, sells ${category}` : ""}
Time: ${timeOfDay}, ${dayName}${monthVibe ? `, ${monthVibe}` : ""}
Link: ${link}

Make them 1-3 lines max. Short enough to read in 2 seconds.
- Caption 1: Announce new/fresh products casually
- Caption 2: Quick hustle energy one-liner  
- Caption 3: Personal/warm, like texting a friend

Return JSON only:
{"captions":[{"vibe":"🆕 Fresh","text":"..."},{"vibe":"🔥 Hustle","text":"..."},{"vibe":"💛 Real","text":"..."}]}`;

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
        return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errText = await response.text();
      console.error('Anthropic error:', response.status, errText);
      throw new Error('AI error');
    }

    const data = await response.json();
    let content = data.content?.[0]?.text || '';
    content = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    const parsed = JSON.parse(content);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Caption error:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate captions' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
