/**
 * Comprehensive attribute master library for AI-powered product detail recommendations.
 * 
 * Categories → subcategories → recommended attributes
 * Each attribute has type info, presets, and AI detection flags.
 */

// ─── Attribute Input Types ───────────────────────────────────────────
export type AttributeInputType =
  | "text"
  | "textarea"
  | "number"
  | "decimal"
  | "boolean"
  | "single_select"
  | "multi_select"
  | "date"
  | "tags"
  | "color_picker";

// ─── Attribute Definition ────────────────────────────────────────────
export interface AttributeDef {
  name: string;
  slug: string;
  emoji: string;
  type: AttributeInputType;
  presets: string[];
  isVariant?: boolean;
  isFilterable?: boolean;
  isRequired?: boolean;
  aiDetectable?: boolean;
}

// ─── Category / Subcategory ──────────────────────────────────────────
export interface SubcategoryDef {
  label: string;
  slug: string;
  attributeSlugs: string[];
}

export interface CategoryDef {
  label: string;
  slug: string;
  emoji: string;
  subcategories: SubcategoryDef[];
  defaultAttributeSlugs: string[];
}

// ─── Colour hex map ──────────────────────────────────────────────────
export const COLOUR_HEX: Record<string, string> = {
  Black: "#000000", White: "#FFFFFF", Red: "#EF4444", Blue: "#3B82F6",
  Yellow: "#EAB308", Green: "#22C55E", Orange: "#F97316", Purple: "#A855F7",
  Pink: "#EC4899", Brown: "#92400E", Grey: "#6B7280", Gold: "#D4A017",
  Silver: "#C0C0C0", Navy: "#1E3A5F", Beige: "#F5F5DC", Maroon: "#800000",
  Teal: "#14B8A6", Cream: "#FFFDD0", Coral: "#FF7F50", Burgundy: "#800020",
  "Rose Gold": "#B76E79", Ivory: "#FFFFF0", Charcoal: "#36454F",
  Olive: "#808000", Lavender: "#E6E6FA", Turquoise: "#40E0D0",
  "Sky Blue": "#87CEEB", Peach: "#FFCBA4",
};

// ══════════════════════════════════════════════════════════════════════
//  MASTER ATTRIBUTE LIBRARY
// ══════════════════════════════════════════════════════════════════════

export const ATTRIBUTE_LIBRARY: AttributeDef[] = [
  // ── Global ──
  { name: "Brand", slug: "brand", emoji: "✨", type: "text", presets: [], aiDetectable: true },
  { name: "Colour", slug: "colour", emoji: "🎨", type: "multi_select", presets: Object.keys(COLOUR_HEX), isVariant: true, isFilterable: true, aiDetectable: true },
  { name: "Material", slug: "material", emoji: "🧵", type: "single_select", presets: ["Cotton", "Polyester", "Silk", "Leather", "Denim", "Linen", "Wool", "Nylon", "Satin", "Velvet", "Chiffon", "Canvas"], aiDetectable: true },
  { name: "Size", slug: "size", emoji: "📏", type: "multi_select", presets: ["XS", "S", "M", "L", "XL", "XXL", "One Size"], isVariant: true, isFilterable: true, aiDetectable: true },
  { name: "Weight", slug: "weight", emoji: "⚖️", type: "single_select", presets: ["250g", "500g", "1kg", "2kg", "5kg", "10kg"], aiDetectable: true },
  { name: "Condition", slug: "condition", emoji: "♻️", type: "single_select", presets: ["Brand New", "Like New", "Good", "Fair", "Refurbished"], isFilterable: true, aiDetectable: true },
  { name: "Style", slug: "style", emoji: "👗", type: "single_select", presets: ["Casual", "Formal", "Sporty", "Traditional", "Street", "Vintage", "Bohemian", "Minimalist"], aiDetectable: true },
  { name: "Stock", slug: "stock", emoji: "📦", type: "single_select", presets: ["In Stock", "Last Few Left", "Made to Order", "Pre-order"] },
  { name: "Warranty", slug: "warranty", emoji: "🛡️", type: "text", presets: ["No Warranty", "3 Months", "6 Months", "1 Year", "2 Years"] },
  { name: "Country of Origin", slug: "country_of_origin", emoji: "🌍", type: "text", presets: [] },
  { name: "Care Instructions", slug: "care_instructions", emoji: "🧼", type: "text", presets: ["Machine Wash", "Hand Wash Only", "Dry Clean Only", "Spot Clean", "Do Not Iron"] },

  // ── Fashion ──
  { name: "Pattern", slug: "pattern", emoji: "🔲", type: "single_select", presets: ["Solid", "Striped", "Floral", "Plaid", "Polka Dot", "Animal Print", "Geometric", "Abstract", "Camo", "Tie Dye"], aiDetectable: true },
  { name: "Fit", slug: "fit", emoji: "👔", type: "single_select", presets: ["Slim", "Regular", "Relaxed", "Oversized", "Fitted", "Loose"], aiDetectable: true },
  { name: "Occasion", slug: "occasion", emoji: "🎉", type: "multi_select", presets: ["Casual", "Party", "Wedding", "Work", "Date Night", "Church", "Festival", "Graduation", "Birthday"], aiDetectable: true },
  { name: "Sleeve Length", slug: "sleeve_length", emoji: "💪", type: "single_select", presets: ["Sleeveless", "Short Sleeve", "3/4 Sleeve", "Long Sleeve", "Cap Sleeve"], aiDetectable: true },
  { name: "Dress Length", slug: "dress_length", emoji: "📐", type: "single_select", presets: ["Mini", "Knee-Length", "Midi", "Maxi", "Floor-Length"], aiDetectable: true },
  { name: "Neckline", slug: "neckline", emoji: "👚", type: "single_select", presets: ["Round Neck", "V-Neck", "Turtle Neck", "Off Shoulder", "Halter", "Square", "Scoop", "Strapless"], aiDetectable: true },
  { name: "Gender", slug: "gender", emoji: "🚻", type: "single_select", presets: ["Women", "Men", "Unisex", "Girls", "Boys"], isFilterable: true, aiDetectable: true },
  { name: "Age Group", slug: "age_group", emoji: "👶", type: "single_select", presets: ["Baby", "Kids", "Teens", "Adults"] },
  { name: "Closure Type", slug: "closure_type", emoji: "🔗", type: "single_select", presets: ["Zipper", "Buttons", "Pull-on", "Lace-up", "Hook & Eye", "Velcro", "Snap"] },

  // ── Shoes ──
  { name: "Shoe Size", slug: "shoe_size", emoji: "👟", type: "multi_select", presets: ["36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46"], isVariant: true, aiDetectable: true },
  { name: "Heel Height", slug: "heel_height", emoji: "👠", type: "single_select", presets: ["Flat", "Low (1-3cm)", "Mid (3-6cm)", "High (6-10cm)", "Very High (10cm+)"], aiDetectable: true },
  { name: "Shoe Type", slug: "shoe_type", emoji: "🥾", type: "single_select", presets: ["Sneakers", "Heels", "Sandals", "Boots", "Loafers", "Flats", "Slippers", "Wedges", "Mules"], aiDetectable: true },

  // ── Cakes / Bakery ──
  { name: "Cake Type", slug: "cake_type", emoji: "🎂", type: "single_select", presets: ["Birthday Cake", "Wedding Cake", "Cupcakes", "Pastry", "Bread", "Cookies", "Doughnuts", "Pie", "Cheesecake"], aiDetectable: true },
  { name: "Flavour", slug: "flavour", emoji: "🍰", type: "multi_select", presets: ["Vanilla", "Chocolate", "Red Velvet", "Strawberry", "Lemon", "Carrot", "Coffee", "Coconut", "Banana"], aiDetectable: true },
  { name: "Filling", slug: "filling", emoji: "🫧", type: "single_select", presets: ["Cream", "Buttercream", "Jam", "Ganache", "Custard", "Fruit", "None"] },
  { name: "Frosting", slug: "frosting", emoji: "🧁", type: "single_select", presets: ["Buttercream", "Fondant", "Whipped Cream", "Ganache", "Royal Icing", "Naked", "None"] },
  { name: "Toppings", slug: "toppings", emoji: "🍫", type: "tags", presets: ["Sprinkles", "Fruit", "Chocolate Drip", "Flowers", "Gold Leaf", "Macarons", "Berries"] },
  { name: "Shape", slug: "shape", emoji: "⭕", type: "single_select", presets: ["Round", "Square", "Heart", "Rectangle", "Tiered", "Number", "Custom"] },
  { name: "Layers", slug: "layers", emoji: "🏗️", type: "single_select", presets: ["1 Layer", "2 Layers", "3 Layers", "4+ Layers"] },
  { name: "Serves", slug: "serves", emoji: "🍽️", type: "single_select", presets: ["4-6", "8-10", "12-15", "20-25", "30-40", "50+"] },
  { name: "Theme", slug: "theme", emoji: "🎨", type: "text", presets: [] },
  { name: "Allergens", slug: "allergens", emoji: "⚠️", type: "multi_select", presets: ["Nuts", "Gluten", "Dairy", "Eggs", "Soy", "None"] },
  { name: "Dietary Option", slug: "dietary_option", emoji: "🥗", type: "multi_select", presets: ["Regular", "Vegan", "Gluten Free", "Sugar Free", "Keto", "Halal"] },
  { name: "Custom Message", slug: "custom_message", emoji: "💌", type: "text", presets: [] },
  { name: "Delivery Date", slug: "delivery_date", emoji: "📅", type: "text", presets: ["Same Day", "Next Day", "2-3 Days", "Custom Date"] },

  // ── Flowers / Gifts ──
  { name: "Flower Type", slug: "flower_type", emoji: "🌹", type: "multi_select", presets: ["Roses", "Lilies", "Sunflowers", "Tulips", "Orchids", "Chrysanthemums", "Carnations", "Daisies", "Mixed"], aiDetectable: true },
  { name: "Bouquet Type", slug: "bouquet_type", emoji: "💐", type: "single_select", presets: ["Hand-Tied", "Wrapped", "Box Arrangement", "Basket", "Vase Arrangement", "Single Stem"] },
  { name: "Stem Count", slug: "stem_count", emoji: "🌿", type: "single_select", presets: ["1", "6", "12", "24", "50", "100"] },
  { name: "Wrapping Style", slug: "wrapping_style", emoji: "🎁", type: "single_select", presets: ["Paper Wrap", "Cellophane", "Kraft Paper", "Fabric", "Gift Box", "None"] },
  { name: "Vase Included", slug: "vase_included", emoji: "🏺", type: "boolean", presets: ["Yes", "No"] },
  { name: "Card Included", slug: "card_included", emoji: "💌", type: "boolean", presets: ["Yes", "No"] },
  { name: "Add-ons", slug: "addons", emoji: "🎀", type: "multi_select", presets: ["Chocolates", "Teddy Bear", "Balloons", "Wine", "Candles", "Gift Basket", "Card"] },
  { name: "Fresh or Artificial", slug: "fresh_artificial", emoji: "🌱", type: "single_select", presets: ["Fresh", "Artificial", "Preserved"] },

  // ── Beauty / Skincare ──
  { name: "Product Type", slug: "product_type_beauty", emoji: "🧴", type: "single_select", presets: ["Moisturizer", "Cleanser", "Serum", "Toner", "Sunscreen", "Mask", "Exfoliator", "Oil", "Cream", "Lotion"], aiDetectable: true },
  { name: "Skin Type", slug: "skin_type", emoji: "✋", type: "multi_select", presets: ["All Skin Types", "Oily", "Dry", "Combination", "Sensitive", "Normal", "Acne-Prone"] },
  { name: "Skin Concern", slug: "skin_concern", emoji: "💧", type: "multi_select", presets: ["Acne", "Aging", "Dark Spots", "Dryness", "Oiliness", "Pores", "Wrinkles", "Dullness", "Uneven Tone"] },
  { name: "Key Ingredients", slug: "key_ingredients", emoji: "🧪", type: "tags", presets: ["Vitamin C", "Retinol", "Hyaluronic Acid", "Niacinamide", "Salicylic Acid", "Glycolic Acid", "AHA", "BHA", "Shea Butter"] },
  { name: "Scent", slug: "scent", emoji: "🌸", type: "single_select", presets: ["Floral", "Fruity", "Fresh", "Musky", "Sweet", "Woody", "Unscented", "Citrus", "Vanilla"] },
  { name: "SPF", slug: "spf", emoji: "☀️", type: "single_select", presets: ["No SPF", "SPF 15", "SPF 30", "SPF 50", "SPF 50+"] },
  { name: "Volume", slug: "volume", emoji: "🫙", type: "single_select", presets: ["30ml", "50ml", "100ml", "150ml", "200ml", "250ml", "500ml"] },
  { name: "Routine Step", slug: "routine_step", emoji: "1️⃣", type: "single_select", presets: ["Cleanse", "Tone", "Treat", "Moisturize", "Protect"] },
  { name: "Vegan", slug: "vegan", emoji: "🌿", type: "boolean", presets: ["Yes", "No"] },
  { name: "Cruelty Free", slug: "cruelty_free", emoji: "🐰", type: "boolean", presets: ["Yes", "No"] },
  { name: "How to Use", slug: "how_to_use", emoji: "📖", type: "text", presets: [] },
  { name: "Expiry Date", slug: "expiry_date", emoji: "📆", type: "text", presets: [] },

  // ── Hair / Wigs ──
  { name: "Hair Type", slug: "hair_type", emoji: "💇", type: "single_select", presets: ["Straight", "Wavy", "Curly", "Kinky", "Body Wave", "Deep Wave", "Loose Wave", "Water Wave", "Jerry Curl"], aiDetectable: true },
  { name: "Hair Length", slug: "hair_length", emoji: "📏", type: "single_select", presets: ["8\"", "10\"", "12\"", "14\"", "16\"", "18\"", "20\"", "22\"", "24\"", "26\"", "28\"", "30\""], isVariant: true, aiDetectable: true },
  { name: "Wig Type", slug: "wig_type", emoji: "👩", type: "single_select", presets: ["Full Lace", "Lace Front", "360 Lace", "Closure Wig", "Headband Wig", "U-Part", "V-Part", "Glueless"], aiDetectable: true },
  { name: "Hair Origin", slug: "hair_origin", emoji: "🌍", type: "single_select", presets: ["Brazilian", "Peruvian", "Indian", "Malaysian", "Cambodian", "Vietnamese", "Chinese", "Synthetic"] },
  { name: "Density", slug: "density", emoji: "🔢", type: "single_select", presets: ["130%", "150%", "180%", "200%", "250%"] },
  { name: "Cap Size", slug: "cap_size", emoji: "🧢", type: "single_select", presets: ["Small", "Medium", "Large", "Average", "Adjustable"] },

  // ── Electronics ──
  { name: "Model", slug: "model", emoji: "📱", type: "text", presets: [], aiDetectable: true },
  { name: "Model Number", slug: "model_number", emoji: "🔢", type: "text", presets: [] },
  { name: "Storage", slug: "storage", emoji: "💾", type: "single_select", presets: ["16GB", "32GB", "64GB", "128GB", "256GB", "512GB", "1TB"], isVariant: true, aiDetectable: true },
  { name: "RAM", slug: "ram", emoji: "🧠", type: "single_select", presets: ["2GB", "4GB", "6GB", "8GB", "12GB", "16GB", "32GB"], aiDetectable: true },
  { name: "Screen Size", slug: "screen_size", emoji: "🖥️", type: "single_select", presets: ["5\"", "6\"", "6.5\"", "7\"", "10\"", "13\"", "14\"", "15\"", "17\"", "24\"", "27\""], aiDetectable: true },
  { name: "Battery Capacity", slug: "battery", emoji: "🔋", type: "single_select", presets: ["3000mAh", "4000mAh", "5000mAh", "6000mAh", "10000mAh", "20000mAh"] },
  { name: "Processor", slug: "processor", emoji: "⚡", type: "text", presets: [] },
  { name: "Connectivity", slug: "connectivity", emoji: "📶", type: "multi_select", presets: ["WiFi", "Bluetooth", "4G LTE", "5G", "NFC", "USB-C", "Lightning"] },
  { name: "Accessories Included", slug: "accessories", emoji: "🎧", type: "tags", presets: ["Charger", "Case", "Screen Protector", "Earphones", "Cable", "Box"] },

  // ── Home / Furniture ──
  { name: "Furniture Type", slug: "furniture_type", emoji: "🛋️", type: "single_select", presets: ["Sofa", "Table", "Chair", "Bed", "Cabinet", "Shelf", "Desk", "Wardrobe", "Stool"], aiDetectable: true },
  { name: "Finish", slug: "finish", emoji: "✨", type: "single_select", presets: ["Matte", "Glossy", "Satin", "Natural", "Painted", "Lacquered", "Polished"] },
  { name: "Dimensions", slug: "dimensions", emoji: "📐", type: "text", presets: [] },
  { name: "Assembly Required", slug: "assembly", emoji: "🔧", type: "boolean", presets: ["Yes", "No"] },
  { name: "Seating Capacity", slug: "seating_capacity", emoji: "🪑", type: "single_select", presets: ["1", "2", "3", "4", "5", "6", "8+"] },
  { name: "Indoor / Outdoor", slug: "indoor_outdoor", emoji: "🏠", type: "single_select", presets: ["Indoor", "Outdoor", "Both"] },

  // ── Food / Grocery ──
  { name: "Ingredients", slug: "ingredients", emoji: "📝", type: "text", presets: [] },
  { name: "Net Weight", slug: "net_weight", emoji: "⚖️", type: "text", presets: [] },
  { name: "Pack Size", slug: "pack_size", emoji: "📦", type: "single_select", presets: ["Single", "3 Pack", "6 Pack", "12 Pack", "Bulk"] },
  { name: "Servings", slug: "servings", emoji: "🍽️", type: "single_select", presets: ["1", "2-4", "4-6", "6-8", "10+"] },
  { name: "Storage Instructions", slug: "storage_instructions", emoji: "❄️", type: "single_select", presets: ["Room Temperature", "Refrigerate", "Freeze", "Cool Dry Place"] },
  { name: "Spice Level", slug: "spice_level", emoji: "🌶️", type: "single_select", presets: ["Not Spicy", "Mild", "Medium", "Hot", "Extra Hot"] },
  { name: "Organic", slug: "organic", emoji: "🌱", type: "boolean", presets: ["Yes", "No"] },
  { name: "Halal", slug: "halal", emoji: "☪️", type: "boolean", presets: ["Yes", "No"] },
  { name: "Gluten Free", slug: "gluten_free", emoji: "🌾", type: "boolean", presets: ["Yes", "No"] },

  // ── Jewellery ──
  { name: "Jewellery Type", slug: "jewellery_type", emoji: "💍", type: "single_select", presets: ["Ring", "Necklace", "Bracelet", "Earrings", "Watch", "Anklet", "Pendant", "Brooch", "Chain"], aiDetectable: true },
  { name: "Metal Type", slug: "metal_type", emoji: "🥇", type: "single_select", presets: ["Gold", "Silver", "Rose Gold", "Platinum", "Stainless Steel", "Brass", "Copper", "Titanium"], aiDetectable: true },
  { name: "Gemstone", slug: "gemstone", emoji: "💎", type: "single_select", presets: ["Diamond", "Ruby", "Sapphire", "Emerald", "Pearl", "Amethyst", "Cubic Zirconia", "None"] },
  { name: "Ring Size", slug: "ring_size", emoji: "💍", type: "multi_select", presets: ["5", "6", "7", "8", "9", "10", "11", "12"] },
  { name: "Chain Length", slug: "chain_length", emoji: "📏", type: "single_select", presets: ["14\"", "16\"", "18\"", "20\"", "22\"", "24\"", "30\""] },

  // ── Pet Products ──
  { name: "Pet Type", slug: "pet_type", emoji: "🐾", type: "single_select", presets: ["Dog", "Cat", "Bird", "Fish", "Rabbit", "Hamster", "All Pets"] },
  { name: "Breed Size", slug: "breed_size", emoji: "🐕", type: "single_select", presets: ["Small", "Medium", "Large", "Extra Large", "All Sizes"] },
  { name: "Pet Age Group", slug: "pet_age_group", emoji: "🐶", type: "single_select", presets: ["Puppy/Kitten", "Adult", "Senior", "All Ages"] },
  { name: "Health Purpose", slug: "health_purpose", emoji: "💊", type: "single_select", presets: ["Joint Health", "Digestive", "Skin & Coat", "Dental", "Weight Management", "General Health"] },
  { name: "Washable", slug: "washable", emoji: "🧺", type: "boolean", presets: ["Yes", "No"] },
];

// ══════════════════════════════════════════════════════════════════════
//  CATEGORY DEFINITIONS
// ══════════════════════════════════════════════════════════════════════

export const CATEGORY_LIBRARY: CategoryDef[] = [
  {
    label: "Fashion", slug: "fashion", emoji: "👗",
    subcategories: [
      { label: "Dresses", slug: "dresses", attributeSlugs: ["brand", "colour", "size", "material", "pattern", "fit", "occasion", "sleeve_length", "dress_length", "neckline", "gender", "condition"] },
      { label: "Tops & Shirts", slug: "tops", attributeSlugs: ["brand", "colour", "size", "material", "pattern", "fit", "sleeve_length", "neckline", "gender", "condition"] },
      { label: "Pants & Trousers", slug: "pants", attributeSlugs: ["brand", "colour", "size", "material", "fit", "gender", "condition", "closure_type"] },
      { label: "Skirts", slug: "skirts", attributeSlugs: ["brand", "colour", "size", "material", "pattern", "style", "gender", "condition"] },
      { label: "Traditional Wear", slug: "traditional", attributeSlugs: ["brand", "colour", "size", "material", "occasion", "gender", "condition", "style"] },
      { label: "Bags & Accessories", slug: "bags", attributeSlugs: ["brand", "colour", "material", "style", "condition"] },
    ],
    defaultAttributeSlugs: ["brand", "colour", "size", "material", "pattern", "fit", "occasion", "style", "gender", "condition"],
  },
  {
    label: "Shoes", slug: "shoes", emoji: "👟",
    subcategories: [
      { label: "Sneakers", slug: "sneakers", attributeSlugs: ["brand", "colour", "shoe_size", "material", "condition", "gender"] },
      { label: "Heels", slug: "heels", attributeSlugs: ["brand", "colour", "shoe_size", "heel_height", "material", "occasion", "condition"] },
      { label: "Sandals", slug: "sandals", attributeSlugs: ["brand", "colour", "shoe_size", "material", "condition", "gender"] },
      { label: "Boots", slug: "boots", attributeSlugs: ["brand", "colour", "shoe_size", "material", "heel_height", "condition"] },
    ],
    defaultAttributeSlugs: ["brand", "colour", "shoe_size", "shoe_type", "material", "condition", "gender"],
  },
  {
    label: "Cakes & Bakery", slug: "cakes", emoji: "🎂",
    subcategories: [
      { label: "Birthday Cakes", slug: "birthday_cakes", attributeSlugs: ["cake_type", "flavour", "filling", "frosting", "toppings", "weight", "shape", "layers", "serves", "theme", "allergens", "custom_message", "delivery_date"] },
      { label: "Wedding Cakes", slug: "wedding_cakes", attributeSlugs: ["cake_type", "flavour", "filling", "frosting", "layers", "serves", "theme", "allergens", "delivery_date"] },
      { label: "Cupcakes & Pastries", slug: "cupcakes", attributeSlugs: ["cake_type", "flavour", "toppings", "allergens", "dietary_option", "pack_size"] },
    ],
    defaultAttributeSlugs: ["cake_type", "flavour", "filling", "frosting", "toppings", "weight", "shape", "layers", "serves", "occasion", "allergens", "custom_message", "delivery_date"],
  },
  {
    label: "Flowers & Gifts", slug: "flowers", emoji: "💐",
    subcategories: [
      { label: "Bouquets", slug: "bouquets", attributeSlugs: ["flower_type", "colour", "bouquet_type", "stem_count", "wrapping_style", "occasion", "addons", "fresh_artificial", "delivery_date"] },
      { label: "Gift Hampers", slug: "hampers", attributeSlugs: ["occasion", "addons", "colour", "delivery_date"] },
    ],
    defaultAttributeSlugs: ["flower_type", "colour", "bouquet_type", "stem_count", "wrapping_style", "occasion", "addons", "card_included", "fresh_artificial", "delivery_date"],
  },
  {
    label: "Beauty & Skincare", slug: "beauty", emoji: "💄",
    subcategories: [
      { label: "Skincare", slug: "skincare", attributeSlugs: ["brand", "product_type_beauty", "skin_type", "skin_concern", "key_ingredients", "volume", "scent", "spf", "vegan", "cruelty_free", "how_to_use", "expiry_date"] },
      { label: "Makeup", slug: "makeup", attributeSlugs: ["brand", "colour", "product_type_beauty", "skin_type", "volume", "vegan", "cruelty_free", "condition"] },
      { label: "Perfumes", slug: "perfumes", attributeSlugs: ["brand", "scent", "volume", "gender", "condition"] },
    ],
    defaultAttributeSlugs: ["brand", "product_type_beauty", "skin_type", "skin_concern", "key_ingredients", "volume", "scent", "how_to_use", "expiry_date"],
  },
  {
    label: "Hair & Wigs", slug: "wigs", emoji: "💇",
    subcategories: [
      { label: "Wigs", slug: "wigs_sub", attributeSlugs: ["colour", "hair_type", "hair_length", "wig_type", "hair_origin", "density", "cap_size", "brand", "condition"] },
      { label: "Extensions", slug: "extensions", attributeSlugs: ["colour", "hair_type", "hair_length", "hair_origin", "weight", "brand"] },
      { label: "Braids", slug: "braids", attributeSlugs: ["colour", "hair_type", "hair_length", "brand", "style"] },
    ],
    defaultAttributeSlugs: ["colour", "hair_type", "hair_length", "wig_type", "hair_origin", "density", "cap_size", "brand", "condition", "stock"],
  },
  {
    label: "Electronics", slug: "phones", emoji: "📱",
    subcategories: [
      { label: "Phones", slug: "phones_sub", attributeSlugs: ["brand", "model", "storage", "ram", "colour", "screen_size", "battery", "condition", "warranty", "accessories"] },
      { label: "Laptops", slug: "laptops", attributeSlugs: ["brand", "model", "storage", "ram", "processor", "screen_size", "colour", "condition", "warranty"] },
      { label: "Accessories", slug: "tech_accessories", attributeSlugs: ["brand", "colour", "material", "connectivity", "condition"] },
    ],
    defaultAttributeSlugs: ["brand", "model", "storage", "ram", "colour", "screen_size", "condition", "warranty", "accessories"],
  },
  {
    label: "Home & Furniture", slug: "home", emoji: "🏠",
    subcategories: [
      { label: "Furniture", slug: "furniture", attributeSlugs: ["furniture_type", "material", "colour", "finish", "dimensions", "assembly", "seating_capacity", "indoor_outdoor", "condition"] },
      { label: "Decor", slug: "decor", attributeSlugs: ["colour", "material", "style", "dimensions", "condition"] },
    ],
    defaultAttributeSlugs: ["furniture_type", "material", "colour", "finish", "style", "dimensions", "condition"],
  },
  {
    label: "Food & Grocery", slug: "food", emoji: "🍽️",
    subcategories: [
      { label: "Fresh Food", slug: "fresh", attributeSlugs: ["weight", "ingredients", "allergens", "dietary_option", "organic", "halal", "storage_instructions", "expiry_date"] },
      { label: "Packaged Food", slug: "packaged", attributeSlugs: ["brand", "flavour", "weight", "pack_size", "ingredients", "allergens", "halal", "gluten_free", "storage_instructions", "expiry_date"] },
      { label: "Spices & Seasonings", slug: "spices", attributeSlugs: ["brand", "weight", "spice_level", "organic", "ingredients"] },
    ],
    defaultAttributeSlugs: ["brand", "flavour", "weight", "ingredients", "allergens", "dietary_option", "halal", "storage_instructions", "expiry_date", "stock"],
  },
  {
    label: "Jewellery", slug: "jewellery", emoji: "💍",
    subcategories: [
      { label: "Necklaces & Chains", slug: "necklaces", attributeSlugs: ["brand", "metal_type", "gemstone", "colour", "chain_length", "style", "condition"] },
      { label: "Rings", slug: "rings", attributeSlugs: ["brand", "metal_type", "gemstone", "colour", "ring_size", "condition"] },
      { label: "Earrings", slug: "earrings", attributeSlugs: ["brand", "metal_type", "gemstone", "colour", "style", "condition"] },
      { label: "Watches", slug: "watches", attributeSlugs: ["brand", "colour", "material", "gender", "condition", "warranty"] },
      { label: "Bracelets", slug: "bracelets", attributeSlugs: ["brand", "metal_type", "colour", "style", "condition"] },
    ],
    defaultAttributeSlugs: ["jewellery_type", "brand", "metal_type", "gemstone", "colour", "style", "condition"],
  },
  {
    label: "Pets", slug: "pets", emoji: "🐾",
    subcategories: [],
    defaultAttributeSlugs: ["pet_type", "breed_size", "pet_age_group", "brand", "flavour", "material", "health_purpose", "washable"],
  },
  {
    label: "Plants & Garden", slug: "plants", emoji: "🌱",
    subcategories: [],
    defaultAttributeSlugs: ["stock", "weight", "colour", "care_instructions", "indoor_outdoor"],
  },
  {
    label: "Other", slug: "other", emoji: "📦",
    subcategories: [],
    defaultAttributeSlugs: ["brand", "colour", "condition", "material", "stock"],
  },
];

// ══════════════════════════════════════════════════════════════════════
//  HELPER FUNCTIONS
// ══════════════════════════════════════════════════════════════════════

/** Get an attribute definition by slug */
export function getAttrDef(slug: string): AttributeDef | undefined {
  return ATTRIBUTE_LIBRARY.find((a) => a.slug === slug);
}

/** Get a category definition by slug */
export function getCategoryDef(slug: string): CategoryDef | undefined {
  return CATEGORY_LIBRARY.find((c) => c.slug === slug);
}

/** Get recommended attribute defs for a category (and optionally subcategory) */
export function getRecommendedAttrs(
  categorySlug?: string,
  subcategorySlug?: string
): { recommended: AttributeDef[]; others: AttributeDef[] } {
  const cat = categorySlug ? getCategoryDef(categorySlug) : undefined;

  let recSlugs: string[] = [];
  if (cat) {
    const sub = subcategorySlug
      ? cat.subcategories.find((s) => s.slug === subcategorySlug)
      : undefined;
    recSlugs = sub ? sub.attributeSlugs : cat.defaultAttributeSlugs;
  }

  const recSet = new Set(recSlugs);
  const recommended = recSlugs
    .map((s) => getAttrDef(s))
    .filter(Boolean) as AttributeDef[];
  const others = ATTRIBUTE_LIBRARY.filter((a) => !recSet.has(a.slug));

  return { recommended, others };
}

/** Build a summary line like "🎨 3 colours • 📏 4 sizes" */
export function getAttributeSummary(attrs: Record<string, any>): string {
  if (!attrs || attrs.chat_only) return "";
  const parts: string[] = [];
  for (const [key, val] of Object.entries(attrs)) {
    if (key === "chat_only" || key === "product_type" || key === "ai_suggestions") continue;
    const def = getAttrDef(key);
    if (Array.isArray(val) && val.length > 0) {
      const emoji = def?.emoji ?? "➕";
      const label = def?.name ?? key.replace(/other_|_/g, " ").trim();
      parts.push(`${emoji} ${val.length} ${label.toLowerCase()}${val.length > 1 ? "s" : ""}`);
    } else if (typeof val === "string" && val) {
      const emoji = def?.emoji ?? "📋";
      const label = def?.name ?? key.replace(/other_|_/g, " ").trim();
      parts.push(`${emoji} ${label}: ${val}`);
    }
  }
  return parts.slice(0, 4).join("  •  ");
}

/** Build WhatsApp message lines from buyer selections */
export function buildAttributeLines(
  attributes: Record<string, any>,
  buyerSelections: Record<string, string>
): string[] {
  if (!attributes || attributes.chat_only) return [];
  const lines: string[] = [];
  for (const [key, sel] of Object.entries(buyerSelections)) {
    if (!sel) continue;
    const def = getAttrDef(key);
    let label = def?.name ?? key.replace(/other_|_/g, " ").trim();
    label = label.charAt(0).toUpperCase() + label.slice(1);
    lines.push(`• ${label}: ${sel}`);
  }
  return lines;
}

/** Get all selectable attribute keys (those with array values) */
export function getSelectableKeys(attributes: Record<string, any>): string[] {
  if (!attributes || attributes.chat_only) return [];
  return Object.keys(attributes).filter(
    (k) => k !== "chat_only" && k !== "product_type" && k !== "ai_suggestions" && Array.isArray(attributes[k]) && attributes[k].length > 0
  );
}

// ── AI Suggestion Types ──────────────────────────────────────────────
export interface AiAttributeSuggestion {
  slug: string;
  value: string | string[];
  confidence: "high" | "medium" | "low";
  source: "title" | "description" | "image" | "combined";
}

export interface AiDetectionResult {
  category: string;
  subcategory?: string;
  suggestions: AiAttributeSuggestion[];
}
