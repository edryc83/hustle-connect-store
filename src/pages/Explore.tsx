import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, X, SlidersHorizontal, Store, Bookmark } from "lucide-react";
import AfristallLogo from "@/components/AfristallLogo";
import { LazyImage } from "@/components/ui/lazy-image";
import { categoriesToDisplay } from "@/components/CategoryPicker";
import { PRODUCT_CATEGORY_DATA, SERVICE_CATEGORY_DATA } from "@/components/CategoryPicker";

type StoreProfile = {
  id: string;
  store_name: string | null;
  store_slug: string | null;
  profile_picture_url: string | null;
  cover_photo_url: string | null;
  category: string | null;
  country: string | null;
  district: string | null;
  city: string | null;
  business_type: string | null;
  first_product_image?: string | null;
};

type TabType = "stores" | "services";

const STORE_CATEGORIES = [
  { label: "All", icon: "🔥" },
  ...Object.keys(PRODUCT_CATEGORY_DATA).map((k) => ({ label: k, icon: "" })),
];

const SERVICE_CATEGORIES = [
  { label: "All", icon: "🔥" },
  ...Object.keys(SERVICE_CATEGORY_DATA).map((k) => ({ label: k, icon: "" })),
];

function getLocationLabel(store: StoreProfile) {
  const parts = [store.district, store.city].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : null;
}

function getBusinessLabel(store: StoreProfile): string | null {
  const tags = categoriesToDisplay(store.category);
  return tags.length > 0 ? tags[0] : null;
}

const Explore = () => {
  const [stores, setStores] = useState<StoreProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [detectedCountry, setDetectedCountry] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("stores");

  useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then((r) => r.json())
      .then((data) => {
        if (data?.country_name) setDetectedCountry(data.country_name);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const fetchStores = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, store_name, store_slug, profile_picture_url, cover_photo_url, category, country, district, city, business_type")
        .not("store_name", "is", null)
        .not("store_slug", "is", null)
        .order("last_active_at", { ascending: false });

      const storeList = (data as StoreProfile[]) ?? [];

      // For stores missing profile pic or cover, fetch their first product image
      const needsImage = storeList.filter((s) => !s.profile_picture_url || !s.cover_photo_url);
      if (needsImage.length > 0) {
        const ids = needsImage.map((s) => s.id);
        const { data: products } = await supabase
          .from("products")
          .select("user_id, image_url")
          .in("user_id", ids)
          .order("created_at", { ascending: false });

        if (products) {
          const firstImg: Record<string, string> = {};
          products.forEach((p: any) => {
            if (!firstImg[p.user_id] && p.image_url) firstImg[p.user_id] = p.image_url;
          });

          // Also check product_images table
          const stillMissing = ids.filter((id) => !firstImg[id]);
          if (stillMissing.length > 0) {
            const { data: prodImgs } = await supabase
              .from("products")
              .select("user_id, id")
              .in("user_id", stillMissing);
            if (prodImgs && prodImgs.length > 0) {
              const prodIds = prodImgs.map((p: any) => p.id);
              const { data: imgs } = await supabase
                .from("product_images")
                .select("product_id, image_url")
                .in("product_id", prodIds)
                .order("position", { ascending: true });
              if (imgs) {
                const prodToUser: Record<string, string> = {};
                prodImgs.forEach((p: any) => { prodToUser[p.id] = p.user_id; });
                imgs.forEach((img: any) => {
                  const userId = prodToUser[img.product_id];
                  if (userId && !firstImg[userId]) firstImg[userId] = img.image_url;
                });
              }
            }
          }

          storeList.forEach((s) => {
            if (firstImg[s.id]) s.first_product_image = firstImg[s.id];
          });
        }
      }

      setStores(storeList);
      setLoading(false);
    };
    fetchStores();
  }, []);

  // Reset category when switching tabs
  useEffect(() => {
    setSelectedCategory("All");
  }, [activeTab]);

  const countryStores = useMemo(() => {
    if (!detectedCountry) return stores;
    const local = stores.filter((s) => s.country?.toLowerCase() === detectedCountry.toLowerCase());
    return local.length > 0 ? local : stores;
  }, [stores, detectedCountry]);

  // Filter by tab (stores vs services)
  const tabStores = useMemo(() => {
    if (activeTab === "services") {
      return countryStores.filter((s) => s.business_type === "service");
    }
    // "stores" tab shows products + both
    return countryStores.filter((s) => s.business_type !== "service");
  }, [countryStores, activeTab]);

  const categories = activeTab === "services" ? SERVICE_CATEGORIES : STORE_CATEGORIES;

  const districtOptions = useMemo(() => {
    const dists = new Set<string>();
    tabStores.forEach((s) => {
      if (s.district) dists.add(s.district);
      else if (s.city) dists.add(s.city);
    });
    return Array.from(dists).sort();
  }, [tabStores]);

  const filtered = useMemo(() => {
    return tabStores.filter((s) => {
      const q = search.trim().toLowerCase().replace(/^@/, "");
      const matchesSearch =
        !q ||
        s.store_name?.toLowerCase().includes(q) ||
        s.store_slug?.toLowerCase().includes(q) ||
        s.category?.toLowerCase().includes(q) ||
        s.city?.toLowerCase().includes(q) ||
        s.district?.toLowerCase().includes(q);
      const matchesCategory =
        selectedCategory === "All" ||
        (s.category && s.category.toLowerCase().includes(selectedCategory.toLowerCase()));
      const matchesLocation =
        selectedLocation === "All" ||
        s.city === selectedLocation ||
        s.district === selectedLocation;
      return matchesSearch && matchesCategory && matchesLocation;
    });
  }, [tabStores, search, selectedCategory, selectedLocation]);

  const activeFilterCount = (selectedCategory !== "All" ? 1 : 0) + (selectedLocation !== "All" ? 1 : 0);
  const hasFilters = activeFilterCount > 0 || search.trim() !== "";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        {/* Search bar */}
        <section className="border-b border-border/50">
          <div className="mx-auto max-w-2xl px-4 pt-6 pb-4">
            <div className="relative flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={activeTab === "services" ? "Search services…" : "Search stores…"}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 h-11 rounded-xl"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`h-11 w-11 shrink-0 rounded-xl border flex items-center justify-center transition-colors relative ${
                  showFilters || activeFilterCount > 0
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/30"
                }`}
              >
                <SlidersHorizontal className="h-4 w-4" />
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* Filters - collapsible */}
        {showFilters && (
          <section className="border-b animate-in slide-in-from-top-2 duration-200">
            <div className="mx-auto max-w-2xl px-4 py-4 space-y-4">
              {/* District dropdown */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">District / Region</label>
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger className="h-10 rounded-xl">
                    <SelectValue placeholder="All districts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All districts</SelectItem>
                    {districtOptions.map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Category chips */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Category</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.label}
                      onClick={() => setSelectedCategory(cat.label)}
                      className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                        selectedCategory === cat.label
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/30"
                      }`}
                    >
                      {cat.icon ? `${cat.icon} ` : ""}{cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear filters */}
              {hasFilters && (
                <button
                  onClick={() => { setSelectedCategory("All"); setSelectedLocation("All"); setSearch(""); }}
                  className="text-xs text-primary font-medium hover:underline"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </section>
        )}

        {/* Top Stores Near You */}
        <section className="mx-auto max-w-2xl sm:max-w-5xl px-4 py-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-foreground">
              {activeTab === "services" ? "Top Services Near You" : "Top Stores Near You"}
            </h2>
            <span className="text-xs text-muted-foreground">
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Stores / Services toggle */}
          <div className="flex gap-2 mb-5">
            <button
              onClick={() => setActiveTab("stores")}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                activeTab === "stores"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              All Stores
            </button>
            <button
              onClick={() => setActiveTab("services")}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                activeTab === "services"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              Services
            </button>
          </div>

          {/* Active filter summary */}
          {hasFilters && !showFilters && (
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedCategory !== "All" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  {selectedCategory}
                  <button onClick={() => setSelectedCategory("All")}><X className="h-3 w-3" /></button>
                </span>
              )}
              {selectedLocation !== "All" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  <MapPin className="h-3 w-3" /> {selectedLocation}
                  <button onClick={() => setSelectedLocation("All")}><X className="h-3 w-3" /></button>
                </span>
              )}
            </div>
          )}

          {/* Results */}
          {loading ? (
            <div className="py-16 text-center animate-pulse text-muted-foreground">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <Store className="h-12 w-12 text-muted-foreground/40" />
              <p className="text-lg font-medium">No {activeTab} found</p>
              <p className="text-sm text-muted-foreground">
                {hasFilters ? "Try adjusting your filters" : "Be the first to create one!"}
              </p>
              {hasFilters && (
                <button
                  onClick={() => { setSearch(""); setSelectedCategory("All"); setSelectedLocation("All"); }}
                  className="text-sm text-primary font-medium hover:underline"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <>
            <div className="space-y-3 sm:hidden">
              {filtered.map((store) => {
                const businessLabel = getBusinessLabel(store);
                const location = getLocationLabel(store);
                const avatarUrl = store.profile_picture_url || store.first_product_image;
                return (
                  <Link key={store.id} to={`/${store.store_slug}`} className="block">
                    <div className="flex items-center gap-3 rounded-2xl bg-card p-3.5 border border-border/50 hover:border-primary/20 hover:shadow-sm transition-all">
                      <div className="ig-ring ig-ring-sm shrink-0">
                        {avatarUrl ? (
                          <LazyImage src={avatarUrl} alt={store.store_name ?? "Store"} wrapperClassName="h-12 w-12 rounded-full" className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary border-2 border-background">
                            <img src="/logo-glow.png" alt="Afristall" className="h-8 w-8 rounded-full object-cover" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        {businessLabel && (
                          <span className="inline-block rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary uppercase tracking-wide mb-0.5">{businessLabel}</span>
                        )}
                        <h3 className="font-semibold text-sm text-foreground truncate">{store.store_name}</h3>
                        {location && (
                          <p className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5 truncate">
                            <MapPin className="h-3 w-3 shrink-0" /> {location}
                          </p>
                        )}
                      </div>
                      <Bookmark className="h-5 w-5 text-muted-foreground/40 shrink-0" />
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Desktop card grid */}
            <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((store) => {
                const businessLabel = getBusinessLabel(store);
                const location = getLocationLabel(store);
                const avatarUrl = store.profile_picture_url || store.first_product_image;
                const coverUrl = store.cover_photo_url || store.first_product_image || "/default-cover.png";
                return (
                  <Link key={store.id} to={`/${store.store_slug}`} className="block group">
                    <div className="rounded-2xl bg-card border border-border/50 hover:border-primary/20 hover:shadow-md transition-all overflow-hidden h-full">
                      {/* Cover / avatar area */}
                      <div className="relative h-28 bg-secondary/50">
                        <LazyImage src={coverUrl} alt="" wrapperClassName="h-full w-full" className="h-full w-full object-cover" />
                        <div className="absolute -bottom-6 left-4 ig-ring ig-ring-sm">
                          {avatarUrl ? (
                            <LazyImage src={avatarUrl} alt={store.store_name ?? "Store"} wrapperClassName="h-12 w-12 rounded-full" className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-card border-2 border-card">
                              <img src="/logo-glow.png" alt="Afristall" className="h-8 w-8 rounded-full object-cover" />
                            </div>
                          )}
                        </div>
                      </div>
                      {/* Info */}
                      <div className="pt-8 px-4 pb-4">
                        {businessLabel && (
                          <span className="inline-block rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary uppercase tracking-wide mb-1">{businessLabel}</span>
                        )}
                        <h3 className="font-semibold text-sm text-foreground truncate">{store.store_name}</h3>
                        {store.store_slug && (
                          <p className="text-xs text-muted-foreground mt-0.5">@{store.store_slug}</p>
                        )}
                        {location && (
                          <p className="flex items-center gap-1 text-xs text-muted-foreground mt-1.5 truncate">
                            <MapPin className="h-3 w-3 shrink-0" /> {location}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
            </>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Explore;
