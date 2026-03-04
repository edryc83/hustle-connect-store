import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Loader2, Sparkles, Copy, Share2, Check, Palette, Image as ImageIcon, Upload, X } from "lucide-react";
import { toast } from "sonner";

type TemplateId = 1 | 2 | 3 | 4;

interface Product {
  id: string;
  name: string;
  image_url: string | null;
}

const TEMPLATE_LABELS: Record<TemplateId, { name: string; desc: string; emoji: string }> = {
  1: { name: "Editorial", desc: "Full photo + bold text", emoji: "📰" },
  2: { name: "Spotlight", desc: "Product hero shot", emoji: "🔥" },
  3: { name: "Brand Card", desc: "Logo & clean text", emoji: "🤍" },
  4: { name: "Collage", desc: "Show multiple items", emoji: "🎨" },
};

// Parse category — handles plain strings or JSON objects
const parseCategory = (raw: string | null | undefined): string => {
  if (!raw) return "";
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === "object" && parsed !== null) {
      // Take the first key as the category name
      const keys = Object.keys(parsed);
      return keys[0] || "";
    }
    return String(parsed);
  } catch {
    return raw;
  }
};

const DashboardShareCard = () => {
  const { user } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [storeName, setStoreName] = useState("");
  const [storeSlug, setStoreSlug] = useState("");
  const [profilePicUrl, setProfilePicUrl] = useState("");
  const [category, setCategory] = useState("");
  const [products, setProducts] = useState<Product[]>([]);

  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId | null>(null);
  const [selectedProductImage, setSelectedProductImage] = useState<string | null>(null);
  const [customUploadedImage, setCustomUploadedImage] = useState<string | null>(null);
  const [headline, setHeadline] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [generatingMsg, setGeneratingMsg] = useState(false);
  const [captionCopied, setCaptionCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const storeUrl = `afristall.com/${storeSlug}`;
  const caption = `🛍️ Visit my store for ${category || "amazing products"} → ${storeUrl}`;

  // The active background image for templates 1 & 2
  const activeImage = customUploadedImage || selectedProductImage;

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
      const prods = (productsData ?? []).map((pr: any) => ({ id: pr.id, name: pr.name, image_url: pr.image_url }));
      setProducts(prods);
      setSubtitle(`Just everyday ${parseCategory(p?.category) || "essentials"}, done properly.`);
      setHeadline(`No limits.\nNo compromise.\nNo holding back.`);
      const firstWithImage = prods.find((pr: Product) => pr.image_url);
      if (firstWithImage) setSelectedProductImage(firstWithImage.image_url);
      setLoading(false);
    };
    fetchData();
  }, [user]);

  // Handle custom image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/design-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("store-images").upload(path, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from("store-images").getPublicUrl(path);
      setCustomUploadedImage(publicUrl);
      toast.success("Image uploaded!");
    } catch {
      toast.error("Upload failed");
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

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

  const drawFullBleedImage = (
    ctx: CanvasRenderingContext2D, img: HTMLImageElement,
    W: number, H: number
  ) => {
    const scale = Math.max(W / img.width, H / img.height);
    const sw = img.width * scale;
    const sh = img.height * scale;
    ctx.drawImage(img, (W - sw) / 2, (H - sh) / 2, sw, sh);
  };

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

  const drawMultilineLeft = (
    ctx: CanvasRenderingContext2D, text: string,
    x: number, y: number, maxWidth: number, lineHeight: number
  ) => {
    const lines = text.split("\n");
    let currentY = y;
    for (const rawLine of lines) {
      const words = rawLine.split(" ");
      let line = "";
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
      currentY += lineHeight;
    }
    return currentY;
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

  const productsWithImages = products.filter(p => p.image_url);

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
      // ---- TEMPLATE 1: Editorial (like Three65/Orelle references) ----
      // Full-bleed background image with bold text overlay
      ctx.fillStyle = "#d4c5b0";
      ctx.fillRect(0, 0, W, H);

      if (activeImage) {
        try {
          const bgImg = await loadImage(activeImage);
          drawFullBleedImage(ctx, bgImg, W, H);
        } catch {}
      }

      // Subtle dark overlay for text readability
      const overlay = ctx.createLinearGradient(0, H * 0.3, 0, H);
      overlay.addColorStop(0, "rgba(0,0,0,0)");
      overlay.addColorStop(0.5, "rgba(0,0,0,0.15)");
      overlay.addColorStop(1, "rgba(0,0,0,0.6)");
      ctx.fillStyle = overlay;
      ctx.fillRect(0, 0, W, H);

      // Store logo/name at top left
      const logoY = 80;
      const logoX = 70;
      if (profileImg) {
        drawCircularImage(ctx, profileImg, logoX + 35, logoY + 35, 35, 3, "#ffffff");
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 36px system-ui, sans-serif";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText(displayName.toUpperCase(), logoX + 85, logoY + 35);
      } else {
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 36px system-ui, sans-serif";
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.fillText(displayName.toUpperCase(), logoX, logoY);
      }

      if (category) {
        ctx.font = "22px system-ui, sans-serif";
        ctx.globalAlpha = 0.8;
        ctx.fillText(category.toUpperCase(), logoX + (profileImg ? 85 : 0), logoY + (profileImg ? 60 : 50));
        ctx.globalAlpha = 1;
      }

      // Bold headline text — large, left-aligned, with text highlight
      const headlineLines = headline.split("\n");
      const hlX = 70;
      let hlY = H * 0.48;
      ctx.font = "bold 82px system-ui, sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";

      for (const line of headlineLines) {
        if (!line.trim()) { hlY += 90; continue; }
        // Draw semi-transparent background behind text
        const metrics = ctx.measureText(line);
        ctx.fillStyle = "rgba(255,255,255,0.85)";
        ctx.beginPath();
        ctx.roundRect(hlX - 16, hlY - 8, metrics.width + 32, 100, 8);
        ctx.fill();
        ctx.fillStyle = "#1a1a1a";
        ctx.fillText(line, hlX, hlY);
        hlY += 110;
      }

      // Subtitle — italic, lighter
      ctx.fillStyle = "#ffffff";
      ctx.font = "italic 36px Georgia, serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.globalAlpha = 0.95;
      drawMultilineLeft(ctx, subtitle, hlX, hlY + 20, W - 140, 48);
      ctx.globalAlpha = 1;

      // Store URL bottom
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 30px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.globalAlpha = 0.8;
      ctx.fillText(storeUrl, W / 2, H - 60);
      ctx.globalAlpha = 1;

    } else if (selectedTemplate === 2) {
      // ---- TEMPLATE 2: Spotlight (product hero with bold CTA) ----
      ctx.fillStyle = "#f5f3ef";
      ctx.fillRect(0, 0, W, H);

      // Store name + logo top center
      ctx.fillStyle = "#1a1a1a";
      ctx.font = "bold 32px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(displayName.toLowerCase(), W / 2, 80);

      // Decorative dots
      const dotY = 115;
      const dotColors = ["#FF6B35", "#FF6B35", "#FF6B35"];
      dotColors.forEach((c, i) => {
        ctx.beginPath();
        ctx.arc(W / 2 - 20 + i * 20, dotY, 6, 0, Math.PI * 2);
        ctx.fillStyle = c;
        ctx.fill();
      });

      // Headline — bold, two-tone
      const words = headline.replace(/\n/g, " ").split(" ");
      const midPoint = Math.ceil(words.length / 2);
      const firstHalf = words.slice(0, midPoint).join(" ");
      const secondHalf = words.slice(midPoint).join(" ");

      ctx.font = "italic bold 64px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      ctx.fillStyle = "#FF6B35";
      ctx.fillText(firstHalf.toUpperCase(), W / 2, 210);
      ctx.fillStyle = "#1a1a1a";
      ctx.fillText(secondHalf.toUpperCase(), W / 2, 285);

      // Product image — large, centered
      if (activeImage) {
        try {
          const prodImg = await loadImage(activeImage);
          const imgTop = 380;
          const imgH = H - imgTop - 300;
          const imgW = W - 120;
          ctx.save();
          ctx.beginPath();
          ctx.roundRect(60, imgTop, imgW, imgH, 40);
          ctx.clip();
          const scale = Math.max(imgW / prodImg.width, imgH / prodImg.height);
          const sw = prodImg.width * scale;
          const sh = prodImg.height * scale;
          ctx.drawImage(prodImg, 60 + (imgW - sw) / 2, imgTop + (imgH - sh) / 2, sw, sh);
          ctx.restore();
        } catch {}
      }

      // Subtitle at bottom
      ctx.fillStyle = "#666666";
      ctx.font = "28px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      wrapText(ctx, subtitle, W / 2, H - 180, W - 160, 38);

      // Store URL
      ctx.fillStyle = "#FF6B35";
      ctx.font = "bold 30px system-ui, sans-serif";
      ctx.fillText(storeUrl, W / 2, H - 70);

    } else if (selectedTemplate === 3) {
      // ---- TEMPLATE 3: Brand Card (clean white, profile-focused) ----
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, W, H);

      // Large profile image — rounded rectangle, top portion
      const imgPad = 80;
      const imgTop = 100;
      const imgW = W - imgPad * 2;
      const imgH = H * 0.5;

      if (profileImg || activeImage) {
        const img = activeImage
          ? await loadImage(activeImage).catch(() => profileImg)
          : profileImg;
        if (img) {
          ctx.save();
          ctx.beginPath();
          ctx.roundRect(imgPad, imgTop, imgW, imgH, 32);
          ctx.clip();
          const scale = Math.max(imgW / img.width, imgH / img.height);
          const sw = img.width * scale;
          const sh = img.height * scale;
          ctx.drawImage(img, imgPad + (imgW - sw) / 2, imgTop + (imgH - sh) / 2, sw, sh);
          ctx.restore();
        }
      } else {
        ctx.fillStyle = "#f3f4f6";
        ctx.beginPath();
        ctx.roundRect(imgPad, imgTop, imgW, imgH, 32);
        ctx.fill();
        drawCircularPlaceholder(ctx, W / 2, imgTop + imgH / 2, 100, letter, "#e5e7eb", "#9ca3af");
      }

      // Store name
      const textTop = imgTop + imgH + 60;
      ctx.fillStyle = "#111827";
      ctx.font = "bold 56px system-ui, sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillText(displayName, imgPad, textTop);

      // Subtitle / bio
      ctx.fillStyle = "#6b7280";
      ctx.font = "30px system-ui, sans-serif";
      drawMultilineLeft(ctx, subtitle, imgPad, textTop + 70, imgW, 42);

      // Category pill
      if (category) {
        const pillY = textTop + 180;
        ctx.font = "bold 26px system-ui, sans-serif";
        const pillW = ctx.measureText(category).width + 48;
        ctx.beginPath();
        ctx.roundRect(imgPad, pillY, pillW, 46, 23);
        ctx.fillStyle = "#FFF3ED";
        ctx.fill();
        ctx.fillStyle = "#FF6B35";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(category, imgPad + pillW / 2, pillY + 23);
      }

      // Orange bottom bar
      const barH = 130;
      const grad = ctx.createLinearGradient(0, H - barH, W, H);
      grad.addColorStop(0, "#FF6B35");
      grad.addColorStop(1, "#FF8F5E");
      ctx.fillStyle = grad;
      ctx.fillRect(0, H - barH, W, barH);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 34px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(storeUrl, W / 2, H - barH / 2);

    } else {
      // ---- TEMPLATE 4: Collage ----
      ctx.fillStyle = "#faf9f7";
      ctx.fillRect(0, 0, W, H);

      // Header
      const headerH = 250;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, W, headerH);
      ctx.fillStyle = "#f3f4f6";
      ctx.fillRect(0, headerH - 2, W, 2);

      const hPicRadius = 45;
      const hPicX = 70 + hPicRadius;
      const hPicY = headerH / 2;
      if (profileImg) drawCircularImage(ctx, profileImg, hPicX, hPicY, hPicRadius, 3, "#f3f4f6");
      else drawCircularPlaceholder(ctx, hPicX, hPicY, hPicRadius, letter, "#f3f4f6", "#9ca3af", 3, "#e5e7eb");

      ctx.fillStyle = "#111827";
      ctx.font = "bold 40px system-ui, sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(displayName, hPicX + hPicRadius + 24, hPicY - 12);
      if (category) {
        ctx.fillStyle = "#FF6B35";
        ctx.font = "24px system-ui, sans-serif";
        ctx.fillText(category, hPicX + hPicRadius + 24, hPicY + 24);
      }

      // Collage grid
      const gridTop = headerH + 16;
      const gridPad = 16;
      const gap = 12;
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

      const gridBottom = H - 340;
      const gridH = gridBottom - gridTop;
      const rad = 20;

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
        ctx.font = "bold 34px system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("Add products to see your collage", W / 2, gridTop + gridH / 2);
      }

      // Bottom text
      const textTop2 = gridBottom + 20;
      ctx.fillStyle = "#111827";
      ctx.font = "bold 44px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      wrapText(ctx, headline.replace(/\n/g, " "), W / 2, textTop2, W - 120, 54);

      ctx.fillStyle = "#6b7280";
      ctx.font = "28px system-ui, sans-serif";
      wrapText(ctx, subtitle, W / 2, textTop2 + 70, W - 120, 38);

      // Orange pill URL
      const barW = 500;
      const barH2 = 80;
      const barX = (W - barW) / 2;
      const barY = H - barH2 - 40;
      const barGrad = ctx.createLinearGradient(barX, barY, barX + barW, barY);
      barGrad.addColorStop(0, "#FF6B35");
      barGrad.addColorStop(1, "#FF8F5E");
      ctx.fillStyle = barGrad;
      ctx.beginPath();
      ctx.roundRect(barX, barY, barW, barH2, 40);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 30px system-ui, sans-serif";
      ctx.textBaseline = "middle";
      ctx.fillText(storeUrl, W / 2, barY + barH2 / 2);
    }
  }, [profilePicUrl, storeName, storeSlug, category, headline, subtitle, selectedTemplate, activeImage, loading, products, productsWithImages]);

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

      {/* How it works guide */}
      {!selectedTemplate && (
        <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl p-6 space-y-4">
          <h2 className="font-semibold text-lg">How it works</h2>
          <div className="grid gap-3">
            {[
              { n: "1", t: "Pick a template below", d: "Choose the style that matches your brand" },
              { n: "2", t: "Upload or choose an image", d: "Use your product photos or upload something new" },
              { n: "3", t: "Edit your text", d: "Change the words, or let AI write it for you" },
              { n: "4", t: "Download & share", d: "Save and post to WhatsApp status or Stories" },
            ].map((s) => (
              <div key={s.n} className="flex items-start gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">{s.n}</div>
                <div>
                  <p className="text-sm font-medium">{s.t}</p>
                  <p className="text-xs text-muted-foreground">{s.d}</p>
                </div>
              </div>
            ))}
          </div>
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
          {/* Image picker — products + upload */}
          <div>
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <ImageIcon className="h-3.5 w-3.5" /> Choose Image
            </Label>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {/* Upload button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="rounded-xl border-2 border-dashed border-border/50 hover:border-primary/40 aspect-square flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary transition-colors"
                disabled={uploading}
              >
                {uploading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Upload className="h-5 w-5" />
                    <span className="text-[10px] font-medium">Upload</span>
                  </>
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />

              {/* Custom uploaded image */}
              {customUploadedImage && (
                <div className="relative">
                  <button
                    onClick={() => setCustomUploadedImage(null)}
                    className="absolute -top-1 -right-1 z-10 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
                  >
                    <X className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => { setCustomUploadedImage(customUploadedImage); setSelectedProductImage(null); }}
                    className={`rounded-xl border-2 overflow-hidden aspect-square w-full transition-all ${
                      activeImage === customUploadedImage
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-border/50"
                    }`}
                  >
                    <img src={customUploadedImage} alt="Uploaded" className="w-full h-full object-cover" />
                  </button>
                </div>
              )}

              {/* Product images */}
              {productsWithImages.map((p) => (
                <button
                  key={p.id}
                  onClick={() => { setSelectedProductImage(p.image_url); setCustomUploadedImage(null); }}
                  className={`rounded-xl border-2 overflow-hidden aspect-square transition-all ${
                    activeImage === p.image_url && !customUploadedImage
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-border/50 hover:border-primary/30"
                  }`}
                >
                  <img src={p.image_url!} alt={p.name} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

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
              <textarea
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g. No limits.&#10;No compromise."
                maxLength={120}
                rows={3}
                className="mt-1 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
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
                placeholder="e.g. Just everyday essentials, done properly."
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
