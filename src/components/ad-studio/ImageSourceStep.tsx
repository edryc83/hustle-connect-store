import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Package, Loader2, Wand2, ImagePlus, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";


export interface ImageSlotData {
  url: string | null;
  file: File | null;
  removeBg: boolean;
  processedUrl: string | null;
  productName?: string;
  productPrice?: number;
  cropData?: { scale: number; offsetX: number; offsetY: number };
}

interface Props {
  slots: ImageSlotData[];
  onUpdateSlot: (index: number, data: Partial<ImageSlotData>) => void;
  userId: string;
}

function ImageSourceStep({ slots, onUpdateSlot, userId }: Props) {
  const [pickerOpen, setPickerOpen] = useState(() => {
    // Auto-open if no image selected yet
    return !slots[0]?.url && !slots[0]?.processedUrl;
  });
  const [processingBg, setProcessingBg] = useState(false);
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

  const slot = slots[0];
  if (!slot) return null;

  const hasImage = !!(slot.processedUrl || slot.url);

  const handleSelectProduct = (product: any) => {
    onUpdateSlot(0, {
      url: product.image_url,
      file: null,
      processedUrl: null,
      removeBg: false,
      productName: product.name,
      productPrice: product.price,
    });
    setPickerOpen(false);
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
      onUpdateSlot(0, { url: data.publicUrl, file, processedUrl: null, removeBg: false });
      setPickerOpen(false);
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveBg = async (enabled: boolean) => {
    onUpdateSlot(0, { removeBg: enabled });
    if (enabled && slot.url) {
      setProcessingBg(true);
      try {
        const { data, error } = await supabase.functions.invoke("remove-background", {
          body: { image_url: slot.url },
        });
        if (error) throw error;
        if (!data?.url) throw new Error("No processed image returned");
        onUpdateSlot(0, { processedUrl: data.url });
        toast({ title: "Background removed!", description: "Image processed successfully" });
      } catch (err: any) {
        console.error("BG removal error:", err);
        toast({ title: "Background removal failed", description: err?.message || "Try again", variant: "destructive" });
        onUpdateSlot(0, { removeBg: false });
      } finally {
        setProcessingBg(false);
      }
    } else {
      onUpdateSlot(0, { processedUrl: null });
    }
  };

  return (
    <div className="space-y-4 pb-4">
      <h2 className="text-base font-semibold">Product Image</h2>

      {/* Selected image display */}
      {hasImage ? (
        <div className="space-y-3">
          <div className="relative rounded-xl overflow-hidden border border-border bg-muted aspect-square max-w-[240px] mx-auto">
            <img
              src={slot.processedUrl || slot.url!}
              alt="Selected"
              className="w-full h-full object-contain"
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2"
            onClick={() => setPickerOpen(true)}
          >
            <RefreshCw className="h-3.5 w-3.5" /> Change Image
          </Button>

          {/* Remove Background toggle */}
          <div className="flex items-center justify-between rounded-xl border border-border p-3 bg-card">
            <div className="flex items-center gap-2">
              <Wand2 className="h-4 w-4 text-muted-foreground" />
              <Label className="text-sm">Remove Background</Label>
            </div>
            {processingBg ? (
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            ) : (
              <Switch
                checked={slot.removeBg}
                onCheckedChange={handleRemoveBg}
              />
            )}
          </div>
        </div>
      ) : (
        <button
          onClick={() => setPickerOpen(true)}
          className="w-full flex flex-col items-center justify-center gap-3 border-2 border-dashed border-border rounded-xl p-10 hover:border-primary/40 transition-colors"
        >
          <ImagePlus className="h-10 w-10 text-muted-foreground/50" />
          <span className="text-sm text-muted-foreground">Tap to select a product image</span>
        </button>
      )}

      {/* Picker Dialog */}
      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Choose an image</DialogTitle>
          </DialogHeader>

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
                <div className="grid grid-cols-3 gap-2 max-h-[50vh] overflow-y-auto">
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
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ImageSourceStep;
