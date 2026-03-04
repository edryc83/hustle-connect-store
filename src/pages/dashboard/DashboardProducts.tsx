import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, ImageIcon, Package, Sparkles, Loader2, Wrench, X } from "lucide-react";
import { toast } from "sonner";
import { formatPrice } from "@/lib/currency";
import { Badge } from "@/components/ui/badge";
import { ProductImageCarousel } from "@/components/storefront/ProductImageCarousel";
import type { Tables } from "@/integrations/supabase/types";

type Product = Tables<"products">;

const LISTING_TYPES = [
  { value: "product", label: "Product" },
  { value: "service", label: "Service" },
];

const CONDITIONS = [
  { value: "new", label: "New" },
  { value: "used", label: "Used" },
  { value: "refurbished", label: "Refurbished" },
];

const DashboardProducts = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [productImages, setProductImages] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(searchParams.get("add") === "true");
  const [saving, setSaving] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [currency, setCurrency] = useState("UGX");
  const [generatingDesc, setGeneratingDesc] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [variantsText, setVariantsText] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [listingType, setListingType] = useState("product");
  const [condition, setCondition] = useState("");

  const fetchProducts = async () => {
    if (!user) return;
    const [{ data }, { data: profile }, { data: images }] = await Promise.all([
      supabase.from("products").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("profiles").select("currency").eq("id", user.id).single(),
      supabase.from("product_images").select("*").order("position", { ascending: true }),
    ]);
    setProducts(data ?? []);
    setCurrency((profile as any)?.currency ?? "UGX");

    // Build images map
    const imgMap: Record<string, string[]> = {};
    const productIds = new Set((data ?? []).map((p) => p.id));
    (images ?? []).forEach((img: any) => {
      if (productIds.has(img.product_id)) {
        if (!imgMap[img.product_id]) imgMap[img.product_id] = [];
        imgMap[img.product_id].push(img.image_url);
      }
    });
    // Also add legacy image_url as fallback
    (data ?? []).forEach((p) => {
      if (p.image_url && (!imgMap[p.id] || imgMap[p.id].length === 0)) {
        imgMap[p.id] = [p.image_url];
      }
    });
    setProductImages(imgMap);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, [user]);

  const resetForm = () => {
    setName("");
    setPrice("");
    setDescription("");
    setVariantsText("");
    setImageFiles([]);
    setImagePreviews([]);
    setExistingImages([]);
    setEditingProduct(null);
    setListingType("product");
    setCondition("");
  };

  const openAdd = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setPrice(String(product.price));
    setDescription(product.description ?? "");
    setVariantsText(product.variants_text ?? "");
    setExistingImages(productImages[product.id] ?? (product.image_url ? [product.image_url] : []));
    setImageFiles([]);
    setImagePreviews([]);
    setListingType((product as any).listing_type ?? "product");
    setCondition((product as any).condition ?? "");
    setDialogOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const totalImages = existingImages.length + imagePreviews.length + files.length;
    if (totalImages > 5) {
      toast.error("Maximum 5 images per listing");
      return;
    }
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is over 5MB`);
        return;
      }
    }
    setImageFiles((prev) => [...prev, ...files]);
    setImagePreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
  };

  const removeExistingImage = (idx: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const removeNewImage = (idx: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== idx));
    setImagePreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleGenerateDesc = async () => {
    if (!name.trim()) { toast.error("Enter a name first"); return; }
    setGeneratingDesc(true);
    try {
      const res = await supabase.functions.invoke("generate-description", {
        body: { productName: name, listingType, condition },
      });
      if (res.error) throw res.error;
      const desc = res.data?.description;
      if (desc) {
        setDescription(desc);
        toast.success("Description generated!");
      }
    } catch {
      toast.error("Failed to generate description");
    }
    setGeneratingDesc(false);
  };

  const handleSave = async () => {
    if (!user) return;
    if (!name.trim()) { toast.error("Name is required"); return; }
    const numericPrice = Number(price.replace(/,/g, ""));
    if (!price || isNaN(numericPrice) || numericPrice <= 0) { toast.error("Enter a valid price"); return; }

    setSaving(true);
    try {
      // Upload new images
      const newImageUrls: string[] = [];
      for (const file of imageFiles) {
        const ext = file.name.split(".").pop();
        const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from("product-images")
          .upload(path, file, { upsert: true });
        if (!uploadErr) {
          const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(path);
          newImageUrls.push(urlData.publicUrl);
        }
      }

      const allImages = [...existingImages, ...newImageUrls];
      const primaryImage = allImages[0] ?? null;

      const payload = {
        name: name.trim(),
        price: numericPrice,
        description: description.trim() || null,
        variants_text: variantsText.trim() || null,
        image_url: primaryImage,
        listing_type: listingType,
        condition: listingType === "product" ? (condition || null) : null,
      } as any;

      let productId: string;

      if (editingProduct) {
        const { error } = await supabase
          .from("products")
          .update(payload)
          .eq("id", editingProduct.id);
        if (error) throw error;
        productId = editingProduct.id;

        // Clear old product_images and re-insert
        await supabase.from("product_images").delete().eq("product_id", productId);
      } else {
        const { data: inserted, error } = await supabase.from("products").insert({
          user_id: user.id,
          ...payload,
        }).select("id").single();
        if (error) throw error;
        productId = inserted.id;
      }

      // Insert all images into product_images table
      if (allImages.length > 0) {
        await supabase.from("product_images").insert(
          allImages.map((url, i) => ({
            product_id: productId,
            image_url: url,
            position: i,
          }))
        );
      }

      toast.success(editingProduct ? "Listing updated!" : "Listing added! 🎉");
      setDialogOpen(false);
      resetForm();
      searchParams.delete("add");
      setSearchParams(searchParams);
      fetchProducts();
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete");
    } else {
      toast.success("Listing deleted");
      fetchProducts();
    }
  };

  if (loading) {
    return <div className="animate-pulse text-muted-foreground py-12 text-center">Loading listings…</div>;
  }

  const allFormImages = [...existingImages, ...imagePreviews];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Listings</h1>
          <p className="text-sm text-muted-foreground">{products.length} listing{products.length !== 1 ? "s" : ""}</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) { resetForm(); searchParams.delete("add"); setSearchParams(searchParams); }
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={openAdd}>
              <Plus className="h-4 w-4" /> Add Listing
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduct ? "Edit Listing" : "Add Listing"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              {/* Listing Type */}
              <div className="space-y-1.5">
                <Label>Type</Label>
                <div className="flex gap-2">
                  {LISTING_TYPES.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => { setListingType(t.value); if (t.value === "service") setCondition(""); }}
                      className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                        listingType === t.value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      {t.value === "service" ? <Wrench className="h-3.5 w-3.5 inline mr-1.5" /> : <Package className="h-3.5 w-3.5 inline mr-1.5" />}
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="productName">Name</Label>
                <Input id="productName" placeholder={listingType === "service" ? "e.g. Hair braiding" : "e.g. Rolex wrap"} value={name} onChange={(e) => setName(e.target.value)} maxLength={100} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="productPrice">Price ({currency})</Label>
                <Input id="productPrice" placeholder="5,000" value={price} onChange={(e) => setPrice(e.target.value)} />
              </div>

              {/* Condition - only for products */}
              {listingType === "product" && (
                <div className="space-y-1.5">
                  <Label>Condition</Label>
                  <Select value={condition} onValueChange={setCondition}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select condition (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {CONDITIONS.map((c) => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="productDesc">Description</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1 text-xs text-primary"
                    onClick={handleGenerateDesc}
                    disabled={generatingDesc}
                  >
                    {generatingDesc ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                    {generatingDesc ? "Generating…" : "AI Generate"}
                  </Button>
                </div>
                <Textarea id="productDesc" placeholder={listingType === "service" ? "What does this service include?" : "What makes this product special?"} value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="productVariants">Variants / Options</Label>
                <Input id="productVariants" placeholder="e.g. Small, Medium, Large" value={variantsText} onChange={(e) => setVariantsText(e.target.value)} />
              </div>

              {/* Multi-image upload */}
              <div className="space-y-1.5">
                <Label>Images <span className="text-muted-foreground font-normal">(up to 5)</span></Label>
                {allFormImages.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {existingImages.map((url, i) => (
                      <div key={`existing-${i}`} className="relative h-16 w-16">
                        <img src={url} alt="" className="h-16 w-16 rounded-lg object-cover border" />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(i)}
                          className="absolute -top-1.5 -right-1.5 rounded-full bg-destructive text-destructive-foreground p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    {imagePreviews.map((url, i) => (
                      <div key={`new-${i}`} className="relative h-16 w-16">
                        <img src={url} alt="" className="h-16 w-16 rounded-lg object-cover border" />
                        <button
                          type="button"
                          onClick={() => removeNewImage(i)}
                          className="absolute -top-1.5 -right-1.5 rounded-full bg-destructive text-destructive-foreground p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {allFormImages.length < 5 && (
                  <label className="cursor-pointer inline-block">
                    <span className="text-sm font-medium text-primary hover:underline">
                      {allFormImages.length > 0 ? "+ Add more" : "Upload images"}
                    </span>
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange} />
                  </label>
                )}
              </div>

              <Button className="w-full" onClick={handleSave} disabled={saving}>
                {saving ? "Saving…" : editingProduct ? "Update Listing" : "Add Listing"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {products.length === 0 ? (
        <Card className="py-16">
          <CardContent className="flex flex-col items-center gap-3 text-center">
            <Package className="h-12 w-12 text-muted-foreground/50" />
            <p className="text-lg font-medium">No listings yet</p>
            <p className="text-sm text-muted-foreground">Add your first product or service to start selling!</p>
            <Button className="mt-2 gap-2" onClick={openAdd}>
              <Plus className="h-4 w-4" /> Add Listing
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => {
            const imgs = productImages[product.id] ?? (product.image_url ? [product.image_url] : []);
            return (
              <Card key={product.id} className="group overflow-hidden">
                <div className="relative aspect-square bg-muted">
                  <ProductImageCarousel images={imgs} alt={product.name} listingType={(product as any).listing_type} />
                  <div className="absolute inset-0 flex items-start justify-end gap-1 p-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button size="icon" variant="secondary" className="h-8 w-8" onClick={() => openEdit(product)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="destructive" className="h-8 w-8" onClick={() => handleDelete(product.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  {/* Badges */}
                  <div className="absolute top-1.5 left-1.5 flex flex-col gap-1">
                    {(product as any).listing_type === "service" && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Service</Badge>
                    )}
                    {(product as any).condition && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-background/80">
                        {(product as any).condition === "new" ? "New" : (product as any).condition === "used" ? "Used" : "Refurbished"}
                      </Badge>
                    )}
                    {imgs.length > 1 && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{imgs.length} 📷</Badge>
                    )}
                  </div>
                </div>
                <CardContent className="p-3">
                  <p className="font-medium text-sm truncate">{product.name}</p>
                  <p className="text-primary font-bold text-sm">{formatPrice(Number(product.price), currency)}</p>
                  {product.variants_text && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{product.variants_text}</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DashboardProducts;
