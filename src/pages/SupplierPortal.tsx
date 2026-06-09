import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import AfristallLogo from "@/components/AfristallLogo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Loader2, Plus, Package, Wallet, KeyRound, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { compressImageToWebp } from "@/lib/imageCompression";

type Supplier = { id: string; supplier_code: string; business_name: string; country: string; currency: string; whatsapp: string | null; bio: string | null; lead_time_days: number | null; must_change_password: boolean };
type Product = { id: string; name: string; description: string | null; images: string[]; category: string | null; moq: number; unit_price: number; currency: string; lead_time_days: number | null; active: boolean };
type Payment = { id: string; amount_foreign: number; currency: string; amount_foreign_total: number; status: string; created_at: string; note: string | null };

export default function SupplierPortal() {
  const navigate = useNavigate();
  const { user, signOut, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useUserRole();

  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  useEffect(() => {
    if (authLoading || roleLoading) return;
    if (!user) { navigate("/login", { replace: true }); return; }
    if (role && role !== "supplier") { navigate("/dashboard", { replace: true }); return; }
    if (role !== "supplier") return;
    load();
  }, [user, role, authLoading, roleLoading]);

  const load = async () => {
    setLoading(true);
    const { data: sup } = await supabase.from("suppliers" as any).select("*").eq("user_id", user!.id).maybeSingle() as any;
    if (!sup) { setLoading(false); return; }
    setSupplier(sup);
    if (sup.must_change_password) setShowPwd(true);
    const [{ data: prods }, { data: pays }] = await Promise.all([
      supabase.from("supplier_products" as any).select("*").eq("supplier_id", sup.id).order("created_at", { ascending: false }) as any,
      supabase.from("supplier_payments" as any).select("id, amount_foreign, currency, amount_foreign_total, status, created_at, note").eq("supplier_id", sup.id).order("created_at", { ascending: false }) as any,
    ]);
    setProducts(prods || []);
    setPayments(pays || []);
    setLoading(false);
  };

  if (authLoading || roleLoading || (role === "supplier" && loading)) {
    return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }
  if (!supplier) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">No supplier profile linked to this account.</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/40 bg-card/80 backdrop-blur-lg">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <AfristallLogo className="h-7 w-7" />
            <span className="text-base font-extrabold tracking-tight">Afri<span className="text-primary">stall</span></span>
            <Badge variant="outline" className="ml-2 text-[10px]">Supplier</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground hidden sm:inline">{supplier.supplier_code}</span>
            <Button variant="ghost" size="icon" onClick={() => setShowPwd(true)} title="Change password"><KeyRound className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" onClick={async () => { await signOut(); navigate("/login"); }}><LogOut className="h-4 w-4" /></Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-4 px-4 py-5">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground">{supplier.country} • {supplier.currency}</p>
            <h1 className="text-xl font-extrabold">{supplier.business_name}</h1>
            <p className="text-xs font-mono text-muted-foreground mt-1">{supplier.supplier_code}</p>
          </CardContent>
        </Card>

        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="products"><Package className="h-3.5 w-3.5 mr-1" />Products</TabsTrigger>
            <TabsTrigger value="payments"><Wallet className="h-3.5 w-3.5 mr-1" />Payments</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-3 mt-4">
            <Button className="w-full gap-1.5" onClick={() => setShowAdd(true)}><Plus className="h-4 w-4" />Add Product</Button>
            {products.length === 0 ? (
              <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">No products yet. Add your first listing.</CardContent></Card>
            ) : products.map(p => (
              <Card key={p.id}>
                <CardContent className="p-3 flex gap-3">
                  {p.images?.[0] ? <img src={p.images[0]} className="h-16 w-16 rounded object-cover" /> : <div className="h-16 w-16 rounded bg-muted" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.currency} {Number(p.unit_price).toLocaleString()} / unit • MOQ {p.moq}</p>
                    {p.category && <p className="text-[10px] text-muted-foreground mt-0.5">{p.category}</p>}
                  </div>
                  <Button variant="ghost" size="icon" onClick={async () => {
                    if (!confirm("Delete this product?")) return;
                    await supabase.from("supplier_products" as any).delete().eq("id", p.id);
                    load();
                  }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="payments" className="space-y-2 mt-4">
            {payments.length === 0 ? (
              <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">No payments received yet.</CardContent></Card>
            ) : payments.map(p => (
              <Card key={p.id}>
                <CardContent className="p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-semibold">{p.currency} {Number(p.amount_foreign).toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleString()}</p>
                      {p.note && <p className="text-xs italic mt-1">"{p.note}"</p>}
                    </div>
                    <PaymentStatusBadge status={p.status} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </main>

      <AddProductDialog open={showAdd} onClose={() => setShowAdd(false)} supplier={supplier} onSaved={load} />
      <ChangePasswordDialog open={showPwd} onClose={() => setShowPwd(false)} mustChange={supplier.must_change_password} supplierId={supplier.id} onDone={() => { setShowPwd(false); load(); }} />
    </div>
  );
}

function PaymentStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    pending: { label: "Pending", cls: "bg-orange-500/15 text-orange-600 border-orange-500/30" },
    pending_review: { label: "Awaiting Review", cls: "bg-orange-500/15 text-orange-600 border-orange-500/30" },
    funds_received: { label: "Funds received by Afristall — awaiting settlement", cls: "bg-blue-500/15 text-blue-600 border-blue-500/30" },
    settled: { label: "Settled to you", cls: "bg-green-500/15 text-green-600 border-green-500/30" },
    failed: { label: "Failed", cls: "bg-destructive/15 text-destructive border-destructive/30" },
    rejected: { label: "Rejected", cls: "bg-destructive/15 text-destructive border-destructive/30" },
  };
  const s = map[status] || { label: status, cls: "" };
  return <Badge variant="outline" className={`text-[10px] ${s.cls}`}>{s.label}</Badge>;
}

function AddProductDialog({ open, onClose, supplier, onSaved }: { open: boolean; onClose: () => void; supplier: Supplier; onSaved: () => void }) {
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [form, setForm] = useState({ name: "", description: "", category: "", moq: "1", unit_price: "", lead_time_days: String(supplier.lead_time_days || 14) });

  const onFile = async (f: File) => {
    const compressed = await compressImageToWebp(f, 1024 * 1024);
    setImageFile(compressed);
    setImagePreview(URL.createObjectURL(compressed));
  };

  const submit = async () => {
    if (!form.name || !form.unit_price) { toast.error("Name and unit price required"); return; }
    setSaving(true);
    try {
      let imageUrl = "";
      if (imageFile) {
        const path = `${supplier.id}/${Date.now()}.webp`;
        const { error } = await supabase.storage.from("product-images").upload(path, imageFile, { contentType: "image/webp" });
        if (error) throw error;
        imageUrl = supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl;
      }
      const { error: insertErr } = await supabase.from("supplier_products" as any).insert({
        supplier_id: supplier.id,
        name: form.name.trim(),
        description: form.description.trim() || null,
        images: imageUrl ? [imageUrl] : [],
        category: form.category.trim() || null,
        moq: parseInt(form.moq) || 1,
        unit_price: parseFloat(form.unit_price),
        currency: supplier.currency,
        lead_time_days: parseInt(form.lead_time_days) || null,
      });
      if (insertErr) throw insertErr;
      toast.success("Product added");
      setForm({ name: "", description: "", category: "", moq: "1", unit_price: "", lead_time_days: String(supplier.lead_time_days || 14) });
      setImageFile(null); setImagePreview("");
      onSaved(); onClose();
    } catch (e: any) { toast.error(e.message || "Failed"); }
    finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Add Product</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Image</Label>
            <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} className="text-sm" />
            {imagePreview && <img src={imagePreview} className="mt-2 h-32 w-32 rounded object-cover" />}
          </div>
          <div><Label>Product name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} /></div>
          <div><Label>Category (e.g. Textiles, Electronics)</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>MOQ (units)</Label><Input type="number" value={form.moq} onChange={(e) => setForm({ ...form, moq: e.target.value })} /></div>
            <div><Label>Unit price ({supplier.currency})</Label><Input type="number" step="0.01" value={form.unit_price} onChange={(e) => setForm({ ...form, unit_price: e.target.value })} /></div>
          </div>
          <div><Label>Lead time (days)</Label><Input type="number" value={form.lead_time_days} onChange={(e) => setForm({ ...form, lead_time_days: e.target.value })} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={submit} disabled={saving}>{saving ? "Saving…" : "Add"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ChangePasswordDialog({ open, onClose, mustChange, supplierId, onDone }: { open: boolean; onClose: () => void; mustChange: boolean; supplierId: string; onDone: () => void }) {
  const [pwd, setPwd] = useState("");
  const [pwd2, setPwd2] = useState("");
  const [saving, setSaving] = useState(false);
  const save = async () => {
    if (pwd.length < 8) { toast.error("Password must be 8+ characters"); return; }
    if (pwd !== pwd2) { toast.error("Passwords don't match"); return; }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: pwd });
    if (error) { toast.error(error.message); setSaving(false); return; }
    if (mustChange) await supabase.from("suppliers" as any).update({ must_change_password: false }).eq("id", supplierId);
    toast.success("Password updated");
    setSaving(false);
    onDone();
  };
  return (
    <Dialog open={open} onOpenChange={(o) => !o && !mustChange && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>{mustChange ? "Set a new password" : "Change password"}</DialogTitle></DialogHeader>
        {mustChange && <p className="text-xs text-muted-foreground">For security, please change your temporary password.</p>}
        <div className="space-y-3">
          <div><Label>New password</Label><Input type="password" value={pwd} onChange={e => setPwd(e.target.value)} /></div>
          <div><Label>Confirm</Label><Input type="password" value={pwd2} onChange={e => setPwd2(e.target.value)} /></div>
        </div>
        <DialogFooter>
          {!mustChange && <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>}
          <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}