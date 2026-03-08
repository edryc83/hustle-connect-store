import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Upload, Check, ImageIcon } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface ProductStepProps {
  selectedProductId: string | null;
  onSelectProduct: (product: {
    id: string;
    name: string;
    price: number;
    imageUrl: string;
    currency?: string;
  }) => void;
  imageFile: File | null;
  imagePreview: string | null;
  onUploadImage: (file: File, preview: string) => void;
  removeBg: boolean;
  onRemoveBgChange: (v: boolean) => void;
}

export default function ProductStep({
  selectedProductId,
  onSelectProduct,
  imageFile,
  imagePreview,
  onUploadImage,
  removeBg,
  onRemoveBgChange,
}: ProductStepProps) {
  const { user } = useAuth();

  const { data: products, isLoading } = useQuery({
    queryKey: ["my-products-for-ad", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: prods } = await supabase
        .from("products")
        .select("id, name, price, image_url, discount_price")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (!prods?.length) return [];

      const { data: imgs } = await supabase
        .from("product_images")
        .select("product_id, image_url, position")
        .in("product_id", prods.map((p) => p.id))
        .order("position", { ascending: true });

      return prods.map((p) => ({
        ...p,
        firstImage: imgs?.find((i) => i.product_id === p.id)?.image_url || p.image_url,
      }));
    },
  });

  const { data: profile } = useQuery({
    queryKey: ["profile-currency", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("currency")
        .eq("id", user!.id)
        .single();
      return data;
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onUploadImage(file, URL.createObjectURL(file));
  };

  return (
    <div className="space-y-4 pb-4">
      <h2 className="text-base font-semibold">Choose a product or upload</h2>

      {/* Upload option */}
      <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-xl p-5 cursor-pointer hover:border-primary/50 transition-colors bg-muted/30">
        {imagePreview && !selectedProductId ? (
          <img src={imagePreview} alt="Upload" className="max-h-32 rounded-lg object-contain" />
        ) : (
          <>
            <Upload className="h-7 w-7 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Upload a new photo</span>
          </>
        )}
        <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      </label>

      {/* Product grid */}
      {isLoading ? (
        <div className="grid grid-cols-3 gap-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="aspect-square rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : products && products.length > 0 ? (
        <>
          <p className="text-xs text-muted-foreground">Or pick from your products</p>
          <div className="grid grid-cols-3 gap-2">
            {products.map((p) => (
              <button
                key={p.id}
                onClick={() =>
                  onSelectProduct({
                    id: p.id,
                    name: p.name,
                    price: p.discount_price ?? p.price,
                    imageUrl: p.firstImage || "",
                    currency: profile?.currency || "UGX",
                  })
                }
                className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                  selectedProductId === p.id
                    ? "border-primary ring-2 ring-primary/30"
                    : "border-border hover:border-primary/40"
                }`}
              >
                {p.firstImage ? (
                  <img src={p.firstImage} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                {selectedProductId === p.id && (
                  <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                    <Check className="h-6 w-6 text-primary-foreground bg-primary rounded-full p-0.5" />
                  </div>
                )}
                <span className="absolute bottom-0 inset-x-0 bg-background/80 text-[10px] px-1 py-0.5 truncate text-center">
                  {p.name}
                </span>
              </button>
            ))}
          </div>
        </>
      ) : null}

      {/* Remove BG toggle */}
      <div className="flex items-center justify-between rounded-xl border border-border p-3 bg-card">
        <div>
          <Label className="text-sm font-medium">Remove Background</Label>
          <p className="text-xs text-muted-foreground">Auto-strip product background</p>
        </div>
        <Switch checked={removeBg} onCheckedChange={onRemoveBgChange} />
      </div>
    </div>
  );
}
