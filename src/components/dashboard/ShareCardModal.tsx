import { useState, useRef, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Share2, Download, Loader2, Camera, Sparkles, Sun, Moon } from "lucide-react";
import { toast } from "sonner";

type CardTheme = "light" | "dark";

const themes = {
  light: {
    bg: "#ffffff",
    accentFrom: "#FF6B35",
    accentTo: "#FF8F5E",
    name: "#111827",
    msg: "#6b7280",
    pillBg: "#FFF3ED",
    pillText: "#FF6B35",
    branding: "#d1d5db",
    placeholderBg: "#f3f4f6",
    placeholderText: "#9ca3af",
  },
  dark: {
    bg: "#1a1a2e",
    accentFrom: "#FF6B35",
    accentTo: "#FF8F5E",
    name: "#f9fafb",
    msg: "#9ca3af",
    pillBg: "#FF6B3522",
    pillText: "#FF8F5E",
    branding: "#4b5563",
    placeholderBg: "#2a2a3e",
    placeholderText: "#6b7280",
  },
};

interface ShareCardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  storeName: string;
  storeSlug: string;
  profilePicUrl: string;
}

export function ShareCardModal({ open, onOpenChange, storeName, storeSlug, profilePicUrl }: ShareCardModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cardGenerated, setCardGenerated] = useState(false);
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [cardMessage, setCardMessage] = useState("");
  const [generatingMsg, setGeneratingMsg] = useState(false);
  const [cardTheme, setCardTheme] = useState<CardTheme>("light");

  useEffect(() => {
    if (open) {
      setCardGenerated(false);
      setCustomImage(null);
      setCardMessage("");
    }
  }, [open]);

  const generateAIMessage = async () => {
    setGeneratingMsg(true);
    try {
      const res = await supabase.functions.invoke("generate-card-message", {
        body: { storeName },
      });
      if (res.error) throw res.error;
      const msg = res.data?.message;
      if (msg) setCardMessage(msg);
    } catch {
      toast.error("Failed to generate message");
    }
    setGeneratingMsg(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB"); return; }
    const reader = new FileReader();
    reader.onload = () => setCustomImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const imageToUse = customImage || profilePicUrl;
  const storeUrl = `afristall.com/${storeSlug}`;

  const generateCard = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = 720;
    const H = 1280;
    canvas.width = W;
    canvas.height = H;
    const t = themes[cardTheme];

    // Background
    if (cardTheme === "dark") {
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, "#1a1a2e");
      grad.addColorStop(1, "#16213e");
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = t.bg;
    }
    ctx.fillRect(0, 0, W, H);

    // Top accent bar
    const topGrad = ctx.createLinearGradient(0, 0, W, 0);
    topGrad.addColorStop(0, t.accentFrom);
    topGrad.addColorStop(1, t.accentTo);
    ctx.fillStyle = topGrad;
    ctx.fillRect(0, 0, W, 6);

    const drawContent = (img?: HTMLImageElement) => {
      const imgSize = 200;
      const imgY = 180;
      const imgX = (W - imgSize) / 2;

      // Rounded rect clip for image
      const radius = 24;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(imgX + radius, imgY);
      ctx.lineTo(imgX + imgSize - radius, imgY);
      ctx.quadraticCurveTo(imgX + imgSize, imgY, imgX + imgSize, imgY + radius);
      ctx.lineTo(imgX + imgSize, imgY + imgSize - radius);
      ctx.quadraticCurveTo(imgX + imgSize, imgY + imgSize, imgX + imgSize - radius, imgY + imgSize);
      ctx.lineTo(imgX + radius, imgY + imgSize);
      ctx.quadraticCurveTo(imgX, imgY + imgSize, imgX, imgY + imgSize - radius);
      ctx.lineTo(imgX, imgY + radius);
      ctx.quadraticCurveTo(imgX, imgY, imgX + radius, imgY);
      ctx.closePath();
      ctx.clip();

      if (img) {
        const scale = Math.max(imgSize / img.width, imgSize / img.height);
        const sw = img.width * scale;
        const sh = img.height * scale;
        ctx.drawImage(img, imgX - (sw - imgSize) / 2, imgY - (sh - imgSize) / 2, sw, sh);
      } else {
        ctx.fillStyle = t.placeholderBg;
        ctx.fillRect(imgX, imgY, imgSize, imgSize);
        ctx.fillStyle = t.placeholderText;
        ctx.font = "bold 72px system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText((storeName || "S")[0].toUpperCase(), W / 2, imgY + imgSize / 2 + 24);
      }
      ctx.restore();

      ctx.shadowColor = "transparent";

      // Store name
      const nameY = imgY + imgSize + 60;
      ctx.fillStyle = t.name;
      ctx.font = "bold 44px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(storeName || "My Store", W / 2, nameY);

      // Card message
      const msgY = nameY + 50;
      ctx.fillStyle = t.msg;
      ctx.font = "28px system-ui, sans-serif";
      const msg = cardMessage || "Click the link below to visit my shop! 👇";
      const words = msg.split(" ");
      let line = "";
      let lineY = msgY;
      for (const word of words) {
        const test = line + (line ? " " : "") + word;
        if (ctx.measureText(test).width > W - 120) {
          ctx.fillText(line, W / 2, lineY);
          line = word;
          lineY += 38;
        } else {
          line = test;
        }
      }
      if (line) ctx.fillText(line, W / 2, lineY);

      // URL pill
      const urlY = lineY + 70;
      ctx.font = "bold 26px system-ui, sans-serif";
      const urlWidth = ctx.measureText(storeUrl).width + 48;
      const pillX = (W - urlWidth) / 2;
      const pillH = 48;

      ctx.fillStyle = t.pillBg;
      ctx.beginPath();
      ctx.roundRect(pillX, urlY - 30, urlWidth, pillH, 24);
      ctx.fill();

      ctx.fillStyle = t.pillText;
      ctx.fillText(storeUrl, W / 2, urlY);

      // Branding
      ctx.fillStyle = t.branding;
      ctx.font = "20px system-ui, sans-serif";
      ctx.fillText("Powered by Afristall", W / 2, H - 60);

      setCardGenerated(true);
    };

    if (imageToUse) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => drawContent(img);
      img.onerror = () => drawContent();
      img.src = imageToUse;
    } else {
      drawContent();
    }
  }, [imageToUse, storeName, storeSlug, cardMessage, cardTheme]);

  const shareOrDownload = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], `${storeSlug}-store-card.png`, { type: "image/png" });

      if (navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: storeName,
            text: cardMessage || `Check out ${storeName} on Afristall! ${window.location.origin}/${storeSlug}`,
          });
        } catch { /* cancelled */ }
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${storeSlug}-store-card.png`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Card downloaded!");
      }
    }, "image/png");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Create Status Card</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Theme toggle */}
          <div>
            <Label className="text-xs">Card Style</Label>
            <div className="flex gap-2 mt-1.5">
              <Button
                variant={cardTheme === "light" ? "default" : "outline"}
                size="sm"
                className="rounded-xl gap-1.5 flex-1"
                onClick={() => { setCardTheme("light"); setCardGenerated(false); }}
              >
                <Sun className="h-3.5 w-3.5" /> Light
              </Button>
              <Button
                variant={cardTheme === "dark" ? "default" : "outline"}
                size="sm"
                className="rounded-xl gap-1.5 flex-1"
                onClick={() => { setCardTheme("dark"); setCardGenerated(false); }}
              >
                <Moon className="h-3.5 w-3.5" /> Dark
              </Button>
            </div>
          </div>

          {/* Image selector */}
          <div>
            <Label className="text-xs">Card Image</Label>
            <div className="flex items-center gap-3 mt-1.5">
              <div className="relative h-14 w-14 rounded-xl overflow-hidden border border-border bg-muted shrink-0">
                {imageToUse ? (
                  <img src={imageToUse} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground text-lg font-bold">
                    {(storeName || "S")[0]}
                  </div>
                )}
              </div>
              <label className="cursor-pointer">
                <Button variant="outline" size="sm" className="gap-1.5 pointer-events-none rounded-xl">
                  <Camera className="h-3.5 w-3.5" /> Change Image
                </Button>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            </div>
          </div>

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
              onChange={(e) => setCardMessage(e.target.value)}
              placeholder="e.g. Visit my shop for amazing deals! 🛍️"
              maxLength={100}
            />
          </div>

          {/* Canvas preview */}
          <canvas
            ref={canvasRef}
            className="w-full rounded-xl border border-border/50 bg-muted/30"
            style={{ aspectRatio: "9/16" }}
          />

          {!cardGenerated ? (
            <Button onClick={generateCard} className="w-full rounded-xl gap-2">
              Generate Card
            </Button>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Button onClick={generateCard} variant="outline" className="rounded-xl">
                Regenerate
              </Button>
              <Button onClick={shareOrDownload} className="rounded-xl gap-2">
                {typeof navigator !== "undefined" && navigator.canShare ? (
                  <><Share2 className="h-4 w-4" /> Share</>
                ) : (
                  <><Download className="h-4 w-4" /> Download</>
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
