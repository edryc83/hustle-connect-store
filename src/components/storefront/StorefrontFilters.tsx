import { useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ATTRIBUTE_LIBRARY as ATTRIBUTE_TYPES } from "@/lib/attributeLibrary";

export interface FilterState {
  search: string;
  category: string;       // product_type value or ""
  condition: string;       // "new" | "used" | "refurbished" | ""
  priceRange: [number, number] | null; // null = any
}

const PRICE_RANGES: { label: string; range: [number, number] | null }[] = [
  { label: "Any price", range: null },
  { label: "Under 50k", range: [0, 50_000] },
  { label: "50k – 200k", range: [50_000, 200_000] },
  { label: "200k – 500k", range: [200_000, 500_000] },
  { label: "500k+", range: [500_000, Infinity] },
];

const CONDITIONS = [
  { value: "", label: "Any" },
  { value: "new", label: "New" },
  { value: "used", label: "Used" },
  { value: "refurbished", label: "Refurbished" },
];

interface StorefrontFiltersProps {
  filters: FilterState;
  onChange: (f: FilterState) => void;
  totalCount: number;
  filteredCount: number;
  products?: any[]; // pass store products to derive available categories
}

export function StorefrontFilters({ filters, onChange, totalCount, filteredCount, products = [] }: StorefrontFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);

  const hasActiveFilters = filters.category || filters.condition || filters.priceRange;
  const activeCount = [filters.category, filters.condition, filters.priceRange].filter(Boolean).length;

  const update = (patch: Partial<FilterState>) => onChange({ ...filters, ...patch });

  const clearAll = () => onChange({ search: "", category: "", condition: "", priceRange: null });

  // Derive categories from actual product listing_type values
  const categorySet = new Map<string, number>();
  products.forEach((p) => {
    const type = p.listing_type || "product";
    categorySet.set(type, (categorySet.get(type) || 0) + 1);
  });
  const CATEGORY_META: Record<string, { label: string; emoji: string }> = {
    product: { label: "Products", emoji: "📦" },
    service: { label: "Services", emoji: "🔧" },
  };
  const categories = [
    { value: "", label: "All", emoji: "" },
    ...Array.from(categorySet.entries()).map(([value, count]) => ({
      value,
      label: `${CATEGORY_META[value]?.label || value} (${count})`,
      emoji: CATEGORY_META[value]?.emoji || "📋",
    })),
  ];

  // Only show conditions that exist in this store's products
  const storeConditions = new Set(
    products
      .map((p) => p.condition || (p.attributes as Record<string, any> | null)?.condition)
      .filter(Boolean)
      .map((c: string) => c.toLowerCase())
  );
  const availableConditions = CONDITIONS.filter((c) => !c.value || storeConditions.has(c.value));

  return (
    <div className="space-y-3">
      {/* Search bar + filter toggle */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products…"
            value={filters.search}
            onChange={(e) => update({ search: e.target.value })}
            className="pl-9 h-10 rounded-full border-border/60 bg-card"
          />
          {filters.search && (
            <button
              onClick={() => update({ search: "" })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`shrink-0 h-10 px-3 rounded-full border flex items-center gap-1.5 text-sm font-medium transition-colors ${
            hasActiveFilters
              ? "border-primary bg-primary/10 text-primary"
              : "border-border/60 bg-card text-muted-foreground hover:border-primary/40"
          }`}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filters
          {activeCount > 0 && (
            <span className="ml-0.5 h-5 w-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      {/* Expandable filter panel */}
      {showFilters && (
        <div className="rounded-2xl border border-border/60 bg-card p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Category pills */}
          {categories.length > 1 && (
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Category</p>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => update({ category: filters.category === cat.value ? "" : cat.value })}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    filters.category === cat.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  {cat.emoji ? `${cat.emoji} ` : ""}{cat.label}
                </button>
              ))}
            </div>
          </div>
          )}

          {/* Price range pills */}
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Price range</p>
            <div className="flex flex-wrap gap-1.5">
              {PRICE_RANGES.map((pr, i) => {
                const isActive = filters.priceRange === pr.range ||
                  (filters.priceRange && pr.range && filters.priceRange[0] === pr.range[0] && filters.priceRange[1] === pr.range[1]);
                return (
                  <button
                    key={i}
                    onClick={() => update({ priceRange: isActive ? null : pr.range })}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                      isActive
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    {pr.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Condition pills — only if store has multiple conditions */}
          {availableConditions.length > 1 && (
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Condition</p>
            <div className="flex flex-wrap gap-1.5">
              {availableConditions.map((c) => (
                <button
                  key={c.value}
                  onClick={() => update({ condition: filters.condition === c.value ? "" : c.value })}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    filters.condition === c.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
          )}

          {/* Clear + result count */}
          <div className="flex items-center justify-between pt-1">
            {hasActiveFilters ? (
              <button onClick={clearAll} className="text-xs text-primary font-medium hover:underline">
                Clear all filters
              </button>
            ) : <span />}
            <p className="text-xs text-muted-foreground">
              {filteredCount === totalCount ? `${totalCount} products` : `${filteredCount} of ${totalCount} products`}
            </p>
          </div>
        </div>
      )}

      {/* Active filter chips (shown when panel is closed) */}
      {!showFilters && hasActiveFilters && (
        <div className="flex flex-wrap gap-1.5 items-center">
          {filters.category && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/30 px-2.5 py-1 text-xs font-medium text-primary">
              {filters.category}
              <button onClick={() => update({ category: "" })} className="hover:text-primary/70"><X className="h-3 w-3" /></button>
            </span>
          )}
          {filters.priceRange && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/30 px-2.5 py-1 text-xs font-medium text-primary">
              {PRICE_RANGES.find((pr) => pr.range && filters.priceRange && pr.range[0] === filters.priceRange[0] && pr.range[1] === filters.priceRange[1])?.label}
              <button onClick={() => update({ priceRange: null })} className="hover:text-primary/70"><X className="h-3 w-3" /></button>
            </span>
          )}
          {filters.condition && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/30 px-2.5 py-1 text-xs font-medium text-primary">
              {CONDITIONS.find((c) => c.value === filters.condition)?.label}
              <button onClick={() => update({ condition: "" })} className="hover:text-primary/70"><X className="h-3 w-3" /></button>
            </span>
          )}
          <button onClick={clearAll} className="text-[10px] text-muted-foreground hover:text-foreground">
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}

/** Apply filters to a product list */
export function applyFilters(products: any[], filters: FilterState): any[] {
  let result = products;

  // Search
  if (filters.search.trim()) {
    const q = filters.search.toLowerCase();
    result = result.filter((p) =>
      p.name?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q)
    );
  }

  // Category (from attributes.product_type)
  if (filters.category) {
    result = result.filter((p) => {
      const type = p.listing_type || "product";
      if (type === filters.category) return true;
      // Fallback: check attributes.product_type
      const attrs = p.attributes as Record<string, any> | null;
      return attrs?.product_type === filters.category;
    });
  }

  // Condition
  if (filters.condition) {
    result = result.filter((p) => {
      // Check product-level condition
      if (p.condition === filters.condition) return true;
      // Also check attributes condition
      const attrs = p.attributes as Record<string, any> | null;
      if (attrs?.condition) {
        return attrs.condition.toLowerCase().includes(filters.condition);
      }
      return false;
    });
  }

  // Price range
  if (filters.priceRange) {
    const [min, max] = filters.priceRange;
    result = result.filter((p) => {
      const price = Number(p.discount_price ?? p.price);
      return price >= min && price <= max;
    });
  }

  return result;
}
