import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useBusinessTerms } from "@/hooks/useBusinessTerms";
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
import { Plus, Pencil, Trash2, ImageIcon, Package, Sparkles, Loader2, Wrench, X, Star, ChevronRight, Camera } from "lucide-react";
import { toast } from "sonner";
import { formatPrice } from "@/lib/currency";
import whatsappIcon from "@/assets/whatsapp-icon.png";
import { Badge } from "@/components/ui/badge";
import type { Tables } from "@/integrations/supabase/types";
import { ProductAttributeForm } from "@/components/dashboard/ProductAttributeForm";
import type { AiAttributeSuggestion } from "@/lib/attributeLibrary";
import { aiSlugToCategory } from "@/lib/categoryMapping";

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

/** Format a numeric string with commas as the user types */
function formatCommaInput(raw: string): string {
  const digits = raw.replace(/[^0-9]/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("en-US");
}

const DashboardProducts = () => {
  const { user } = useAuth();
  const terms = useBusinessTerms();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [productImages, setProductImages] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(searchParams.get("add") === "true");
  const [saving, setSaving] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [currency, setCurrency] = useState("UGX");
  const [profile, setProfile] = useState<{ store_name?: string; store_slug?: string } | null>(null);
  const [generatingDesc, setGeneratingDesc] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiFilledFields, setAiFilledFields] = useState<Set<string>>(new Set());
  const [aiSuggestions, setAiSuggestions] = useState<AiAttributeSuggestion[]>([]);
  const [detectedSubcategory, setDetectedSubcategory] = useState("");
  const [detectedCategory, setDetectedCategory] = useState("");

  // Form state
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [discountPercent, setDiscountPercent] = useState("");
  const [description, setDescription] = useState("");
  const [variantsText, setVariantsText] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [listingType, setListingType] = useState("product");
  const [condition, setCondition] = useState("");
  const [attributes, setAttributes] = useState<Record<string, any>>({});

  const fetchProducts = async () => {
    if (!user) return;
    const [{ data }, { data: profileData }] = await Promise.all([
      supabase.from("products").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("profiles").select("currency, store_name, store_slug").eq("id", user.id).single(),
    ]);
    const productIds = (data ?? []).map((p) => p.id);
    const { data: images } = productIds.length > 0
      ? await supabase.from("product_images").select("*").in("product_id", productIds).order("position", { ascending: true })
      : { data: [] };
    setProducts(data ?? []);
    const p = profileData as any;
    setCurrency(p?.currency ?? "UGX");
    setProfile({ store_name: p?.store_name, store_slug: p?.store_slug });

    const imgMap: Record<string, string[]> = {};
    const productIdSet = new Set(productIds);
    (images ?? []).forEach((img: any) => {
      if (productIdSet.has(img.product_id)) {
        if (!imgMap[img.product_id]) imgMap[img.product_id] = [];
        imgMap[img.product_id].push(img.image_url);
      }
    });
    (data ?? []).forEach((p) => {
      if (p.image_url && (!imgMap[p.id] || imgMap[p.id].length === 0)) {
        imgMap[p.id] = [p.image_url];
      }
    });
    setProductImages(imgMap);
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, [user]);

  const resetForm = () => {
    setName(""); setPrice(""); setDiscountPrice(""); setDiscountPercent(""); setDescription(""); setVariantsText("");
    setImageFiles([]); setImagePreviews([]); setExistingImages([]);
    setEditingProduct(null); setListingType("product"); setCondition(""); setAttributes({});
    setAiFilledFields(new Set()); setAiSuggestions([]); setDetectedSubcategory(""); setDetectedCategory("");
  };

  const openAdd = () => { resetForm(); setDialogOpen(true); };

  const openDuplicate = (product: Product) => {
    resetForm();
    setName(product.name + " (copy)");
    setPrice(formatCommaInput(String(product.price)));
    setDiscountPrice((product as any).discount_price ? formatCommaInput(String((product as any).discount_price)) : "");
    if ((product as any).discount_price && product.price > 0) {
      setDiscountPercent(String(Math.round(((product.price - Number((product as any).discount_price)) / product.price) * 100)));
    } else { setDiscountPercent(""); }
    setDescription(product.description ?? "");
    setVariantsText(product.variants_text ?? "");
    setExistingImages(productImages[product.id] ?? (product.image_url ? [product.image_url] : []));
    setListingType((product as any).listing_type ?? "product");
    setCondition((product as any).condition ?? "");
    setAttributes((product as any).attributes ?? {});
    setEditingProduct(null);
    setDialogOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setPrice(formatCommaInput(String(product.price)));
    setDiscountPrice((product as any).discount_price ? formatCommaInput(String((product as any).discount_price)) : "");
    if ((product as any).discount_price && product.price > 0) {
      setDiscountPercent(String(Math.round(((product.price - Number((product as any).discount_price)) / product.price) * 100)));
    } else { setDiscountPercent(""); }
    setDescription(product.description ?? "");
    setVariantsText(product.variants_text ?? "");
    setExistingImages(productImages[product.id] ?? (product.image_url ? [product.image_url] : []));
    setImageFiles([]); setImagePreviews([]);
    setListingType((product as any).listing_type ?? "product");
    setCondition((product as any).condition ?? "");
    setAttributes((product as any).attributes ?? {});
    setDetectedCategory((product as any).category ?? "");
    setDialogOpen(true);
  };

  const analyzeProduct = async (file?: File) => {
    setAnalyzing(true);
    try {
      const body: any = {};
      
      if (file) {
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve) => {
          reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(",")[1]);
          };
          reader.readAsDataURL(file);
        });
        body.imageBase64 = base64;
        body.mimeType = file.type;
      }
      
      // Also send title and description for text-based detection
      if (name.trim()) body.productName = name.trim();
      if (description.trim()) body.productDescription = description.trim();

      if (!body.imageBase64 && !body.productName && !body.productDescription) {
        setAnalyzing(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke("analyze-product-image", { body });

      if (error) throw error;
      if (data) {
        const filled = new Set<string>();
        if (data.name && !name.trim()) { setName(data.name); filled.add("name"); }
        if (data.description && !description.trim()) { setDescription(data.description); filled.add("description"); }
        if (data.listing_type) { setListingType(data.listing_type); filled.add("type"); }
        
        if (data.category) {
          const mappedCat = aiSlugToCategory(data.category);
          if (mappedCat) {
            setDetectedCategory(mappedCat);
          }
          setAttributes((prev) => ({ ...prev, product_type: data.category }));
          filled.add("category");
        }
        if (data.subcategory) {
          setDetectedSubcategory(data.subcategory);
        }
        if (data.suggestions && Array.isArray(data.suggestions)) {
          setAiSuggestions(data.suggestions);
        }
        
        setAiFilledFields(filled);
        if (filled.size > 0 || (data.suggestions && data.suggestions.length > 0)) {
          toast.success("✨ AI analyzed your product and suggested details!");
        }
      }
    } catch {
      // Silent fail — user can still fill manually
    }
    setAnalyzing(false);
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFiles = Array.from(e.target.files ?? []);
    const totalImages = existingImages.length + imagePreviews.length + rawFiles.length;
    if (totalImages > 5) { toast.error(`Maximum 5 images per ${terms.singular.toLowerCase()}`); return; }
    for (const file of rawFiles) {
      if (file.size > 5 * 1024 * 1024) { toast.error(`${file.name} is over 5MB`); return; }
    }

    // Compress images before storing
    const { compressImages } = await import("@/lib/imageCompression");
    const files = await compressImages(rawFiles);

    setImageFiles((prev) => [...prev, ...files]);
    setImagePreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);

    // Auto-analyze the first image if no name has been entered yet
    const isFirstImage = existingImages.length === 0 && imagePreviews.length === 0;
    if (isFirstImage && rawFiles.length > 0 && !name.trim()) {
      analyzeProduct(rawFiles[0]);
    }
  };

  const removeExistingImage = (idx: number) => setExistingImages((prev) => prev.filter((_, i) => i !== idx));
  const removeNewImage = (idx: number) => {
    // Revoke the object URL to prevent memory leak
    URL.revokeObjectURL(imagePreviews[idx]);
    setImageFiles((prev) => prev.filter((_, i) => i !== idx));
    setImagePreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleGenerateDesc = async () => {
    if (!name.trim()) { toast.error("Enter a name first"); return; }
    setGeneratingDesc(true);
    try {
      const res = await supabase.functions.invoke("generate-description", { body: { productName: name, listingType, condition } });
      if (res.error) throw res.error;
      if (res.data?.description) { setDescription(res.data.description); toast.success("Description generated!"); }
    } catch { toast.error("Failed to generate description"); }
    setGeneratingDesc(false);
  };

  const handleSave = async () => {
    if (!user) return;
    if (!name.trim()) { toast.error("Name is required"); return; }
    const numericPrice = Number(price.replace(/,/g, ""));
    if (!price || isNaN(numericPrice) || numericPrice <= 0) { toast.error("Enter a valid price"); return; }

    setSaving(true);
    try {
      // If no category detected yet, do a quick text-based AI detection
      let finalCategory = detectedCategory;
      if (!finalCategory && name.trim()) {
        try {
          const { data: catData } = await supabase.functions.invoke("analyze-product-image", {
            body: { productName: name.trim(), productDescription: description.trim() || undefined },
          });
          if (catData?.category) {
            finalCategory = aiSlugToCategory(catData.category) || "";
          }
        } catch { /* silent — save without category */ }
      }

      const newImageUrls: string[] = [];
      for (const file of imageFiles) {
        const ext = file.name.split(".").pop();
        const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadErr } = await supabase.storage.from("product-images").upload(path, file, { upsert: true });
        if (!uploadErr) {
          const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(path);
          newImageUrls.push(urlData.publicUrl);
        }
      }

      const allImages = [...existingImages, ...newImageUrls];
      const numericDiscount = discountPrice ? Number(discountPrice.replace(/,/g, "")) : null;
      const payload = {
        name: name.trim(), price: numericPrice,
        discount_price: numericDiscount && numericDiscount > 0 && numericDiscount < numericPrice ? numericDiscount : null,
        description: description.trim() || null, variants_text: variantsText.trim() || null,
        image_url: allImages[0] ?? null, listing_type: listingType,
        condition: listingType === "product" ? (condition || null) : null,
        attributes: Object.keys(attributes).length > 0 ? attributes : null,
        category: finalCategory || null,
        subcategory: detectedSubcategory || null,
      } as any;

      let productId: string;
      if (editingProduct) {
        const { error } = await supabase.from("products").update(payload).eq("id", editingProduct.id);
        if (error) throw error;
        productId = editingProduct.id;
        await supabase.from("product_images").delete().eq("product_id", productId);
      } else {
        const { data: inserted, error } = await supabase.from("products").insert({ user_id: user.id, ...payload }).select("id").single();
        if (error) throw error;
        productId = inserted.id;
      }

      if (allImages.length > 0) {
        await supabase.from("product_images").insert(allImages.map((url, i) => ({ product_id: productId, image_url: url, position: i })));
      }

      toast.success(editingProduct ? `${terms.singular} updated!` : `${terms.singular} added! 🎉`);
      setDialogOpen(false); resetForm();
      searchParams.delete("add"); setSearchParams(searchParams);
      fetchProducts();
    } catch (err: any) { toast.error(err.message || "Something went wrong"); }
    finally { setSaving(false); }
  };

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    // Delete product_images first (FK constraint — no cascade)
    await supabase.from("product_images").delete().eq("product_id", id);
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) toast.error("Failed to delete");
    else { toast.success(`${terms.singular} deleted`); fetchProducts(); }
    setDeleteConfirmId(null);
  };

  const toggleFeatured = async (product: Product) => {
    const isFeatured = (product as any).is_featured;
    if (!isFeatured && products.filter((p) => (p as any).is_featured).length >= 6) {
      toast.error(`Maximum 6 featured ${terms.plural.toLowerCase()}`); return;
    }
    const { error } = await supabase.from("products").update({ is_featured: !isFeatured } as any).eq("id", product.id);
    if (error) toast.error("Failed to update");
    else { toast.success(isFeatured ? "Removed from featured" : "Added to featured ⭐"); fetchProducts(); }
  };

  if (loading) return <div className="animate-pulse text-muted-foreground py-12 text-center">Loading {terms.plural.toLowerCase()}…</div>;

  const allFormImages = [...existingImages, ...imagePreviews];
  const featured = products.filter((p) => (p as any).is_featured);
  const regular = products.filter((p) => !(p as any).is_featured);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return { month: d.toLocaleString("en", { month: "short" }), day: String(d.getDate()).padStart(2, "0") };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{terms.plural}</h1>
          <p className="text-sm text-muted-foreground">{products.length} {products.length !== 1 ? terms.plural.toLowerCase() : terms.singular.toLowerCase()}</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) { resetForm(); searchParams.delete("add"); setSearchParams(searchParams); }
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={openAdd}><Plus className="h-4 w-4" /> Add</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduct ? `Edit ${terms.singular}` : `Add ${terms.singular}`}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              {/* Type */}
              <div className="space-y-1.5">
                <Label>Type</Label>
                <div className="flex gap-2">
                  {LISTING_TYPES.map((t) => (
                    <button key={t.value} type="button"
                      onClick={() => { setListingType(t.value); if (t.value === "service") setCondition(""); }}
                      className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                        listingType === t.value ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/40"
                      }`}>
                      {t.value === "service" ? <Wrench className="h-3.5 w-3.5 inline mr-1.5" /> : <Package className="h-3.5 w-3.5 inline mr-1.5" />}
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              {/* Multi-image upload */}
              <div className="space-y-2">
                <Label>Images <span className="text-muted-foreground font-normal">(up to 5)</span></Label>
                {allFormImages.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {existingImages.map((url, i) => (
                      <div key={`existing-${i}`} className="relative h-16 w-16">
                        <img src={url} alt="" className="h-16 w-16 rounded-lg object-cover border" />
                        <button type="button" onClick={() => removeExistingImage(i)} className="absolute -top-1.5 -right-1.5 rounded-full bg-destructive text-destructive-foreground p-0.5"><X className="h-3 w-3" /></button>
                      </div>
                    ))}
                    {imagePreviews.map((url, i) => (
                      <div key={`new-${i}`} className="relative h-16 w-16">
                        <img src={url} alt="" className="h-16 w-16 rounded-lg object-cover border" />
                        <button type="button" onClick={() => removeNewImage(i)} className="absolute -top-1.5 -right-1.5 rounded-full bg-destructive text-destructive-foreground p-0.5"><X className="h-3 w-3" /></button>
                      </div>
                    ))}
                  </div>
                )}
                {allFormImages.length < 5 && (
                  <div className="flex gap-3">
                    <label className="cursor-pointer flex-1">
                      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border/60 bg-muted/30 py-6 hover:border-primary/40 hover:bg-muted/50 transition-colors">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <Camera className="h-5 w-5 text-primary" />
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">Camera</span>
                      </div>
                      <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageChange} />
                    </label>
                    <label className="cursor-pointer flex-1">
                      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border/60 bg-muted/30 py-6 hover:border-primary/40 hover:bg-muted/50 transition-colors">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <ImageIcon className="h-5 w-5 text-primary" />
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">Gallery</span>
                      </div>
                      <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange} />
                    </label>
                  </div>
                )}
                {analyzing ? (
                  <div className="flex items-center gap-2 rounded-lg bg-primary/5 border border-primary/20 px-3 py-2">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                    <span className="text-xs text-primary font-medium">Analyzing product & suggesting details…</span>
                  </div>
                ) : (name.trim() || description.trim()) && aiSuggestions.length === 0 && !aiFilledFields.has("category") ? (
                  <button
                    type="button"
                    onClick={() => analyzeProduct(imageFiles[0])}
                    className="flex items-center gap-2 rounded-lg bg-primary/5 border border-primary/20 px-3 py-2 hover:bg-primary/10 transition-colors w-full"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs text-primary font-medium">Tap to auto-detect product details with AI</span>
                  </button>
                ) : null}
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Label htmlFor="productName">Name</Label>
                  {aiFilledFields.has("name") && <span className="text-[10px] text-primary font-medium flex items-center gap-0.5"><Sparkles className="h-2.5 w-2.5" />AI filled</span>}
                </div>
                <Input id="productName" placeholder={listingType === "service" ? "e.g. Birthday Party Package" : "e.g. Rolex wrap"} value={name} onChange={(e) => { setName(e.target.value); setAiFilledFields((prev) => { const n = new Set(prev); n.delete("name"); return n; }); }} maxLength={100} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="productPrice">Price ({currency})</Label>
                <Input id="productPrice" placeholder="5,000" value={price} onChange={(e) => setPrice(formatCommaInput(e.target.value))} inputMode="numeric" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="discountPercent">Discount % <span className="text-muted-foreground font-normal">(optional)</span></Label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="discountPercent"
                      placeholder="e.g. 20"
                      value={discountPercent}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/[^0-9]/g, "");
                        const pct = raw ? Math.min(99, Number(raw)) : 0;
                        setDiscountPercent(raw ? String(pct) : "");
                        const numPrice = Number(price.replace(/,/g, ""));
                        if (pct > 0 && numPrice > 0) {
                          setDiscountPrice(formatCommaInput(String(Math.round(numPrice * (1 - pct / 100)))));
                        } else {
                          setDiscountPrice("");
                        }
                      }}
                      inputMode="numeric"
                      maxLength={2}
                      className="pr-8"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">%</span>
                  </div>
                </div>
                {discountPercent && price && (
                  <p className="text-xs text-muted-foreground">
                    Buyers pay{" "}
                    <span className="font-semibold text-primary">
                      {formatPrice(Number(discountPrice.replace(/,/g, "")), currency)}
                    </span>{" "}
                    <span className="line-through">{formatPrice(Number(price.replace(/,/g, "")), currency)}</span>
                    {" "}— {discountPercent}% off
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="productDesc">Description</Label>
                    {aiFilledFields.has("description") && <span className="text-[10px] text-primary font-medium flex items-center gap-0.5"><Sparkles className="h-2.5 w-2.5" />AI filled</span>}
                  </div>
                  <Button type="button" variant="ghost" size="sm" className="h-7 gap-1 text-xs text-primary" onClick={handleGenerateDesc} disabled={generatingDesc}>
                    {generatingDesc ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                    {generatingDesc ? "Generating…" : "AI Generate"}
                  </Button>
                </div>
                <Textarea id="productDesc" placeholder={listingType === "service" ? "What does this service package include?" : "What makes this product special?"} value={description} onChange={(e) => { setDescription(e.target.value); setAiFilledFields((prev) => { const n = new Set(prev); n.delete("description"); return n; }); }} rows={3} />
              </div>
              {/* Dynamic Product Attributes */}
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold flex items-center gap-1.5">
                  📋 Product Details <span className="text-muted-foreground font-normal text-xs">(optional)</span>
                  {aiFilledFields.has("category") && <span className="text-[10px] text-primary font-medium flex items-center gap-0.5"><Sparkles className="h-2.5 w-2.5" />AI detected</span>}
                </Label>
                <ProductAttributeForm 
                  attributes={attributes} 
                  onChange={(attrs) => { setAttributes(attrs); setAiFilledFields((prev) => { const n = new Set(prev); n.delete("category"); return n; }); }} 
                  productCategory={attributes.product_type} 
                  productSubcategory={detectedSubcategory}
                  aiSuggestions={aiSuggestions}
                  onAcceptSuggestion={(slug) => setAiSuggestions((prev) => prev.filter((s) => s.slug !== slug))}
                  onDismissSuggestion={(slug) => setAiSuggestions((prev) => prev.filter((s) => s.slug !== slug))}
                />
              </div>
              <Button className="w-full" onClick={handleSave} disabled={saving}>
                {saving ? "Saving…" : editingProduct ? `Update ${terms.singular}` : `Add ${terms.singular}`}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Empty state */}
      {products.length === 0 ? (
        <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl py-16">
          <CardContent className="flex flex-col items-center gap-3 text-center">
            <Package className="h-12 w-12 text-muted-foreground/50" />
            <p className="text-lg font-medium">No {terms.plural.toLowerCase()} yet</p>
            <p className="text-sm text-muted-foreground">Add your first {terms.singular.toLowerCase()} to start selling!</p>
            <Button className="mt-2 gap-2" onClick={openAdd}><Plus className="h-4 w-4" /> Add {terms.singular}</Button>
          </CardContent>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Tip */}
          <div className="rounded-xl bg-card/60 backdrop-blur-xl border border-border/50 px-4 py-2.5 text-xs text-muted-foreground flex items-center gap-2">
            <Star className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>Tap <strong>★</strong> to feature a {terms.singular.toLowerCase()} (up to 6). Featured items appear first on your storefront.</span>
          </div>

          {/* Featured section */}
          {featured.length > 0 && (
            <section className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Star className="h-3 w-3 text-primary fill-primary" />
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Featured ({featured.length}/6)</h2>
              </div>
              <div className="space-y-2">
                {featured.map((product) => (
                  <ListingRow key={product.id} product={product} productImages={productImages} currency={currency} formatDate={formatDate}
                    onEdit={openEdit} onDelete={handleDelete} onToggleFeatured={toggleFeatured} profile={profile} />
                ))}
              </div>
            </section>
          )}

          {/* All items */}
          <section className="space-y-2">
            {featured.length > 0 && (
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">All {terms.plural}</h2>
            )}
            <div className="space-y-2">
              {(featured.length > 0 ? regular : products).map((product) => (
                <ListingRow key={product.id} product={product} productImages={productImages} currency={currency} formatDate={formatDate}
                  onEdit={openEdit} onDelete={handleDelete} onToggleFeatured={toggleFeatured} profile={profile} />
              ))}
            </div>
          </section>
        </div>
      )}

      {/* Product detail modal with Share to Status */}
      <Dialog open={!!detailProduct} onOpenChange={(open) => !open && setDetailProduct(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="truncate">{detailProduct?.name}</DialogTitle>
          </DialogHeader>
          {detailProduct && (() => {
            const imgs = productImages[detailProduct.id] ?? (detailProduct.image_url ? [detailProduct.image_url] : []);
            return (
              <div className="space-y-4">
                {imgs[0] && (
                  <img src={imgs[0]} alt={detailProduct.name} className="w-full aspect-square object-cover rounded-xl" />
                )}
                <div className="space-y-1">
                  <p className="text-lg font-bold">
                    {formatPrice(detailProduct.discount_price ?? detailProduct.price, currency)}
                  </p>
                  {detailProduct.discount_price && (
                    <p className="text-sm text-muted-foreground line-through">
                      {formatPrice(detailProduct.price, currency)}
                    </p>
                  )}
                </div>
                {detailProduct.description && (
                  <p className="text-sm text-muted-foreground">{detailProduct.description}</p>
                )}
                <Button className="w-full rounded-xl gap-2" onClick={() => { setDetailProduct(null); openEdit(detailProduct); }}>
                  <Pencil className="h-4 w-4" /> Edit {terms.singular}
                </Button>
                <ShareToStatusButton product={detailProduct} imgs={imgs} currency={currency} profile={profile} />
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
};

/** List-style row for a single item */
function ListingRow({
  product, productImages, currency, formatDate, onEdit, onDelete, onToggleFeatured, profile,
}: {
  product: Product;
  productImages: Record<string, string[]>;
  currency: string;
  formatDate: (d: string) => { month: string; day: string };
  onEdit: (p: Product) => void;
  onDelete: (id: string) => void;
  onToggleFeatured: (p: Product) => void;
  profile: { store_name?: string; store_slug?: string } | null;
}) {
  const [sharing, setSharing] = useState(false);
  const imgs = productImages[product.id] ?? (product.image_url ? [product.image_url] : []);
  const { month, day } = formatDate(product.created_at);
  const isFeatured = (product as any).is_featured;
  const isService = (product as any).listing_type === "service";

  const handleShareToStatus = async () => {
    setSharing(true);
    const imgUrl = imgs[0];
    const price = formatPrice((product as any).discount_price ?? product.price, currency);
    const shopLink = profile?.store_slug ? `https://afristall.com/${profile.store_slug}` : "";
    const fallbackCaption = `🔥 ${product.name} — ${price}\n\nShop here 👉 ${shopLink}`;

    // Try AI caption
    let caption = fallbackCaption;
    try {
      const { data } = await supabase.functions.invoke("generate-share-caption", {
        body: {
          productName: product.name,
          price,
          description: product.description || "",
          storeName: profile?.store_name || "",
          storeSlug: profile?.store_slug || "",
          platform: "WhatsApp Status",
        },
      });
      if (data?.caption) caption = data.caption;
    } catch {
      // Use fallback
    }

    try {
      if (imgUrl && navigator.canShare) {
        const res = await fetch(imgUrl);
        const blob = await res.blob();
        const ext = blob.type.split("/")[1] || "jpg";
        const file = new File([blob], `product.${ext}`, { type: blob.type });

        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], text: caption });
          setSharing(false);
          return;
        }
      }
    } catch (err: any) {
      if (err?.name === "AbortError") {
        setSharing(false);
        return;
      }
    }
    // Fallback: text-only WhatsApp share
    window.open(`https://wa.me/?text=${encodeURIComponent(caption)}`, "_blank");
    setSharing(false);
  };

  return (
    <div className="group flex items-center gap-3 rounded-2xl bg-card/60 backdrop-blur-xl border border-border/50 p-3 transition-shadow hover:shadow-md">
      {/* Date column */}
      <div className="hidden sm:flex flex-col items-center text-center w-10 shrink-0">
        <span className="text-[10px] font-medium text-muted-foreground uppercase">{month}</span>
        <span className="text-lg font-bold leading-tight">{day}</span>
      </div>

      {/* Thumbnail */}
      <div className="h-12 w-12 shrink-0 rounded-lg overflow-hidden bg-muted">
        {imgs[0] ? (
          <img src={imgs[0]} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            {isService ? <Wrench className="h-5 w-5 text-muted-foreground/40" /> : <ImageIcon className="h-5 w-5 text-muted-foreground/40" />}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate">{product.name}</p>
        <div className="flex items-center gap-1.5">
          {(product as any).discount_price ? (
            <>
                  <div className="flex flex-col">
                    <p className="text-xs text-success font-bold">{formatPrice(Number((product as any).discount_price), currency)}</p>
                    <p className="text-[10px] text-muted-foreground line-through">{formatPrice(Number(product.price), currency)}</p>
                  </div>
              <Badge variant="destructive" className="text-[9px] px-1.5 py-0 h-4 rounded font-semibold">
                {Math.round(((product.price - Number((product as any).discount_price)) / product.price) * 100)}% OFF
              </Badge>
            </>
          ) : (
            <p className="text-xs text-primary font-bold">{formatPrice(Number(product.price), currency)}</p>
          )}
        </div>
      </div>

      {/* Badges */}
      <div className="hidden sm:flex flex-col gap-0.5 items-end shrink-0">
        {isFeatured && (
          <Badge className="text-[10px] px-1.5 py-0 bg-primary text-primary-foreground">
            <Star className="h-2.5 w-2.5 mr-0.5 fill-current" /> Featured
          </Badge>
        )}
        {isService && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Service</Badge>}
        {(product as any).condition && (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
            {(product as any).condition === "new" ? "New" : (product as any).condition === "used" ? "Used" : "Refurbished"}
          </Badge>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <Button size="icon" variant={isFeatured ? "default" : "ghost"} className="h-7 w-7" onClick={() => onToggleFeatured(product)} title="Toggle featured">
          <Star className={`h-3.5 w-3.5 ${isFeatured ? "fill-current" : ""}`} />
        </Button>
        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleShareToStatus} disabled={sharing} title="Share to WhatsApp Status">
          {sharing ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <img src={whatsappIcon} alt="WhatsApp" className="h-4 w-4" />
          )}
        </Button>
        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onEdit(product)} title="Edit">
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => {
          if (confirm(`Delete "${product.name}"? This cannot be undone.`)) onDelete(product.id);
        }} title="Delete">
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0 hidden sm:block" />
    </div>
  );
}

export default DashboardProducts;
