import { useState, useRef, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Download, Loader2, Sparkles, Copy, Share2, Check } from "lucide-react";
import { toast } from "sonner";

type TemplateId = 1 | 2 | 3;

interface Product {
  id: string;
  name: string;
  image_url: string | null;
}

interface ShareCardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  storeName: string;
  storeSlug: string;
  profilePicUrl: string;
  category: string;
  products: Product[];
}

const TEMPLATE_LABELS: Record<TemplateId, { name: string; desc: string }> = {
  1: { name: "Clean", desc: "White & minimal" },
  2: { name: "Bold", desc: "Orange energy" },
  3: { name: "Product", desc: "Feature an item" },
};

export function ShareCardModal({
  open, onOpenChange, storeName, storeSlug, profilePicUrl, category, products,
}: ShareCardModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>(1);
  const [selectedProductImage, setSelectedProductImage] = useState<string | null>(null);
  const [cardMessage, setCardMessage] = useState("");
  const [generatingMsg, setGeneratingMsg] = useState(false);
  const [cardGenerated, setCardGenerated] = useState(false);
  const [captionCopied, setCaptionCopied] = useState(false);

  const storeUrl = `afristall.com/${storeSlug}`;
  const caption = `🛍️ Visit my store for ${category || "amazing products"} → ${storeUrl}`;

  useEffect(() => {
    if (open) {
      setCardGenerated(false);
      setCardMessage("");
      setSelectedProductImage(null);
    }
  }, [open]);

  useEffect(() => {
    setCardGenerated(false);
  }, [selectedTemplate]);

  // Set default product image when switching to template 3
  useEffect(() => {
    if (selectedTemplate === 3 && !selectedProductImage && products.length > 0) {
      const first = products.find(p => p.image_url);
      if (first) setSelectedProductImage(first.image_url);
    }
  }, [selectedTemplate, products, selectedProductImage]);

  const generateAIMessage = async () => {
    setGeneratingMsg(true);
    try {
      const res = await supabase.functions.invoke("generate-card-message", {
        body: { storeName },
      });
      if (res.error) throw res.error;
      const msg = res.data?.message;
      if (msg) { setCardMessage(msg); setCardGenerated(false); }
    } catch {
      toast.error("Failed to generate message");
    }
    setGeneratingMsg(false);
  };

  const loadImage = (src: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });

  const drawCircularImage = (
    ctx: CanvasRenderingContext2D, img: HTMLImageElement,
    cx: number, cy: number, radius: number, borderWidth = 0, borderColor = "#fff"
  ) => {
    if (borderWidth > 0) {
      ctx.beginPath();
      ctx.arc(cx, cy, radius + borderWidth, 0, Math.PI * 2);
      ctx.fillStyle = borderColor;
      ctx.fill();
    }
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.clip();
    const scale = Math.max((radius * 2) / img.width, (radius * 2) / img.height);
    const sw = img.width * scale;
    const sh = img.height * scale;
    ctx.drawImage(img, cx - sw / 2, cy - sh / 2, sw, sh);
    ctx.restore();
  };

  const drawCircularPlaceholder = (
    ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number,
    letter: string, bgColor: string, textColor: string, borderWidth = 0, borderColor = "#fff"
  ) => {
    if (borderWidth > 0) {
      ctx.beginPath();
      ctx.arc(cx, cy, radius + borderWidth, 0, Math.PI * 2);
      ctx.fillStyle = borderColor;
      ctx.fill();
    }
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = bgColor;
    ctx.fill();
    ctx.fillStyle = textColor;
    ctx.font = `bold ${radius}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(letter, cx, cy);
  };

  const wrapText = (
    ctx: CanvasRenderingContext2D, text: string,
    x: number, y: number, maxWidth: number, lineHeight: number
  ) => {
    const words = text.split(" ");
    let line = "";
    let currentY = y;
    for (const word of words) {
      const test = line + (line ? " " : "") + word;
      if (ctx.measureText(test).width > maxWidth && line) {
        ctx.fillText(line, x, currentY);
        line = word;
        currentY += lineHeight;
      } else {
        line = test;
      }
    }
    if (line) ctx.fillText(line, x, currentY);
    return currentY;
  };

  const generateCard = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = 1080;
    const H = 1920;
    canvas.width = W;
    canvas.height = H;

    let profileImg: HTMLImageElement | null = null;
    if (profilePicUrl) {
      try { profileImg = await loadImage(profilePicUrl); } catch {}
    }

    const msg = cardMessage || "Click the link below to visit my shop! 👇";
    const displayName = storeName || "My Store";
    const letter = (displayName)[0].toUpperCase();

    if (selectedTemplate === 1) {
      // ---- TEMPLATE 1: Clean White ----
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, W, H);

      // Profile pic
      const picRadius = 120;
      const picY = 480;
      if (profileImg) {
        drawCircularImage(ctx, profileImg, W / 2, picY, picRadius, 6, "#f3f4f6");
      } else {
        drawCircularPlaceholder(ctx, W / 2, picY, picRadius, letter, "#f3f4f6", "#9ca3af", 6, "#e5e7eb");
      }

      // Store name
      ctx.fillStyle = "#111827";
      ctx.font = "bold 64px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(displayName, W / 2, picY + picRadius + 80);

      // Category pill
      if (category) {
        const pillY = picY + picRadius + 140;
        ctx.font = "bold 32px system-ui, sans-serif";
        const pillW = ctx.measureText(category).width + 60;
        ctx.beginPath();
        ctx.roundRect((W - pillW) / 2, pillY - 22, pillW, 52, 26);
        ctx.fillStyle = "#FFF3ED";
        ctx.fill();
        ctx.fillStyle = "#FF6B35";
        ctx.fillText(category, W / 2, pillY + 4);
      }

      // Card message
      const msgY = picY + picRadius + 240;
      ctx.fillStyle = "#6b7280";
      ctx.font = "32px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      wrapText(ctx, msg, W / 2, msgY, W - 160, 46);

      // Orange bottom bar
      const barH = 140;
      const grad = ctx.createLinearGradient(0, H - barH, W, H);
      grad.addColorStop(0, "#FF6B35");
      grad.addColorStop(1, "#FF8F5E");
      ctx.fillStyle = grad;
      ctx.fillRect(0, H - barH, W, barH);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 36px system-ui, sans-serif";
      ctx.textBaseline = "middle";
      ctx.fillText(storeUrl, W / 2, H - barH / 2);

    } else if (selectedTemplate === 2) {
      // ---- TEMPLATE 2: Bold Orange ----
      ctx.fillStyle = "#FF6B35";
      ctx.fillRect(0, 0, W, H);

      // Profile pic with white border
      const picRadius = 110;
      const picY = 520;
      if (profileImg) {
        drawCircularImage(ctx, profileImg, W / 2, picY, picRadius, 8, "#ffffff");
      } else {
        drawCircularPlaceholder(ctx, W / 2, picY, picRadius, letter, "#ffffff", "#FF6B35", 8, "#ffffff");
      }

      // SHOP NOW 🔥
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 80px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("SHOP NOW 🔥", W / 2, picY + picRadius + 100);

      // Store name
      ctx.font = "44px system-ui, sans-serif";
      ctx.fillText(displayName, W / 2, picY + picRadius + 180);

      // Card message
      ctx.font = "30px system-ui, sans-serif";
      ctx.globalAlpha = 0.9;
      ctx.textBaseline = "top";
      wrapText(ctx, msg, W / 2, picY + picRadius + 240, W - 160, 44);
      ctx.globalAlpha = 1;

      // URL at bottom
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 34px system-ui, sans-serif";
      ctx.textBaseline = "middle";
      ctx.fillText(storeUrl, W / 2, H - 120);

      // Powered by
      ctx.globalAlpha = 0.7;
      ctx.font = "22px system-ui, sans-serif";
      ctx.fillText("Powered by Afristall", W / 2, H - 60);
      ctx.globalAlpha = 1;

    } else {
      // ---- TEMPLATE 3: Product Focus ----
      ctx.fillStyle = "#1a1a2e";
      ctx.fillRect(0, 0, W, H);

      // Product image fills top 60%
      const productH = Math.round(H * 0.6);
      if (selectedProductImage) {
        try {
          const prodImg = await loadImage(selectedProductImage);
          const scale = Math.max(W / prodImg.width, productH / prodImg.height);
          const sw = prodImg.width * scale;
          const sh = prodImg.height * scale;
          ctx.drawImage(prodImg, (W - sw) / 2, (productH - sh) / 2, sw, sh);
        } catch {
          ctx.fillStyle = "#2a2a3e";
          ctx.fillRect(0, 0, W, productH);
          ctx.fillStyle = "#6b7280";
          ctx.font = "bold 40px system-ui, sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("No product image", W / 2, productH / 2);
        }
      }

      // Dark gradient overlay bottom 40%
      const gradStart = productH - 200;
      const grad = ctx.createLinearGradient(0, gradStart, 0, H);
      grad.addColorStop(0, "rgba(0,0,0,0)");
      grad.addColorStop(0.3, "rgba(0,0,0,0.7)");
      grad.addColorStop(1, "rgba(0,0,0,0.95)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, gradStart, W, H - gradStart);

      // Profile pic small circle bottom-left
      const smallRadius = 48;
      const ppX = 80 + smallRadius;
      const ppY = H - 260;
      if (profileImg) {
        drawCircularImage(ctx, profileImg, ppX, ppY, smallRadius, 4, "#ffffff");
      } else {
        drawCircularPlaceholder(ctx, ppX, ppY, smallRadius, letter, "#374151", "#d1d5db", 4, "#ffffff");
      }

      // Store name next to pic
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 40px system-ui, sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(displayName, ppX + smallRadius + 24, ppY - 10);

      // Category below name
      if (category) {
        ctx.font = "28px system-ui, sans-serif";
        ctx.globalAlpha = 0.7;
        ctx.fillText(category, ppX + smallRadius + 24, ppY + 30);
        ctx.globalAlpha = 1;
      }

      // Card message
      ctx.fillStyle = "#ffffff";
      ctx.font = "30px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.globalAlpha = 0.9;
      wrapText(ctx, msg, W / 2, H - 160, W - 120, 42);
      ctx.globalAlpha = 1;

      // URL at bottom
      ctx.fillStyle = "#FF6B35";
      ctx.font = "bold 32px system-ui, sans-serif";
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";
      ctx.fillText(storeUrl, W / 2, H - 50);
    }

    setCardGenerated(true);
  }, [profilePicUrl, storeName, storeSlug, category, cardMessage, selectedTemplate, selectedProductImage]);

  const downloadOrShare = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], `${storeSlug}-card.png`, { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: storeName, text: caption });
        } catch { /* cancelled */ }
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${storeSlug}-card.png`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Card downloaded!");
      }
    }, "image/png");
  };

  const copyCaption = async () => {
    await navigator.clipboard.writeText(caption);
    setCaptionCopied(true);
    toast.success("Caption copied!");
    setTimeout(() => setCaptionCopied(false), 2000);
  };

  const productsWithImages = products.filter(p => p.image_url);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Share Card</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Template selector */}
          <div>
            <Label className="text-xs">Choose Template</Label>
            <div className="grid grid-cols-3 gap-2 mt-1.5">
              {([1, 2, 3] as TemplateId[]).map((id) => (
                <button
                  key={id}
                  onClick={() => setSelectedTemplate(id)}
                  className={`rounded-xl border-2 p-3 text-center transition-all ${
                    selectedTemplate === id
                      ? "border-primary bg-primary/10 shadow-sm"
                      : "border-border/50 bg-card/60 hover:border-primary/30"
                  }`}
                >
                  <div className={`mx-auto mb-1.5 h-8 w-8 rounded-lg ${
                    id === 1 ? "bg-white border border-border" :
                    id === 2 ? "bg-[#FF6B35]" :
                    "bg-gradient-to-b from-muted to-foreground/80"
                  }`} />
                  <div className="text-xs font-semibold">{TEMPLATE_LABELS[id].name}</div>
                  <div className="text-[10px] text-muted-foreground">{TEMPLATE_LABELS[id].desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Product picker for template 3 */}
          {selectedTemplate === 3 && productsWithImages.length > 0 && (
            <div>
              <Label className="text-xs">Select Product Image</Label>
              <div className="grid grid-cols-4 gap-2 mt-1.5">
                {productsWithImages.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => { setSelectedProductImage(p.image_url); setCardGenerated(false); }}
                    className={`rounded-lg border-2 overflow-hidden aspect-square ${
                      selectedProductImage === p.image_url
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-border/50"
                    }`}
                  >
                    <img src={p.image_url!} alt={p.name} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <Label className="text-xs">Card Message</Label>
              <Button
                variant="ghost" size="sm"
                className="h-6 gap-1 text-xs text-primary"
                onClick={generateAIMessage}
                disabled={generatingMsg}
              >
                {generatingMsg ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                AI Generate
              </Button>
            </div>
            <Input
              value={cardMessage}
              onChange={(e) => { setCardMessage(e.target.value); setCardGenerated(false); }}
              placeholder="e.g. Visit my shop for amazing deals! 🛍️"
              maxLength={120}
            />
          </div>

          {/* Canvas preview */}
          <canvas
            ref={canvasRef}
            className="w-full rounded-xl border border-border/50 bg-muted/30"
            style={{ aspectRatio: "9/16" }}
          />

          {/* Generate / Download */}
          {!cardGenerated ? (
            <Button onClick={generateCard} className="w-full rounded-xl gap-2">
              Generate Card
            </Button>
          ) : (
            <Button onClick={downloadOrShare} className="w-full rounded-xl gap-2">
              {typeof navigator !== "undefined" && navigator.canShare ? (
                <><Share2 className="h-4 w-4" /> Share Card</>
              ) : (
                <><Download className="h-4 w-4" /> Download Card</>
              )}
            </Button>
          )}

          {/* Caption section */}
          {cardGenerated && (
            <div className="rounded-xl border border-border/50 bg-muted/30 p-3 space-y-2">
              <Label className="text-xs text-muted-foreground">Copy Caption</Label>
              <p className="text-sm">{caption}</p>
              <Button
                variant="outline" size="sm"
                className="w-full rounded-xl gap-1.5"
                onClick={copyCaption}
              >
                {captionCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {captionCopied ? "Copied!" : "Copy Caption"}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
