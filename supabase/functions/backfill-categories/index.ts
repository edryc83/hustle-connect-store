import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch products missing a category (limit batch to 50)
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, description, listing_type, user_id')
      .or('category.is.null,category.eq.')
      .limit(50);

    if (error) throw error;
    if (!products || products.length === 0) {
      return new Response(JSON.stringify({ message: 'No products need backfilling', updated: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const categorySlugMap: Record<string, string> = {
      fashion: "Fashion & Clothing",
      shoes: "Fashion & Clothing",
      phones: "Electronics & Gadgets",
      electronics: "Electronics & Gadgets",
      home: "Home & Living",
      food: "Food & Beverages",
      beauty: "Beauty & Cosmetics",
      wigs: "Beauty & Cosmetics",
      cakes: "Food & Beverages",
      flowers: "Art & Crafts",
      jewellery: "Jewelry & Accessories",
      pets: "Pets & Animals",
      plants: "Agriculture & Farm Produce",
      furniture: "Home & Living",
      appliances: "Home Appliances",
      baby: "Baby & Kids",
      sports: "Sports & Fitness",
      books: "Books & Stationery",
      auto: "Auto & Motor Parts",
      building: "Building & Hardware",
      health: "Health & Wellness",
      delivery: "Delivery & Logistics",
      repair: "Repairs & Maintenance",
      grooming: "Beauty & Grooming",
      cleaning: "Cleaning Services",
      photography: "Photography & Videography",
      catering: "Catering & Events",
      education: "Education & Tutoring",
      design: "Design & Creative",
      tech: "IT & Tech Services",
      tailoring: "Tailoring & Fashion",
      trips: "Trips & Travel",
      adventure: "Adventure & Outdoor",
      dining: "Dining Experiences",
      wellness: "Wellness & Spa",
      cultural: "Cultural Experiences",
      other: "Other",
    };

    // Build a single AI prompt with all products
    const productList = products.map((p, i) => 
      `${i + 1}. "${p.name}"${p.description ? ` — ${p.description.slice(0, 80)}` : ''}`
    ).join('\n');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-lite',
        max_tokens: 2048,
        messages: [
          {
            role: 'system',
            content: `You categorize products for an African marketplace. For each numbered product, return its category slug from this list ONLY: fashion, shoes, phones, electronics, home, food, beauty, wigs, cakes, flowers, jewellery, pets, plants, furniture, appliances, baby, sports, books, auto, building, health, delivery, repair, grooming, cleaning, photography, catering, education, design, tech, tailoring, trips, adventure, dining, wellness, cultural, other.

Return ONLY a JSON array of objects with "index" (1-based) and "slug". No explanation.`
          },
          {
            role: 'user',
            content: `Categorize these products:\n${productList}`
          }
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('AI error:', response.status, errText);
      throw new Error('AI categorization failed');
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || '';
    content = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    const results = JSON.parse(content) as { index: number; slug: string }[];

    let updated = 0;
    const affectedUsers = new Set<string>();

    for (const r of results) {
      const product = products[r.index - 1];
      if (!product) continue;
      const fullCategory = categorySlugMap[r.slug] || null;
      if (!fullCategory) continue;

      const { error: updateError } = await supabase
        .from('products')
        .update({ category: fullCategory })
        .eq('id', product.id);

      if (!updateError) {
        updated++;
        affectedUsers.add(product.user_id);
      }
    }

    // Trigger profile category sync for affected sellers
    // The DB trigger handles this on update, so it should fire automatically

    return new Response(JSON.stringify({ 
      message: `Backfilled ${updated} of ${products.length} products`,
      updated,
      total: products.length,
      sellersAffected: affectedUsers.size,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Backfill error:', error);
    return new Response(JSON.stringify({ error: 'Backfill failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
