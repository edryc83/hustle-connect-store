import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTokens } from "@/hooks/useTokens";
import { TOKENS_PER_COMMERCIAL } from "@/lib/tokenPackages";
import { InsufficientTokensModal } from "@/components/tokens/InsufficientTokensModal";
import { toast } from "sonner";
import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import {
  Package, Loader2, Download, Share2, RefreshCw,
  ArrowLeft, Coins, Sparkles, Clapperboard, Check,
} from "lucide-react";
import { COMMERCIAL_TEMPLATES } from "./commercialTemplates";
import { renderCommercial } from "@/lib/commercialRender";
import { formatPrice } from "@/lib/currency";
import { useQuery } from "@tanstack/react-query";

interface ProductLite {
  id: string;
  name: string;
  price: number | null;
  image_url: string | null;
  description: string | null;
  category: string | null;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

type Stage = "pick" | "template" | "processing" | "stitching" | "result";

export function StudioCommercialModal({ open, onClose }: Props) {
  const { user } = useAuth();
  const { balance, enabled: tokensEnabled, refetch: refetchTokens } = useTokens();

  const [stage, setStage] = useState<Stage>("pick");
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductLite | null>(null);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [shotStatuses, setShotStatuses] = useState<
    Array<{ shot_index: number; status: string; video_url: string | null }>
  >([]);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [showInsufficient, setShowInsufficient] = useState(false);
  const [stitchProgress, setStitchProgress] = useState(0);
  const [stitchStage, setStitchStage] = useState<"loading" | "downloading" | "rendering">("loading");

  const { data: currency = "UGX" } = useQuery({
    queryKey: ["profile-currency", user?.id],
    enabled: !!user?.id && open,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("currency").eq("id", user!.id).maybeSingle();
      return (data?.currency as string) || "UGX";
    },
  });

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["commercial-products", user?.id],
    enabled: !!user?.id && open,
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("id, name, price, image_url, description, category")
        .eq("user_id", user!.id)
        .not("image_url", "is", null)
        .order("created_at", { ascending: false });
      return (data as ProductLite[]) || [];
    },
  });

  useEffect(() => {
    if (!open) {
      setStage("pick");
      setOriginalUrl(null); setOriginalFile(null); setSelectedProduct(null);
      setTemplateId(null); setJobId(null); setShotStatuses([]);
      setResultUrl(null); setError(null); setStarting(false);
      setStitchProgress(0); setStitchStage("loading");
    }
  }, [open]);

  // Realtime per-shot status. When the job flips to "ready" we start client-side stitching.
  useEffect(() => {
    if (!jobId || !user) return;
    const tpl = COMMERCIAL_TEMPLATES.find((t) => t.id === templateId);

    const shotsChannel = supabase
      .channel(`commercial-shots-${jobId}`)
      .on("postgres_changes", {
        event: "*", schema: "public", table: "commercial_shots", filter: `job_id=eq.${jobId}`,
      }, (payload) => {
        const row: any = payload.new;
        if (!row) return;
        setShotStatuses((prev) => {
          const others = prev.filter((s) => s.shot_index !== row.shot_index);
          return [...others, { shot_index: row.shot_index, status: row.status, video_url: row.video_url }]
            .sort((a, b) => a.shot_index - b.shot_index);
        });
      })
      .subscribe();

    const jobChannel = supabase
      .channel(`commercial-job-${jobId}`)
      .on("postgres_changes", {
        event: "UPDATE", schema: "public", table: "commercial_jobs", filter: `id=eq.${jobId}`,
      }, async (payload) => {
        const row: any = payload.new;
        if (row.status === "failed") {
          setError(row.error || "One of the shots failed. Tokens refunded.");
          setStage("template");
          refetchTokens();
          return;
        }
        if (row.status === "ready" && tpl && selectedProduct) {
          // Pull the final shot list ordered by index
          const { data: shots } = await supabase
            .from("commercial_shots")
            .select("shot_index, video_url")
            .eq("job_id", jobId)
            .order("shot_index");
          const urls = (shots || []).map((s: any) => s.video_url).filter(Boolean);
          if (urls.length !== tpl.shots.length) {
            setError("Shots incomplete — try again.");
            setStage("template");
            return;
          }
          setStage("stitching");
          try {
            const priceStr = selectedProduct.price
              ? formatPrice(Number(selectedProduct.price), currency)
              : "";
            const blob = await renderCommercial({
              template: tpl,
              shotUrls: urls,
              productName: selectedProduct.name,
              price: priceStr,
              onProgress: (s, p) => { setStitchStage(s); setStitchProgress(p); },
            });
            const blobUrl = URL.createObjectURL(blob);
            setResultUrl(blobUrl);
            setStage("result");
            refetchTokens();
          } catch (e: any) {
            setError("Editing failed on your device: " + (e?.message || "unknown"));
            setStage("template");
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(shotsChannel);
      supabase.removeChannel(jobChannel);
    };
  }, [jobId, user, templateId, selectedProduct, currency, refetchTokens]);

  const handleSelectProduct = async (p: ProductLite) => {
    if (!p.image_url) return;
    setLoadingProduct(true);
    try {
      const r = await fetch(p.image_url);
      const blob = await r.blob();
      const mime = blob.type || "image/jpeg";
      const ext = mime.split("/")[1] || "jpg";
      const file = new File([blob], `${p.id}.${ext}`, { type: mime });
      setSelectedProduct(p);
      setOriginalFile(file);
      setOriginalUrl(p.image_url);
      setStage("template");
    } catch {
      toast.error("Could not load that product image");
    } finally {
      setLoadingProduct(false);
    }
  };

  const handleGenerate = async () => {
    if (!originalFile || !templateId || !user || !selectedProduct) return;
    if (tokensEnabled && balance < TOKENS_PER_COMMERCIAL) { setShowInsufficient(true); return; }
    const tpl = COMMERCIAL_TEMPLATES.find((t) => t.id === templateId);
    if (!tpl) return;
    setError(null);
    setStarting(true);
    setShotStatuses(tpl.shots.map((_, i) => ({ shot_index: i, status: "queued", video_url: null })));
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const fr = new FileReader();
        fr.onloadend = () => resolve((fr.result as string).split(",")[1]);
        fr.onerror = reject;
        fr.readAsDataURL(originalFile);
      });
      const productContext = [
        selectedProduct.name && `Product: ${selectedProduct.name}`,
        selectedProduct.category && `Category: ${selectedProduct.category}`,
        selectedProduct.description && `Details: ${selectedProduct.description}`,
      ].filter(Boolean).join(". ");

      const shots = tpl.shots.map((cameraPrompt) => ({
        prompt: productContext ? `${cameraPrompt} ${productContext}` : cameraPrompt,
      }));

      const { data: { session } } = await supabase.auth.getSession();
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/commercial-generate-start`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session?.access_token}`,
            "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({
            imageBase64: base64,
            mimeType: originalFile.type,
            templateId: tpl.id,
            shots,
            productName: selectedProduct.name,
            productId: selectedProduct.id,
          }),
        }
      );
      const data = await resp.json();
      if (data?.error === "insufficient_tokens") {
        setShowInsufficient(true);
        return;
      }
      if (!resp.ok) throw new Error(data?.message || data?.error || `Error ${resp.status}`);
      setJobId(data.jobId);
      setStage("processing");
      refetchTokens();
    } catch (e: any) {
      toast.error(e?.message || "Could not start commercial");
    } finally {
      setStarting(false);
    }
  };

  const handleDownload = async () => {
    if (!resultUrl) return;
    try {
      const r = await fetch(resultUrl);
      const blob = await r.blob();
      if (Capacitor.isNativePlatform()) {
        const b64 = await new Promise<string>((resolve, reject) => {
          const fr = new FileReader();
          fr.onloadend = () => resolve((fr.result as string).split(",")[1]);
          fr.onerror = reject;
          fr.readAsDataURL(blob);
        });
        const fileName = `commercial-${Date.now()}.mp4`;
        await Filesystem.writeFile({ path: fileName, data: b64, directory: Directory.Cache });
        const { uri } = await Filesystem.getUri({ path: fileName, directory: Directory.Cache });
        await Share.share({ title: "Commercial", url: uri, dialogTitle: "Save your commercial" });
      } else {
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = blobUrl; a.download = `commercial-${Date.now()}.mp4`;
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(blobUrl), 30_000);
      }
    } catch { toast.error("Download failed"); }
  };

  const handleShare = async () => {
    if (!resultUrl) return;
    try {
      const r = await fetch(resultUrl);
      const blob = await r.blob();
      const file = new File([blob], "commercial.mp4", { type: "video/mp4" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file] });
      } else {
        handleDownload();
      }
    } catch {}
  };

  const reset = () => {
    setStage("pick");
    setOriginalUrl(null); setOriginalFile(null); setSelectedProduct(null);
    setTemplateId(null); setJobId(null); setShotStatuses([]);
    setResultUrl(null); setError(null); setStitchProgress(0);
  };

  const readyShots = shotStatuses.filter((s) => s.status === "ready").length;
  const totalShots = shotStatuses.length;

  return (
    <>
      <InsufficientTokensModal open={showInsufficient} onClose={() => setShowInsufficient(false)} balance={balance} />
      <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
        <DialogContent className="max-w-full w-screen h-[100dvh] sm:max-w-md sm:h-auto sm:max-h-[90vh] p-4 overflow-y-auto rounded-none sm:rounded-lg flex flex-col gap-3">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                {stage !== "pick" && stage !== "processing" && stage !== "stitching" && (
                  <button
                    onClick={() => (stage === "result" ? reset() : setStage("pick"))}
                    className="text-muted-foreground hover:text-foreground"
                    aria-label="Back"
                  ><ArrowLeft className="h-4 w-4" /></button>
                )}
                <Clapperboard className="h-4 w-4 text-primary" />
                Studio Commercial
              </span>
              {tokensEnabled && (
                <span className="flex items-center gap-1 text-xs font-normal text-muted-foreground">
                  <Coins className="h-3.5 w-3.5 text-amber-400" /> {balance}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>

          {stage === "pick" && (
            <div className="space-y-4 flex-1 content-center">
              <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-fuchsia-500/10 via-amber-500/5 to-primary/10 p-4 text-center space-y-1">
                <Sparkles className="h-7 w-7 mx-auto text-primary" />
                <p className="text-sm font-bold">One photo. A full commercial.</p>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  Pick a product — we film 2–3 cinematic shots, cut them together with music and captions.
                </p>
              </div>
              {productsLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : products.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-border/60 p-8 text-center space-y-2">
                  <Package className="h-10 w-10 mx-auto text-muted-foreground" />
                  <p className="text-sm font-semibold">No products yet</p>
                  <p className="text-[11px] text-muted-foreground">Add a product with a photo first, then come back to make its commercial.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-[11px] font-semibold text-muted-foreground px-1">Choose a product</p>
                  <div className="grid grid-cols-3 gap-2 max-h-[52vh] overflow-y-auto pr-1">
                    {products.map((p) => (
                      <button
                        key={p.id}
                        disabled={loadingProduct}
                        onClick={() => handleSelectProduct(p)}
                        className="group relative rounded-xl overflow-hidden border border-border hover:border-primary/60 transition aspect-square bg-muted"
                      >
                        <img src={p.image_url!} alt={p.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-1.5">
                          <p className="text-[10px] text-white font-medium truncate">{p.name}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                  {loadingProduct && (
                    <p className="text-[11px] text-center text-muted-foreground flex items-center justify-center gap-1.5 pt-1">
                      <Loader2 className="h-3 w-3 animate-spin" /> Loading product…
                    </p>
                  )}
                </div>
              )}
              {tokensEnabled && (
                <p className="text-center text-[11px] text-muted-foreground flex items-center justify-center gap-1">
                  <Coins className="h-3 w-3 text-amber-400" /> {TOKENS_PER_COMMERCIAL} tokens per commercial
                </p>
              )}
            </div>
          )}

          {stage === "template" && originalUrl && (
            <div className="space-y-3">
              <div className="aspect-square rounded-xl overflow-hidden bg-muted">
                <img src={originalUrl} alt="" className="w-full h-full object-cover" />
              </div>
              {error && (
                <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-2 text-[11px] text-destructive">
                  {error}
                </div>
              )}
              <p className="text-xs font-semibold text-muted-foreground">Pick an ad style</p>
              <div className="grid grid-cols-2 gap-2">
                {COMMERCIAL_TEMPLATES.map((t) => {
                  const active = templateId === t.id;
                  const duration = t.shotDurations.reduce((a, b) => a + b, 0);
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTemplateId(t.id)}
                      className={`flex flex-col items-start gap-1 rounded-xl border p-3 text-left bg-gradient-to-br transition ${t.tint} ${active ? "ring-2 ring-primary" : "hover:brightness-110"}`}
                    >
                      <span className="text-2xl">{t.emoji}</span>
                      <span className="text-sm font-semibold text-foreground">{t.label}</span>
                      <span className="text-[10px] leading-snug text-muted-foreground">{t.desc}</span>
                      <span className="text-[9px] uppercase tracking-wider text-muted-foreground/80 mt-0.5">
                        {t.shots.length} shots • {Math.round(duration)}s
                      </span>
                    </button>
                  );
                })}
              </div>
              <Button
                onClick={handleGenerate}
                disabled={!templateId || starting}
                className="w-full gap-1.5 bg-gradient-to-r from-fuchsia-600 to-amber-500 text-white border-0"
              >
                {starting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Clapperboard className="h-4 w-4" /> Make commercial{tokensEnabled ? ` (${TOKENS_PER_COMMERCIAL} tokens)` : ""}</>}
              </Button>
            </div>
          )}

          {stage === "processing" && (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 py-8">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-primary/20 blur-2xl animate-pulse" />
                <Loader2 className="relative h-14 w-14 animate-spin text-primary" />
              </div>
              <p className="text-sm font-semibold">Filming {totalShots} cinematic shots…</p>
              <div className="w-full max-w-[240px] space-y-1.5">
                {shotStatuses.map((s) => (
                  <div key={s.shot_index} className="flex items-center gap-2 text-[11px]">
                    <div className={`h-4 w-4 rounded-full flex items-center justify-center ${
                      s.status === "ready" ? "bg-emerald-500 text-white" :
                      s.status === "failed" ? "bg-red-500 text-white" :
                      "bg-muted"
                    }`}>
                      {s.status === "ready" ? <Check className="h-2.5 w-2.5" /> :
                       s.status === "failed" ? "!" :
                       <Loader2 className="h-2.5 w-2.5 animate-spin" />}
                    </div>
                    <span className={s.status === "ready" ? "text-foreground" : "text-muted-foreground"}>
                      Shot {s.shot_index + 1} — {s.status}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground text-center max-w-[240px]">
                {readyShots}/{totalShots} ready. Usually 1–3 minutes per shot. You can close and come back.
              </p>
              <Button variant="ghost" size="sm" onClick={onClose}>Close and come back later</Button>
            </div>
          )}

          {stage === "stitching" && (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 py-8">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-primary/20 blur-2xl animate-pulse" />
                <Clapperboard className="relative h-14 w-14 text-primary animate-pulse" />
              </div>
              <p className="text-sm font-semibold">Editing your commercial…</p>
              <div className="w-full max-w-[240px] h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-fuchsia-500 to-amber-400 transition-all"
                  style={{ width: `${Math.round(stitchProgress * 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-muted-foreground text-center max-w-[240px]">
                {stitchStage === "loading" && "Loading the editor…"}
                {stitchStage === "downloading" && "Downloading shots + music…"}
                {stitchStage === "rendering" && "Cutting shots, overlaying captions, mixing music…"}
              </p>
            </div>
          )}

          {stage === "result" && resultUrl && (
            <div className="space-y-3">
              <div className="aspect-[9/16] max-h-[60vh] mx-auto rounded-xl overflow-hidden bg-black">
                <video src={resultUrl} className="w-full h-full object-contain" controls autoPlay loop playsInline />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" onClick={reset} className="gap-1.5">
                  <RefreshCw className="h-3.5 w-3.5" /> New
                </Button>
                <Button variant="outline" onClick={handleDownload} className="gap-1.5">
                  <Download className="h-3.5 w-3.5" /> Save
                </Button>
                <Button onClick={handleShare} className="gap-1.5">
                  <Share2 className="h-3.5 w-3.5" /> Share
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}