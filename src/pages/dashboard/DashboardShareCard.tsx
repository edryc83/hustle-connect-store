import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Loader2, Sparkles, Copy, Share2, Check, Palette, Image as ImageIcon, Upload, X, Camera } from "lucide-react";
import { toast } from "sonner";

/* ───────── Types ───────── */

type CategoryId = "editorial" | "spotlight" | "brandcard" | "collage";

interface DesignVariant {
  id: string;
  name: string;
  defaultHeadline: string;
  defaultSubtitle: string;
  thumb: string; // emoji or short label for the thumbnail
}

interface Product {
  id: string;
  name: string;
  image_url: string | null;
}

/* ───────── Template Data ───────── */

const CATEGORIES: { id: CategoryId; label: string; desc: string }[] = [
  { id: "editorial", label: "Editorial", desc: "Full photo + bold text" },
  { id: "spotlight", label: "Spotlight", desc: "Product hero shot" },
  { id: "brandcard", label: "Brand Card", desc: "Clean & minimal" },
  { id: "collage", label: "Collage", desc: "Multi-product grid" },
];

const DESIGN_VARIANTS: Record<CategoryId, DesignVariant[]> = {
  editorial: [
    { id: "ed-1", name: "Highlight", defaultHeadline: "No limits.\nNo compromise.", defaultSubtitle: "Just everyday essentials, done properly.", thumb: "📰" },
    { id: "ed-2", name: "Magazine", defaultHeadline: "NEW\nCOLLECTION", defaultSubtitle: "Curated pieces you'll love.", thumb: "📖" },
    { id: "ed-3", name: "Minimal", defaultHeadline: "SHOP\nNOW", defaultSubtitle: "Discover what's trending.", thumb: "✨" },
  ],
  spotlight: [
    { id: "sp-1", name: "Hero", defaultHeadline: "FEATURED\nPRODUCT", defaultSubtitle: "The one everyone's talking about.", thumb: "🔥" },
    { id: "sp-2", name: "Split", defaultHeadline: "BEST\nSELLER", defaultSubtitle: "See why it's #1.", thumb: "⚡" },
  ],
  brandcard: [
    { id: "bc-1", name: "Profile", defaultHeadline: "VISIT\nMY STORE", defaultSubtitle: "Quality products, great prices.", thumb: "🤍" },
    { id: "bc-2", name: "Elegant", defaultHeadline: "EXPLORE\nOUR RANGE", defaultSubtitle: "Something for everyone.", thumb: "🖤" },
  ],
  collage: [
    { id: "co-1", name: "Grid", defaultHeadline: "NEW ARRIVALS", defaultSubtitle: "Fresh stock just dropped!", thumb: "🎨" },
    { id: "co-2", name: "Mosaic", defaultHeadline: "TOP PICKS", defaultSubtitle: "Our best sellers, curated for you.", thumb: "🧩" },
  ],
};

const BG_COLORS = [
  { label: "Black", value: "#000000" },
  { label: "White", value: "#ffffff" },
  { label: "Beige", value: "#f5f0e8" },
  { label: "Navy", value: "#1a1a3e" },
  { label: "Forest", value: "#1a3a2a" },
  { label: "Warm", value: "#d4a574" },
];

const TINT_FILTERS = [
  { label: "Normal", value: "normal" },
  { label: "Warm", value: "warm" },
  { label: "Cool", value: "cool" },
  { label: "B&W", value: "bw" },
  { label: "Sepia", value: "sepia" },
];

/* ───────── Helpers ───────── */

const parseCategory = (raw: string | null | undefined): string => {
  if (!raw) return "";
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === "object" && parsed !== null) {
      return Object.keys(parsed)[0] || "";
    }
    return String(parsed);
  } catch {
    return raw;
  }
};

/* ───────── Component ───────── */

const DashboardShareCard = () => {
  const { user } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Data
  const [storeName, setStoreName] = useState("");
  const [storeSlug, setStoreSlug] = useState("");
  const [profilePicUrl, setProfilePicUrl] = useState("");
  const [category, setCategory] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Design state
  const [activeCategory, setActiveCategory] = useState<CategoryId | null>(null);
  const [activeVariantId, setActiveVariantId] = useState<string | null>(null);
  const [selectedProductImage, setSelectedProductImage] = useState<string | null>(null);
  const [customUploadedImage, setCustomUploadedImage] = useState<string | null>(null);
  const [headline, setHeadline] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [bgColor, setBgColor] = useState("#000000");
  const [tintFilter, setTintFilter] = useState("normal");

  // UI state
  const [generatingMsg, setGeneratingMsg] = useState(false);
  const [captionCopied, setCaptionCopied] = useState(false);
  const [uploading, setUploading] = useState(false);

  const storeUrl = `afristall.com/${storeSlug}`;
  const caption = `🛍️ Visit my store → ${storeUrl}`;
  const activeImage = customUploadedImage || selectedProductImage;
  const productsWithImages = products.filter(p => p.image_url);

  const activeVariant = activeCategory && activeVariantId
    ? DESIGN_VARIANTS[activeCategory].find(v => v.id === activeVariantId) ?? null
    : null;

  // ── Fetch data ──
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
      const firstWithImage = prods.find((pr: Product) => pr.image_url);
      if (firstWithImage) setSelectedProductImage(firstWithImage.image_url);
      setLoading(false);
    };
    fetchData();
  }, [user]);

  // ── When category changes, auto-select first variant ──
  useEffect(() => {
    if (!activeCategory) return;
    const variants = DESIGN_VARIANTS[activeCategory];
    const v = variants[0];
    setActiveVariantId(v.id);
    setHeadline(v.defaultHeadline);
    setSubtitle(v.defaultSubtitle);
  }, [activeCategory]);

  // ── When variant changes, update default text ──
  const selectVariant = (v: DesignVariant) => {
    setActiveVariantId(v.id);
    setHeadline(v.defaultHeadline);
    setSubtitle(v.defaultSubtitle);
  };

  // ── Image upload ──
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB"); return; }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/design-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("store-images").upload(path, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from("store-images").getPublicUrl(path);
      setCustomUploadedImage(publicUrl);
      toast.success("Image uploaded!");
    } catch { toast.error("Upload failed"); }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const generateAIText = async () => {
    setGeneratingMsg(true);
    try {
      const res = await supabase.functions.invoke("generate-card-message", { body: { storeName } });
      if (res.error) throw res.error;
      if (res.data?.message) setSubtitle(res.data.message);
    } catch { toast.error("Failed to generate text"); }
    setGeneratingMsg(false);
  };

  /* ───────── Canvas Drawing ───────── */

  const loadImage = (src: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });

  const drawFullBleed = (ctx: CanvasRenderingContext2D, img: HTMLImageElement, W: number, H: number) => {
    const scale = Math.max(W / img.width, H / img.height);
    const sw = img.width * scale;
    const sh = img.height * scale;
    ctx.drawImage(img, (W - sw) / 2, (H - sh) / 2, sw, sh);
  };

  const applyTint = (ctx: CanvasRenderingContext2D, W: number, H: number, filter: string) => {
    if (filter === "normal") return;
    ctx.save();
    if (filter === "warm") { ctx.fillStyle = "rgba(255,140,50,0.18)"; ctx.fillRect(0, 0, W, H); }
    else if (filter === "cool") { ctx.fillStyle = "rgba(50,100,255,0.15)"; ctx.fillRect(0, 0, W, H); }
    else if (filter === "bw") {
      ctx.globalCompositeOperation = "saturation";
      ctx.fillStyle = "hsl(0,0%,50%)";
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = "source-over";
    } else if (filter === "sepia") {
      ctx.globalCompositeOperation = "saturation";
      ctx.fillStyle = "hsl(0,0%,50%)";
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "rgba(180,120,60,0.25)";
      ctx.fillRect(0, 0, W, H);
    }
    ctx.restore();
  };

  const drawCircularImage = (
    ctx: CanvasRenderingContext2D, img: HTMLImageElement,
    cx: number, cy: number, radius: number, borderWidth = 0, borderColor = "#fff"
  ) => {
    if (borderWidth > 0) {
      ctx.beginPath(); ctx.arc(cx, cy, radius + borderWidth, 0, Math.PI * 2);
      ctx.fillStyle = borderColor; ctx.fill();
    }
    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2); ctx.clip();
    const scale = Math.max((radius * 2) / img.width, (radius * 2) / img.height);
    const sw = img.width * scale; const sh = img.height * scale;
    ctx.drawImage(img, cx - sw / 2, cy - sh / 2, sw, sh);
    ctx.restore();
  };

  const drawCircularPlaceholder = (
    ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number,
    letter: string, bg: string, fg: string, borderWidth = 0, borderColor = "#fff"
  ) => {
    if (borderWidth > 0) {
      ctx.beginPath(); ctx.arc(cx, cy, radius + borderWidth, 0, Math.PI * 2);
      ctx.fillStyle = borderColor; ctx.fill();
    }
    ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = bg; ctx.fill();
    ctx.fillStyle = fg;
    ctx.font = `bold ${radius}px system-ui, sans-serif`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(letter, cx, cy);
  };

  const drawMultiline = (
    ctx: CanvasRenderingContext2D, text: string,
    x: number, y: number, maxWidth: number, lineHeight: number, align: CanvasTextAlign = "left"
  ) => {
    ctx.textAlign = align;
    const lines = text.split("\n");
    let currentY = y;
    for (const rawLine of lines) {
      const words = rawLine.split(" ");
      let line = "";
      for (const word of words) {
        const test = line + (line ? " " : "") + word;
        if (ctx.measureText(test).width > maxWidth && line) {
          ctx.fillText(line, x, currentY); line = word; currentY += lineHeight;
        } else { line = test; }
      }
      if (line) ctx.fillText(line, x, currentY);
      currentY += lineHeight;
    }
    return currentY;
  };

  const drawBranding = async (
    ctx: CanvasRenderingContext2D, W: number, H: number,
    profileImg: HTMLImageElement | null, displayName: string, letter: string,
    position: "top" | "bottom" = "top", light = true
  ) => {
    const color = light ? "#ffffff" : "#111827";
    const subColor = light ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.5)";

    // Load Afristall logo
    let logoImg: HTMLImageElement | null = null;
    try { logoImg = await loadImage("/logo.jpeg"); } catch {}

    if (position === "top") {
      const y = 70;
      const x = 70;
      // Afristall logo
      if (logoImg) {
        ctx.save();
        ctx.beginPath(); ctx.roundRect(x, y, 50, 50, 10); ctx.clip();
        ctx.drawImage(logoImg, x, y, 50, 50);
        ctx.restore();
        ctx.fillStyle = color;
        ctx.font = "bold 28px system-ui, sans-serif";
        ctx.textAlign = "left"; ctx.textBaseline = "middle";
        ctx.fillText("afristall", x + 62, y + 25);
      }

      // Profile pic + store name on the right
      const rightX = W - 70;
      if (profileImg) {
        drawCircularImage(ctx, profileImg, rightX - 25, y + 25, 25, 2, light ? "#ffffff" : "#e5e7eb");
        ctx.fillStyle = color;
        ctx.font = "600 24px system-ui, sans-serif";
        ctx.textAlign = "right"; ctx.textBaseline = "middle";
        ctx.fillText(displayName, rightX - 60, y + 25);
      } else {
        ctx.fillStyle = color;
        ctx.font = "600 24px system-ui, sans-serif";
        ctx.textAlign = "right"; ctx.textBaseline = "middle";
        ctx.fillText(displayName, rightX, y + 25);
      }
    } else {
      // Bottom branding bar
      const y = H - 100;
      const cx = W / 2;
      if (logoImg) {
        ctx.save();
        ctx.beginPath(); ctx.roundRect(cx - 130, y, 40, 40, 8); ctx.clip();
        ctx.drawImage(logoImg, cx - 130, y, 40, 40);
        ctx.restore();
      }
      ctx.fillStyle = color;
      ctx.font = "bold 28px system-ui, sans-serif";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(storeUrl, cx, y + 20);
      ctx.fillStyle = subColor;
      ctx.font = "20px system-ui, sans-serif";
      ctx.fillText("Powered by Afristall", cx, y + 55);
    }
  };

  const renderCanvas = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || loading || !activeCategory || !activeVariantId) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = 1080;
    const H = 1920;
    canvas.width = W;
    canvas.height = H;

    let profileImg: HTMLImageElement | null = null;
    if (profilePicUrl) { try { profileImg = await loadImage(profilePicUrl); } catch {} }

    const displayName = storeName || "My Store";
    const letter = displayName[0].toUpperCase();

    // Background color base
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, W, H);

    /* ──────── EDITORIAL ──────── */
    if (activeCategory === "editorial") {
      // Full-bleed image
      if (activeImage) {
        try { const img = await loadImage(activeImage); drawFullBleed(ctx, img, W, H); } catch {}
      }
      applyTint(ctx, W, H, tintFilter);

      if (activeVariantId === "ed-1") {
        // Highlight: dark gradient bottom, bold text with white bg highlights
        const ov = ctx.createLinearGradient(0, H * 0.25, 0, H);
        ov.addColorStop(0, "rgba(0,0,0,0)"); ov.addColorStop(0.5, "rgba(0,0,0,0.2)"); ov.addColorStop(1, "rgba(0,0,0,0.7)");
        ctx.fillStyle = ov; ctx.fillRect(0, 0, W, H);

        await drawBranding(ctx, W, H, profileImg, displayName, letter, "top", true);

        // Headline with highlight boxes
        const lines = headline.split("\n");
        let hlY = H * 0.50;
        ctx.font = "bold 108px system-ui, sans-serif";
        ctx.textAlign = "left"; ctx.textBaseline = "top";
        for (const line of lines) {
          if (!line.trim()) { hlY += 120; continue; }
          const m = ctx.measureText(line);
          ctx.fillStyle = "rgba(255,255,255,0.9)";
          ctx.beginPath(); ctx.roundRect(60, hlY - 10, m.width + 40, 130, 10); ctx.fill();
          ctx.fillStyle = "#0a0a0a"; ctx.fillText(line, 80, hlY);
          hlY += 140;
        }

        ctx.fillStyle = "#ffffff"; ctx.font = "italic 40px Georgia, serif";
        ctx.textAlign = "left"; ctx.textBaseline = "top"; ctx.globalAlpha = 0.95;
        drawMultiline(ctx, subtitle, 80, hlY + 30, W - 160, 54, "left");
        ctx.globalAlpha = 1;

        await drawBranding(ctx, W, H, profileImg, displayName, letter, "bottom", true);

      } else if (activeVariantId === "ed-2") {
        // Magazine: top-heavy text, centered, large serif
        const ov = ctx.createLinearGradient(0, 0, 0, H * 0.5);
        ov.addColorStop(0, "rgba(0,0,0,0.65)"); ov.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = ov; ctx.fillRect(0, 0, W, H);
        const ov2 = ctx.createLinearGradient(0, H * 0.7, 0, H);
        ov2.addColorStop(0, "rgba(0,0,0,0)"); ov2.addColorStop(1, "rgba(0,0,0,0.5)");
        ctx.fillStyle = ov2; ctx.fillRect(0, 0, W, H);

        await drawBranding(ctx, W, H, profileImg, displayName, letter, "top", true);

        ctx.fillStyle = "#ffffff"; ctx.font = "bold 120px Georgia, serif";
        ctx.textAlign = "center"; ctx.textBaseline = "top";
        drawMultiline(ctx, headline, W / 2, 200, W - 120, 140, "center");

        ctx.fillStyle = "#ffffff"; ctx.font = "36px system-ui, sans-serif";
        ctx.globalAlpha = 0.85;
        drawMultiline(ctx, subtitle, W / 2, H - 250, W - 160, 48, "center");
        ctx.globalAlpha = 1;

        await drawBranding(ctx, W, H, profileImg, displayName, letter, "bottom", true);

      } else {
        // ed-3 Minimal: centered, clean
        const ov = ctx.createLinearGradient(0, H * 0.5, 0, H);
        ov.addColorStop(0, "rgba(0,0,0,0)"); ov.addColorStop(1, "rgba(0,0,0,0.6)");
        ctx.fillStyle = ov; ctx.fillRect(0, 0, W, H);

        await drawBranding(ctx, W, H, profileImg, displayName, letter, "top", true);

        ctx.fillStyle = "#ffffff"; ctx.font = "bold 100px system-ui, sans-serif";
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        drawMultiline(ctx, headline, W / 2, H * 0.65, W - 160, 120, "center");

        ctx.font = "34px system-ui, sans-serif"; ctx.globalAlpha = 0.85;
        drawMultiline(ctx, subtitle, W / 2, H * 0.65 + 180, W - 160, 46, "center");
        ctx.globalAlpha = 1;

        await drawBranding(ctx, W, H, profileImg, displayName, letter, "bottom", true);
      }

    /* ──────── SPOTLIGHT ──────── */
    } else if (activeCategory === "spotlight") {
      if (activeVariantId === "sp-1") {
        // Hero: light bg, large product image, text below
        ctx.fillStyle = bgColor === "#000000" ? "#f5f3ef" : bgColor;
        ctx.fillRect(0, 0, W, H);

        await drawBranding(ctx, W, H, profileImg, displayName, letter, "top", false);

        // Two-tone headline
        const words = headline.replace(/\n/g, " ").split(" ");
        const mid = Math.ceil(words.length / 2);
        ctx.font = "bold 80px system-ui, sans-serif";
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillStyle = "#FF6B35"; ctx.fillText(words.slice(0, mid).join(" ").toUpperCase(), W / 2, 220);
        ctx.fillStyle = "#1a1a1a"; ctx.fillText(words.slice(mid).join(" ").toUpperCase(), W / 2, 310);

        // Product image
        if (activeImage) {
          try {
            const img = await loadImage(activeImage);
            const imgTop = 400; const imgH = H - imgTop - 340; const imgW = W - 120;
            ctx.save(); ctx.beginPath(); ctx.roundRect(60, imgTop, imgW, imgH, 40); ctx.clip();
            const scale = Math.max(imgW / img.width, imgH / img.height);
            const sw = img.width * scale; const sh = img.height * scale;
            ctx.drawImage(img, 60 + (imgW - sw) / 2, imgTop + (imgH - sh) / 2, sw, sh);
            ctx.restore();
            applyTint(ctx, W, H, tintFilter);
          } catch {}
        }

        ctx.fillStyle = "#666666"; ctx.font = "32px system-ui, sans-serif"; ctx.textAlign = "center";
        drawMultiline(ctx, subtitle, W / 2, H - 220, W - 160, 42, "center");

        ctx.fillStyle = "#FF6B35"; ctx.font = "bold 32px system-ui, sans-serif";
        ctx.textBaseline = "middle"; ctx.fillText(storeUrl, W / 2, H - 70);

      } else {
        // sp-2 Split: image top half, text bottom half
        const splitY = H * 0.55;
        if (activeImage) {
          try {
            const img = await loadImage(activeImage);
            ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, splitY); ctx.clip();
            drawFullBleed(ctx, img, W, splitY);
            ctx.restore();
            applyTint(ctx, W, H, tintFilter);
          } catch {}
        }

        ctx.fillStyle = bgColor === "#000000" ? "#ffffff" : bgColor;
        ctx.fillRect(0, splitY, W, H - splitY);

        await drawBranding(ctx, W, H, profileImg, displayName, letter, "top", true);

        const textY = splitY + 60;
        ctx.fillStyle = "#1a1a1a"; ctx.font = "bold 90px system-ui, sans-serif";
        ctx.textAlign = "left"; ctx.textBaseline = "top";
        drawMultiline(ctx, headline, 70, textY, W - 140, 110, "left");

        ctx.fillStyle = "#6b7280"; ctx.font = "32px system-ui, sans-serif";
        drawMultiline(ctx, subtitle, 70, textY + 260, W - 140, 44, "left");

        // Bottom bar
        const barH = 100;
        ctx.fillStyle = "#FF6B35"; ctx.fillRect(0, H - barH, W, barH);
        ctx.fillStyle = "#ffffff"; ctx.font = "bold 32px system-ui, sans-serif";
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(storeUrl, W / 2, H - barH / 2);
      }

    /* ──────── BRAND CARD ──────── */
    } else if (activeCategory === "brandcard") {
      if (activeVariantId === "bc-1") {
        // Profile card: white bg, large rounded image, name below
        ctx.fillStyle = bgColor === "#000000" ? "#ffffff" : bgColor;
        ctx.fillRect(0, 0, W, H);

        const imgPad = 80; const imgTop = 160; const imgW = W - imgPad * 2; const imgH = H * 0.48;
        if (activeImage || profileImg) {
          const img = activeImage ? await loadImage(activeImage).catch(() => profileImg) : profileImg;
          if (img) {
            ctx.save(); ctx.beginPath(); ctx.roundRect(imgPad, imgTop, imgW, imgH, 32); ctx.clip();
            const scale = Math.max(imgW / img.width, imgH / img.height);
            const sw = img.width * scale; const sh = img.height * scale;
            ctx.drawImage(img, imgPad + (imgW - sw) / 2, imgTop + (imgH - sh) / 2, sw, sh);
            ctx.restore();
            applyTint(ctx, W, H, tintFilter);
          }
        } else {
          ctx.fillStyle = "#f3f4f6"; ctx.beginPath(); ctx.roundRect(imgPad, imgTop, imgW, imgH, 32); ctx.fill();
          drawCircularPlaceholder(ctx, W / 2, imgTop + imgH / 2, 100, letter, "#e5e7eb", "#9ca3af");
        }

        // Afristall logo at top
        let logoImg: HTMLImageElement | null = null;
        try { logoImg = await loadImage("/logo.jpeg"); } catch {}
        if (logoImg) {
          ctx.save(); ctx.beginPath(); ctx.roundRect(imgPad, 70, 45, 45, 10); ctx.clip();
          ctx.drawImage(logoImg, imgPad, 70, 45, 45); ctx.restore();
          ctx.fillStyle = "#1a1a1a"; ctx.font = "bold 26px system-ui, sans-serif";
          ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillText("afristall", imgPad + 55, 92);
        }

        const textTop = imgTop + imgH + 50;
        ctx.fillStyle = "#111827"; ctx.font = "bold 64px system-ui, sans-serif";
        ctx.textAlign = "left"; ctx.textBaseline = "top";
        drawMultiline(ctx, headline, imgPad, textTop, imgW, 78, "left");

        ctx.fillStyle = "#6b7280"; ctx.font = "32px system-ui, sans-serif";
        drawMultiline(ctx, subtitle, imgPad, textTop + 180, imgW, 44, "left");

        // Profile pic + name at bottom
        const bY = H - 180;
        if (profileImg) {
          drawCircularImage(ctx, profileImg, imgPad + 30, bY, 30, 3, "#e5e7eb");
          ctx.fillStyle = "#111827"; ctx.font = "600 28px system-ui, sans-serif";
          ctx.textAlign = "left"; ctx.textBaseline = "middle";
          ctx.fillText(displayName, imgPad + 75, bY);
        }

        const barH = 110;
        const grad = ctx.createLinearGradient(0, H - barH, W, H);
        grad.addColorStop(0, "#FF6B35"); grad.addColorStop(1, "#FF8F5E");
        ctx.fillStyle = grad; ctx.fillRect(0, H - barH, W, barH);
        ctx.fillStyle = "#ffffff"; ctx.font = "bold 34px system-ui, sans-serif";
        ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(storeUrl, W / 2, H - barH / 2);

      } else {
        // bc-2 Elegant: dark theme
        ctx.fillStyle = bgColor === "#000000" || bgColor === "#ffffff" ? "#1a1a2e" : bgColor;
        ctx.fillRect(0, 0, W, H);

        const imgPad = 80; const imgTop = 160; const imgW = W - imgPad * 2; const imgH = H * 0.45;
        if (activeImage || profileImg) {
          const img = activeImage ? await loadImage(activeImage).catch(() => profileImg) : profileImg;
          if (img) {
            ctx.save(); ctx.beginPath(); ctx.roundRect(imgPad, imgTop, imgW, imgH, 32); ctx.clip();
            const scale = Math.max(imgW / img.width, imgH / img.height);
            const sw = img.width * scale; const sh = img.height * scale;
            ctx.drawImage(img, imgPad + (imgW - sw) / 2, imgTop + (imgH - sh) / 2, sw, sh);
            ctx.restore();
            applyTint(ctx, W, H, tintFilter);
          }
        }

        await drawBranding(ctx, W, H, profileImg, displayName, letter, "top", true);

        const textTop = imgTop + imgH + 50;
        ctx.fillStyle = "#ffffff"; ctx.font = "bold 64px system-ui, sans-serif";
        ctx.textAlign = "left"; ctx.textBaseline = "top";
        drawMultiline(ctx, headline, imgPad, textTop, imgW, 78, "left");

        ctx.fillStyle = "rgba(255,255,255,0.7)"; ctx.font = "32px system-ui, sans-serif";
        drawMultiline(ctx, subtitle, imgPad, textTop + 180, imgW, 44, "left");

        await drawBranding(ctx, W, H, profileImg, displayName, letter, "bottom", true);
      }

    /* ──────── COLLAGE ──────── */
    } else if (activeCategory === "collage") {
      ctx.fillStyle = bgColor === "#000000" ? "#faf9f7" : bgColor;
      ctx.fillRect(0, 0, W, H);

      // Header
      const headerH = 200;
      if (profileImg) {
        drawCircularImage(ctx, profileImg, 100, headerH / 2, 40, 3, "#e5e7eb");
        ctx.fillStyle = "#111827"; ctx.font = "bold 36px system-ui, sans-serif";
        ctx.textAlign = "left"; ctx.textBaseline = "middle";
        ctx.fillText(displayName, 155, headerH / 2);
      } else {
        drawCircularPlaceholder(ctx, 100, headerH / 2, 40, letter, "#f3f4f6", "#9ca3af", 3, "#e5e7eb");
        ctx.fillStyle = "#111827"; ctx.font = "bold 36px system-ui, sans-serif";
        ctx.textAlign = "left"; ctx.textBaseline = "middle";
        ctx.fillText(displayName, 155, headerH / 2);
      }

      // Afristall logo top right
      let logoImg2: HTMLImageElement | null = null;
      try { logoImg2 = await loadImage("/logo.jpeg"); } catch {}
      if (logoImg2) {
        ctx.save(); ctx.beginPath(); ctx.roundRect(W - 120, headerH / 2 - 20, 40, 40, 8); ctx.clip();
        ctx.drawImage(logoImg2, W - 120, headerH / 2 - 20, 40, 40); ctx.restore();
      }

      const gridTop = headerH + 10;
      const gridPad = 16; const gap = 12;
      const gridW = W - gridPad * 2;
      const gridBottom = H - 320;
      const gridH = gridBottom - gridTop;
      const rad = 20;
      const collageImages = productsWithImages.slice(0, 4);
      const imgCount = collageImages.length;

      const drawRounded = async (url: string, x: number, y: number, w: number, h: number) => {
        try {
          const img = await loadImage(url);
          ctx.save(); ctx.beginPath(); ctx.roundRect(x, y, w, h, rad); ctx.clip();
          const scale = Math.max(w / img.width, h / img.height);
          const sw = img.width * scale; const sh = img.height * scale;
          ctx.drawImage(img, x + (w - sw) / 2, y + (h - sh) / 2, sw, sh);
          ctx.restore();
        } catch {
          ctx.fillStyle = "#e5e7eb"; ctx.beginPath(); ctx.roundRect(x, y, w, h, rad); ctx.fill();
        }
      };

      if (activeVariantId === "co-1") {
        // Grid: 2x2
        if (imgCount >= 4) {
          const cW = (gridW - gap) / 2; const cH = (gridH - gap) / 2;
          await drawRounded(collageImages[0].image_url!, gridPad, gridTop, cW, cH);
          await drawRounded(collageImages[1].image_url!, gridPad + cW + gap, gridTop, cW, cH);
          await drawRounded(collageImages[2].image_url!, gridPad, gridTop + cH + gap, cW, cH);
          await drawRounded(collageImages[3].image_url!, gridPad + cW + gap, gridTop + cH + gap, cW, cH);
        } else if (imgCount >= 1) {
          await drawRounded(collageImages[0].image_url!, gridPad, gridTop, gridW, gridH);
        }
      } else {
        // co-2 Mosaic: 1 large left, 2 stacked right
        if (imgCount >= 3) {
          const leftW = Math.round(gridW * 0.55); const rightW = gridW - leftW - gap;
          const rightH = (gridH - gap) / 2;
          await drawRounded(collageImages[0].image_url!, gridPad, gridTop, leftW, gridH);
          await drawRounded(collageImages[1].image_url!, gridPad + leftW + gap, gridTop, rightW, rightH);
          await drawRounded(collageImages[2].image_url!, gridPad + leftW + gap, gridTop + rightH + gap, rightW, rightH);
        } else if (imgCount >= 1) {
          await drawRounded(collageImages[0].image_url!, gridPad, gridTop, gridW, gridH);
        }
      }

      applyTint(ctx, W, H, tintFilter);

      // Bottom text
      ctx.fillStyle = "#111827"; ctx.font = "bold 52px system-ui, sans-serif";
      ctx.textAlign = "center"; ctx.textBaseline = "top";
      drawMultiline(ctx, headline.replace(/\n/g, " "), W / 2, gridBottom + 30, W - 120, 62, "center");

      ctx.fillStyle = "#6b7280"; ctx.font = "30px system-ui, sans-serif";
      drawMultiline(ctx, subtitle, W / 2, gridBottom + 110, W - 120, 42, "center");

      // URL pill
      const pillW = 500; const pillH = 80; const pillX = (W - pillW) / 2; const pillY = H - pillH - 40;
      const pGrad = ctx.createLinearGradient(pillX, pillY, pillX + pillW, pillY);
      pGrad.addColorStop(0, "#FF6B35"); pGrad.addColorStop(1, "#FF8F5E");
      ctx.fillStyle = pGrad; ctx.beginPath(); ctx.roundRect(pillX, pillY, pillW, pillH, 40); ctx.fill();
      ctx.fillStyle = "#ffffff"; ctx.font = "bold 30px system-ui, sans-serif";
      ctx.textBaseline = "middle"; ctx.textAlign = "center"; ctx.fillText(storeUrl, W / 2, pillY + pillH / 2);
    }
  }, [profilePicUrl, storeName, storeSlug, headline, subtitle, activeCategory, activeVariantId, activeImage, bgColor, tintFilter, loading, products, productsWithImages, storeUrl]);

  useEffect(() => {
    if (activeCategory && activeVariantId) renderCanvas();
  }, [renderCanvas, activeCategory, activeVariantId]);

  const downloadOrShare = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], `${storeSlug}-card.png`, { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        try { await navigator.share({ files: [file], title: storeName, text: caption }); } catch {}
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href = url; a.download = `${storeSlug}-card.png`; a.click();
        URL.revokeObjectURL(url);
        toast.success("Card downloaded!");
      }
    }, "image/png", 1.0);
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
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Palette className="h-6 w-6 text-primary" /> Design Studio
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Create branded cards for WhatsApp Status & Instagram Stories</p>
      </div>

      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold transition-all ${
              activeCategory === cat.id
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Design variants grid */}
      {activeCategory && (
        <div>
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Designs</Label>
          <div className="grid grid-cols-3 gap-3 mt-2">
            {DESIGN_VARIANTS[activeCategory].map((v) => (
              <button
                key={v.id}
                onClick={() => selectVariant(v)}
                className={`rounded-2xl border-2 p-4 text-center transition-all ${
                  activeVariantId === v.id
                    ? "border-primary bg-primary/10 shadow-md shadow-primary/10"
                    : "border-border/50 bg-card/60 hover:border-primary/30"
                }`}
              >
                <div className="text-2xl mb-1">{v.thumb}</div>
                <div className="text-xs font-semibold">{v.name}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Design area */}
      {activeVariant && (
        <>
          {/* Canvas preview — click to change image */}
          <div className="flex justify-center">
            <div className="relative group w-full max-w-xs cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <canvas
                ref={canvasRef}
                className="w-full rounded-2xl border border-border/50 shadow-lg"
                style={{ aspectRatio: "9/16" }}
              />
              <div className="absolute inset-0 rounded-2xl bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="bg-white/90 rounded-full px-4 py-2 flex items-center gap-2 text-sm font-medium text-foreground shadow-lg">
                  <Camera className="h-4 w-4" /> Tap to change image
                </div>
              </div>
            </div>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />

          {/* Image picker row */}
          <div>
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <ImageIcon className="h-3.5 w-3.5" /> Images
            </Label>
            <div className="grid grid-cols-5 gap-2 mt-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="rounded-xl border-2 border-dashed border-border/50 hover:border-primary/40 aspect-square flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary transition-colors"
                disabled={uploading}
              >
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Upload className="h-4 w-4" /><span className="text-[9px] font-medium">Upload</span></>}
              </button>
              {customUploadedImage && (
                <div className="relative">
                  <button onClick={() => setCustomUploadedImage(null)} className="absolute -top-1 -right-1 z-10 h-4 w-4 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"><X className="h-2.5 w-2.5" /></button>
                  <button
                    onClick={() => { setCustomUploadedImage(customUploadedImage); setSelectedProductImage(null); }}
                    className={`rounded-xl border-2 overflow-hidden aspect-square w-full ${activeImage === customUploadedImage ? "border-primary ring-2 ring-primary/20" : "border-border/50"}`}
                  >
                    <img src={customUploadedImage} alt="Uploaded" className="w-full h-full object-cover" />
                  </button>
                </div>
              )}
              {productsWithImages.slice(0, customUploadedImage ? 3 : 4).map((p) => (
                <button
                  key={p.id}
                  onClick={() => { setSelectedProductImage(p.image_url); setCustomUploadedImage(null); }}
                  className={`rounded-xl border-2 overflow-hidden aspect-square ${activeImage === p.image_url && !customUploadedImage ? "border-primary ring-2 ring-primary/20" : "border-border/50 hover:border-primary/30"}`}
                >
                  <img src={p.image_url!} alt={p.name} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Background color */}
          <div>
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Background</Label>
            <div className="flex gap-2 mt-2">
              {BG_COLORS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setBgColor(c.value)}
                  className={`h-8 w-8 rounded-full border-2 transition-all ${bgColor === c.value ? "border-primary ring-2 ring-primary/20 scale-110" : "border-border/50"}`}
                  style={{ backgroundColor: c.value }}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          {/* Tint filter */}
          <div>
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Image Tint</Label>
            <div className="flex gap-2 mt-2">
              {TINT_FILTERS.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTintFilter(t.value)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${tintFilter === t.value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Text editing */}
          <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold">Customize Text</h3>
            <div>
              <Label className="text-xs">Headline</Label>
              <textarea
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g. SHOP NOW"
                maxLength={120}
                rows={3}
                className="mt-1 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <Label className="text-xs">Subtitle</Label>
                <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-xs text-primary" onClick={generateAIText} disabled={generatingMsg}>
                  {generatingMsg ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />} AI Generate
                </Button>
              </div>
              <Input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="e.g. Quality products, great prices." maxLength={120} />
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button onClick={downloadOrShare} className="w-full rounded-2xl gap-2 h-12 text-base">
              {typeof navigator !== "undefined" && navigator.canShare ? <><Share2 className="h-5 w-5" /> Share Card</> : <><Download className="h-5 w-5" /> Download Card</>}
            </Button>
            <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl p-4 space-y-3">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Caption</Label>
              <p className="text-sm leading-relaxed">{caption}</p>
              <Button variant="outline" size="sm" className="w-full rounded-xl gap-1.5" onClick={copyCaption}>
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
