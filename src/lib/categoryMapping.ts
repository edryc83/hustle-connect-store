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
