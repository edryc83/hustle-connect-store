import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Sparkles, Loader2, ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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
}: TextStepProps) {
  const [aiLoading, setAiLoading] = useState(false);

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
      {imagePreview ? (
        <div className="rounded-xl border border-border overflow-hidden bg-muted/30">
          <img src={imagePreview} alt="Product" className="w-full max-h-48 object-contain bg-muted/20" />
          <div className="flex items-center justify-between px-3 py-2 border-t border-border">
            <div>
              <Label className="text-sm font-medium">Remove Background</Label>
              <p className="text-[11px] text-muted-foreground">Auto-strip for cleaner design</p>
            </div>
            <Switch checked={removeBg} onCheckedChange={onRemoveBgChange} />
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
