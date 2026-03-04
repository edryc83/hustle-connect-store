import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Loader2, Sparkles, Copy, Share2, Check, Palette, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

type TemplateId = 1 | 2 | 3 | 4;

interface Product {
  id: string;
  name: string;
  image_url: string | null;
}

const TEMPLATE_LABELS: Record<TemplateId, { name: string; desc: string; emoji: string }> = {
  1: { name: "Clean", desc: "White & minimal", emoji: "🤍" },
  2: { name: "Bold", desc: "Orange energy", emoji: "🔥" },
  3: { name: "Product", desc: "Feature an item", emoji: "📸" },
  4: { name: "Collage", desc: "Show multiple items", emoji: "🎨" },
};

const DashboardShareCard = () => {
  const { user } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [storeName, setStoreName] = useState("");
  const [storeSlug, setStoreSlug] = useState("");
  const [profilePicUrl, setProfilePicUrl] = useState("");
  const [category, setCategory] = useState("");
  const [products, setProducts] = useState<Product[]>([]);

  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId | null>(null);
  const [selectedProductImage, setSelectedProductImage] = useState<string | null>(null);
  const [headline, setHeadline] = useState("SHOP NOW 🔥");
  const [subtitle, setSubtitle] = useState("");
  const [generatingMsg, setGeneratingMsg] = useState(false);
  const [captionCopied, setCaptionCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  const storeUrl = `afristall.com/${storeSlug}`;
  const caption = `🛍️ Visit my store for ${category || "amazing products"} → ${storeUrl}`;

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
      setCategory(p?.category ?? "");
      const prods = (productsData ?? []).map((pr: any) => ({ id: pr.id, name: pr.name, image_url: pr.image_url }));
      setProducts(prods);
      setSubtitle(`Check out our ${p?.category || "amazing products"}! 🛍️`);
      const firstWithImage = prods.find((pr: Product) => pr.image_url);
      if (firstWithImage) setSelectedProductImage(firstWithImage.image_url);
      setLoading(false);
    };
    fetchData();
  }, [user]);

  useEffect(() => {
    if (selectedTemplate === 3 && !selectedProductImage) {
      const first = products.find(p => p.image_url);
      if (first) setSelectedProductImage(first.image_url);
    }
  }, [selectedTemplate, products, selectedProductImage]);

  const generateAIText = async () => {
    setGeneratingMsg(true);
    try {
      const res = await supabase.functions.invoke("generate-card-message", {
        body: { storeName },
      });
      if (res.error) throw res.error;
      const msg = res.data?.message;
      if (msg) setSubtitle(msg);
    } catch {
      toast.error("Failed to generate text");
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

  const renderCanvas = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || loading || !selectedTemplate) return;
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

    const displayName = storeName || "My Store";
    const letter = displayName[0].toUpperCase();

    if (selectedTemplate === 1) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, W, H);
      const picRadius = 120;
      const picY = 480;
      if (profileImg) drawCircularImage(ctx, profileImg, W / 2, picY, picRadius, 6, "#f3f4f6");
      else drawCircularPlaceholder(ctx, W / 2, picY, picRadius, letter, "#f3f4f6", "#9ca3af", 6, "#e5e7eb");

      ctx.fillStyle = "#111827";
      ctx.font = "bold 64px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(displayName, W / 2, picY + picRadius + 80);

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

      ctx.fillStyle = "#111827";
      ctx.font = "bold 52px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      wrapText(ctx, headline, W / 2, picY + picRadius + 220, W - 160, 64);

      ctx.fillStyle = "#6b7280";
      ctx.font = "32px system-ui, sans-serif";
      wrapText(ctx, subtitle, W / 2, picY + picRadius + 340, W - 160, 46);

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
      ctx.fillStyle = "#FF6B35";
      ctx.fillRect(0, 0, W, H);
      const picRadius = 110;
      const picY = 520;
      if (profileImg) drawCircularImage(ctx, profileImg, W / 2, picY, picRadius, 8, "#ffffff");
      else drawCircularPlaceholder(ctx, W / 2, picY, picRadius, letter, "#ffffff", "#FF6B35", 8, "#ffffff");

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 80px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(headline, W / 2, picY + picRadius + 100);
      ctx.font = "44px system-ui, sans-serif";
      ctx.fillText(displayName, W / 2, picY + picRadius + 180);
      ctx.font = "30px system-ui, sans-serif";
      ctx.globalAlpha = 0.9;
      ctx.textBaseline = "top";
      wrapText(ctx, subtitle, W / 2, picY + picRadius + 240, W - 160, 44);
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 34px system-ui, sans-serif";
      ctx.textBaseline = "middle";
      ctx.fillText(storeUrl, W / 2, H - 120);
      ctx.globalAlpha = 0.7;
      ctx.font = "22px system-ui, sans-serif";
      ctx.fillText("Powered by Afristall", W / 2, H - 60);
      ctx.globalAlpha = 1;

    } else if (selectedTemplate === 3) {
      ctx.fillStyle = "#1a1a2e";
      ctx.fillRect(0, 0, W, H);
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
      const gradStart = productH - 200;
      const grad = ctx.createLinearGradient(0, gradStart, 0, H);
      grad.addColorStop(0, "rgba(0,0,0,0)");
      grad.addColorStop(0.3, "rgba(0,0,0,0.7)");
      grad.addColorStop(1, "rgba(0,0,0,0.95)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, gradStart, W, H - gradStart);

      const smallRadius = 48;
      const ppX = 80 + smallRadius;
      const ppY = H - 300;
      if (profileImg) drawCircularImage(ctx, profileImg, ppX, ppY, smallRadius, 4, "#ffffff");
      else drawCircularPlaceholder(ctx, ppX, ppY, smallRadius, letter, "#374151", "#d1d5db", 4, "#ffffff");

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 40px system-ui, sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(displayName, ppX + smallRadius + 24, ppY - 10);
      if (category) {
        ctx.font = "28px system-ui, sans-serif";
        ctx.globalAlpha = 0.7;
        ctx.fillText(category, ppX + smallRadius + 24, ppY + 30);
        ctx.globalAlpha = 1;
      }

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 44px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      wrapText(ctx, headline, W / 2, H - 200, W - 120, 54);
      ctx.font = "30px system-ui, sans-serif";
      ctx.globalAlpha = 0.9;
      wrapText(ctx, subtitle, W / 2, H - 130, W - 120, 42);
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#FF6B35";
      ctx.font = "bold 32px system-ui, sans-serif";
      ctx.textBaseline = "middle";
      ctx.fillText(storeUrl, W / 2, H - 50);

    } else {
      // ---- TEMPLATE 4: Collage ----
      ctx.fillStyle = "#faf9f7";
      ctx.fillRect(0, 0, W, H);

      // Header area with profile + store name
      const headerH = 280;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, W, headerH);
      // Bottom border
      ctx.fillStyle = "#f3f4f6";
      ctx.fillRect(0, headerH - 2, W, 2);

      const hPicRadius = 50;
      const hPicX = 80 + hPicRadius;
      const hPicY = headerH / 2;
      if (profileImg) drawCircularImage(ctx, profileImg, hPicX, hPicY, hPicRadius, 4, "#f3f4f6");
      else drawCircularPlaceholder(ctx, hPicX, hPicY, hPicRadius, letter, "#f3f4f6", "#9ca3af", 4, "#e5e7eb");

      ctx.fillStyle = "#111827";
      ctx.font = "bold 44px system-ui, sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(displayName, hPicX + hPicRadius + 28, hPicY - 14);
      if (category) {
        ctx.fillStyle = "#FF6B35";
        ctx.font = "26px system-ui, sans-serif";
        ctx.fillText(category, hPicX + hPicRadius + 28, hPicY + 26);
      }

      // Collage grid area
      const gridTop = headerH + 20;
      const gridPad = 20;
      const gap = 16;
      const gridW = W - gridPad * 2;
      const collageImages = productsWithImages.slice(0, 4);
      const imgCount = collageImages.length;

      const drawRoundedImage = async (imgUrl: string, x: number, y: number, w: number, h: number, r: number) => {
        try {
          const img = await loadImage(imgUrl);
          ctx.save();
          ctx.beginPath();
          ctx.roundRect(x, y, w, h, r);
          ctx.clip();
          const scale = Math.max(w / img.width, h / img.height);
          const sw = img.width * scale;
          const sh = img.height * scale;
          ctx.drawImage(img, x + (w - sw) / 2, y + (h - sh) / 2, sw, sh);
          ctx.restore();
        } catch {
          ctx.save();
          ctx.beginPath();
          ctx.roundRect(x, y, w, h, r);
          ctx.clip();
          ctx.fillStyle = "#e5e7eb";
          ctx.fillRect(x, y, w, h);
          ctx.restore();
        }
      };

      const gridBottom = H - 380;
      const gridH = gridBottom - gridTop;
      const rad = 24;

      if (imgCount >= 4) {
        const cellW = (gridW - gap) / 2;
        const cellH = (gridH - gap) / 2;
        await drawRoundedImage(collageImages[0].image_url!, gridPad, gridTop, cellW, cellH, rad);
        await drawRoundedImage(collageImages[1].image_url!, gridPad + cellW + gap, gridTop, cellW, cellH, rad);
        await drawRoundedImage(collageImages[2].image_url!, gridPad, gridTop + cellH + gap, cellW, cellH, rad);
        await drawRoundedImage(collageImages[3].image_url!, gridPad + cellW + gap, gridTop + cellH + gap, cellW, cellH, rad);
      } else if (imgCount === 3) {
        const leftW = Math.round(gridW * 0.55);
        const rightW = gridW - leftW - gap;
        const rightCellH = (gridH - gap) / 2;
        await drawRoundedImage(collageImages[0].image_url!, gridPad, gridTop, leftW, gridH, rad);
        await drawRoundedImage(collageImages[1].image_url!, gridPad + leftW + gap, gridTop, rightW, rightCellH, rad);
        await drawRoundedImage(collageImages[2].image_url!, gridPad + leftW + gap, gridTop + rightCellH + gap, rightW, rightCellH, rad);
      } else if (imgCount === 2) {
        const cellW = (gridW - gap) / 2;
        await drawRoundedImage(collageImages[0].image_url!, gridPad, gridTop, cellW, gridH, rad);
        await drawRoundedImage(collageImages[1].image_url!, gridPad + cellW + gap, gridTop, cellW, gridH, rad);
      } else if (imgCount === 1) {
        await drawRoundedImage(collageImages[0].image_url!, gridPad, gridTop, gridW, gridH, rad);
      } else {
        ctx.fillStyle = "#e5e7eb";
        ctx.beginPath();
        ctx.roundRect(gridPad, gridTop, gridW, gridH, rad);
        ctx.fill();
        ctx.fillStyle = "#9ca3af";
        ctx.font = "bold 36px system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("Add products to see your collage", W / 2, gridTop + gridH / 2);
      }

      // Bottom text area
      const textTop = gridBottom + 30;
      ctx.fillStyle = "#111827";
      ctx.font = "bold 48px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      wrapText(ctx, headline, W / 2, textTop, W - 120, 58);

      ctx.fillStyle = "#6b7280";
      ctx.font = "30px system-ui, sans-serif";
      wrapText(ctx, subtitle, W / 2, textTop + 80, W - 120, 42);

      // Orange bottom bar
      const barH = 120;
      const barGrad = ctx.createLinearGradient(0, H - barH, W, H);
      barGrad.addColorStop(0, "#FF6B35");
      barGrad.addColorStop(1, "#FF8F5E");
      ctx.fillStyle = barGrad;
      ctx.beginPath();
      ctx.roundRect(gridPad, H - barH - 20, gridW, barH, 20);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 34px system-ui, sans-serif";
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";
      ctx.fillText(storeUrl, W / 2, H - barH / 2 - 20);
    }
  }, [profilePicUrl, storeName, storeSlug, category, headline, subtitle, selectedTemplate, selectedProductImage, loading, products]);

  useEffect(() => {
    if (selectedTemplate) renderCanvas();
  }, [renderCanvas, selectedTemplate]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24 md:pb-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Palette className="h-6 w-6 text-primary" />
          Design Studio
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Create branded cards for WhatsApp Status & Instagram Stories
        </p>
      </div>

      {/* How it works guide — shown when no template selected */}
      {!selectedTemplate && (
        <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl p-6 space-y-4">
          <h2 className="font-semibold text-lg">How it works</h2>
          <div className="grid gap-3">
            <div className="flex items-start gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">1</div>
              <div>
                <p className="text-sm font-medium">Pick a template below</p>
                <p className="text-xs text-muted-foreground">Choose the style that matches your brand vibe</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">2</div>
              <div>
                <p className="text-sm font-medium">Edit your text</p>
                <p className="text-xs text-muted-foreground">Change the headline & subtitle, or let AI write it for you</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">3</div>
              <div>
                <p className="text-sm font-medium">Download & share</p>
                <p className="text-xs text-muted-foreground">Save the card and post it to your WhatsApp status or Stories</p>
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground border-t border-border/50 pt-3">
            Your store name, profile picture, and products are added automatically ✨
          </p>
        </div>
      )}

      {/* Template selector */}
      <div>
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {selectedTemplate ? "Template" : "👇 Choose a template to start"}
        </Label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
          {([1, 2, 3, 4] as TemplateId[]).map((id) => (
            <button
              key={id}
              onClick={() => setSelectedTemplate(id)}
              className={`rounded-2xl border-2 p-4 text-center transition-all ${
                selectedTemplate === id
                  ? "border-primary bg-primary/10 shadow-md shadow-primary/10"
                  : "border-border/50 bg-card/60 hover:border-primary/30 hover:shadow-sm"
              }`}
            >
              <div className="text-2xl mb-1">{TEMPLATE_LABELS[id].emoji}</div>
              <div className="text-sm font-semibold">{TEMPLATE_LABELS[id].name}</div>
              <div className="text-xs text-muted-foreground">{TEMPLATE_LABELS[id].desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Everything below only shows after template is selected */}
      {selectedTemplate && (
        <>
          {/* Product picker for template 3 */}
          {selectedTemplate === 3 && productsWithImages.length > 0 && (
            <div>
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="h-3.5 w-3.5" /> Product Image
              </Label>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {productsWithImages.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedProductImage(p.image_url)}
                    className={`rounded-xl border-2 overflow-hidden aspect-square transition-all ${
                      selectedProductImage === p.image_url
                        ? "border-primary ring-2 ring-primary/20 scale-[1.02]"
                        : "border-border/50 hover:border-primary/30"
                    }`}
                  >
                    <img src={p.image_url!} alt={p.name} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Live canvas preview */}
          <div className="flex justify-center">
            <canvas
              ref={canvasRef}
              className="w-full max-w-xs rounded-2xl border border-border/50 shadow-lg"
              style={{ aspectRatio: "9/16" }}
            />
          </div>

          {/* Text editing form */}
          <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold">Customize Text</h3>
            <div>
              <Label className="text-xs">Headline</Label>
              <Input
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g. SHOP NOW 🔥"
                maxLength={60}
                className="mt-1"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <Label className="text-xs">Subtitle</Label>
                <Button
                  variant="ghost" size="sm"
                  className="h-7 gap-1.5 text-xs text-primary"
                  onClick={generateAIText}
                  disabled={generatingMsg}
                >
                  {generatingMsg ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                  AI Generate
                </Button>
              </div>
              <Input
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="e.g. Visit my shop for amazing deals!"
                maxLength={120}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button onClick={downloadOrShare} className="w-full rounded-2xl gap-2 h-12 text-base">
              {typeof navigator !== "undefined" && navigator.canShare ? (
                <><Share2 className="h-5 w-5" /> Share Card</>
              ) : (
                <><Download className="h-5 w-5" /> Download Card</>
              )}
            </Button>

            <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl p-4 space-y-3">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Caption</Label>
              <p className="text-sm leading-relaxed">{caption}</p>
              <Button
                variant="outline" size="sm"
                className="w-full rounded-xl gap-1.5"
                onClick={copyCaption}
              >
                {captionCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {captionCopied ? "Copied!" : "Copy Caption"}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardShareCard;
