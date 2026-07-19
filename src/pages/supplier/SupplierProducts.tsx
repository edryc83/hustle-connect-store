import { useEffect, useState } from "react";
import { Plus, Sparkles, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProductAttributeForm } from "@/components/dashboard/ProductAttributeForm";
import { formatMoney, SUPPLIER_CURRENCIES } from "@/lib/importUtils";
import { toast } from "sonner";

export default function SupplierProducts() {
  const { user } = useAuth();
  const [supplier, setSupplier] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({ name: "", description: "", category: "", moq: "", unit_price: "", currency: "USD", lead_time_days: "", attributes: {} });
  const [images, setImages] = useState<File[]>([]);

  const load = async () => {
    if (!user) return;
    const { data: sup }: any = await supabase.from("suppliers" as any).select("*").eq("user_id", user.id).single();
    setSupplier(sup);
    if (sup) {
      setForm((f: any) => ({ ...f, currency: sup.currency || "USD", lead_time_days: sup.lead_time_days || "" }));
      const { data } = await supabase.from("supplier_products" as any).select("*").eq("supplier_id", sup.id).order("created_at", { ascending: false });
      setProducts((data as any[]) || []);
    }
  };

  useEffect(() => { load(); }, [user]);

  const reset = () => {
    setEditing(null);
    setImages([]);
    setForm({ name: "", description: "", category: "", moq: "", unit_price: "", currency: supplier?.currency || "USD", lead_time_days: supplier?.lead_time_days || "", attributes: {} });
  };

  const analyze = async (file?: File) => {
    const body: any = { productName: form.name, productDescription: form.description };
    if (file) {
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result).split(",")[1]);
        reader.readAsDataURL(file);
      });
      body.imageBase64 = base64;
      body.mimeType = file.type;
    }
    const { data } = await supabase.functions.invoke("analyze-product-image", { body });
    if (data) {
      setForm((f: any) => ({
        ...f,
        name: f.name || data.name || "",
        description: f.description || data.description || "",
        category: data.category || f.category,
        attributes: { ...f.attributes, product_type: data.category || f.attributes?.product_type },
      }));
      toast.success("AI details suggested");
    }
  };

  const save = async () => {
    if (!supplier || !form.name || !form.unit_price) return toast.error("Name and unit price are required");
    setSaving(true);
    try {
      const imageUrls: string[] = editing?.images ? [...editing.images] : [];
      for (const file of images) {
        const ext = file.name.split(".").pop();
        const path = `${supplier.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error } = await supabase.storage.from("product-images").upload(path, file, { upsert: true });
        if (!error) {
          const { data } = supabase.storage.from("product-images").getPublicUrl(path);
          imageUrls.push(data.publicUrl);
        }
      }
      const payload: any = {
        supplier_id: supplier.id,
        name: form.name.trim(),
        description: form.description || null,
        images: imageUrls,
        category: form.category || null,
        attributes: Object.keys(form.attributes || {}).length ? form.attributes : null,
        moq: form.moq ? Number(form.moq) : null,
        unit_price: Number(form.unit_price),
        currency: form.currency,
        lead_time_days: form.lead_time_days ? Number(form.lead_time_days) : null,
        updated_at: new Date().toISOString(),
      };
      const res = editing
        ? await supabase.from("supplier_products" as any).update(payload).eq("id", editing.id)
        : await supabase.from("supplier_products" as any).insert(payload);
      if (res.error) throw res.error;
      toast.success(editing ? "Product updated" : "Product added");
      setOpen(false);
      reset();
      load();
    } catch (e: any) {
      toast.error(e.message || "Could not save product");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-sm text-muted-foreground">{supplier?.business_name}</p>
        </div>
        <Dialog open={open} onOpenChange={(next) => { setOpen(next); if (!next) reset(); }}>
          <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" /> Add</Button></DialogTrigger>
          <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
            <DialogHeader><DialogTitle>{editing ? "Edit product" : "Add product"}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1.5"><Label>Images</Label><Input type="file" accept="image/*" multiple onChange={(e) => { const files = Array.from(e.target.files || []); setImages(files); if (files[0]) analyze(files[0]); }} /></div>
              <div className="space-y-1.5"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Description</Label><Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => analyze(images[0])}><Sparkles className="h-4 w-4" /> AI suggest details</Button>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label>MOQ</Label><Input inputMode="numeric" value={form.moq} onChange={(e) => setForm({ ...form, moq: e.target.value.replace(/\D/g, "") })} /></div>
                <div className="space-y-1.5"><Label>Lead time days</Label><Input inputMode="numeric" value={form.lead_time_days} onChange={(e) => setForm({ ...form, lead_time_days: e.target.value.replace(/\D/g, "") })} /></div>
              </div>
              <div className="grid grid-cols-[1fr_120px] gap-3">
                <div className="space-y-1.5"><Label>Unit price</Label><Input inputMode="decimal" value={form.unit_price} onChange={(e) => setForm({ ...form, unit_price: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>Currency</Label><Select value={form.currency} onValueChange={(v) => setForm({ ...form, currency: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{SUPPLIER_CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
              </div>
              <ProductAttributeForm attributes={form.attributes || {}} onChange={(attributes) => setForm({ ...form, attributes })} productCategory={form.attributes?.product_type} />
              <Button className="w-full" disabled={saving} onClick={save}>{saving ? "Saving..." : "Save product"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {products.map((product) => (
          <Card key={product.id}>
            <CardContent className="flex gap-3 p-3">
              <img src={product.images?.[0] || "/placeholder.svg"} alt="" className="h-20 w-20 rounded-lg object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{product.name}</p>
                <p className="text-sm text-muted-foreground">{formatMoney(Number(product.unit_price), product.currency)} {product.moq ? `- MOQ ${product.moq}` : ""}</p>
                <div className="mt-2 flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => { setEditing(product); setForm({ ...product, moq: product.moq || "", lead_time_days: product.lead_time_days || "" }); setOpen(true); }}>Edit</Button>
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={async () => { await supabase.from("supplier_products" as any).delete().eq("id", product.id); load(); }}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
