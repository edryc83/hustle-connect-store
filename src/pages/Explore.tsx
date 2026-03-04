import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Store, MapPin, X } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;

const CATEGORIES = [
  { label: "All", icon: "🔥" },
  { label: "Food & Drinks", icon: "🍲" },
  { label: "Fashion & Clothes", icon: "👗" },
  { label: "Beauty & Skincare", icon: "✨" },
  { label: "Phones & Electronics", icon: "📱" },
  { label: "Home & Decor", icon: "🏠" },
  { label: "Plants & Garden", icon: "🌿" },
  { label: "Other", icon: "📦" },
];

const CITIES = ["All", "Kampala", "Nairobi", "Lagos", "Accra", "Dar es Salaam", "Kigali"];

const Explore = () => {
  const [stores, setStores] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCity, setSelectedCity] = useState("All");

  useEffect(() => {
    const fetchStores = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .not("store_name", "is", null)
        .not("store_slug", "is", null)
        .order("last_active_at", { ascending: false });
      setStores(data ?? []);
      setLoading(false);
    };
    fetchStores();
  }, []);

  const filtered = useMemo(() => {
    return stores.filter((s) => {
      const matchesSearch =
        !search.trim() ||
        s.store_name?.toLowerCase().includes(search.toLowerCase()) ||
        s.category?.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === "All" || s.category === selectedCategory;
      const matchesCity = selectedCity === "All" || s.city === selectedCity;
      return matchesSearch && matchesCategory && matchesCity;
    });
  }, [stores, search, selectedCategory, selectedCity]);

  const hasFilters = selectedCategory !== "All" || selectedCity !== "All" || search.trim();

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
            <div className="relative mx-auto max-w-md">
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
          </div>
        </section>

        {/* Filters */}
        <section className="border-b">
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
            {/* Cities */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {CITIES.map((city) => (
                <button
                  key={city}
                  onClick={() => setSelectedCity(city)}
                  className={`flex items-center gap-1 whitespace-nowrap rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                    selectedCity === city
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/30"
                  }`}
                >
                  {city !== "All" && <MapPin className="h-3 w-3" />} {city}
                </button>
              ))}
            </div>
          </div>
        </section>

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
                  onClick={() => { setSearch(""); setSelectedCategory("All"); setSelectedCity("All"); }}
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
                {filtered.map((store) => (
                  <Link key={store.id} to={`/${store.store_slug}`}>
                    <Card className="group overflow-hidden transition-shadow hover:shadow-md h-full">
                      <CardContent className="flex flex-col items-center text-center p-5 gap-3">
                        {store.profile_picture_url ? (
                          <img
                            src={store.profile_picture_url}
                            alt={store.store_name ?? "Store"}
                            className="h-16 w-16 rounded-full object-cover border-2 border-primary/10"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                            <Store className="h-6 w-6 text-primary" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-sm truncate">{store.store_name}</p>
                          {store.city && (
                            <p className="flex items-center justify-center gap-1 text-xs text-muted-foreground mt-0.5">
                              <MapPin className="h-3 w-3" /> {store.city}
                            </p>
                          )}
                          {store.category && (
                            <span className="mt-1.5 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                              {store.category}
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
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
