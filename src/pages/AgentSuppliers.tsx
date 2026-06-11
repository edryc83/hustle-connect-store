import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Store } from "lucide-react";
import { useAgentData } from "@/hooks/useAgentData";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const makePassword = () => `Sup-${Math.random().toString(36).slice(2, 8)}-${Math.floor(1000 + Math.random() * 9000)}`;

export default function AgentSuppliers() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAgent, loading } = useAgentData();
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [created, setCreated] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({ business_name: "", country: "UAE", currency: "USD", contact_name: "", email: "", whatsapp: "", bank_details: "", password: makePassword() });

  useEffect(() => {
    if (!loading && isAgent === false) navigate("/", { replace: true });
  }, [loading, isAgent, navigate]);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from("suppliers" as any).select("*").eq("created_by_agent", user.id).order("created_at", { ascending: false });
    setSuppliers((data as any[]) || []);
  };
  useEffect(() => { load(); }, [user]);

  const createSupplier = async () => {
    setSaving(true);
    let bankDetails = null;
    try {
      bankDetails = form.bank_details ? JSON.parse(form.bank_details) : null;
    } catch {
      toast.error("Bank details must be valid JSON");
      setSaving(false);
      return;
    }
    const { data, error } = await supabase.functions.invoke("admin-create-supplier", {
      body: { ...form, bank_details: bankDetails },
    });
    setSaving(false);
    if (error || data?.error) toast.error(data?.error || error?.message || "Could not create supplier");
    else {
      setCreated(data);
      setForm({ business_name: "", country: "UAE", currency: "USD", contact_name: "", email: "", whatsapp: "", bank_details: "", password: makePassword() });
      load();
    }
  };

  if (loading || isAgent === null) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading...</div>;
  if (!isAgent) return null;

  return (
    <div className="mx-auto max-w-4xl space-y-5 px-4 py-5">
      <Button variant="ghost" size="sm" asChild><Link to="/agent" className="gap-2"><ArrowLeft className="h-4 w-4" /> Back to agent portal</Link></Button>
      <div>
        <h1 className="text-2xl font-bold">Supplier onboarding</h1>
        <p className="text-sm text-muted-foreground">Create vetted UK/UAE supplier accounts with temporary passwords.</p>
      </div>
      {created && (
        <Card className="border-primary/30">
          <CardContent className="p-4 text-sm">
            <p className="font-semibold">Created {created.supplier.business_name} ({created.supplier.supplier_code})</p>
            <p>Email: {created.email}</p>
            <p>Temporary password: <span className="font-mono">{created.temporary_password}</span></p>
          </CardContent>
        </Card>
      )}
      <Card>
        <CardContent className="grid gap-3 p-4 md:grid-cols-2">
          <div className="space-y-1.5"><Label>Business name</Label><Input value={form.business_name} onChange={(e) => setForm({ ...form, business_name: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>Country</Label><Select value={form.country} onValueChange={(v) => setForm({ ...form, country: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="UK">UK</SelectItem><SelectItem value="UAE">UAE</SelectItem></SelectContent></Select></div>
          <div className="space-y-1.5"><Label>Currency</Label><Select value={form.currency} onValueChange={(v) => setForm({ ...form, currency: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["USD", "GBP", "AED", "EUR"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-1.5"><Label>Contact name</Label><Input value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>WhatsApp</Label><Input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} /></div>
          <div className="space-y-1.5 md:col-span-2"><Label>Bank details JSON</Label><Textarea rows={3} value={form.bank_details} onChange={(e) => setForm({ ...form, bank_details: e.target.value })} placeholder='{"bank":"Wise","account":"..."}' /></div>
          <div className="space-y-1.5"><Label>Temporary password</Label><Input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
          <div className="flex items-end"><Button className="w-full gap-2" disabled={saving} onClick={createSupplier}><Plus className="h-4 w-4" /> {saving ? "Creating..." : "Create supplier"}</Button></div>
        </CardContent>
      </Card>
      <div className="grid gap-3 md:grid-cols-2">
        {suppliers.map((supplier) => (
          <Card key={supplier.id}>
            <CardContent className="flex gap-3 p-4">
              <Store className="mt-1 h-5 w-5 text-primary" />
              <div>
                <p className="font-semibold">{supplier.business_name}</p>
                <p className="text-sm text-muted-foreground">{supplier.supplier_code} - {supplier.country} - {supplier.status}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
