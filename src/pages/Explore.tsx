import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Search, Store, MapPin, X, SlidersHorizontal } from "lucide-react";
import AfristallLogo from "@/components/AfristallLogo";
import { categoriesToDisplay } from "@/components/CategoryPicker";

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
};

const CATEGORIES = [
  { label: "All", icon: "🔥" },
  { label: "Food & Drinks", icon: "🍲" },
  { label: "Fashion & Clothes", icon: "👗" },
  { label: "Beauty & Skincare", icon: "✨" },
  { label: "Phones & Electronics", icon: "📱" },
  { label: "Home & Decor", icon: "🏠" },
  { label: "Catering & Events", icon: "🎉" },
  { label: "Plants & Garden", icon: "🌿" },
  { label: "Other", icon: "📦" },
];



function getLocationLabel(store: StoreProfile) {
  const parts = [store.city, store.district].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : null;
}

const Explore = () => {
  const [stores, setStores] = useState<StoreProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [detectedCountry, setDetectedCountry] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [showFilters, setShowFilters] = useState(false);

  // Auto-detect country
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
        .select("id, store_name, store_slug, profile_picture_url, cover_photo_url, category, country, district, city")
        .not("store_name", "is", null)
        .not("store_slug", "is", null)
        .order("last_active_at", { ascending: false });
      setStores((data as any) ?? []);
      setLoading(false);
    };
    fetchStores();
  }, []);

  // Filter stores by detected country first
  const countryStores = useMemo(() => {
    if (!detectedCountry) return stores;
    const local = stores.filter((s) => s.country?.toLowerCase() === detectedCountry.toLowerCase());
    return local.length > 0 ? local : stores;
  }, [stores, detectedCountry]);

  const locationOptions = useMemo(() => {
    const locs = new Set<string>();
    countryStores.forEach((s) => {
      if (s.city) locs.add(s.city);
      if (s.district) locs.add(s.district);
    });
    return ["All", ...Array.from(locs).sort()];
  }, [countryStores]);

  const filtered = useMemo(() => {
    return countryStores.filter((s) => {
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
  }, [countryStores, search, selectedCategory, selectedLocation]);

  const activeFilterCount = (selectedCategory !== "All" ? 1 : 0) + (selectedLocation !== "All" ? 1 : 0);
  const hasFilters = activeFilterCount > 0 || search.trim() !== "";

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-b from-primary/5 to-background border-b">
          <div className="mx-auto max-w-5xl px-4 py-10 sm:py-14 text-center">
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">
              Explore <span className="text-primary">Stores</span>
            </h1>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Discover African sellers and shop via WhatsApp
            </p>
            <div className="relative mx-auto max-w-md flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search stores…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 h-11"
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
                className={`h-11 w-11 shrink-0 rounded-xl border flex items-center justify-center transition-colors ${
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
            <div className="mx-auto max-w-5xl px-4 py-4 space-y-3">
              {/* Categories */}
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.label}
                    onClick={() => setSelectedCategory(cat.label)}
                    className={`flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                      selectedCategory === cat.label
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/30"
                    }`}
                  >
                    <span>{cat.icon}</span> {cat.label}
                  </button>
                ))}
              </div>
              {/* City / District */}
              {locationOptions.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                  {locationOptions.map((loc) => (
                    <button
                      key={loc}
                      onClick={() => setSelectedLocation(loc)}
                      className={`flex items-center gap-1 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                        selectedLocation === loc
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/30"
                      }`}
                    >
                      {loc !== "All" && <MapPin className="h-2.5 w-2.5" />} {loc}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Results */}
        <section className="mx-auto max-w-5xl px-4 py-6">
          {loading ? (
            <div className="py-16 text-center animate-pulse text-muted-foreground">Loading stores…</div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <Store className="h-12 w-12 text-muted-foreground/40" />
              <p className="text-lg font-medium">No stores found</p>
              <p className="text-sm text-muted-foreground">
                {hasFilters ? "Try adjusting your filters" : "Be the first to create a store!"}
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
              <p className="mb-4 text-sm text-muted-foreground">
                {filtered.length} store{filtered.length !== 1 ? "s" : ""}
              </p>
              <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
                {filtered.map((store) => {
                  const tags = categoriesToDisplay(store.category);
                  const location = getLocationLabel(store);
                  return (
                    <Link key={store.id} to={`/${store.store_slug}`}>
                      <div className="group rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl overflow-hidden transition-all hover:shadow-lg hover:border-primary/20 h-full">
                        {/* Cover Photo */}
                        <div className="h-24 bg-gradient-to-br from-primary/10 to-primary/5 overflow-hidden">
                          {store.cover_photo_url ? (
                            <img
                              src={store.cover_photo_url}
                              alt=""
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary/15 via-primary/5 to-accent/10" />
                          )}
                        </div>

                        {/* Profile pic overlapping cover */}
                        <div className="flex flex-col items-center -mt-8 px-3 pb-4">
                          {store.profile_picture_url ? (
                            <img
                              src={store.profile_picture_url}
                              alt={store.store_name ?? "Store"}
                              className="h-14 w-14 rounded-full object-cover border-3 border-background shadow-md"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-card border-3 border-background shadow-md">
                              <AfristallLogo className="h-6 w-6" />
                            </div>
                          )}

                          <p className="font-semibold text-sm mt-2 truncate max-w-full">{store.store_name}</p>
                          {store.store_slug && (
                            <p className="text-[11px] text-muted-foreground">@{store.store_slug}</p>
                          )}

                          {location && (
                            <p className="flex items-center gap-1 text-[11px] text-muted-foreground mt-1">
                              <MapPin className="h-3 w-3 shrink-0" /> {location}
                            </p>
                          )}

                          {/* Category Tags */}
                          {tags.length > 0 && (
                            <div className="flex flex-wrap items-center justify-center gap-1 mt-2">
                              {tags.slice(0, 2).map((tag) => (
                                <span
                                  key={tag}
                                  className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary"
                                >
                                  {tag}
                                </span>
                              ))}
                              {tags.length > 2 && (
                                <span className="text-[10px] text-muted-foreground">+{tags.length - 2}</span>
                              )}
                            </div>
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
