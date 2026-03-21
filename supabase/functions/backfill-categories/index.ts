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
    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
    if (!ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not configured');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch products missing a category or subcategory (limit batch to 50)
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, description, listing_type, user_id, category, subcategory')
      .or('category.is.null,category.eq.,subcategory.is.null,subcategory.eq.')
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

    // Valid subcategories per category for validation
    const validSubcategories: Record<string, string[]> = {
      "Fashion & Clothing": ["Men's Wear", "Women's Wear", "Kids' Wear", "Shoes", "Bags", "Dresses", "Vintage", "Uniforms", "Sportswear", "Traditional Wear"],
      "Electronics & Gadgets": ["Phones", "Laptops", "Tablets", "Accessories", "Chargers & Cables", "Speakers", "TVs", "Headphones", "Cameras", "Smart Watches", "Gaming Consoles", "Printers"],
      "Home Appliances": ["Microwaves", "Fridges", "Freezers", "Washing Machines", "Blenders", "Cookers & Ovens", "Air Conditioners", "Fans", "Irons", "Water Dispensers", "Vacuum Cleaners", "Rice Cookers", "Kettles", "Toasters"],
      "Food & Beverages": ["Fresh Produce", "Snacks", "Drinks", "Baked Goods", "Spices", "Catering", "Frozen Foods", "Organic", "Cereals & Grains", "Cooking Oils"],
      "Beauty & Cosmetics": ["Skincare", "Makeup", "Haircare", "Perfumes", "Natural/Organic", "Wigs & Extensions", "Nail Products", "Body Care"],
      "Home & Living": ["Furniture", "Kitchen", "Décor", "Bedding", "Cleaning Supplies", "Curtains & Blinds", "Lighting", "Storage & Organisation", "Carpets & Rugs"],
      "Health & Wellness": ["Supplements", "Fitness Gear", "Natural Remedies", "Personal Care", "Medical Devices", "Essential Oils"],
      "Books & Stationery": ["Textbooks", "Novels", "Office Supplies", "Notebooks", "Art Supplies", "Printing Services"],
      "Art & Crafts": ["Paintings", "Handmade Goods", "Beadwork", "Pottery", "Woodwork", "Candles"],
      "Sports & Fitness": ["Sportswear", "Equipment", "Outdoor Gear", "Gym Equipment", "Cycling", "Swimming"],
      "Agriculture & Farm Produce": ["Seeds", "Livestock Feed", "Fresh Harvest", "Dairy", "Poultry", "Farm Tools", "Fertilizers"],
      "Auto & Motor Parts": ["Car Parts", "Motorcycle Parts", "Tools", "Accessories", "Tyres", "Batteries", "Car Audio"],
      "Baby & Kids": ["Clothing", "Toys", "Feeding", "Diapers", "Strollers", "Car Seats", "School Supplies"],
      "Phones & Accessories": ["Cases", "Screen Protectors", "Earphones", "Power Banks", "Chargers", "Phone Stands", "Memory Cards"],
      "Jewelry & Accessories": ["Necklaces", "Bracelets", "Watches", "Rings", "Sunglasses", "Belts", "Hats & Caps"],
      "Building & Hardware": ["Cement", "Paint", "Plumbing", "Electrical", "Tiles", "Roofing", "Tools"],
      "Pets & Animals": ["Pet Food", "Accessories", "Aquarium", "Grooming", "Cages & Kennels"],
      "Delivery & Logistics": ["Dispatch Riders", "Courier Services", "Food Delivery", "Moving Services"],
      "Repairs & Maintenance": ["Phone Repair", "Electronics Repair", "Plumbing", "Electrical", "Appliance Repair"],
      "Beauty & Grooming": ["Hair Styling", "Barbing", "Makeup Artist", "Nail Technician", "Spa & Massage"],
      "Cleaning Services": ["Home Cleaning", "Office Cleaning", "Laundry", "Carpet Cleaning", "Fumigation"],
      "Photography & Videography": ["Events", "Portraits", "Product Photography", "Drone", "Video Editing"],
      "Catering & Events": ["Event Catering", "Small Chops", "Cake Making", "Event Planning", "Decoration"],
      "Education & Tutoring": ["Academic Tutoring", "Music Lessons", "Language Classes", "Test Prep", "Online Courses"],
      "Design & Creative": ["Graphic Design", "Web Design", "Interior Design", "Fashion Design", "Branding"],
      "IT & Tech Services": ["Web Development", "App Development", "IT Support", "Social Media Management", "SEO"],
      "Tailoring & Fashion": ["Custom Clothing", "Alterations", "Traditional Wear", "Uniforms"],
      "Trips & Travel": ["Local Trips", "Weekend Getaways", "Road Trips", "Guided Tours", "Safari", "Beach Trips", "Camping"],
      "Adventure & Outdoor": ["Hiking", "Zip-lining", "Paintball", "Go-Karting", "Horse Riding", "Boat Cruises"],
      "Dining Experiences": ["Private Chef", "Food Tasting", "Rooftop Dining", "Picnic Setups", "Brunch"],
      "Wellness & Spa": ["Spa Days", "Couples' Retreat", "Yoga Retreat", "Meditation", "Hot Springs"],
      "Cultural Experiences": ["Art Exhibitions", "Museum Tours", "Live Music", "Theatre", "Cultural Festivals"],
    };

    // Build subcategory list for the AI prompt
    const subcatList = Object.entries(validSubcategories)
      .map(([cat, subs]) => `${cat}: ${subs.join(", ")}`)
      .join("\n");

    // Build a single AI prompt with all products
    const productList = products.map((p, i) => 
      `${i + 1}. "${p.name}"${p.description ? ` — ${p.description.slice(0, 80)}` : ''}${p.category ? ` [current category: ${p.category}]` : ''}`
    ).join('\n');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system: `You categorize products for an African marketplace. For each numbered product, return its category slug AND a subcategory name.

Category slugs: fashion, shoes, phones, electronics, home, food, beauty, wigs, cakes, flowers, jewellery, pets, plants, furniture, appliances, baby, sports, books, auto, building, health, delivery, repair, grooming, cleaning, photography, catering, education, design, tech, tailoring, trips, adventure, dining, wellness, cultural, other.

Valid subcategories per category:
${subcatList}

Return ONLY a JSON array of objects with "index" (1-based), "slug" (category), and "subcategory" (exact subcategory name from the list above). If no subcategory fits, use null. No explanation.`,
        messages: [
          {
            role: 'user',
            content: `Categorize these products with category and subcategory:\n${productList}`
          }
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Anthropic error:', response.status, errText);
      throw new Error('AI categorization failed');
    }

    const data = await response.json();
    let content = data.content?.[0]?.text || '';
    content = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    const results = JSON.parse(content) as { index: number; slug: string; subcategory: string | null }[];

    let updated = 0;
    const affectedUsers = new Set<string>();

    for (const r of results) {
      const product = products[r.index - 1];
      if (!product) continue;
      
      const fullCategory = categorySlugMap[r.slug] || null;
      if (!fullCategory) continue;

      // Validate subcategory against the valid list
      let validatedSubcategory: string | null = null;
      if (r.subcategory && validSubcategories[fullCategory]) {
        const match = validSubcategories[fullCategory].find(
          s => s.toLowerCase() === r.subcategory!.toLowerCase()
        );
        validatedSubcategory = match || null;
      }

      // Only update fields that are missing
      const updateFields: Record<string, string> = {};
      if (!product.category) updateFields.category = fullCategory;
      if (!product.subcategory && validatedSubcategory) updateFields.subcategory = validatedSubcategory;

      if (Object.keys(updateFields).length === 0) continue;

      const { error: updateError } = await supabase
        .from('products')
        .update(updateFields)
        .eq('id', product.id);

      if (!updateError) {
        updated++;
        affectedUsers.add(product.user_id);
      }
    }

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
