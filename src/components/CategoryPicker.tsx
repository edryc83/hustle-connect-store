import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ChevronDown, ChevronRight } from "lucide-react";

export const CATEGORY_DATA: Record<string, string[]> = {
  "Fashion & Clothing": ["Men's Wear", "Women's Wear", "Kids' Wear", "Shoes", "Bags", "Dresses", "Vintage"],
  "Electronics & Gadgets": ["Phones", "Laptops", "Accessories", "Chargers & Cables", "Speakers", "TVs"],
  "Food & Beverages": ["Fresh Produce", "Snacks", "Drinks", "Baked Goods", "Spices", "Catering"],
  "Beauty & Cosmetics": ["Skincare", "Makeup", "Haircare", "Perfumes", "Natural/Organic"],
  "Home & Living": ["Furniture", "Kitchen", "Décor", "Bedding", "Cleaning Supplies"],
  "Health & Wellness": ["Supplements", "Fitness Gear", "Natural Remedies", "Personal Care"],
  "Books & Stationery": ["Textbooks", "Novels", "Office Supplies", "Notebooks"],
  "Art & Crafts": ["Paintings", "Handmade Goods", "Beadwork", "Pottery"],
  "Sports & Fitness": ["Sportswear", "Equipment", "Outdoor Gear"],
  "Agriculture & Farm Produce": ["Seeds", "Livestock Feed", "Fresh Harvest", "Dairy"],
  "Auto & Motor Parts": ["Car Parts", "Motorcycle Parts", "Tools", "Accessories"],
  "Baby & Kids": ["Clothing", "Toys", "Feeding", "Diapers"],
  "Phones & Accessories": ["Cases", "Screen Protectors", "Earphones", "Power Banks"],
  "Jewelry & Accessories": ["Necklaces", "Bracelets", "Watches", "Rings", "Sunglasses"],
  "Services": ["Delivery", "Repairs", "Tutoring", "Cleaning", "Photography"],
  "Other": [],
};

export type CategorySelection = Record<string, string[]>;

interface CategoryPickerProps {
  value: CategorySelection;
  onChange: (val: CategorySelection) => void;
}

export function CategoryPicker({ value, onChange }: CategoryPickerProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggleExpand = (cat: string) =>
    setExpanded((prev) => ({ ...prev, [cat]: !prev[cat] }));

  const isCatSelected = (cat: string) => cat in value;

  const toggleCategory = (cat: string) => {
    const next = { ...value };
    if (isCatSelected(cat)) {
      delete next[cat];
    } else {
      next[cat] = [];
    }
    onChange(next);
  };

  const toggleSub = (cat: string, sub: string) => {
    const next = { ...value };
    if (!next[cat]) next[cat] = [];
    if (next[cat].includes(sub)) {
      next[cat] = next[cat].filter((s) => s !== sub);
    } else {
      next[cat] = [...next[cat], sub];
    }
    onChange(next);
  };

  return (
    <div className="space-y-1 max-h-64 overflow-y-auto rounded-md border p-2">
      {Object.entries(CATEGORY_DATA).map(([cat, subs]) => (
        <div key={cat}>
          <div className="flex items-center gap-2 py-1.5 px-1 rounded hover:bg-accent/50 cursor-pointer">
            {subs.length > 0 && (
              <button
                type="button"
                onClick={() => toggleExpand(cat)}
                className="p-0.5 text-muted-foreground"
              >
                {expanded[cat] ? (
                  <ChevronDown className="h-3.5 w-3.5" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5" />
                )}
              </button>
            )}
            {subs.length === 0 && <span className="w-[18px]" />}
            <Checkbox
              id={`cat-${cat}`}
              checked={isCatSelected(cat)}
              onCheckedChange={() => toggleCategory(cat)}
            />
            <Label htmlFor={`cat-${cat}`} className="cursor-pointer text-sm font-medium">
              {cat}
            </Label>
          </div>
          {expanded[cat] && subs.length > 0 && isCatSelected(cat) && (
            <div className="ml-9 space-y-1 pb-1">
              {subs.map((sub) => (
                <div key={sub} className="flex items-center gap-2 py-0.5">
                  <Checkbox
                    id={`sub-${cat}-${sub}`}
                    checked={value[cat]?.includes(sub) ?? false}
                    onCheckedChange={() => toggleSub(cat, sub)}
                  />
                  <Label htmlFor={`sub-${cat}-${sub}`} className="cursor-pointer text-xs">
                    {sub}
                  </Label>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/** Serialize for DB storage */
export function serializeCategories(sel: CategorySelection): string {
  return JSON.stringify(sel);
}

/** Deserialize from DB */
export function deserializeCategories(raw: string | null): CategorySelection {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === "object" && !Array.isArray(parsed)) return parsed;
    // Legacy: single string category
    if (typeof parsed === "string") return { [parsed]: [] };
  } catch {
    // Legacy: plain string
    if (raw) return { [raw]: [] };
  }
  return {};
}

/** Human-readable summary */
export function categoriesToDisplay(raw: string | null): string[] {
  const sel = deserializeCategories(raw);
  const tags: string[] = [];
  for (const [cat, subs] of Object.entries(sel)) {
    if (subs.length === 0) {
      tags.push(cat);
    } else {
      subs.forEach((s) => tags.push(s));
    }
  }
  return tags;
}
