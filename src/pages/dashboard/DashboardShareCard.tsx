import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Loader2, Check, Palette, ArrowRight } from "lucide-react";
import { PolotnoEditor } from "@/components/dashboard/PolotnoEditor";

/* ───────── Types ───────── */

interface DesignTemplate {
  id: string;
  name: string;
  category: string;
  defaultHeadline: string;
  defaultSubtitle: string;
  previewImage: string;
  previewBg: string;
  previewTextColor: string;
  previewAccent: string;
  previewLayout: "full-bleed" | "split" | "centered" | "grid";
}

interface Product {
  id: string;
  name: string;
  image_url: string | null;
}

/* ───────── All 9 Design Templates ───────── */

const TEMPLATES: DesignTemplate[] = [
  { id: "editorial-highlight", name: "Highlight", category: "Editorial", defaultHeadline: "No limits.\nNo compromise.", defaultSubtitle: "Just everyday essentials, done properly.", previewImage: "/templates/editorial-1.jpeg", previewBg: "#1a1a1a", previewTextColor: "#fff", previewAccent: "#FF6B35", previewLayout: "full-bleed" },
  { id: "editorial-magazine", name: "Magazine", category: "Editorial", defaultHeadline: "NEW\nCOLLECTION", defaultSubtitle: "Curated pieces you'll love.", previewImage: "/templates/editorial-3.jpg", previewBg: "#0a0a0a", previewTextColor: "#fff", previewAccent: "#d4a574", previewLayout: "full-bleed" },
  { id: "editorial-minimal", name: "Minimal", category: "Editorial", defaultHeadline: "SHOP\nNOW", defaultSubtitle: "Discover what's trending.", previewImage: "/templates/spotlight-1.jpeg", previewBg: "#111", previewTextColor: "#fff", previewAccent: "#FF6B35", previewLayout: "full-bleed" },
  { id: "spotlight-hero", name: "Hero Shot", category: "Spotlight", defaultHeadline: "FEATURED\nPRODUCT", defaultSubtitle: "The one everyone's talking about.", previewImage: "/templates/spotlight-2.jpeg", previewBg: "#f5f3ef", previewTextColor: "#1a1a1a", previewAccent: "#FF6B35", previewLayout: "split" },
  { id: "spotlight-split", name: "Split View", category: "Spotlight", defaultHeadline: "BEST\nSELLER", defaultSubtitle: "See why it's #1.", previewImage: "/templates/brand-2.png", previewBg: "#1a1a2e", previewTextColor: "#fff", previewAccent: "#FF6B35", previewLayout: "split" },
  { id: "brand-profile", name: "Profile Card", category: "Brand Card", defaultHeadline: "VISIT\nMY STORE", defaultSubtitle: "Quality products, great prices.", previewImage: "/templates/brand-1.jpeg", previewBg: "#ffffff", previewTextColor: "#111827", previewAccent: "#FF6B35", previewLayout: "centered" },
  { id: "brand-elegant", name: "Elegant Dark", category: "Brand Card", defaultHeadline: "EXPLORE\nOUR RANGE", defaultSubtitle: "Something for everyone.", previewImage: "/templates/brand-3.png", previewBg: "#1a1a2e", previewTextColor: "#fff", previewAccent: "#d4a574", previewLayout: "centered" },
  { id: "collage-grid", name: "Grid Layout", category: "Collage", defaultHeadline: "NEW ARRIVALS", defaultSubtitle: "Fresh stock just dropped!", previewImage: "/templates/collage-1.png", previewBg: "#faf9f7", previewTextColor: "#111827", previewAccent: "#FF6B35", previewLayout: "grid" },
  { id: "collage-mosaic", name: "Mosaic", category: "Collage", defaultHeadline: "TOP PICKS", defaultSubtitle: "Our best sellers, curated for you.", previewImage: "/templates/collage-2.png", previewBg: "#faf9f7", previewTextColor: "#111827", previewAccent: "#FF8F5E", previewLayout: "grid" },
];

/* ───────── Helpers ───────── */

const parseCategory = (raw: string | null | undefined): string => {
  if (!raw) return "";
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === "object" && parsed !== null) return Object.keys(parsed)[0] || "";
    return String(parsed);
  } catch { return raw; }
};

/* ───────── Component ───────── */

const DashboardShareCard = () => {
  const { user } = useAuth();

  // Data
  const [storeName, setStoreName] = useState("");
  const [storeSlug, setStoreSlug] = useState("");
  const [profilePicUrl, setProfilePicUrl] = useState("");
  const [category, setCategory] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Flow state
  const [step, setStep] = useState<"select" | "edit">("select");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  const selectedTemplate = TEMPLATES.find(t => t.id === selectedTemplateId) ?? null;

  // ── Fetch data ──
  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const [{ data: profile }, { data: productsData }] = await Promise.all([
        supabase.from("profiles").select("store_name, store_slug, profile_picture_url, category").eq("id", user.id).single(),
        supabase.from("products").select("id, name, image_url").eq("user_id", user.id),
      ]);
      const p = profile as any;
      setStoreName(p?.store_name ?? "");
      setStoreSlug(p?.store_slug ?? "");
      setProfilePicUrl(p?.profile_picture_url ?? "");
      setCategory(parseCategory(p?.category));
      setProducts((productsData ?? []).map((pr: any) => ({ id: pr.id, name: pr.name, image_url: pr.image_url })));
      setLoading(false);
    };
    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  /* ───────── STEP 2: Polotno Editor ───────── */
  if (step === "edit" && selectedTemplate) {
    return (
      <PolotnoEditor
        template={selectedTemplate}
        storeName={storeName}
        storeSlug={storeSlug}
        profilePicUrl={profilePicUrl}
        category={category}
        products={products}
        onBack={() => setStep("select")}
      />
    );
  }

  /* ───────── STEP 1: Template Selection ───────── */
  const categories = [...new Set(TEMPLATES.map(t => t.category))];

  return (
    <div className="space-y-6 pb-24 md:pb-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Palette className="h-6 w-6 text-primary" /> Design Studio
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Create branded cards for WhatsApp Status & Instagram Stories</p>
      </div>

      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
        <p className="text-sm font-medium text-foreground">👋 Select your preferred design to get started</p>
        <p className="text-xs text-muted-foreground mt-1">Pick a template that matches your brand's vibe, then customize it with the full design editor.</p>
      </div>

      {categories.map((cat) => (
        <div key={cat}>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">{cat}</h2>
          <div className="grid grid-cols-2 gap-3">
            {TEMPLATES.filter(t => t.category === cat).map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTemplateId(t.id)}
                className={`relative rounded-2xl border-2 overflow-hidden transition-all aspect-[9/14] group ${
                  selectedTemplateId === t.id
                    ? "border-primary ring-2 ring-primary/30 shadow-lg shadow-primary/10 scale-[1.02]"
                    : "border-border/50 hover:border-primary/40 hover:shadow-md"
                }`}
              >
                <img src={t.previewImage} alt={t.name} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 pt-8">
                  <p className="text-white text-xs font-bold">{t.name}</p>
                  <p className="text-white/60 text-[10px]">{t.category}</p>
                </div>
                {selectedTemplateId === t.id && (
                  <div className="absolute top-2 right-2 h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                    <Check className="h-3.5 w-3.5 text-primary-foreground" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      ))}

      {selectedTemplateId && (
        <div className="sticky bottom-20 md:bottom-4 z-40">
          <Button onClick={() => setStep("edit")} className="w-full rounded-2xl h-12 text-base gap-2 shadow-lg shadow-primary/20">
            Next – Customize Design <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default DashboardShareCard;
