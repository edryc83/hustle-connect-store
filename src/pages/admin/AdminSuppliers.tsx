import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Loader2, Plus, Copy } from "lucide-react";
import { toast } from "sonner";

export default function AdminSuppliers() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [created, setCreated] = useState<{ email: string; password: string; code: string } | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("suppliers" as any).select("*").order("created_at", { ascending: false }) as any;
    setRows(data || []); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Suppliers</h1>
        <Button onClick={() => setOpen(true)} className="gap-1.5"><Plus className="h-4 w-4" />Onboard Supplier</Button>
      </div>

      {loading ? <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin" /></div> :
        rows.length === 0 ? <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">No suppliers onboarded yet.</CardContent></Card> :
        <div className="space-y-2">
          {rows.map(s => (
            <Card key={s.id}>
              <CardContent className="p-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold truncate">{s.business_name}</p>
                    <Badge variant="outline" className="text-[10px]">{s.country}</Badge>
                    <Badge variant={s.status === "active" ? "default" : "destructive"} className="text-[10px]">{s.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono">{s.supplier_code} • {s.currency}</p>
                  <p className="text-xs text-muted-foreground">{s.email} {s.whatsapp && `• ${s.whatsapp}`}</p>
                </div>
                <Button size="sm" variant="outline" onClick={async () => {
                  const newStatus = s.status === "active" ? "suspended" : "active";
                  await supabase.from("suppliers" as any).update({ status: newStatus }).eq("id", s.id);
                  load();
                }}>{s.status === "active" ? "Suspend" : "Activate"}</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      }

      <OnboardDialog open={open} onClose={() => setOpen(false)} onCreated={(c) => { setCreated(c); load(); }} />

      <Dialog open={!!created} onOpenChange={() => setCreated(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Supplier created</DialogTitle></DialogHeader>
          {created && (
            <div className="space-y-3 text-sm">
              <p className="text-muted-foreground">Share these credentials with the supplier securely. They will be required to change the password on first login.</p>
              <div className="rounded-lg border border-border bg-muted/40 p-3 space-y-1 font-mono text-xs">
                <p><b>Supplier ID:</b> {created.code}</p>
                <p><b>Email:</b> {created.email}</p>
                <p><b>Temp password:</b> {created.password}</p>
              </div>
              <Button onClick={() => { navigator.clipboard.writeText(`Afristall Supplier login\nID: ${created.code}\nEmail: ${created.email}\nPassword: ${created.password}\nLogin: https://afristall.com/login`); toast.success("Copied"); }} className="w-full gap-1.5"><Copy className="h-4 w-4" />Copy login details</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function OnboardDialog({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: (c: { email: string; password: string; code: string }) => void }) {
  const [saving, setSaving] = useState(false);
  const [f, setF] = useState({ email: "", business_name: "", country: "UK", currency: "GBP", contact_name: "", whatsapp: "", bio: "", lead_time_days: "14", bank_details_text: "" });

  const submit = async () => {
    if (!f.email || !f.business_name) { toast.error("Email and business name required"); return; }
    setSaving(true);
    try {
      const bank = f.bank_details_text.trim() ? { raw: f.bank_details_text.trim() } : null;
      const { data, error } = await supabase.functions.invoke("create-supplier-account", {
        body: { ...f, lead_time_days: parseInt(f.lead_time_days) || 14, bank_details: bank },
      });
      if (error) throw new Error(error.message);
      if ((data as any)?.error) throw new Error((data as any).error);
      onCreated({ email: f.email, password: (data as any).temp_password, code: (data as any).supplier.supplier_code });
      onClose();
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Onboard Supplier</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>Email</Label><Input type="email" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} /></div>
          <div><Label>Business name</Label><Input value={f.business_name} onChange={e => setF({ ...f, business_name: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Country</Label>
              <select className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" value={f.country} onChange={e => { const c = e.target.value; setF({ ...f, country: c, currency: c === "UK" ? "GBP" : "AED" }); }}>
                <option>UK</option><option>UAE</option>
              </select>
            </div>
            <div><Label>Currency</Label>
              <select className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" value={f.currency} onChange={e => setF({ ...f, currency: e.target.value })}>
                <option>GBP</option><option>USD</option><option>AED</option><option>EUR</option>
              </select>
            </div>
          </div>
          <div><Label>Contact name</Label><Input value={f.contact_name} onChange={e => setF({ ...f, contact_name: e.target.value })} /></div>
          <div><Label>WhatsApp</Label><Input value={f.whatsapp} onChange={e => setF({ ...f, whatsapp: e.target.value })} placeholder="+447123456789" /></div>
          <div><Label>Bio / about</Label><Textarea rows={2} value={f.bio} onChange={e => setF({ ...f, bio: e.target.value })} /></div>
          <div><Label>Default lead time (days)</Label><Input type="number" value={f.lead_time_days} onChange={e => setF({ ...f, lead_time_days: e.target.value })} /></div>
          <div><Label>Bank details (admin only)</Label><Textarea rows={2} value={f.bank_details_text} onChange={e => setF({ ...f, bank_details_text: e.target.value })} placeholder="Bank, account, IBAN/SWIFT" /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={submit} disabled={saving}>{saving ? "Creating…" : "Create supplier"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}