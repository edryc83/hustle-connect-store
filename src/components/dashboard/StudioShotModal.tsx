import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTokens } from "@/hooks/useTokens";
import { TOKENS_PER_ENHANCE } from "@/lib/tokenPackages";
import { InsufficientTokensModal } from "@/components/tokens/InsufficientTokensModal";
import { compressImage } from "@/lib/imageCompression";
import { toast } from "sonner";
import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import {
  ImagePlus, Sparkles, Loader2, Download, Share2, RefreshCw,
  ArrowLeft, Coins, Wand2,
} from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

type Stage = "pick" | "preview" | "result";

export function StudioShotModal({ open, onClose }: Props) {
  const { user } = useAuth();
  const { balance, enabled: tokensEnabled, refetch: refetchTokens } = useTokens();

  const [stage, setStage] = useState<Stage>("pick");
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [enhancing, setEnhancing] = useState(false);
  const [showInsufficient, setShowInsufficient] = useState(false);
  const [compare, setCompare] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      setStage("pick");
      setOriginalUrl(null);
      setOriginalFile(null);
      setResultUrl(null);
      setEnhancing(false);
      setCompare(false);
    }
  }, [open]);

  const handlePick = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image");
      return;
    }
    try {
      const compressed = await compressImage(file, { maxSizeMB: 1.5, maxWidthOrHeight: 1600 });
      setOriginalFile(compressed);
      setOriginalUrl(URL.createObjectURL(compressed));
      setStage("preview");
    } catch {
      toast.error("Could not read that image");
    }
  };

  const handleEnhance = async () => {
    if (!originalFile || !user) return;
    if (tokensEnabled && balance < TOKENS_PER_ENHANCE) {
      setShowInsufficient(true);
      return;
    }
    setEnhancing(true);
    setResultUrl(null);
    try {
      // Read file as base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const fr = new FileReader();
        fr.onloadend = () => resolve((fr.result as string).split(",")[1]);
        fr.onerror = reject;
        fr.readAsDataURL(originalFile);
      });

      const { data: { session } } = await supabase.auth.getSession();
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/enhance-photo`,
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
            mode: "product",
          }),
        }
      );
      const data = await resp.json();
      if (resp.status === 402 || data?.error === "insufficient_tokens") {
        setShowInsufficient(true);
        return;
      }
      if (!resp.ok) throw new Error(data?.error || `Error ${resp.status}`);
      setResultUrl(data.url);
      setStage("result");
      refetchTokens();
    } catch (e: any) {
      toast.error(e?.message || "Could not enhance the photo");
    } finally {
      setEnhancing(false);
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
        const fileName = `studio-shot-${Date.now()}.png`;
        await Filesystem.writeFile({ path: fileName, data: b64, directory: Directory.Cache });
        const { uri } = await Filesystem.getUri({ path: fileName, directory: Directory.Cache });
        await Share.share({ title: "Studio Shot", url: uri, dialogTitle: "Save your studio shot" });
      } else {
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = `studio-shot-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(blobUrl), 30_000);
      }
    } catch (e: any) {
      if (e?.message?.toLowerCase().includes("cancel")) return;
      toast.error("Download failed");
    }
  };

  const handleShare = async () => {
    if (!resultUrl) return;
    try {
      const r = await fetch(resultUrl);
      const blob = await r.blob();
      const file = new File([blob], "studio-shot.png", { type: blob.type });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file] });
      } else {
        window.open(`https://wa.me/?text=${encodeURIComponent(resultUrl)}`, "_blank");
      }
    } catch {}
  };

  const reset = () => {
    setStage("pick");
    setOriginalUrl(null);
    setOriginalFile(null);
    setResultUrl(null);
    setCompare(false);
  };

  return (
    <>
      <InsufficientTokensModal
        open={showInsufficient}
        onClose={() => setShowInsufficient(false)}
        balance={balance}
      />
      <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
        <DialogContent className="max-w-full w-screen h-[100dvh] sm:max-w-md sm:h-auto sm:max-h-[90vh] p-4 overflow-y-auto rounded-none sm:rounded-lg flex flex-col gap-3">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                {stage !== "pick" && (
                  <button
                    onClick={() => (stage === "result" ? reset() : setStage("pick"))}
                    className="text-muted-foreground hover:text-foreground"
                    aria-label="Back"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                )}
                <Sparkles className="h-4 w-4 text-primary" />
                Studio Shot
              </span>
              {tokensEnabled && (
                <span className="flex items-center gap-1 text-xs font-normal text-muted-foreground">
                  <Coins className="h-3.5 w-3.5 text-amber-400" /> {balance}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>

          {/* STAGE 1 — PICK */}
          {stage === "pick" && (
            <div className="space-y-4 flex-1 content-center">
              <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-fuchsia-500/5 to-violet-500/10 p-4 text-center space-y-1">
                <Wand2 className="h-7 w-7 mx-auto text-primary" />
                <p className="text-sm font-bold">Phone photo in. Studio shot out.</p>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  Cleans noise, fixes lighting, sharpens detail, polishes the background — keeps your product exactly as it is.
                </p>
              </div>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border/60 hover:border-primary/50 hover:bg-primary/5 p-8 transition"
              >
                <ImagePlus className="h-10 w-10 text-muted-foreground" />
                <span className="text-sm font-semibold">Tap to choose a photo</span>
                <span className="text-[11px] text-muted-foreground">JPG, PNG or WebP</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handlePick(f);
                  e.target.value = "";
                }}
              />

              <p className="text-center text-[11px] text-muted-foreground flex items-center justify-center gap-1">
                <Coins className="h-3 w-3 text-amber-400" />
                {TOKENS_PER_ENHANCE} tokens per photo
              </p>
            </div>
          )}

          {/* STAGE 2 — PREVIEW */}
          {stage === "preview" && originalUrl && (
            <div className="space-y-3">
              <div className="aspect-square rounded-xl overflow-hidden bg-muted relative">
                <img src={originalUrl} alt="Original" className="w-full h-full object-cover" />
                {enhancing && (
                  <div className="absolute inset-0 bg-background/70 backdrop-blur-sm flex flex-col items-center justify-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-xs font-medium">Polishing your shot…</p>
                    <p className="text-[10px] text-muted-foreground">This takes 10–20 seconds</p>
                  </div>
                )}
              </div>
              <Button
                onClick={handleEnhance}
                disabled={enhancing}
                className="w-full gap-1.5 bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white border-0"
              >
                {enhancing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Enhance ({TOKENS_PER_ENHANCE} tokens)
                  </>
                )}
              </Button>
              {!enhancing && (
                <Button variant="outline" className="w-full" onClick={() => setStage("pick")}>
                  Choose a different photo
                </Button>
              )}
            </div>
          )}

          {/* STAGE 3 — RESULT */}
          {stage === "result" && resultUrl && originalUrl && (
            <div className="space-y-3">
              <div
                className="aspect-square rounded-xl overflow-hidden bg-muted relative select-none touch-none cursor-pointer"
                onPointerDown={(e) => { (e.target as Element).setPointerCapture?.(e.pointerId); setCompare(true); }}
                onPointerUp={() => setCompare(false)}
                onPointerCancel={() => setCompare(false)}
                onPointerLeave={() => setCompare(false)}
              >
                {/* After (base) */}
                <img src={resultUrl} alt="Enhanced" className="absolute inset-0 w-full h-full object-cover" draggable={false} />
                {/* Before (overlay while pressed) */}
                <img
                  src={originalUrl}
                  alt="Original"
                  draggable={false}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-150 ${compare ? "opacity-100" : "opacity-0"}`}
                />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold pointer-events-none">
                  {compare ? "Before" : "After"}
                </span>
                <span
                  className={`absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-background/85 backdrop-blur text-[10px] font-semibold border border-border/60 pointer-events-none transition-opacity ${compare ? "opacity-0" : "opacity-100"}`}
                >
                  Press &amp; hold to see original
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" onClick={handleEnhance} disabled={enhancing} className="gap-1.5">
                  <RefreshCw className="h-3.5 w-3.5" /> Redo
                </Button>
                <Button variant="outline" onClick={handleDownload} className="gap-1.5">
                  <Download className="h-3.5 w-3.5" /> Save
                </Button>
                <Button onClick={handleShare} className="gap-1.5">
                  <Share2 className="h-3.5 w-3.5" /> Share
                </Button>
              </div>
              <Button variant="ghost" size="sm" className="w-full" onClick={reset}>
                Clean another photo
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
