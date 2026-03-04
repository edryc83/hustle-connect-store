import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Loader2, Palette, ArrowRight, Check } from "lucide-react";
import { ShareCardEditor } from "@/components/dashboard/ShareCardEditor";

const parseCategory = (raw: string | null | undefined): string => {
  if (!raw) return "";
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === "object" && parsed !== null) return Object.keys(parsed)[0] || "";
    return String(parsed);
  } catch { return raw; }
};

const TEMPLATES = [
  {
    id: 1,
    name: "Editorial",
    desc: "White background, large image top, bold text bottom",
    preview: "/templates/editorial-1.jpeg",
    previewBg: "#ffffff",
  },
  {
    id: 2,
    name: "Bold Orange",
    desc: "Full orange background, store name centre, white text",
    preview: "/templates/brand-1.jpeg",
    previewBg: "#FF6B35",
  },
  {
    id: 3,
    name: "Dark Gradient",
    desc: "Dark background, product image, orange gradient overlay",
    preview: "/templates/spotlight-2.jpeg",
    previewBg: "#1a1a2e",
  },
];

const DashboardShareCard = () => {
  const { user } = useAuth();
  const [storeName, setStoreName] = useState("");
  const [storeSlug, setStoreSlug] = useState("");
  const [profilePicUrl, setProfilePicUrl] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<"select" | "edit">("select");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("store_name, store_slug, profile_picture_url, category")
        .eq("id", user.id)
        .single();
      const p = profile as any;
      setStoreName(p?.store_name ?? "");
      setStoreSlug(p?.store_slug ?? "");
      setProfilePicUrl(p?.profile_picture_url ?? "");
      setCategory(parseCategory(p?.category));
      setLoading(false);
    })();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (step === "edit" && selectedId) {
    return (
      <ShareCardEditor
        templateId={selectedId}
        storeName={storeName}
        storeSlug={storeSlug}
        profilePicUrl={profilePicUrl}
        category={category}
        onBack={() => setStep("select")}
      />
    );
  }

  return (
    <div className="space-y-6 pb-24 md:pb-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Palette className="h-6 w-6 text-primary" /> Design Studio
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Create branded cards for WhatsApp Status & Instagram Stories</p>
      </div>

      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
        <p className="text-sm font-medium text-foreground">👋 Pick a template to get started</p>
        <p className="text-xs text-muted-foreground mt-1">Click to edit text, change images, then share as PNG.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {TEMPLATES.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelectedId(t.id)}
            className={`relative rounded-2xl border-2 overflow-hidden transition-all aspect-[9/16] group ${
              selectedId === t.id
                ? "border-primary ring-2 ring-primary/30 shadow-lg shadow-primary/10 scale-[1.02]"
                : "border-border/50 hover:border-primary/40 hover:shadow-md"
            }`}
          >
            <img src={t.preview} alt={t.name} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pt-10">
              <p className="text-white text-sm font-bold">{t.name}</p>
              <p className="text-white/60 text-xs">{t.desc}</p>
            </div>
            {selectedId === t.id && (
              <div className="absolute top-3 right-3 h-7 w-7 rounded-full bg-primary flex items-center justify-center">
                <Check className="h-4 w-4 text-primary-foreground" />
              </div>
            )}
          </button>
        ))}
      </div>

      {selectedId && (
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
