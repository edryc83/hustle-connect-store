import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, ImageIcon, Package } from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type Product = Tables<"products">;

const DashboardProducts = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(searchParams.get("add") === "true");
  const [saving, setSaving] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [variantsText, setVariantsText] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  const fetchProducts = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setProducts(data ?? []);
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
    setImageFile(null);
    setImagePreview("");
    setEditingProduct(null);
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
    setImagePreview(product.image_url ?? "");
    setDialogOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be under 5MB");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!user) return;
    if (!name.trim()) { toast.error("Product name is required"); return; }
    if (!price || isNaN(Number(price)) || Number(price) <= 0) { toast.error("Enter a valid price"); return; }

    setSaving(true);
    try {
      let imageUrl = editingProduct?.image_url ?? null;

      if (imageFile) {
        const ext = imageFile.name.split(".").pop();
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from("product-images")
          .upload(path, imageFile, { upsert: true });
        if (!uploadErr) {
          const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(path);
          imageUrl = urlData.publicUrl;
        }
      }

      if (editingProduct) {
        const { error } = await supabase
          .from("products")
          .update({
            name: name.trim(),
            price: Number(price),
            description: description.trim() || null,
            variants_text: variantsText.trim() || null,
            image_url: imageUrl,
          })
          .eq("id", editingProduct.id);
        if (error) throw error;
        toast.success("Product updated!");
      } else {
        const { error } = await supabase.from("products").insert({
          user_id: user.id,
          name: name.trim(),
          price: Number(price),
          description: description.trim() || null,
          variants_text: variantsText.trim() || null,
          image_url: imageUrl,
        });
        if (error) throw error;
        toast.success("Product added! 🎉");
      }

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
      toast.error("Failed to delete product");
    } else {
      toast.success("Product deleted");
      fetchProducts();
    }
  };

  if (loading) {
    return <div className="animate-pulse text-muted-foreground py-12 text-center">Loading products…</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-sm text-muted-foreground">{products.length} product{products.length !== 1 ? "s" : ""}</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) { resetForm(); searchParams.delete("add"); setSearchParams(searchParams); }
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={openAdd}>
              <Plus className="h-4 w-4" /> Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduct ? "Edit Product" : "Add Product"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="productName">Name</Label>
                <Input id="productName" placeholder="e.g. Rolex wrap" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="productPrice">Price (UGX)</Label>
                <Input id="productPrice" type="number" placeholder="5000" value={price} onChange={(e) => setPrice(e.target.value)} min="0" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="productDesc">Description</Label>
                <Textarea id="productDesc" placeholder="What makes this product special?" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="productVariants">Variants / Options</Label>
                <Input id="productVariants" placeholder="e.g. Small, Medium, Large" value={variantsText} onChange={(e) => setVariantsText(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Product Image</Label>
                <div className="flex items-center gap-3">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="h-16 w-16 rounded-lg object-cover border" />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-muted">
                      <ImageIcon className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <label className="cursor-pointer">
                    <span className="text-sm font-medium text-primary hover:underline">
                      {imagePreview ? "Change" : "Upload"}
                    </span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </label>
                </div>
              </div>
              <Button className="w-full" onClick={handleSave} disabled={saving}>
                {saving ? "Saving…" : editingProduct ? "Update Product" : "Add Product"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {products.length === 0 ? (
        <Card className="py-16">
          <CardContent className="flex flex-col items-center gap-3 text-center">
            <Package className="h-12 w-12 text-muted-foreground/50" />
            <p className="text-lg font-medium">No products yet</p>
            <p className="text-sm text-muted-foreground">Add your first product to start selling!</p>
            <Button className="mt-2 gap-2" onClick={openAdd}>
              <Plus className="h-4 w-4" /> Add Product
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <Card key={product.id} className="group overflow-hidden">
              <div className="relative aspect-square bg-muted">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
                  </div>
                )}
                <div className="absolute inset-0 flex items-start justify-end gap-1 p-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button size="icon" variant="secondary" className="h-8 w-8" onClick={() => openEdit(product)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="icon" variant="destructive" className="h-8 w-8" onClick={() => handleDelete(product.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <CardContent className="p-3">
                <p className="font-medium text-sm truncate">{product.name}</p>
                <p className="text-primary font-bold text-sm">UGX {Number(product.price).toLocaleString()}</p>
                {product.variants_text && (
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{product.variants_text}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardProducts;
