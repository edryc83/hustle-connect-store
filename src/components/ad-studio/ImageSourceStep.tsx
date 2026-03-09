import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Package, X, Loader2, Wand2 } from "lucide-react";
import { removeBackground } from "@imgly/background-removal";

export interface ImageSlotData {
  url: string | null;
  file: File | null;
  removeBg: boolean;
  processedUrl: string | null;
  productName?: string;
  productPrice?: number;
}

interface Props {
  slots: ImageSlotData[];
  onUpdateSlot: (index: number, data: Partial<ImageSlotData>) => void;
  userId: string;
}

const ImageSfunction ImageSourceStep({ slots, onUpdateSlot, userId }: Props[activeSlot, setActiveSlot] = useState(0);
  const [processingBg, setProcessingBg] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);

  const { data: products = [] } = useQuery({
    queryKey: ["my-products-ad", userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("id, name, price, image_url")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  const handleSelectProduct = (product: any) => {
    onUpdateSlot(activeSlot, {
      url: product.image_url,
      file: null,
      processedUrl: null,
      productName: product.name,
      productPrice: product.price,
    });
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${userId}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from("ad-images")
        .upload(path, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from("ad-images").getPublicUrl(path);
      onUpdateSlot(activeSlot, { url: data.publicUrl, file, processedUrl: null });
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveBg = async (index: number, enabled: boolean) => {
    onUpdateSlot(index, { removeBg: enabled });
    if (enabled && slots[index].url) {
      setProcessingBg(index);
      try {
        const blob = await removeBackground(slots[index].url!);
        const processedUrl = URL.createObjectURL(blob);
        onUpdateSlot(index, { processedUrl });
      } catch (err) {
        console.error("BG removal error:", err);
        onUpdateSlot(index, { removeBg: false });
      } finally {
        setProcessingBg(null);
      }
    } else {
      onUpdateSlot(index, { processedUrl: null });
    }
  };

  const slot = slots[activeSlot];
  if (!slot) return null;

  return (
    <div className="space-y-4 pb-4">
      <h2 className="text-base font-semibold">Add images</h2>

      {/* Slot selector tabs */}
      {slots.length > 1 && (
        <div className="flex gap-2">
          {slots.map((s, i) => (
            <button
              key={i}
              onClick={() => setActiveSlot(i)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                activeSlot === i
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/40"
              }`}
            >
              Image {i + 1}
              {(s.url || s.processedUrl) && <span className="ml-1 text-green-500">✓</span>}
            </button>
          ))}
        </div>
      )}

      {/* Current slot preview */}
      {(slot.processedUrl || slot.url) && (
        <div className="relative rounded-xl overflow-hidden border border-border bg-muted aspect-square max-w-[200px]">
          <img
            src={slot.processedUrl || slot.url!}
            alt="Selected"
            className="w-full h-full object-contain"
          />
          <button
            onClick={() => onUpdateSlot(activeSlot, { url: null, file: null, processedUrl: null, removeBg: false })}
            className="absolute top-1.5 right-1.5 bg-background/80 backdrop-blur-sm rounded-full p-1 hover:bg-background"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Source tabs */}
      <Tabs defaultValue="products">
        <TabsList className="w-full">
          <TabsTrigger value="products" className="flex-1 gap-1.5">
            <Package className="h-3.5 w-3.5" /> My Products
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex-1 gap-1.5">
            <Upload className="h-3.5 w-3.5" /> Upload
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="mt-3">
          {products.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No products yet. Upload an image instead.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-2 max-h-[40vh] overflow-y-auto">
              {products.filter((p) => p.image_url).map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleSelectProduct(p)}
                  className={`rounded-lg overflow-hidden border-2 transition-all aspect-square ${
                    slot.url === p.image_url
                      ? "border-primary ring-1 ring-primary/30"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  <img src={p.image_url!} alt={p.name} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="upload" className="mt-3">
          <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-xl p-8 cursor-pointer hover:border-primary/40 transition-colors">
            {uploading ? (
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            ) : (
              <>
                <Upload className="h-8 w-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Tap to upload an image</span>
              </>
            )}
            <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
          </label>
        </TabsContent>
      </Tabs>

      {/* Remove Background toggle */}
      {slot.url && (
        <div className="flex items-center justify-between rounded-xl border border-border p-3 bg-card">
          <div className="flex items-center gap-2">
            <Wand2 className="h-4 w-4 text-muted-foreground" />
            <Label className="text-sm">Remove Background</Label>
          </div>
          {processingBg === activeSlot ? (
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          ) : (
            <Switch
              checked={slot.removeBg}
              onCheckedChange={(v) => handleRemoveBg(activeSlot, v)}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default ImageSourceStep;
