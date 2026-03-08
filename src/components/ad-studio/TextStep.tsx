import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Sparkles, Loader2, ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { removeBackground } from "@imgly/background-removal";

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
}: TextStepProps) {
  const [aiLoading, setAiLoading] = useState(false);
  const [bgRemovalLoading, setBgRemovalLoading] = useState(false);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const originalImageRef = useRef<string | null>(null);

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
        // Silently revert toggle
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
