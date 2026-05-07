import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  Loader2, Sparkles, Package, Wand2, ArrowLeft, Download, Share2, RefreshCw, Search, Shuffle, Check,
} from "lucide-react";
import { AutoDesignModal } from "./AutoDesignModal";
import { INSPIRATIONS, COLOR_THEMES, pickRandomInspiration } from "./designInspirations";

interface Props {
  open: boolean;
  onClose: () => void;
}

type Track = "product" | "prompt";
type Step = "menu" | "template" | "theme" | "final";

interface ProductRow {
  id: string;
  name: string;
  image_url: string | null;
}

export function DesignStudioModal({ open, onClose }: Props) {
  const { user } = useAuth();
  const [track, setTrack] = useState<Track | null>(null);
  const [step, setStep] = useState<Step>("menu");

  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<ProductRow | null>(null);

  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const [inspirationId, setInspirationId] = useState<string | null>(null);
  // null themeId == "use template default"
  const [themeId, setThemeId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setTrack(null);
      setStep("menu");
      setSelectedProduct(null);
      setPrompt("");
      setResultUrl(null);
      setSearch("");
      setInspirationId(null);
      setThemeId(null);
    }
  }, [open]);

  useEffect(() => {
    if (track === "product" && step === "final" && user && products.length === 0) {
      setLoadingProducts(true);
      supabase
        .from("products")
        .select("id, name, image_url")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .then(({ data, error }) => {
          if (error) toast.error(error.message);
          else setProducts((data as ProductRow[]) || []);
          setLoadingProducts(false);
        });
    }
  }, [track, step, user, products.length]);

  const insp = INSPIRATIONS.find((i) => i.id === inspirationId) || null;
  const theme = themeId ? COLOR_THEMES.find((t) => t.id === themeId) : null;

  const loadInspirationDataUrl = async (): Promise<string | null> => {
    if (!insp) return null;
    try {
      const r = await fetch(insp.image);
      const blob = await r.blob();
      if (!blob.type.startsWith("image/")) return null;
      return await new Promise<string>((resolve, reject) => {
        const fr = new FileReader();
        fr.onloadend = () => resolve(fr.result as string);
        fr.onerror = reject;
        fr.readAsDataURL(blob);
      });
    } catch {
      return null;
    }
  };

  const generateFromPrompt = async () => {
    if (prompt.trim().length < 3) {
      toast.error("Describe what poster you want");
      return;
    }
    setGenerating(true);
    setResultUrl(null);
    try {
      const inspirationImage = await loadInspirationDataUrl();
      const { data, error } = await supabase.functions.invoke("design-poster-prompt", {
        body: {
          prompt: prompt.trim(),
          inspiration: insp?.prompt || null,
          inspirationImage,
          themeColor: theme?.color || null,
        },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setResultUrl((data as any).url);
    } catch (e: any) {
      toast.error(e?.message || "Failed to generate");
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!resultUrl) return;
    try {
      const r = await fetch(resultUrl);
      const blob = await r.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `poster-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch {
      toast.error("Download failed");
    }
  };

  const handleShare = async () => {
    if (!resultUrl) return;
    try {
      const r = await fetch(resultUrl);
      const blob = await r.blob();
      const file = new File([blob], `poster.png`, { type: blob.type });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file] });
      } else {
        window.open(`https://wa.me/?text=${encodeURIComponent(resultUrl)}`, "_blank");
      }
    } catch {}
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  // Hand off to AutoDesignModal once product is selected
  if (selectedProduct) {
    return (
      <AutoDesignModal
        productId={selectedProduct.id}
        productName={selectedProduct.name}
        inspiration={insp?.prompt || null}
        inspirationImage={insp?.image || null}
        themeColor={theme?.color || null}
        open={open}
        onClose={() => {
          setSelectedProduct(null);
          onClose();
        }}
      />
    );
  }

  const goBack = () => {
    if (step === "final") setStep("theme");
    else if (step === "theme") setStep("template");
    else if (step === "template") {
      setStep("menu");
      setTrack(null);
    } else onClose();
  };

  const stepIndex =
    step === "menu" ? 0 : step === "template" ? 1 : step === "theme" ? 2 : 3;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {step !== "menu" && (
              <button
                onClick={goBack}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Back"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <Sparkles className="h-4 w-4 text-primary" />
            {step === "menu" && "Design Studio"}
            {step === "template" && "Pick a template"}
            {step === "theme" && "Pick a color"}
            {step === "final" && (track === "product" ? "Choose a product" : "Describe your poster")}
          </DialogTitle>
        </DialogHeader>

        {/* Step indicator */}
        {step !== "menu" && (
          <div className="flex items-center gap-1.5 -mt-1">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className={`h-1 flex-1 rounded-full transition ${
                  n <= stepIndex ? "bg-primary" : "bg-border/60"
                }`}
              />
            ))}
          </div>
        )}

        {/* STEP 1 — MENU */}
        {step === "menu" && (
          <div className="grid grid-cols-1 gap-3">
            <button
              onClick={() => { setTrack("product"); setStep("template"); }}
              className="group flex items-center gap-3 rounded-2xl border border-border/60 bg-card/40 p-4 text-left hover:border-primary/40 hover:bg-card/80 transition"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Package className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="font-semibold">Choose product</div>
                <div className="text-xs text-muted-foreground">
                  Pick a product and auto-generate a premium poster
                </div>
              </div>
            </button>
            <button
              onClick={() => { setTrack("prompt"); setStep("template"); }}
              className="group flex items-center gap-3 rounded-2xl border border-border/60 bg-card/40 p-4 text-left hover:border-primary/40 hover:bg-card/80 transition"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Wand2 className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="font-semibold">Make poster</div>
                <div className="text-xs text-muted-foreground">
                  Describe any poster — AI designs it for you
                </div>
              </div>
            </button>
          </div>
        )}

        {/* STEP 2 — TEMPLATE */}
        {step === "template" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground">
                {insp ? `Selected: ${insp.label}` : "Tap a template"}
              </span>
              <button
                onClick={() => setInspirationId(pickRandomInspiration().id)}
                className="text-[11px] flex items-center gap-1 text-primary hover:underline"
              >
                <Shuffle className="h-3 w-3" /> Random
              </button>
            </div>
            <div className="grid grid-cols-3 gap-1.5 max-h-[55vh] overflow-y-auto -mx-1 px-1">
              {INSPIRATIONS.map((i) => {
                const active = inspirationId === i.id;
                return (
                  <button
                    key={i.id}
                    onClick={() => setInspirationId(i.id)}
                    className={`relative rounded-lg overflow-hidden border transition ${
                      active ? "border-primary ring-2 ring-primary/40" : "border-border/60 hover:border-primary/40"
                    }`}
                  >
                    <div className="aspect-square bg-muted">
                      <img src={i.image} alt={i.label} className="w-full h-full object-cover" loading="lazy" />
                    </div>
                    {active && (
                      <div className="absolute top-1 right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                        <Check className="h-3 w-3" />
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-1.5 py-1 text-[10px] text-white text-left line-clamp-1">
                      {i.label}
                    </div>
                  </button>
                );
              })}
            </div>
            <Button
              className="w-full"
              disabled={!inspirationId}
              onClick={() => setStep("theme")}
            >
              Next
            </Button>
          </div>
        )}

        {/* STEP 3 — COLOR THEME */}
        {step === "theme" && (
          <div className="space-y-3">
            <p className="text-[11px] text-muted-foreground">
              Override the template's colors, or keep them as-is.
            </p>
            <button
              onClick={() => setThemeId(null)}
              className={`w-full flex items-center gap-3 rounded-xl border p-3 text-left transition ${
                themeId === null ? "border-primary bg-primary/10" : "border-border/60 hover:border-primary/40"
              }`}
            >
              {insp && (
                <div className="h-12 w-12 rounded-lg overflow-hidden bg-muted shrink-0">
                  <img src={insp.image} alt={insp.label} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1">
                <div className="text-sm font-semibold">Use template colors</div>
                <div className="text-[11px] text-muted-foreground">
                  Keep the original palette of {insp?.label || "this template"}
                </div>
              </div>
              {themeId === null && <Check className="h-4 w-4 text-primary" />}
            </button>

            <div className="grid grid-cols-4 gap-2">
              {COLOR_THEMES.map((t) => {
                const active = themeId === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setThemeId(t.id)}
                    className={`flex flex-col items-center gap-1 rounded-xl border p-2 transition ${
                      active ? "border-primary bg-primary/10" : "border-border/60 hover:border-primary/40"
                    }`}
                  >
                    {t.color ? (
                      <span
                        className="h-8 w-8 rounded-full border border-border/60"
                        style={{ background: t.color }}
                      />
                    ) : (
                      <span className="h-8 w-8 rounded-full border border-border/60 flex items-center justify-center bg-primary/10">
                        <Sparkles className="h-4 w-4 text-primary" />
                      </span>
                    )}
                    <span className="text-[10px]">{t.label}</span>
                  </button>
                );
              })}
            </div>

            <Button className="w-full" onClick={() => setStep("final")}>
              {track === "product" ? "Choose product" : "Continue"}
            </Button>
          </div>
        )}

        {/* STEP 4 — FINAL: pick product OR describe + generate */}
        {step === "final" && track === "product" && (
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search products"
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="max-h-[60vh] overflow-y-auto -mx-1 px-1">
              {loadingProducts ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              ) : filtered.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground p-6">
                  No products found
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {filtered.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedProduct(p)}
                      className="group rounded-xl overflow-hidden border border-border/60 bg-card/40 hover:border-primary/40 transition text-left"
                    >
                      <div className="aspect-square bg-muted overflow-hidden">
                        {p.image_url ? (
                          <img
                            src={p.image_url}
                            alt={p.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                            <Package className="h-6 w-6" />
                          </div>
                        )}
                      </div>
                      <div className="p-2">
                        <div className="text-xs font-medium line-clamp-1">{p.name}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {step === "final" && track === "prompt" && (
          <div className="space-y-3">
            <div className="aspect-square rounded-xl overflow-hidden bg-muted relative flex items-center justify-center">
              {generating && (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-xs">Designing your poster…</p>
                </div>
              )}
              {!generating && resultUrl && (
                <img src={resultUrl} alt="Generated poster" className="w-full h-full object-cover" />
              )}
              {!generating && !resultUrl && insp && (
                <img src={insp.image} alt="Template preview" className="w-full h-full object-cover opacity-40" />
              )}
              {!generating && !resultUrl && !insp && (
                <div className="text-center text-muted-foreground p-6">
                  <Wand2 className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  <p className="text-xs">Your poster will appear here</p>
                </div>
              )}
            </div>
            <Textarea
              placeholder="e.g. Black Friday sale poster with bold red typography and a 50% off badge"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[80px]"
              disabled={generating}
            />
            {!resultUrl ? (
              <Button
                onClick={generateFromPrompt}
                disabled={generating || prompt.trim().length < 3}
                className="w-full gap-1.5"
              >
                {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Generate poster
              </Button>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" onClick={generateFromPrompt} disabled={generating} className="gap-1.5">
                  <RefreshCw className="h-3.5 w-3.5" /> Redo
                </Button>
                <Button variant="outline" onClick={handleDownload} className="gap-1.5">
                  <Download className="h-3.5 w-3.5" /> Save
                </Button>
                <Button onClick={handleShare} className="gap-1.5">
                  <Share2 className="h-3.5 w-3.5" /> Share
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
