/**
 * Simplified attribute system.
 * Sellers pick attribute types and select/add values.
 * Buyers pick one value per attribute when ordering.
 *
 * Stored format in products.attributes:
 * {
 *   "colour": ["Black", "White", "Red"],
 *   "size": ["S", "M", "L"],
 *   "condition": ["Brand New"]
 * }
 * OR { "chat_only": true }
 */

export interface AttributeType {
  key: string;
  label: string;
  emoji: string;
  presets: string[];  // empty = text-only input
  isCustom?: boolean; // "Other" type with custom label
}

/** Map colour names to hex values for swatches */
export const COLOUR_HEX: Record<string, string> = {
  Black: "#000000",
  White: "#FFFFFF",
  Red: "#EF4444",
  Blue: "#3B82F6",
  Yellow: "#EAB308",
  Green: "#22C55E",
  Orange: "#F97316",
  Purple: "#A855F7",
  Pink: "#EC4899",
  Brown: "#92400E",
  Grey: "#6B7280",
  Gold: "#D4A017",
  Silver: "#C0C0C0",
  Navy: "#1E3A5F",
  Beige: "#F5F5DC",
  Maroon: "#800000",
  Teal: "#14B8A6",
  Cream: "#FFFDD0",
};

export const ATTRIBUTE_TYPES: AttributeType[] = [
  {
    key: "size",
    label: "Size",
    emoji: "📏",
    presets: ["XS", "S", "M", "L", "XL", "XXL", "One Size"],
  },
  {
    key: "colour",
    label: "Colour",
    emoji: "🎨",
    presets: ["Black", "White", "Red", "Blue", "Yellow", "Green", "Orange", "Purple", "Pink", "Brown"],
  },
  {
    key: "brand",
    label: "Brand",
    emoji: "✨",
    presets: [], // text input only
  },
  {
    key: "condition",
    label: "Condition",
    emoji: "♻️",
    presets: ["Brand New", "Like New", "Good", "Fair", "Refurbished"],
  },
  {
    key: "weight",
    label: "Weight",
    emoji: "⚖️",
    presets: ["250g", "500g", "1kg", "2kg", "5kg"],
  },
  {
    key: "scent",
    label: "Scent",
    emoji: "🌸",
    presets: ["Floral", "Fruity", "Fresh", "Musky", "Sweet", "Woody", "Unscented"],
  },
  {
    key: "style",
    label: "Style",
    emoji: "👗",
    presets: ["Casual", "Formal", "Sporty", "Traditional", "Street"],
  },
  {
    key: "stock",
    label: "Stock",
    emoji: "📦",
    presets: ["In Stock", "Last Few Left", "Made to Order", "Pre-order"],
  },
];

/** Map detected product categories to recommended attribute keys */
export const CATEGORY_ATTRIBUTES: Record<string, string[]> = {
  fashion: ["size", "colour", "brand", "condition", "style"],
  beauty: ["scent", "brand", "weight", "condition"],
  food: ["weight", "stock"],
  phones: ["brand", "condition", "colour", "stock"],
  wigs: ["colour", "style", "brand", "stock"],
  shoes: ["size", "colour", "brand", "condition"],
  home: ["colour", "brand", "weight", "condition"],
  jewellery: ["colour", "brand", "condition", "style"],
  cakes: ["weight", "stock"],
  plants: ["stock", "weight"],
  other: ["condition", "brand", "stock"],
};

/**
 * Get recommended attribute types for a product category.
 * Returns all types, with recommended ones first.
 */
export function getRecommendedAttributes(category?: string): { recommended: AttributeType[]; others: AttributeType[] } {
  const recKeys = category ? (CATEGORY_ATTRIBUTES[category] ?? []) : [];
  const recommended = recKeys
    .map((k) => ATTRIBUTE_TYPES.find((t) => t.key === k))
    .filter(Boolean) as AttributeType[];
  const recKeySet = new Set(recKeys);
  const others = ATTRIBUTE_TYPES.filter((t) => !recKeySet.has(t.key));
  return { recommended, others };
}

export function getAttributeType(key: string): AttributeType | undefined {
  return ATTRIBUTE_TYPES.find((t) => t.key === key);
}

/**
 * Get a summary line for product cards, e.g. "🎨 3 colours • 📏 4 sizes"
 */
export function getAttributeSummary(attrs: Record<string, any>): string {
  if (!attrs || attrs.chat_only) return "";
  const parts: string[] = [];
  for (const type of ATTRIBUTE_TYPES) {
    const val = attrs[type.key];
    if (Array.isArray(val) && val.length > 0) {
      parts.push(`${type.emoji} ${val.length} ${type.label.toLowerCase()}${val.length > 1 ? "s" : ""}`);
    }
  }
  // Check custom "other_*" keys
  for (const key of Object.keys(attrs)) {
    if (key.startsWith("other_")) {
      const val = attrs[key];
      if (Array.isArray(val) && val.length > 0) {
        const label = key.replace("other_", "").replace(/_/g, " ");
        parts.push(`➕ ${val.length} ${label}`);
      }
    }
  }
  return parts.join("  •  ");
}

/**
 * Build WhatsApp message bullet lines from buyer selections.
 */
export function buildAttributeLines(
  attributes: Record<string, any>,
  buyerSelections: Record<string, string>,
): string[] {
  if (!attributes || attributes.chat_only) return [];
  const lines: string[] = [];

  const allKeys = Object.keys(attributes).filter(
    (k) => k !== "chat_only" && Array.isArray(attributes[k]) && attributes[k].length > 0
  );

  for (const key of allKeys) {
    const sel = buyerSelections[key];
    if (!sel) continue;
    // Find display label
    const type = ATTRIBUTE_TYPES.find((t) => t.key === key);
    let label = type?.label ?? key.replace("other_", "").replace(/_/g, " ");
    label = label.charAt(0).toUpperCase() + label.slice(1);
    lines.push(`• ${label}: ${sel}`);
  }

  return lines;
}

/**
 * Get all selectable attribute keys (those with array values).
 */
export function getSelectableKeys(attributes: Record<string, any>): string[] {
  if (!attributes || attributes.chat_only) return [];
  return Object.keys(attributes).filter(
    (k) => k !== "chat_only" && k !== "stock" && Array.isArray(attributes[k]) && attributes[k].length > 0
  );
}
