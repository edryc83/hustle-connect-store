import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Sparkles, Loader2, ImageIcon, Search, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { removeBackground } from "@imgly/background-removal";

type WallpaperResult = {
  id: string;
  url: string;
  thumb: string;
  source: string;
  photographer?: string;
};

interface TextStepProps {
  productName: string;
  setProductName: (v: string) => void;
  price: string;
  setPrice: (v: string) => void;
  tagline: string;
  setTagline: (v: string) => void;
  imagePreview: string | null;
  removeBg: boolean;
  onRemoveBgChange: (v: boolean) => void;
  onProcessedImage: (blobUrl: string | null) => void;
  bgImageUrl: string | null;
  setBgImageUrl: (v: string | null) => void;
}

export default function TextStep({
  productName,
  setProductName,
  price,
  setPrice,
  tagline,
  setTagline,
  imagePreview,
  removeBg,
  onRemoveBgChange,
  onProcessedImage,
  bgImageUrl,
  setBgImageUrl,
}: TextStepProps) {
  const [aiLoading, setAiLoading] = useState(false);
  const [bgRemovalLoading, setBgRemovalLoading] = useState(false);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const originalImageRef = useRef<string | null>(null);

  // Background search state
  const [bgQuery, setBgQuery] = useState("");
  const [bgResults, setBgResults] = useState<WallpaperResult[]>([]);
  const [bgSearching, setBgSearching] = useState(false);
  const [bgExpanded, setBgExpanded] = useState(!bgImageUrl);

  // Track the original image so we can restore it
  useEffect(() => {
    if (imagePreview && !processedUrl) {
      originalImageRef.current = imagePreview;
    }
  }, [imagePreview, processedUrl]);

  // Run background removal when toggled ON
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

  // When toggled OFF, restore original
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
    } catch {
      // silent fail
    } finally {
      setAiLoading(false);
    }
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
    } catch {
      // silent
    } finally {
      setBgSearching(false);
    }
  };

  const handleSelectBg = (wp: WallpaperResult) => {
    setBgImageUrl(wp.url);
    setBgExpanded(false);
  };

  return (
    <div className="space-y-4 pb-4">
      {/* Image preview + remove bg */}
      {displayImage ? (
        <div className="rounded-xl border border-border overflow-hidden bg-muted/30">
          <div className="relative">
            <img
              src={displayImage}
              alt="Product"
              className="w-full max-h-48 object-contain bg-muted/20"
            />
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
            <Switch
              checked={removeBg}
              onCheckedChange={onRemoveBgChange}
              disabled={bgRemovalLoading}
            />
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-border p-6 flex items-center justify-center bg-muted/30">
          <ImageIcon className="h-10 w-10 text-muted-foreground" />
        </div>
      )}

      {/* Background picker */}
      <div className="rounded-xl border border-border overflow-hidden bg-muted/30">
        <div className="px-3 py-2">
          <Label className="text-sm font-medium">Ad Background</Label>
          <p className="text-[11px] text-muted-foreground">Search free photos from Unsplash & Pexels</p>
        </div>

        {/* Selected preview */}
        {bgImageUrl && !bgExpanded && (
          <div className="relative mx-3 mb-2 rounded-lg overflow-hidden border border-border">
            <img src={bgImageUrl} alt="Selected background" className="w-full h-24 object-cover" />
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/30 opacity-0 hover:opacity-100 transition-opacity">
              <Button size="sm" variant="secondary" className="h-7 text-xs" onClick={() => setBgExpanded(true)}>
                Change
              </Button>
              <Button size="sm" variant="secondary" className="h-7 text-xs" onClick={() => setBgImageUrl(null)}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}

        {/* Search UI */}
        {(bgExpanded || !bgImageUrl) && (
          <div className="px-3 pb-3 space-y-2">
            <form onSubmit={(e) => { e.preventDefault(); handleBgSearch(); }} className="flex gap-2">
              <Input
                placeholder="e.g. abstract, fashion, gradient…"
                value={bgQuery}
                onChange={(e) => setBgQuery(e.target.value)}
                className="flex-1 h-8 text-sm"
              />
              <Button type="submit" size="sm" disabled={bgSearching} className="h-8 px-2.5">
                {bgSearching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
              </Button>
            </form>

            {bgResults.length > 0 && (
              <div className="grid grid-cols-3 gap-1.5 max-h-40 overflow-y-auto">
                {bgResults.map((wp) => (
                  <button
                    key={wp.id}
                    onClick={() => handleSelectBg(wp)}
                    className="group relative rounded-md overflow-hidden border border-border/50 hover:border-primary/50 transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <img
                      src={wp.thumb}
                      alt={`By ${wp.photographer}`}
                      className="w-full h-16 object-cover"
                      loading="lazy"
                    />
                    <span className="absolute bottom-0 left-0 right-0 text-[8px] text-white/0 group-hover:text-white/90 bg-black/0 group-hover:bg-black/40 px-1 py-0.5 truncate transition-colors">
                      {wp.photographer}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
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
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs gap-1 text-primary"
            onClick={handleAiWrite}
            disabled={aiLoading || !productName.trim()}
          >
            {aiLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
            AI Write
          </Button>
        </div>
        <Input id="tagline" placeholder="e.g. Sleep in luxury ✨" value={tagline} onChange={(e) => setTagline(e.target.value)} />
      </div>
    </div>
  );
}