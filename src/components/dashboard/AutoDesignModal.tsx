import { useEffect, useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, RefreshCw, Download, Share2, Save, Sparkles, AlertCircle } from "lucide-react";

interface Props {
  productId: string | null;
  productName?: string;
  inspiration?: string | null;
  inspirationImage?: string | null;
  themeColor?: string | null;
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export function AutoDesignModal({ productId, productName, inspiration, inspirationImage, themeColor, open, onClose, onSaved }: Props) {
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasPhone, setHasPhone] = useState(true);
  const [saving, setSaving] = useState(false);

  const generate = useCallback(async () => {
    if (!productId) return;
    setLoading(true);
    setError(null);
    setUrl(null);
    try {
      let inspirationDataUrl: string | null = null;
      if (inspirationImage) {
        try {
          const r = await fetch(inspirationImage);
          const blob = await r.blob();
          if (blob.type.startsWith("image/")) {
            inspirationDataUrl = await new Promise<string>((resolve, reject) => {
              const fr = new FileReader();
              fr.onloadend = () => resolve(fr.result as string);
              fr.onerror = reject;
              fr.readAsDataURL(blob);
            });
          }
        } catch {
          inspirationDataUrl = null;
        }
      }
      const { data: { session } } = await supabase.auth.getSession();
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/auto-design-product`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session?.access_token}`,
            "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({
            productId,
            inspiration: inspiration || null,
            inspirationImage: inspirationDataUrl,
            themeColor: themeColor || null,
          }),
        }
      );
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.error || `Error ${resp.status}`);
      if (data?.error) throw new Error(data.error);
      setUrl(data.url);
      setHasPhone(!!data.hasPhone);
    } catch (e: any) {
      const msg = e?.message || "Failed to generate design";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [productId, inspiration, inspirationImage, themeColor]);

  useEffect(() => {
    if (open && productId) generate();
    if (!open) {
      setUrl(null);
      setError(null);
      // Release any scroll lock Radix leaves behind on iOS
      const t = setTimeout(() => {
        document.body.removeAttribute("data-scroll-locked");
        document.body.style.overflow = "";
        document.body.style.paddingRight = "";
      }, 250);
      return () => clearTimeout(t);
    }
  }, [open, productId, generate]);

  const handleDownload = async () => {
    if (!url) return;
    try {
      const r = await fetch(url);
      const blob = await r.blob();
      const blobUrl = URL.createObjectURL(blob);
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (isIOS) {
        // iOS ignores <a download> for cross-origin blobs; open in new tab so user can long-press to save
        window.open(blobUrl, "_blank");
      } else {
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = `${productName || "design"}.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
      setTimeout(() => URL.revokeObjectURL(blobUrl), 30_000);
    } catch {
      toast.error("Could not download image");
    }
  };

  const handleShare = async () => {
    if (!url) return;
    try {
      const r = await fetch(url);
      const blob = await r.blob();
      const file = new File([blob], `${productName || "design"}.png`, { type: blob.type });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], text: productName || "" });
      } else {
        window.open(`https://wa.me/?text=${encodeURIComponent(url)}`, "_blank");
      }
    } catch {
      // user cancelled
    }
  };

  const handleSave = async () => {
    if (!url || !productId) return;
    setSaving(true);
    try {
      const { data: existing } = await supabase
        .from("product_images")
        .select("position")
        .eq("product_id", productId)
        .order("position", { ascending: false })
        .limit(1);
      const nextPos = (existing?.[0]?.position ?? -1) + 1;
      const { error: insErr } = await supabase
        .from("product_images")
        .insert({ product_id: productId, image_url: url, position: nextPos });
      if (insErr) throw insErr;
      toast.success("Saved to product images");
      onSaved?.();
      onClose();
    } catch (e: any) {
      toast.error(e?.message || "Could not save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" /> Auto Design
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="aspect-square rounded-xl overflow-hidden bg-muted relative flex items-center justify-center">
            {loading && (
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-xs">Designing your premium poster…</p>
                <p className="text-[10px] opacity-60">This usually takes 10–25 seconds</p>
              </div>
            )}
            {!loading && error && (
              <div className="flex flex-col items-center gap-2 text-center p-6">
                <AlertCircle className="h-8 w-8 text-destructive" />
                <p className="text-xs text-muted-foreground">{error}</p>
              </div>
            )}
            {!loading && url && (
              <img src={url} alt="AI design" className="w-full h-full object-cover" />
            )}
          </div>

          {!loading && url && !hasPhone && (
            <p className="text-[11px] text-muted-foreground text-center">
              💡 Add a WhatsApp number in your profile to include it on designs.
            </p>
          )}

          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" className="gap-1.5" onClick={generate} disabled={loading}>
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Regenerate
            </Button>
            <Button variant="outline" className="gap-1.5" onClick={handleDownload} disabled={!url || loading}>
              <Download className="h-3.5 w-3.5" /> Download
            </Button>
            <Button variant="outline" className="gap-1.5" onClick={handleShare} disabled={!url || loading}>
              <Share2 className="h-3.5 w-3.5" /> Share
            </Button>
            <Button className="gap-1.5" onClick={handleSave} disabled={!url || loading || saving}>
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}