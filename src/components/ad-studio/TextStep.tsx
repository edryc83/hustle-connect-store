import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Sparkles, Loader2, ImageIcon, Search, X, Check, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { removeBackground } from "@imgly/background-removal";

type WallpaperResult = {
  id: string;
  url: string;
  thumb: string;
  source: string;
  photographer?: string;
};

const PRESET_COLORS = [
  "#000000", "#FFFFFF", "#1a1a2e", "#FF6B6B",
  "#A8D5BA", "#0D1B2A", "#F4C430", "#FFB6C1",
];

interface TextStepProps {
  productName: string;
  setProductName: (v: string) => void;
  price: string;
  setPrice: (v: string) => void;
  tagline: string;
  setTagline: (v: string) => void;
  subtitle: string;
  setSubtitle: (v: string) => void;
  storeLogo: string | null;
  setStoreLogo: (v: string | null) => void;
  imagePreview: string | null;
  removeBg: boolean;
  onRemoveBgChange: (v: boolean) => void;
  onProcessedImage: (blobUrl: string | null) => void;
  bgImageUrl: string | null;
  setBgImageUrl: (v: string | null) => void;
  bgColor: string;
  setBgColor: (v: string) => void;
  bgType: "color" | "image";
  setBgType: (v: "color" | "image") => void;
}

export default function TextStep({
  productName, setProductName, price, setPrice, tagline, setTagline,
  subtitle, setSubtitle, storeLogo, setStoreLogo,
  imagePreview, removeBg, onRemoveBgChange, onProcessedImage,
  bgImageUrl, setBgImageUrl, bgColor, setBgColor, bgType, setBgType,
}: TextStepProps) {
  const [aiLoading, setAiLoading] = useState(false);
  const [bgRemovalLoading, setBgRemovalLoading] = useState(false);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const originalImageRef = useRef<string | null>(null);

  const [bgQuery, setBgQuery] = useState("");
  const [bgResults, setBgResults] = useState<WallpaperResult[]>([]);
  const [bgSearching, setBgSearching] = useState(false);
  const [customHex, setCustomHex] = useState(bgColor);

  useEffect(() => {
    if (imagePreview && !processedUrl) originalImageRef.current = imagePreview;
  }, [imagePreview, processedUrl]);

  useEffect(() => {
    if (!removeBg || !imagePreview || processedUrl) return;
    const source = originalImageRef.current || imagePreview;
    let cancelled = false;
    const run = async () => {
      setBgRemovalLoading(true);
      try {
        const blob = await removeBackground(source);
        if (cancelled) return;
        const url = URL.createObjectURL(blob);
        setProcessedUrl(url);
        onProcessedImage(url);
      } catch (err) {
        console.error("Background removal failed:", err);
        onRemoveBgChange(false);
      } finally {
        if (!cancelled) setBgRemovalLoading(false);
      }
    };
    run();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [removeBg]);

  useEffect(() => {
    if (!removeBg && processedUrl) {
      URL.revokeObjectURL(processedUrl);
      setProcessedUrl(null);
      onProcessedImage(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [removeBg]);

  const displayImage = removeBg && processedUrl ? processedUrl : imagePreview;

  const handleAiWrite = async () => {
    if (!productName.trim()) return;
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-tagline", {
        body: { productName, price },
      });
      if (error) throw error;
      if (data?.tagline) setTagline(data.tagline);
    } catch { /* silent */ } finally { setAiLoading(false); }
  };

  const handleBgSearch = async () => {
    if (!bgQuery.trim()) return;
    setBgSearching(true);
    try {
      const { data, error } = await supabase.functions.invoke("search-wallpapers", {
        body: { query: bgQuery.trim() },
      });
      if (error) throw error;
      setBgResults(data?.results || []);
    } catch { /* silent */ } finally { setBgSearching(false); }
  };

  const handleSelectBg = (wp: WallpaperResult) => {
    setBgImageUrl(wp.url);
    setBgType("image");
  };

  const handleSelectColor = (hex: string) => {
    setBgColor(hex);
    setCustomHex(hex);
    setBgType("color");
  };

  const handleCustomHexSubmit = () => {
    if (/^#[0-9A-Fa-f]{6}$/.test(customHex)) {
      setBgColor(customHex);
      setBgType("color");
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setStoreLogo(url);
    // Store file ref for later upload
    (window as any).__adStudioLogoFile = file;
  };

  return (
    <div className="space-y-4 pb-4">
      {/* Image preview + remove bg */}
      {displayImage ? (
        <div className="rounded-xl border border-border overflow-hidden bg-muted/30">
          <div className="relative">
            <img src={displayImage} alt="Product" className="w-full max-h-48 object-contain bg-muted/20" />
            {bgRemovalLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/70 backdrop-blur-sm">
                <Loader2 className="h-6 w-6 animate-spin text-primary mb-2" />
                <p className="text-xs font-medium text-muted-foreground">Removing background…</p>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between px-3 py-2 border-t border-border">
            <div>
              <Label className="text-sm font-medium">Remove Background</Label>
              <p className="text-[11px] text-muted-foreground">Auto-strip for cleaner design</p>
            </div>
            <Switch checked={removeBg} onCheckedChange={onRemoveBgChange} disabled={bgRemovalLoading} />
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-border p-6 flex items-center justify-center bg-muted/30">
          <ImageIcon className="h-10 w-10 text-muted-foreground" />
        </div>
      )}

      {/* Background picker — Tabs */}
      <div className="rounded-xl border border-border overflow-hidden bg-muted/30">
        <div className="px-3 pt-2">
          <Label className="text-sm font-medium">Ad Background</Label>
        </div>
        <Tabs value={bgType} onValueChange={(v) => setBgType(v as "color" | "image")} className="px-3 pb-3">
          <TabsList className="w-full h-8 mt-1.5">
            <TabsTrigger value="color" className="flex-1 text-xs h-6">Color</TabsTrigger>
            <TabsTrigger value="image" className="flex-1 text-xs h-6">Image</TabsTrigger>
          </TabsList>

          <TabsContent value="color" className="space-y-2 mt-2">
            <div className="grid grid-cols-4 gap-2">
              {PRESET_COLORS.map((hex) => (
                <button
                  key={hex}
                  onClick={() => handleSelectColor(hex)}
                  className="relative w-full aspect-square rounded-lg border-2 transition-all focus:outline-none focus:ring-2 focus:ring-ring"
                  style={{
                    backgroundColor: hex,
                    borderColor: bgType === "color" && bgColor === hex ? "hsl(var(--primary))" : "hsl(var(--border))",
                  }}
                >
                  {bgType === "color" && bgColor === hex && (
                    <Check
                      className="absolute inset-0 m-auto h-4 w-4"
                      style={{ color: ["#FFFFFF", "#F4C430", "#A8D5BA", "#FFB6C1"].includes(hex) ? "#000" : "#fff" }}
                    />
                  )}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  value={customHex}
                  onChange={(e) => setCustomHex(e.target.value)}
                  placeholder="#FF5500"
                  className="h-8 text-sm font-mono pl-9"
                  maxLength={7}
                  onKeyDown={(e) => e.key === "Enter" && handleCustomHexSubmit()}
                />
                <div
                  className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 rounded border border-border"
                  style={{ backgroundColor: /^#[0-9A-Fa-f]{6}$/.test(customHex) ? customHex : "transparent" }}
                />
              </div>
              <Button size="sm" variant="secondary" className="h-8 text-xs" onClick={handleCustomHexSubmit}>
                Apply
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="image" className="space-y-2 mt-2">
            <p className="text-[10px] text-muted-foreground">Search Unsplash & Pexels (may not render on all templates)</p>

            {bgImageUrl && bgType === "image" && (
              <div className="relative rounded-lg overflow-hidden border border-border">
                <img src={bgImageUrl} alt="Selected background" className="w-full h-20 object-cover" />
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/30 opacity-0 hover:opacity-100 transition-opacity">
                  <Button size="sm" variant="secondary" className="h-7 text-xs" onClick={() => setBgImageUrl(null)}>
                    <X className="h-3 w-3 mr-1" /> Remove
                  </Button>
                </div>
              </div>
            )}

            <form onSubmit={(e) => { e.preventDefault(); handleBgSearch(); }} className="flex gap-2">
              <Input placeholder="e.g. abstract, gradient…" value={bgQuery} onChange={(e) => setBgQuery(e.target.value)} className="flex-1 h-8 text-sm" />
              <Button type="submit" size="sm" disabled={bgSearching} className="h-8 px-2.5">
                {bgSearching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
              </Button>
            </form>

            {bgResults.length > 0 && (
              <div className="grid grid-cols-3 gap-1.5 max-h-40 overflow-y-auto">
                {bgResults.map((wp) => (
                  <button key={wp.id} onClick={() => handleSelectBg(wp)} className="group relative rounded-md overflow-hidden border border-border/50 hover:border-primary/50 transition-colors focus:outline-none focus:ring-2 focus:ring-ring">
                    <img src={wp.thumb} alt={`By ${wp.photographer}`} className="w-full h-16 object-cover" loading="lazy" />
                    <span className="absolute bottom-0 left-0 right-0 text-[8px] text-white/0 group-hover:text-white/90 bg-black/0 group-hover:bg-black/40 px-1 py-0.5 truncate transition-colors">{wp.photographer}</span>
                  </button>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <h2 className="text-base font-semibold">Edit text</h2>

      <div className="space-y-1.5">
        <Label htmlFor="product-name">Product Name</Label>
        <Input id="product-name" placeholder="e.g. Silk Bonnet" value={productName} onChange={(e) => setProductName(e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="price">Price</Label>
        <Input id="price" placeholder="e.g. KES 1,500" value={price} onChange={(e) => setPrice(e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="tagline">Tagline</Label>
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-primary" onClick={handleAiWrite} disabled={aiLoading || !productName.trim()}>
            {aiLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
            AI Write
          </Button>
        </div>
        <Input id="tagline" placeholder="e.g. Sleep in luxury ✨" value={tagline} onChange={(e) => setTagline(e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="subtitle">Subtitle</Label>
        <Input id="subtitle" placeholder="e.g. Free delivery countrywide" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
      </div>

      {/* Store Logo */}
      <div className="space-y-1.5">
        <Label>Store Logo</Label>
        {storeLogo ? (
          <div className="flex items-center gap-3">
            <img src={storeLogo} alt="Store logo" className="h-10 w-10 rounded-lg border border-border object-contain bg-muted/20" />
            <div className="flex gap-2">
              <label className="cursor-pointer">
                <span className="text-xs text-primary hover:underline">Change</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
              </label>
              <button onClick={() => setStoreLogo(null)} className="text-xs text-muted-foreground hover:text-destructive">Remove</button>
            </div>
          </div>
        ) : (
          <label className="flex items-center gap-2 cursor-pointer rounded-lg border border-dashed border-border px-3 py-2.5 bg-muted/20 hover:bg-muted/40 transition-colors">
            <Upload className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Upload your logo</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
          </label>
        )}
      </div>
    </div>
  );
}
