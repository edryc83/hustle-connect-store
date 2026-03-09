import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface TextStepProps {
  productName: string;
  setProductName: (v: string) => void;
  subtitle: string;
  setSubtitle: (v: string) => void;
  tagline: string;
  setTagline: (v: string) => void;
  price: string;
  setPrice: (v: string) => void;
  templateStyle: string;
}

export default function TextStep({
  productName, setProductName,
  subtitle, setSubtitle,
  tagline, setTagline,
  price, setPrice,
  templateStyle,
}: TextStepProps) {
  const [suggesting, setSuggesting] = useState(false);

  const handleAiSuggest = async () => {
    if (!productName.trim()) return;
    setSuggesting(true);
    try {
      const { data, error } = await supabase.functions.invoke("ad-suggest-text", {
        body: { productName, price, templateStyle },
      });
      if (error) throw error;
      if (data?.subtitle) setSubtitle(data.subtitle);
      if (data?.tagline) setTagline(data.tagline);
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
      <h2 className="text-base font-semibold">Add text</h2>

      <div className="space-y-3">
        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">Product Name</Label>
          <Input
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="e.g. Nike Air Max 90"
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">Price</Label>
          <Input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="e.g. UGX 150,000"
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">Subtitle</Label>
          <Input
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="A compelling subtitle for your ad"
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">Tagline</Label>
          <Input
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            placeholder="Your catchy tagline"
          />
        </div>
      </div>

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
        AI will generate a subtitle and tagline based on your product
      </p>
    </div>
  );
}
