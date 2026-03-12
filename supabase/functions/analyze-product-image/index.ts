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

    const { imageBase64, mimeType, productName, productDescription } = await req.json();
    
    // Build analysis prompt with available context
    let contextLines = '';
    if (productName) contextLines += `\nProduct title: "${productName}"`;
    if (productDescription) contextLines += `\nProduct description: "${productDescription}"`;

    const hasImage = !!imageBase64;

    const systemPrompt = `You are a product listing assistant for an African marketplace.
Analyze the provided product information and return ONLY valid JSON with this structure:
{
  "name": "short product name (max 5 words, only if image provided)",
  "description": "2 sentence selling description, warm and direct tone (only if image provided)",
  "category": "one of: fashion, shoes, cakes, flowers, beauty, wigs, phones, home, food, jewellery, pets, plants, furniture, appliances, baby, sports, books, auto, building, health, delivery, repair, grooming, cleaning, photography, catering, education, design, tech, tailoring, trips, adventure, dining, wellness, cultural, other",
  "subcategory": "exact subcategory display name from the valid list below",
  "listing_type": "product or service",
  "suggestions": [
    {
      "slug": "attribute_slug",
      "value": "detected value or array of values",
      "confidence": "high or medium or low",
      "source": "title or description or image or combined"
    }
  ]
}

IMPORTANT RULES:
- Only include "name" and "description" if an image was provided
- For suggestions, detect attribute values from the product context
- Use these attribute slugs: brand, colour, material, size, weight, condition, style, stock, pattern, fit, occasion, sleeve_length, dress_length, neckline, gender, shoe_size, heel_height, shoe_type, cake_type, flavour, filling, frosting, toppings, shape, layers, serves, theme, allergens, flower_type, bouquet_type, stem_count, addons, fresh_artificial, product_type_beauty, skin_type, skin_concern, key_ingredients, scent, volume, hair_type, hair_length, wig_type, hair_origin, density, model, storage, ram, screen_size, furniture_type, finish, dimensions, jewellery_type, metal_type, gemstone
- confidence: "high" = very confident (clearly visible/stated), "medium" = likely, "low" = possible guess
- If value is multi-select, use array. If single, use string.
- Return 5-15 attribute suggestions maximum
- No explanation. JSON only.

Category guide: wigs includes weaves, extensions, braids. phones includes tablets, laptops, electronics, phone cases. fashion includes clothing, bags, accessories. beauty includes skincare, makeup, perfumes. cakes includes all baked goods. jewellery includes watches, bracelets, necklaces, earrings. flowers includes bouquets, gift hampers.`;

    const userContent: any[] = [];
    
    if (hasImage) {
      userContent.push({
        type: 'image_url',
        image_url: {
          url: `data:${mimeType || 'image/jpeg'};base64,${imageBase64}`,
        },
      });
    }

    userContent.push({
      type: 'text',
      text: hasImage 
        ? `Analyze this product image and any context below.${contextLines}\n\nReturn JSON only.`
        : `Analyze this product from the text context below.${contextLines}\n\nReturn JSON only. Do NOT include "name" or "description" fields since no image was provided.`,
    });

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        max_tokens: 1024,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('AI Gateway error:', response.status, errText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded, please try again later' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error('AI analysis failed');
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || '';
    content = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    const parsed = JSON.parse(content);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Analyze error:', error);
    return new Response(JSON.stringify({ error: 'Failed to analyze image' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
