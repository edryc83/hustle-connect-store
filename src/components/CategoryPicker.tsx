import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ChevronDown, ChevronRight } from "lucide-react";

export const PRODUCT_CATEGORY_DATA: Record<string, string[]> = {
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
  "Other": [],
};

export const SERVICE_CATEGORY_DATA: Record<string, string[]> = {
  "Delivery & Logistics": ["Dispatch Riders", "Courier Services", "Food Delivery", "Moving Services"],
  "Repairs & Maintenance": ["Phone Repair", "Electronics Repair", "Plumbing", "Electrical", "Appliance Repair"],
  "Beauty & Grooming": ["Hair Styling", "Barbing", "Makeup Artist", "Nail Technician", "Spa & Massage"],
  "Cleaning Services": ["Home Cleaning", "Office Cleaning", "Laundry", "Carpet Cleaning", "Fumigation"],
  "Photography & Videography": ["Events", "Portraits", "Product Photography", "Drone", "Video Editing"],
  "Catering & Events": ["Event Catering", "Small Chops", "Cake Making", "Event Planning", "Decoration"],
  "Education & Tutoring": ["Academic Tutoring", "Music Lessons", "Language Classes", "Test Prep", "Online Courses"],
  "Design & Creative": ["Graphic Design", "Web Design", "Interior Design", "Fashion Design", "Branding"],
  "IT & Tech Services": ["Web Development", "App Development", "IT Support", "Social Media Management", "SEO"],
  "Health & Fitness": ["Personal Training", "Yoga", "Nutrition Coaching", "Physiotherapy"],
  "Tailoring & Fashion": ["Custom Clothing", "Alterations", "Traditional Wear", "Uniforms"],
  "Auto Services": ["Car Wash", "Mechanic", "Auto Electrician", "Panel Beating", "Towing"],
  "Legal & Professional": ["Legal Advice", "Accounting", "Consulting", "Tax Filing"],
  "Real Estate": ["Property Management", "House Hunting", "Valuation", "Short-let Apartments"],
  "Other": [],
};

export const EXPERIENCE_CATEGORY_DATA: Record<string, string[]> = {
  "Trips & Travel": ["Local Trips", "Weekend Getaways", "Road Trips", "Guided Tours", "Safari", "Beach Trips", "Camping"],
  "Birthday Experiences": ["Surprise Packages", "Party Planning", "Themed Birthdays", "Outdoor Birthdays", "Kids' Parties"],
  "Dining Experiences": ["Private Chef", "Food Tasting", "Rooftop Dining", "Picnic Setups", "Suya Nights", "Brunch"],
  "Adventure & Outdoor": ["Hiking", "Zip-lining", "Paintball", "Go-Karting", "Horse Riding", "Boat Cruises", "Skydiving"],
  "Wellness & Spa": ["Spa Days", "Couples' Retreat", "Yoga Retreat", "Meditation", "Hot Springs"],
  "Cultural Experiences": ["Art Exhibitions", "Museum Tours", "Live Music", "Theatre", "Cultural Festivals", "Poetry Nights"],
  "Workshops & Classes": ["Cooking Classes", "Art Workshops", "Dance Classes", "Pottery", "Photography Walks", "DIY Crafts"],
  "Nightlife & Entertainment": ["Club Events", "Karaoke Nights", "Comedy Shows", "Game Nights", "Pool Parties", "Concerts"],
  "Romantic Experiences": ["Date Night Packages", "Couples' Picnic", "Sunset Cruises", "Proposal Planning", "Anniversary Specials"],
  "Kids & Family": ["Theme Parks", "Kids' Playgrounds", "Family Game Day", "Zoo Visits", "Science Fairs"],
  "Other": [],
};

export const ALL_CATEGORY_DATA: Record<string, string[]> = {
  ...PRODUCT_CATEGORY_DATA,
  ...SERVICE_CATEGORY_DATA,
  ...EXPERIENCE_CATEGORY_DATA,
};

export const CATEGORY_DATA = ALL_CATEGORY_DATA;

export type CategorySelection = Record<string, string[]>;

interface CategoryPickerProps {
  value: CategorySelection;
  onChange: (val: CategorySelection) => void;
  filter?: "products" | "services" | "experiences" | "all";
}

export function CategoryPicker({ value, onChange, filter = "all" }: CategoryPickerProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const categorySource = filter === "products" ? PRODUCT_CATEGORY_DATA
    : filter === "services" ? SERVICE_CATEGORY_DATA
    : filter === "experiences" ? EXPERIENCE_CATEGORY_DATA
    : CATEGORY_DATA;

  const toggleExpand = (cat: string) =>
    setExpanded((prev) => ({ ...prev, [cat]: !prev[cat] }));

  const isCatSelected = (cat: string) => cat in value;

  const toggleCategory = (cat: string) => {
    const next = { ...value };
    if (isCatSelected(cat)) {
      delete next[cat];
      setExpanded((prev) => ({ ...prev, [cat]: false }));
    } else {
      next[cat] = [];
      setExpanded((prev) => ({ ...prev, [cat]: true }));
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
      {Object.entries(categorySource).map(([cat, subs]) => (
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
