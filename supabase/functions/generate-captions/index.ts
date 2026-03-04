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
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY is not configured');

    const { storeName, category } = await req.json().catch(() => ({}));

    const hour = new Date().getHours();
    const day = new Date().getDay();
    const date = new Date().getDate();

    const timeOfDay =
      hour < 6 ? "middle of the night (late night grind)" :
      hour < 12 ? "morning" :
      hour < 17 ? "afternoon" :
      hour < 21 ? "evening" :
      "late night";

    const dayVibe =
      day === 0 ? "Sunday, slow day, people are relaxed at home scrolling their phones, great time to impulse buy" :
      day === 1 ? "Monday, everyone is complaining about Monday, lean into the Monday is rough energy and make it funny" :
      day === 2 ? "Tuesday, mid-week grind, nothing special, keep it real and relatable" :
      day === 3 ? "Wednesday, hump day, halfway through the week, people are tired but pushing" :
      day === 4 ? "Thursday, almost Friday energy, people are getting excited for the weekend" :
      day === 5 ? "Friday, TGIF energy, people are hyped, weekend plans, treat yourself mood" :
      "Saturday, weekend hype, people are out, feeling good, spending money, maximum energy";

    const monthEndVibe = date >= 25
      ? "It is month end, salaries just dropped or about to drop, people have money or are about to, lean into payday energy"
      : date <= 5
        ? "It is the start of the month, fresh start energy, new month new me vibes"
        : "";

    const sellerContext = storeName
      ? `The seller's store is called "${storeName}"${category ? ` and they sell ${category}` : ''}. Use their store link: afristall.com/${storeName.toLowerCase().replace(/\s+/g, '')}`
      : "Use a placeholder store link: afristall.com/yourname";

    const systemPrompt = `You write WhatsApp status captions for African hustlers and small business owners selling things like beauty products, fashion, food, phones, plants, curtains and more from cities like Kampala, Nairobi, Lagos, Accra. Your captions are short, punchy, funny, real and relatable. They sound like a real person not a brand. They always end with a store link. Write in a mix of confident hustle energy and African internet humour. No cringe. No corporate speak. Maximum 5 lines per caption.`;

    const userPrompt = `Write 3 different WhatsApp status captions for a small business seller right now.

Context:
- Time: ${timeOfDay} (${hour}:00)
- Day: ${dayVibe}
- Date context: ${monthEndVibe || "middle of the month, normal hustle days"}
- ${sellerContext}

Rules:
- Caption 1: Funny and self-aware, lean into the day/time vibe hard. Reference Monday being terrible, Friday being lit, Sunday laziness etc. Make it so relatable people screenshot it.
- Caption 2: Confident hustle energy, short and punchy, 2-3 lines max. No fluff.
- Caption 3: Warm and personal, feels like a real person talking to their followers, could mention the time of day naturally eg "while you're scrolling at 2am..."

Each caption must end with the store link.

Return as JSON only, no other text:
{
  "captions": [
    { "vibe": "😂 Funny", "text": "..." },
    { "vibe": "🔥 Hustle", "text": "..." },
    { "vibe": "💛 Real", "text": "..." }
  ]
}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded, try again shortly.' }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted.' }), {
          status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const t = await response.text();
      console.error('AI gateway error:', response.status, t);
      throw new Error('AI gateway error');
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || '';

    // Strip markdown code fences
    content = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

    const parsed = JSON.parse(content);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Caption generation error:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate captions' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
