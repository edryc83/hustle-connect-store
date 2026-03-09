import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";
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

  // Determine which fields this template supports
  const fields = template?.fields || ["product_name", "price", "subtitle", "tagline"];
  const hasField = (f: string) => fields.includes(f);

  const mainImage = imageSlots[0]?.processedUrl || imageSlots[0]?.url;

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
      {/* Live preview of chosen template at top */}
      {template && (
        <div className="w-full max-w-sm mx-auto">
          <div className="relative aspect-[4/5] rounded-2xl overflow-hidden border border-border bg-card shadow-lg">
            {/* Use template thumbnail as background reference */}
            {template.thumbnail ? (
              <img src={template.thumbnail} alt={template.name} className="absolute inset-0 w-full h-full object-cover opacity-40" />
            ) : null}

            {/* Product image overlay */}
            {mainImage && (
              <img src={mainImage} alt="Product" className="absolute inset-0 w-full h-full object-contain z-10" />
            )}

            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-20" />

            {/* Text overlay - updates in real time */}
            <div className="absolute bottom-0 inset-x-0 p-4 space-y-1 z-30">
              {storeName && (
                <p className="text-[10px] font-medium text-white/60 uppercase tracking-wider">{storeName}</p>
              )}
              <h3 className="text-lg font-bold text-white leading-tight">
                {productName || "Product Name"}
              </h3>
              {hasField("subtitle") && subtitle && (
                <p className="text-xs text-white/80">{subtitle}</p>
              )}
              {hasField("tagline") && tagline && (
                <p className="text-[10px] text-white/60 italic">{tagline}</p>
              )}
              {price && (
                <div className="inline-block mt-1 bg-white/20 backdrop-blur-sm rounded-md px-2 py-0.5">
                  <span className="text-sm font-bold text-white">{price}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
