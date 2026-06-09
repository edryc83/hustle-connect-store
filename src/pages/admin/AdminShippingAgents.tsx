import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminShippingAgents() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("shipping_agents" as any).select("*").order("created_at", { ascending: false }) as any;
    setRows(data || []); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Shipping Agents</h1>
        <Button onClick={() => setOpen(true)} className="gap-1.5"><Plus className="h-4 w-4" />Add Agent</Button>
      </div>
      {loading ? <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin" /></div> :
        rows.length === 0 ? <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">No shipping agents yet.</CardContent></Card> :
        <div className="space-y-2">
          {rows.map(a => (
            <Card key={a.id}>
              <CardContent className="p-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2"><p className="text-sm font-semibold truncate">{a.name}</p><Badge variant="outline" className="text-[10px]">{a.lane_from} → {a.lane_to}</Badge><Badge variant="outline" className="text-[10px]">{a.mode}</Badge></div>
                  <p className="text-xs text-muted-foreground">{a.rate_currency} {Number(a.rate_amount).toLocaleString()} {a.rate_unit === "per_kg" ? "/kg" : "/CBM"} • ~{a.duration_days} days • {a.whatsapp}</p>
                </div>
                <Button size="sm" variant="ghost" onClick={async () => { if (confirm("Delete?")) { await supabase.from("shipping_agents" as any).delete().eq("id", a.id); load(); } }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </CardContent>
            </Card>
          ))}
        </div>
      }
      <AddDialog open={open} onClose={() => setOpen(false)} onSaved={load} />
    </div>
  );
}

function AddDialog({ open, onClose, onSaved }: { open: boolean; onClose: () => void; onSaved: () => void }) {
  const [saving, setSaving] = useState(false);
  const [f, setF] = useState({ name: "", lane_from: "UAE", lane_to: "UG", mode: "Air", rate_amount: "", rate_unit: "per_kg", rate_currency: "USD", duration_days: "7", whatsapp: "", notes: "" });
  const submit = async () => {
    if (!f.name || !f.rate_amount || !f.whatsapp) { toast.error("Required fields missing"); return; }
    setSaving(true);
    const { error } = await supabase.from("shipping_agents" as any).insert({ ...f, rate_amount: parseFloat(f.rate_amount), duration_days: parseInt(f.duration_days) || null });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Added"); onSaved(); onClose();
  };
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Add Shipping Agent</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>Name</Label><Input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>From</Label><select className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" value={f.lane_from} onChange={e => setF({ ...f, lane_from: e.target.value })}><option>UK</option><option>UAE</option><option>CN</option></select></div>
            <div><Label>Mode</Label><select className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" value={f.mode} onChange={e => setF({ ...f, mode: e.target.value })}><option>Air</option><option>Sea</option></select></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><Label>Rate</Label><Input type="number" step="0.01" value={f.rate_amount} onChange={e => setF({ ...f, rate_amount: e.target.value })} /></div>
            <div><Label>Unit</Label><select className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" value={f.rate_unit} onChange={e => setF({ ...f, rate_unit: e.target.value })}><option value="per_kg">per kg</option><option value="per_cbm">per CBM</option></select></div>
            <div><Label>Currency</Label><select className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" value={f.rate_currency} onChange={e => setF({ ...f, rate_currency: e.target.value })}><option>USD</option><option>GBP</option><option>AED</option></select></div>
          </div>
          <div><Label>Duration (days)</Label><Input type="number" value={f.duration_days} onChange={e => setF({ ...f, duration_days: e.target.value })} /></div>
          <div><Label>WhatsApp</Label><Input value={f.whatsapp} onChange={e => setF({ ...f, whatsapp: e.target.value })} placeholder="+97150…" /></div>
          <div><Label>Notes</Label><Textarea rows={2} value={f.notes} onChange={e => setF({ ...f, notes: e.target.value })} /></div>
        </div>
        <DialogFooter><Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button><Button onClick={submit} disabled={saving}>{saving ? "Saving…" : "Add"}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}