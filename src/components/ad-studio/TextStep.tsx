import { useState, useEffect, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, Image, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { Template } from "@/components/ad-studio/TemplatePicker";
import type { ImageSlotData } from "@/components/ad-studio/ImageSourceStep";

interface CopyVariation {
  subtitle: string;
  tagline: string;
}

interface TextStepProps {
  productName: string;
  setProductName: (v: string) => void;
  subtitle: string;
  setSubtitle: (v: string) => void;
  tagline: string;
  setTagline: (v: string) => void;
  price: string;
  setPrice: (v: string) => void;
  template: Template | null;
  imageSlots: ImageSlotData[];
  storeName: string;
  profilePicture?: string;
  autoSuggest?: boolean;
}

export default function TextStep({
  productName, setProductName,
  subtitle, setSubtitle,
  tagline, setTagline,
  price, setPrice,
  template,
  imageSlots,
  storeName,
  profilePicture,
  autoSuggest,
}: TextStepProps) {
  const [suggesting, setSuggesting] = useState(false);
  const [variations, setVariations] = useState<CopyVariation[]>([]);
  const [selectedVariation, setSelectedVariation] = useState<number | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoSuggestDone = useRef(false);

  // Template fields (from Railway API)
  const fields = template?.fields || ["product_name", "price", "subtitle", "tagline"];
  const hasField = (f: string) => fields.includes(f);

  // Character limits from template (Railway can define these)
  const charLimits = {
    subtitle: (template as any)?.char_limits?.subtitle || 50,
    tagline: (template as any)?.char_limits?.tagline || 35,
  };

  // Build render body
  const buildBody = useCallback(() => {
    if (!template) return null;
    const body: Record<string, string> = {
      template: template.id,
      product_name: productName || "Product Name",
      subtitle: subtitle || " ",
      tagline: tagline || " ",
      price: price || " ",
      store_name: storeName || "My Store",
    };
    imageSlots.forEach((slot, i) => {
      const imgUrl = slot.processedUrl || slot.url;
      if (imgUrl) body[`image${i + 1}`] = imgUrl;
    });
    return body;
  }, [template, productName, subtitle, tagline, price, storeName, imageSlots]);

  // Debounced live preview from Railway
  useEffect(() => {
    if (!template) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      const body = buildBody();
      if (!body) return;
      setPreviewLoading(true);
      try {
        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ad-render`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
          }
        );
        if (res.ok) {
          const data = await res.json();
          const url = data.url || data.image_url;
          if (url) setPreviewUrl(url);
        }
      } catch (err) {
        console.error("Preview render error:", err);
      } finally {
        setPreviewLoading(false);
      }
    }, 1200);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [template, productName, subtitle, tagline, price, buildBody]);

  // Auto-suggest copy when entering step 3 with a product name
  useEffect(() => {
    if (autoSuggest && productName.trim() && !autoSuggestDone.current) {
      autoSuggestDone.current = true;
      handleAiSuggest();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSuggest, productName]);

  const handleAiSuggest = async () => {
    if (!productName.trim()) return;
    setSuggesting(true);
    setVariations([]);
    setSelectedVariation(null);
    try {
      const { data, error } = await supabase.functions.invoke("ad-suggest-text", {
        body: {
          productName,
          price,
          templateStyle: template?.name || "modern",
          charLimits,
        },
      });
      if (error) throw error;

      if (data?.variations && data.variations.length > 0) {
        setVariations(data.variations);
        // Auto-select the first one
        applyVariation(data.variations[0], 0);
      } else if (data?.subtitle || data?.tagline) {
        // Legacy single response
        const v = { subtitle: data.subtitle || "", tagline: data.tagline || "" };
        setVariations([v]);
        applyVariation(v, 0);
      }
    } catch (err: any) {
      console.error("AI suggest error:", err);
      toast({ title: "AI suggestion failed", description: err?.message || "Try again", variant: "destructive" });
    } finally {
      setSuggesting(false);
    }
  };

  const applyVariation = (v: CopyVariation, index: number) => {
    setSelectedVariation(index);
    if (hasField("subtitle") && v.subtitle) setSubtitle(v.subtitle);
    if (hasField("tagline") && v.tagline) setTagline(v.tagline);
  };

  return (
    <div className="space-y-4 pb-4">
      {/* Live preview from Railway */}
      <div className="w-full max-w-sm mx-auto">
        <div className="relative aspect-[4/5] rounded-2xl overflow-hidden border border-border bg-muted shadow-lg">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Ad preview"
              className={`w-full h-full object-cover transition-opacity ${previewLoading ? "opacity-50" : "opacity-100"}`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              {previewLoading ? (
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              ) : (
                <Image className="h-10 w-10 text-muted-foreground/30" />
              )}
            </div>
          )}
          {previewLoading && previewUrl && (
            <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded-full p-1.5">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
            </div>
          )}
        </div>
        <p className="text-[10px] text-muted-foreground text-center mt-2">
          Live preview — rendered from template
        </p>
      </div>

      <h2 className="text-base font-semibold">Edit text</h2>

      <div className="space-y-3">
        {hasField("product_name") && (
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">Product Name</Label>
            <Input
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="e.g. Nike Air Max 90"
              maxLength={40}
            />
          </div>
        )}
        {hasField("price") && (
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">Price</Label>
            <Input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g. UGX 150,000"
            />
          </div>
        )}
        {hasField("subtitle") && (
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">
              Subtitle <span className="text-muted-foreground/50">({charLimits.subtitle} chars max)</span>
            </Label>
            <Input
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Short benefit line"
              maxLength={charLimits.subtitle}
            />
          </div>
        )}
        {hasField("tagline") && (
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">
              Tagline <span className="text-muted-foreground/50">({charLimits.tagline} chars max)</span>
            </Label>
            <Input
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="Catchy tagline"
              maxLength={charLimits.tagline}
            />
          </div>
        )}
      </div>

      {/* Copy variations */}
      {variations.length > 0 && (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Pick a copy style</Label>
          <div className="grid gap-2">
            {variations.map((v, i) => (
              <button
                key={i}
                onClick={() => applyVariation(v, i)}
                className={`text-left p-3 rounded-xl border transition-all ${
                  selectedVariation === i
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                    : "border-border hover:border-primary/30 bg-card"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5 min-w-0">
                    <p className="text-sm font-medium truncate">{v.subtitle}</p>
                    <p className="text-xs text-muted-foreground italic truncate">{v.tagline}</p>
                  </div>
                  {selectedVariation === i && (
                    <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* AI Suggest button */}
      {(hasField("subtitle") || hasField("tagline")) && (
        <Button
          variant="outline"
          className="w-full gap-2 border-primary/30 text-primary hover:bg-primary/5"
          onClick={handleAiSuggest}
          disabled={suggesting || !productName.trim()}
        >
          {suggesting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {variations.length > 0 ? "Regenerate Copy" : "AI Smart Copy"}
        </Button>
      )}
    </div>
  );
}
