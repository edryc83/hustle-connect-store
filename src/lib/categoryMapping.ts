/**
 * Maps AI-detected category slugs (from analyze-product-image)
 * to the full CategoryPicker display names used in profiles.category.
 */

const AI_SLUG_TO_CATEGORY: Record<string, string> = {
  // Product categories
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
  // Service categories
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
  // Experience categories
  trips: "Trips & Travel",
  adventure: "Adventure & Outdoor",
  dining: "Dining Experiences",
  wellness: "Wellness & Spa",
  cultural: "Cultural Experiences",
  // Catch-all
  other: "Other",
};

/** Convert an AI slug like "fashion" to "Fashion & Clothing" */
export function aiSlugToCategory(slug: string | undefined | null): string | null {
  if (!slug) return null;
  return AI_SLUG_TO_CATEGORY[slug.toLowerCase()] || null;
}

/** Subcategory slug mapping — AI returns slugs, we map to display names */
const AI_SUBCATEGORY_MAP: Record<string, Record<string, string>> = {
  "Fashion & Clothing": {
    mens_wear: "Men's Wear", womens_wear: "Women's Wear", kids_wear: "Kids' Wear",
    shoes: "Shoes", bags: "Bags", dresses: "Dresses", vintage: "Vintage",
    uniforms: "Uniforms", sportswear: "Sportswear", traditional_wear: "Traditional Wear",
  },
  "Electronics & Gadgets": {
    phones: "Phones", laptops: "Laptops", tablets: "Tablets", accessories: "Accessories",
    chargers: "Chargers & Cables", speakers: "Speakers", tvs: "TVs", headphones: "Headphones",
    cameras: "Cameras", smart_watches: "Smart Watches", gaming: "Gaming Consoles", printers: "Printers",
  },
  "Beauty & Cosmetics": {
    skincare: "Skincare", makeup: "Makeup", haircare: "Haircare", perfumes: "Perfumes",
    natural: "Natural/Organic", wigs: "Wigs & Extensions", nails: "Nail Products", body_care: "Body Care",
  },
  "Food & Beverages": {
    fresh_produce: "Fresh Produce", snacks: "Snacks", drinks: "Drinks", baked_goods: "Baked Goods",
    spices: "Spices", catering: "Catering", frozen: "Frozen Foods", organic: "Organic",
    cereals: "Cereals & Grains", cooking_oils: "Cooking Oils",
  },
  "Home & Living": {
    furniture: "Furniture", kitchen: "Kitchen", decor: "Décor", bedding: "Bedding",
    cleaning: "Cleaning Supplies", curtains: "Curtains & Blinds", lighting: "Lighting",
    storage: "Storage & Organisation", carpets: "Carpets & Rugs",
  },
};

/** Convert an AI subcategory slug to display name given the parent category */
export function aiSlugToSubcategory(categoryName: string, subcategorySlug: string | undefined | null): string | null {
  if (!subcategorySlug || !categoryName) return null;
  const catMap = AI_SUBCATEGORY_MAP[categoryName];
  if (catMap) {
    return catMap[subcategorySlug.toLowerCase()] || null;
  }
  // If not in map, return the slug as-is if it looks like a display name
  if (subcategorySlug.includes(' ') || subcategorySlug[0] === subcategorySlug[0].toUpperCase()) {
    return subcategorySlug;
  }
  return null;
}

/** Category emoji map for storefront filter pills */
export const CATEGORY_EMOJI: Record<string, string> = {
  "Fashion & Clothing": "👗",
  "Electronics & Gadgets": "📱",
  "Home Appliances": "🏠",
  "Food & Beverages": "🍽️",
  "Beauty & Cosmetics": "💄",
  "Home & Living": "🛋️",
  "Health & Wellness": "💊",
  "Books & Stationery": "📚",
  "Art & Crafts": "🎨",
  "Sports & Fitness": "🏋️",
  "Agriculture & Farm Produce": "🌾",
  "Auto & Motor Parts": "🚗",
  "Baby & Kids": "👶",
  "Phones & Accessories": "📱",
  "Jewelry & Accessories": "💎",
  "Building & Hardware": "🔨",
  "Pets & Animals": "🐾",
  "Other": "📦",
};
