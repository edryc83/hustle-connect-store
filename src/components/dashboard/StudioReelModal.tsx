import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTokens } from "@/hooks/useTokens";
import { TOKENS_PER_VIDEO } from "@/lib/tokenPackages";
import { InsufficientTokensModal } from "@/components/tokens/InsufficientTokensModal";
import { toast } from "sonner";
import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import {
  Package, Film, Loader2, Download, Share2, RefreshCw,
  ArrowLeft, Coins, Sparkles,
} from "lucide-react";
import { VIDEO_TEMPLATES } from "./videoTemplates";
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

type Stage = "pick" | "template" | "processing" | "result";

export function StudioReelModal({ open, onClose }: Props) {
  const { user } = useAuth();
  const { balance, enabled: tokensEnabled, refetch: refetchTokens } = useTokens();

  const [stage, setStage] = useState<Stage>("pick");
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductLite | null>(null);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [vibe, setVibe] = useState("");
  const [jobId, setJobId] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [showInsufficient, setShowInsufficient] = useState(false);

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["reel-products", user?.id],
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
      setOriginalUrl(null);
      setOriginalFile(null);
      setSelectedProduct(null);
      setTemplateId(null);
      setVibe("");
      setJobId(null);
      setResultUrl(null);
      setError(null);
      setStarting(false);
    }
  }, [open]);

  // Realtime job status
  useEffect(() => {
    if (!jobId || !user) return;
    const channel = supabase
      .channel(`video-job-${jobId}`)
      .on("postgres_changes", {
        event: "UPDATE", schema: "public", table: "video_jobs", filter: `id=eq.${jobId}`,
      }, (payload) => {
        const row: any = payload.new;
        if (row.status === "ready" && row.result_url) {
          setResultUrl(row.result_url);
          setStage("result");
          refetchTokens();
        } else if (row.status === "failed") {
          setError(row.error || "Video generation failed. Tokens refunded.");
          setStage("template");
          refetchTokens();
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [jobId, user, refetchTokens]);

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
    if (!originalFile || !templateId || !user) return;
    if (tokensEnabled && balance < TOKENS_PER_VIDEO) { setShowInsufficient(true); return; }
    const tpl = VIDEO_TEMPLATES.find((t) => t.id === templateId);
    if (!tpl) return;
    setError(null);
    setStarting(true);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const fr = new FileReader();
        fr.onloadend = () => resolve((fr.result as string).split(",")[1]);
        fr.onerror = reject;
        fr.readAsDataURL(originalFile);
      });
      const { data: { session } } = await supabase.auth.getSession();
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/video-generate-start`,
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
            template: tpl.id,
            cameraPrompt: tpl.cameraPrompt,
            prompt: [
              vibe.trim(),
              selectedProduct?.name && `Product: ${selectedProduct.name}`,
              selectedProduct?.category && `Category: ${selectedProduct.category}`,
              selectedProduct?.description && `Details: ${selectedProduct.description}`,
            ].filter(Boolean).join(". ") || null,
            productId: selectedProduct?.id ?? null,
          }),
        }
      );
      const data = await resp.json();
      if (resp.status === 402 || data?.error === "insufficient_tokens") {
        setShowInsufficient(true);
        return;
      }
      if (!resp.ok) throw new Error(data?.error || `Error ${resp.status}`);
      setJobId(data.jobId);
      setStage("processing");
      refetchTokens();
    } catch (e: any) {
      toast.error(e?.message || "Could not start video");
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
        const fileName = `motion-reel-${Date.now()}.mp4`;
        await Filesystem.writeFile({ path: fileName, data: b64, directory: Directory.Cache });
        const { uri } = await Filesystem.getUri({ path: fileName, directory: Directory.Cache });
        await Share.share({ title: "Motion Reel", url: uri, dialogTitle: "Save your video" });
      } else {
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = blobUrl; a.download = `motion-reel-${Date.now()}.mp4`;
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
      const file = new File([blob], "motion-reel.mp4", { type: "video/mp4" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file] });
      } else {
        window.open(`https://wa.me/?text=${encodeURIComponent(resultUrl)}`, "_blank");
      }
    } catch {}
  };

  const reset = () => {
    setStage("pick");
    setOriginalUrl(null); setOriginalFile(null); setSelectedProduct(null);
    setTemplateId(null); setVibe(""); setJobId(null); setResultUrl(null); setError(null);
  };

  return (
    <>
      <InsufficientTokensModal open={showInsufficient} onClose={() => setShowInsufficient(false)} balance={balance} />
      <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
        <DialogContent className="max-w-full w-screen h-[100dvh] sm:max-w-md sm:h-auto sm:max-h-[90vh] p-4 overflow-y-auto rounded-none sm:rounded-lg flex flex-col gap-3">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                {stage !== "pick" && stage !== "processing" && (
                  <button
                    onClick={() => (stage === "result" ? reset() : setStage("pick"))}
                    className="text-muted-foreground hover:text-foreground"
                    aria-label="Back"
                  ><ArrowLeft className="h-4 w-4" /></button>
                )}
                <Film className="h-4 w-4 text-primary" />
                Motion Reel
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
              <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-violet-500/10 via-fuchsia-500/5 to-primary/10 p-4 text-center space-y-1">
                <Sparkles className="h-7 w-7 mx-auto text-primary" />
                <p className="text-sm font-bold">One photo. One cinematic reel.</p>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  Turn a product picture into a 5-second commercial video for Reels, Status, or TikTok.
                </p>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border/60 hover:border-primary/50 hover:bg-primary/5 p-8 transition"
              >
                <ImagePlus className="h-10 w-10 text-muted-foreground" />
                <span className="text-sm font-semibold">Tap to choose a product photo</span>
                <span className="text-[11px] text-muted-foreground">Sharp, well-lit shots work best</span>
              </button>
              <input
                ref={fileInputRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePick(f); e.target.value = ""; }}
              />
              {tokensEnabled && (
                <p className="text-center text-[11px] text-muted-foreground flex items-center justify-center gap-1">
                  <Coins className="h-3 w-3 text-amber-400" /> {TOKENS_PER_VIDEO} tokens per reel
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
              <p className="text-xs font-semibold text-muted-foreground">Pick a camera style</p>
              <div className="grid grid-cols-2 gap-2">
                {VIDEO_TEMPLATES.map((t) => {
                  const active = templateId === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTemplateId(t.id)}
                      className={`flex flex-col items-start gap-1 rounded-xl border p-3 text-left bg-gradient-to-br transition ${t.tint} ${active ? "ring-2 ring-primary" : "hover:brightness-110"}`}
                    >
                      <span className="text-2xl">{t.emoji}</span>
                      <span className="text-sm font-semibold text-foreground">{t.label}</span>
                      <span className="text-[10px] leading-snug text-muted-foreground">{t.desc}</span>
                    </button>
                  );
                })}
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-muted-foreground">Optional vibe</label>
                <Input value={vibe} onChange={(e) => setVibe(e.target.value)} placeholder="e.g. warm sunset light, matte black studio" />
              </div>
              <Button
                onClick={handleGenerate}
                disabled={!templateId || starting}
                className="w-full gap-1.5 bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white border-0"
              >
                {starting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Film className="h-4 w-4" /> Generate reel{tokensEnabled ? ` (${TOKENS_PER_VIDEO} tokens)` : ""}</>}
              </Button>
            </div>
          )}

          {stage === "processing" && (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 py-8">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-primary/20 blur-2xl animate-pulse" />
                <Loader2 className="relative h-14 w-14 animate-spin text-primary" />
              </div>
              <p className="text-sm font-semibold">Filming your reel…</p>
              <p className="text-[11px] text-muted-foreground text-center max-w-[240px]">
                This usually takes 1–3 minutes. Feel free to close this — we'll keep your reel ready in your gallery.
              </p>
              <Button variant="ghost" size="sm" onClick={onClose}>Close and come back later</Button>
            </div>
          )}

          {stage === "result" && resultUrl && (
            <div className="space-y-3">
              <div className="aspect-square rounded-xl overflow-hidden bg-black">
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