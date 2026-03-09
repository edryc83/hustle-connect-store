import { useState, useEffect, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, Image } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { Template } from "@/components/ad-studio/TemplatePicker";
import type { ImageSlotData } from "@/components/ad-studio/ImageSourceStep";

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
}

export default function TextStep({
  productName, setProductName,
  subtitle, setSubtitle,
  tagline, setTagline,
  price, setPrice,
  template,
  imageSlots,
  storeName,
}: TextStepProps) {
  const [suggesting, setSuggesting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Determine which fields this template supports (from Railway API)
  const fields = template?.fields || ["product_name", "price", "subtitle", "tagline"];
  const hasField = (f: string) => fields.includes(f);

  // Build the render body
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
    }, 1200); // 1.2s debounce to avoid hammering the API

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [template, productName, subtitle, tagline, price, buildBody]);

  // Initial preview on mount
  useEffect(() => {
    if (template && !previewUrl) {
      const body = buildBody();
      if (!body) return;
      setPreviewLoading(true);
      fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ad-render`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })
        .then((r) => r.json())
        .then((data) => {
          const url = data.url || data.image_url;
          if (url) setPreviewUrl(url);
        })
        .catch(console.error)
        .finally(() => setPreviewLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAiSuggest = async () => {
    if (!productName.trim()) return;
    setSuggesting(true);
    try {
      const { data, error } = await supabase.functions.invoke("ad-suggest-text", {
        body: { productName, price, templateStyle: template?.name || "modern" },
      });
      if (error) throw error;
      if (data?.subtitle && hasField("subtitle")) setSubtitle(data.subtitle);
      if (data?.tagline && hasField("tagline")) setTagline(data.tagline);
      toast({ title: "✨ AI copy generated!", description: "Feel free to edit the suggestions." });
    } catch (err: any) {
      console.error("AI suggest error:", err);
      toast({ title: "AI suggestion failed", description: err?.message || "Try again", variant: "destructive" });
    } finally {
      setSuggesting(false);
    }
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
              className={`w-full h-full object-contain transition-opacity ${previewLoading ? "opacity-50" : "opacity-100"}`}
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
            <Label className="text-xs text-muted-foreground mb-1 block">Subtitle</Label>
            <Input
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Short benefit line"
              maxLength={60}
            />
          </div>
        )}
        {hasField("tagline") && (
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">Tagline</Label>
            <Input
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="Catchy tagline"
              maxLength={40}
            />
          </div>
        )}
      </div>

      {(hasField("subtitle") || hasField("tagline")) && (
        <>
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
            AI Suggest Copy
          </Button>
          <p className="text-[10px] text-muted-foreground text-center">
            AI will generate copy based on your product
          </p>
        </>
      )}
    </div>
  );
}
