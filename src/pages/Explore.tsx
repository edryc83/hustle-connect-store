import { useEffect, useState, useMemo } from "react";
import whatsappIcon from "@/assets/whatsapp-icon.png";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Search, MapPin, X, SlidersHorizontal, Store, ArrowLeft,
  ShoppingBag, Wrench, Sparkles,
  Shirt, Smartphone, Home, UtensilsCrossed, Sparkle, Sofa,
  Heart, BookOpen, Palette, Dumbbell, Tractor, Car, Baby,
  Phone, Gem, Hammer, PawPrint,
  Truck, Settings, Scissors, SprayCan, Camera, ChefHat,
  GraduationCap, PenTool, Code, PersonStanding, Ruler, Wrench as WrenchIcon, Scale, Building2,
  Plane, PartyPopper, Wine, Mountain, Flower2, Theater, BookOpenCheck, Music, HeartHandshake, Users,
} from "lucide-react";
import { LazyImage } from "@/components/ui/lazy-image";
import { categoriesToDisplay } from "@/components/CategoryPicker";
import { PRODUCT_CATEGORY_DATA, SERVICE_CATEGORY_DATA, EXPERIENCE_CATEGORY_DATA } from "@/components/CategoryPicker";

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
  whatsapp_number: string | null;
  business_type: string | null;
  first_product_image?: string | null;
};

type TabType = "products" | "services" | "experiences";
type Step = "type" | "category" | "subcategory" | "stores";

const TAB_CATEGORY_MAP: Record<TabType, Record<string, string[]>> = {
  products: PRODUCT_CATEGORY_DATA,
  services: SERVICE_CATEGORY_DATA,
  experiences: EXPERIENCE_CATEGORY_DATA,
};

const TAB_CARDS: { key: TabType; label: string; emoji: string; description: string; icon: typeof ShoppingBag }[] = [
  { key: "products", label: "Products", emoji: "📦", description: "Browse items from stores near you", icon: ShoppingBag },
  { key: "services", label: "Services", emoji: "🔧", description: "Find service providers & freelancers", icon: Wrench },
  { key: "experiences", label: "Experiences", emoji: "✨", description: "Discover trips, events & activities", icon: Sparkles },
];

// Icons for product categories
const CATEGORY_ICONS: Record<string, typeof ShoppingBag> = {
  "Fashion & Clothing": Shirt,
  "Electronics & Gadgets": Smartphone,
  "Home Appliances": Home,
  "Food & Beverages": UtensilsCrossed,
  "Beauty & Cosmetics": Sparkle,
  "Home & Living": Sofa,
  "Health & Wellness": Heart,
  "Books & Stationery": BookOpen,
  "Art & Crafts": Palette,
  "Sports & Fitness": Dumbbell,
  "Agriculture & Farm Produce": Tractor,
  "Auto & Motor Parts": Car,
  "Baby & Kids": Baby,
  "Phones & Accessories": Phone,
  "Jewelry & Accessories": Gem,
  "Building & Hardware": Hammer,
  "Pets & Animals": PawPrint,
  // Service categories
  "Delivery & Logistics": Truck,
  "Repairs & Maintenance": Settings,
  "Beauty & Grooming": Scissors,
  "Cleaning Services": SprayCan,
  "Photography & Videography": Camera,
  "Catering & Events": ChefHat,
  "Education & Tutoring": GraduationCap,
  "Design & Creative": PenTool,
  "IT & Tech Services": Code,
  "Health & Fitness": PersonStanding,
  "Tailoring & Fashion": Ruler,
  "Auto Services": WrenchIcon,
  "Legal & Professional": Scale,
  "Real Estate": Building2,
  // Experience categories
  "Trips & Travel": Plane,
  "Birthday Experiences": PartyPopper,
  "Dining Experiences": Wine,
  "Adventure & Outdoor": Mountain,
  "Wellness & Spa": Flower2,
  "Cultural Experiences": Theater,
  "Workshops & Classes": BookOpenCheck,
  "Nightlife & Entertainment": Music,
  "Romantic Experiences": HeartHandshake,
  "Kids & Family": Users,
};

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
  const [detectedCountry, setDetectedCountry] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [showFilters, setShowFilters] = useState(false);

  // Drill-down state
  const [activeTab, setActiveTab] = useState<TabType | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);

  // Determine current step
  const step: Step = !activeTab
    ? "type"
    : !selectedCategory
    ? "category"
    : selectedCategory && TAB_CATEGORY_MAP[activeTab]?.[selectedCategory]?.length > 0 && !selectedSubcategory
    ? "subcategory"
    : "stores";

  const handleBack = () => {
    if (step === "stores" && selectedSubcategory) {
      setSelectedSubcategory(null);
    } else if (step === "stores" && selectedCategory) {
      // Category with no subcategories — go back to categories
      setSelectedCategory(null);
    } else if (step === "subcategory") {
      setSelectedCategory(null);
    } else if (step === "category") {
      setActiveTab(null);
    }
  };

  const handleSelectCategory = (cat: string) => {
    setSelectedCategory(cat);
    const subs = activeTab ? TAB_CATEGORY_MAP[activeTab][cat] ?? [] : [];
    if (subs.length === 0) {
      // No subcategories — go straight to stores
      setSelectedSubcategory(null);
    }
  };

  const handleSelectSubcategory = (sub: string) => {
    setSelectedSubcategory(sub);
  };

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
        .select("id, store_name, store_slug, profile_picture_url, cover_photo_url, category, country, district, city, business_type, whatsapp_number")
        .not("store_name", "is", null)
        .not("store_slug", "is", null)
        .order("last_active_at", { ascending: false });

      const storeList = (data as StoreProfile[]) ?? [];

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

  const categoryData = activeTab ? TAB_CATEGORY_MAP[activeTab] : {};
  const categoryKeys = Object.keys(categoryData).filter((k) => k !== "Other");
  const subcategories = selectedCategory ? categoryData[selectedCategory] ?? [] : [];

  const countryStores = useMemo(() => {
    if (!detectedCountry) return stores;
    const local = stores.filter((s) => s.country?.toLowerCase() === detectedCountry.toLowerCase());
    return local.length > 0 ? local : stores;
  }, [stores, detectedCountry]);

  const tabStores = useMemo(() => {
    if (!activeTab) return countryStores;
    if (activeTab === "services") return countryStores.filter((s) => s.business_type === "service");
    if (activeTab === "experiences") return countryStores.filter((s) => s.business_type === "experience");
    return countryStores.filter((s) => s.business_type !== "service" && s.business_type !== "experience");
  }, [countryStores, activeTab]);

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

      let matchesCategory = true;
      if (selectedCategory) {
        matchesCategory = !!(s.category && s.category.toLowerCase().includes(selectedCategory.toLowerCase()));
      }
      if (selectedSubcategory) {
        matchesCategory = !!(s.category && s.category.toLowerCase().includes(selectedSubcategory.toLowerCase()));
      }

      const matchesLocation =
        selectedLocation === "All" ||
        s.city === selectedLocation ||
        s.district === selectedLocation;
      return matchesSearch && matchesCategory && matchesLocation;
    });
  }, [tabStores, search, selectedCategory, selectedSubcategory, selectedLocation]);

  const activeFilterCount =
    (selectedLocation !== "All" ? 1 : 0);
  const hasFilters = activeFilterCount > 0 || search.trim() !== "";

  // Breadcrumb text
  const breadcrumb = [
    activeTab ? TAB_CARDS.find((t) => t.key === activeTab)?.label : null,
    selectedCategory,
    selectedSubcategory,
  ].filter(Boolean);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        {/* ── Step: Choose Type ── */}
        {step === "type" && (
          <section className="mx-auto max-w-2xl px-4 py-12 sm:py-20">
            <div className="text-center mb-10">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Explore</h1>
              <p className="text-muted-foreground text-sm">What are you looking for?</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {TAB_CARDS.map((card) => {
                const Icon = card.icon;
                return (
                  <button
                    key={card.key}
                    onClick={() => setActiveTab(card.key)}
                    className="group flex flex-col items-center gap-3 rounded-2xl border border-border/50 bg-card p-8 text-center transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon className="h-7 w-7" />
                    </div>
                    <span className="text-lg font-semibold text-foreground">{card.label}</span>
                    <span className="text-xs text-muted-foreground leading-relaxed">{card.description}</span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Step: Choose Category ── */}
        {step === "category" && (
          <section className="mx-auto max-w-2xl px-4 py-6">
            <button
              onClick={handleBack}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
            <h2 className="text-xl font-bold text-foreground mb-1">
              {TAB_CARDS.find((t) => t.key === activeTab)?.emoji} {TAB_CARDS.find((t) => t.key === activeTab)?.label}
            </h2>
            <p className="text-sm text-muted-foreground mb-6">Choose a category</p>

            <div className="grid grid-cols-3 gap-3">
              {categoryKeys.map((cat) => {
                const Icon = CATEGORY_ICONS[cat] ?? ShoppingBag;
                return (
                  <button
                    key={cat}
                    onClick={() => handleSelectCategory(cat)}
                    className="group flex flex-col items-center gap-2 rounded-xl border border-border/50 bg-card p-4 text-center transition-all hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-[11px] font-medium text-foreground leading-tight line-clamp-2">{cat}</span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Step: Choose Subcategory ── */}
        {step === "subcategory" && (
          <section className="mx-auto max-w-2xl px-4 py-6">
            <button
              onClick={handleBack}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
            <h2 className="text-xl font-bold text-foreground mb-1">
              {selectedCategory}
            </h2>
            <p className="text-sm text-muted-foreground mb-6">Pick a subcategory</p>

            {/* "All" option */}
            <button
              onClick={() => setSelectedSubcategory("__all__")}
              className="w-full mb-3 flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4 text-left transition-all hover:border-primary/50 hover:bg-primary/10"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Search className="h-5 w-5" />
              </div>
              <div>
                <span className="text-sm font-semibold text-foreground">All {selectedCategory}</span>
                <p className="text-xs text-muted-foreground">Browse everything in this category</p>
              </div>
            </button>

            <div className="grid grid-cols-2 gap-2">
              {subcategories.map((sub) => (
                <button
                  key={sub}
                  onClick={() => handleSelectSubcategory(sub)}
                  className="flex items-center gap-3 rounded-xl border border-border/50 bg-card p-3.5 text-left transition-all hover:border-primary/40 hover:shadow-sm"
                >
                  <span className="text-sm font-medium text-foreground">{sub}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* ── Step: Stores List ── */}
        {step === "stores" && (
          <>
            {/* Header with breadcrumb + search */}
            <section className="border-b border-border/50">
              <div className="mx-auto max-w-2xl px-4 pt-4 pb-4">
                <div className="flex items-center gap-2 mb-3">
                  <button
                    onClick={handleBack}
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground overflow-x-auto">
                    {breadcrumb.map((crumb, i) => (
                      <span key={i} className="flex items-center gap-1 shrink-0">
                        {i > 0 && <span className="text-border">›</span>}
                        <span className={i === breadcrumb.length - 1 ? "font-semibold text-foreground" : ""}>
                          {crumb === "__all__" ? `All ${selectedCategory}` : crumb}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
                <div className="relative flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search stores…"
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

            {/* Filters */}
            {showFilters && (
              <section className="border-b animate-in slide-in-from-top-2 duration-200">
                <div className="mx-auto max-w-2xl px-4 py-4 space-y-4">
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
                  {hasFilters && (
                    <button
                      onClick={() => { setSelectedLocation("All"); setSearch(""); }}
                      className="text-xs text-primary font-medium hover:underline"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              </section>
            )}

            {/* Results */}
            <section className="mx-auto max-w-2xl sm:max-w-5xl px-4 py-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-foreground">
                  {selectedSubcategory && selectedSubcategory !== "__all__"
                    ? selectedSubcategory
                    : selectedCategory ?? "Stores"}
                </h2>
                <span className="text-xs text-muted-foreground">
                  {filtered.length} result{filtered.length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Active filter summary */}
              {hasFilters && !showFilters && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedLocation !== "All" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      <MapPin className="h-3 w-3" /> {selectedLocation}
                      <button onClick={() => setSelectedLocation("All")}><X className="h-3 w-3" /></button>
                    </span>
                  )}
                </div>
              )}

              {loading ? (
                <div className="py-16 text-center animate-pulse text-muted-foreground">Loading…</div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-16 text-center">
                  <Store className="h-12 w-12 text-muted-foreground/40" />
                  <p className="text-lg font-medium">No stores found</p>
                  <p className="text-sm text-muted-foreground">
                    {hasFilters ? "Try adjusting your filters" : "Be the first to create one!"}
                  </p>
                  {hasFilters && (
                    <button
                      onClick={() => { setSearch(""); setSelectedLocation("All"); }}
                      className="text-sm text-primary font-medium hover:underline"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              ) : (
                <>
                  {/* Mobile cards */}
                  <div className="grid grid-cols-2 gap-3 sm:hidden">
                    {filtered.map((store) => {
                      const businessLabel = getBusinessLabel(store);
                      const avatarUrl = store.profile_picture_url || store.first_product_image;
                      const coverUrl = store.cover_photo_url || store.first_product_image || "/default-cover.png";
                      const cleanNumber = store.whatsapp_number?.replace(/[^0-9+]/g, "").replace(/^\+/, "") || "";
                      const displayNumber = store.whatsapp_number || "";
                      return (
                        <div key={store.id} className="rounded-2xl bg-card border border-border/50 overflow-hidden shadow-sm">
                          <Link to={`/${store.store_slug}`}>
                            <div className="relative h-20 bg-secondary/50">
                              <LazyImage src={coverUrl} alt="" wrapperClassName="h-full w-full" className="h-full w-full object-cover" />
                              <div className="absolute -bottom-5 left-3 ig-ring ig-ring-sm">
                                {avatarUrl ? (
                                  <LazyImage src={avatarUrl} alt={store.store_name ?? "Store"} wrapperClassName="h-10 w-10 rounded-full" className="w-full h-full rounded-full object-cover" />
                                ) : (
                                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-card border-2 border-card">
                                    <img src="/logo-glow.png" alt="Afristall" className="h-6 w-6 rounded-full object-cover" />
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="pt-7 px-3 pb-2">
                              <h3 className="font-semibold text-xs text-foreground truncate">{store.store_name}</h3>
                              {businessLabel && (
                                <p className="text-[10px] text-primary truncate mt-0.5">{businessLabel}</p>
                              )}
                            </div>
                          </Link>
                          {displayNumber && (
                            <a
                              href={`https://wa.me/${cleanNumber}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 mx-3 mb-3 px-2.5 py-1.5 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 transition-colors"
                            >
                              <img src={whatsappIcon} alt="WhatsApp" className="h-3.5 w-3.5" />
                              <span className="text-[10px] font-medium text-foreground/70 truncate">{displayNumber}</span>
                            </a>
                          )}
                        </div>
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
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Explore;
