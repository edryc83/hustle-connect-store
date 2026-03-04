/**
 * Product attribute configuration by category.
 * Each category defines fields the seller can fill in.
 * The buyer sees selectable options based on what the seller provided.
 */

export type AttrFieldType = "pills" | "multi-pills" | "text" | "toggle" | "number";

export interface AttrField {
  key: string;
  label: string;
  type: AttrFieldType;
  options?: string[];        // For pills / multi-pills / toggle
  placeholder?: string;      // For text / number inputs
  optional?: boolean;        // default true on seller side
}

export interface ProductCategory {
  value: string;
  label: string;
  emoji: string;
  fields: AttrField[];
}

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  {
    value: "fashion",
    label: "Fashion & Clothing",
    emoji: "👗",
    fields: [
      { key: "sizes", label: "Sizes available", type: "multi-pills", options: ["XS", "S", "M", "L", "XL", "XXL", "Custom"] },
      { key: "colours", label: "Colours available", type: "text", placeholder: "e.g. Black, White, Red" },
      { key: "material", label: "Material", type: "text", placeholder: "e.g. Cotton, Polyester" },
      { key: "condition", label: "Condition", type: "toggle", options: ["New", "Thrift/Used"] },
      { key: "gender", label: "Gender", type: "pills", options: ["Unisex", "Women", "Men", "Kids"] },
    ],
  },
  {
    value: "beauty",
    label: "Beauty & Skincare",
    emoji: "💄",
    fields: [
      { key: "volume", label: "Size/Volume options", type: "text", placeholder: "e.g. 30ml, 50ml, 100ml" },
      { key: "skin_type", label: "Skin type", type: "multi-pills", options: ["Oily", "Dry", "Combination", "Normal", "All skin types"] },
      { key: "shades", label: "Available shades/tones", type: "text", placeholder: "e.g. Light, Medium, Dark" },
      { key: "scent", label: "Scent options", type: "text", placeholder: "e.g. Rose, Lavender, Unscented" },
    ],
  },
  {
    value: "phones",
    label: "Phones & Electronics",
    emoji: "📱",
    fields: [
      { key: "brand", label: "Brand", type: "text", placeholder: "e.g. Samsung, iPhone, Tecno" },
      { key: "storage", label: "Storage options", type: "multi-pills", options: ["32GB", "64GB", "128GB", "256GB", "512GB", "1TB"] },
      { key: "colours", label: "Colour options", type: "text", placeholder: "e.g. Black, White, Gold" },
      { key: "condition", label: "Condition", type: "toggle", options: ["Brand New", "UK Used", "SA Used", "Refurbished"] },
      { key: "network", label: "Network", type: "toggle", options: ["Unlocked", "Locked"] },
      { key: "warranty", label: "Warranty", type: "toggle", options: ["Yes", "No"] },
    ],
  },
  {
    value: "food",
    label: "Food & Drinks",
    emoji: "🍱",
    fields: [
      { key: "portions", label: "Portion sizes", type: "text", placeholder: "e.g. Small, Regular, Large, Family size" },
      { key: "quantity_options", label: "Quantity options", type: "text", placeholder: "e.g. 1 piece, 5 pieces, 10 pieces" },
      { key: "spice_level", label: "Spice level", type: "pills", options: ["Mild", "Medium", "Hot", "Extra Hot", "No Spice"] },
      { key: "dietary", label: "Dietary tags", type: "multi-pills", options: ["Halal", "Vegan", "Vegetarian", "Gluten Free", "Dairy Free"] },
      { key: "fulfilment", label: "Fulfilment", type: "toggle", options: ["Delivery", "Pickup", "Both"] },
    ],
  },
  {
    value: "cakes",
    label: "Cakes & Bakery",
    emoji: "🎂",
    fields: [
      { key: "cake_size", label: "Cake size", type: "pills", options: ["6 inch (feeds 8)", "8 inch (feeds 15)", "10 inch (feeds 25)", "12 inch (feeds 35)", "Custom"] },
      { key: "flavour", label: "Flavour options", type: "text", placeholder: "e.g. Vanilla, Chocolate, Red Velvet, Lemon" },
      { key: "occasion", label: "Occasion", type: "pills", options: ["Birthday", "Wedding", "Baby Shower", "Graduation", "Custom", "No Occasion"] },
      { key: "cake_message", label: "Custom message on cake", type: "toggle", options: ["Yes", "No"] },
      { key: "cake_dietary", label: "Dietary", type: "multi-pills", options: ["Regular", "Eggless", "Gluten Free", "Vegan"] },
      { key: "days_notice", label: "Days notice needed", type: "number", placeholder: "e.g. 3" },
    ],
  },
  {
    value: "plants",
    label: "Plants & Garden",
    emoji: "🌿",
    fields: [
      { key: "pot_size", label: "Pot size", type: "pills", options: ["Small", "Medium", "Large", "Extra Large"] },
      { key: "pot_included", label: "Pot included", type: "toggle", options: ["With pot", "Without pot"] },
      { key: "indoor_outdoor", label: "Indoor/Outdoor", type: "pills", options: ["Indoor", "Outdoor", "Both"] },
      { key: "care_level", label: "Care level", type: "pills", options: ["Easy", "Moderate", "Expert"] },
    ],
  },
  {
    value: "home",
    label: "Home & Decor",
    emoji: "🏠",
    fields: [
      { key: "dimensions", label: "Dimensions/Size", type: "text", placeholder: "e.g. 1.5m x 2m, 2m x 3m" },
      { key: "colours", label: "Colour options", type: "text", placeholder: "e.g. Beige, White, Navy" },
      { key: "material", label: "Material", type: "text", placeholder: "e.g. Cotton, Velvet, Linen" },
      { key: "quantity_options", label: "Quantity", type: "text", placeholder: "e.g. Single panel, Pair, Set of 4" },
      { key: "installation", label: "Installation included", type: "toggle", options: ["Yes", "No", "Extra cost"] },
    ],
  },
  {
    value: "jewellery",
    label: "Jewellery & Accessories",
    emoji: "💍",
    fields: [
      { key: "material", label: "Material", type: "pills", options: ["Gold plated", "Silver", "Rose gold", "Stainless steel", "Beaded"] },
      { key: "ring_size", label: "Ring/Bracelet size", type: "text", placeholder: "e.g. Size 6, 7, 8" },
      { key: "colours", label: "Colour", type: "text", placeholder: "e.g. Gold, Silver, Rose" },
      { key: "personalisation", label: "Personalisation available", type: "toggle", options: ["Yes", "No"] },
    ],
  },
  {
    value: "shoes",
    label: "Shoes & Footwear",
    emoji: "👟",
    fields: [
      { key: "sizes", label: "Sizes available", type: "multi-pills", options: ["36", "37", "38", "39", "40", "41", "42", "43", "44", "45"] },
      { key: "colours", label: "Colour options", type: "text", placeholder: "e.g. Black, White, Brown" },
      { key: "condition", label: "Condition", type: "toggle", options: ["New", "Used"] },
      { key: "gender", label: "Gender", type: "pills", options: ["Women", "Men", "Kids", "Unisex"] },
    ],
  },
  {
    value: "wigs",
    label: "Wigs & Hair",
    emoji: "💇",
    fields: [
      { key: "length", label: "Length", type: "pills", options: ['8"', '10"', '12"', '14"', '16"', '18"', '20"', '22"', '24"', '26"', '28"', '30"'] },
      { key: "texture", label: "Texture", type: "pills", options: ["Straight", "Body Wave", "Deep Wave", "Curly", "Kinky Curly", "Afro"] },
      { key: "colours", label: "Colour", type: "text", placeholder: "e.g. Natural black, Ombre, Blonde" },
      { key: "density", label: "Density", type: "pills", options: ["150%", "180%", "200%", "250%"] },
      { key: "lace_type", label: "Lace type", type: "pills", options: ["Lace Front", "Full Lace", "360 Lace", "No Lace", "Closure"] },
      { key: "hair_type", label: "Hair type", type: "toggle", options: ["Human Hair", "Synthetic"] },
    ],
  },
  {
    value: "other",
    label: "Other",
    emoji: "📦",
    fields: [
      { key: "custom_options", label: "Your options", type: "text", placeholder: "Add your options (e.g. colours, sizes, types)" },
    ],
  },
];

export function getCategoryByValue(value: string): ProductCategory | undefined {
  return PRODUCT_CATEGORIES.find((c) => c.value === value);
}

/**
 * Parse text-type attributes into arrays for buyer selection.
 * Splits by comma, trims, filters empty.
 */
export function parseTextToOptions(text: string): string[] {
  return text.split(",").map((s) => s.trim()).filter(Boolean);
}

/**
 * Build the attribute lines for the WhatsApp message.
 * Only includes fields that have buyer selections.
 */
export function buildAttributeLines(
  attributes: Record<string, any>,
  buyerSelections: Record<string, string | string[]>,
  buyerTextInputs?: Record<string, string>,
): string[] {
  const category = getCategoryByValue(attributes.product_type);
  if (!category) return [];

  const lines: string[] = [];

  for (const field of category.fields) {
    const sellerValue = attributes[field.key];
    if (!sellerValue) continue;

    const buyerValue = buyerSelections[field.key];
    const buyerText = buyerTextInputs?.[field.key];

    if (buyerText) {
      lines.push(`- ${field.label}: ${buyerText}`);
    } else if (buyerValue) {
      if (Array.isArray(buyerValue)) {
        if (buyerValue.length > 0) lines.push(`- ${field.label}: ${buyerValue.join(", ")}`);
      } else {
        lines.push(`- ${field.label}: ${buyerValue}`);
      }
    } else if (field.type === "toggle" || field.type === "number") {
      // Show toggle/number values as badges (non-selectable info)
      if (typeof sellerValue === "string" || typeof sellerValue === "number") {
        lines.push(`- ${field.label}: ${sellerValue}`);
      }
    }
  }

  return lines;
}
