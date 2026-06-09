import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Loader2, FileText, CheckCircle2, XCircle, Truck } from "lucide-react";
import { toast } from "sonner";

export default function AdminSupplierPayments() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data: pays } = await supabase.from("supplier_payments" as any).select("*").order("created_at", { ascending: false }) as any;
    const supIds = Array.from(new Set((pays || []).map((p: any) => p.supplier_id)));
    const buyerIds = Array.from(new Set((pays || []).map((p: any) => p.buyer_id)));
    const [{ data: sups }, { data: buyers }] = await Promise.all([
      supIds.length ? (supabase.from("suppliers" as any).select("id, business_name, supplier_code").in("id", supIds) as any) : { data: [] },
      buyerIds.length ? (supabase.from("profiles").select("id, first_name, email, store_name").in("id", buyerIds) as any) : { data: [] },
    ]);
    const sMap: any = {}; for (const s of sups || []) sMap[s.id] = s;
    const bMap: any = {}; for (const b of buyers || []) bMap[b.id] = b;
    setRows((pays || []).map((p: any) => ({ ...p, supplier: sMap[p.supplier_id], buyer: bMap[p.buyer_id] })));
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const action = async (id: string, act: "approve_bank" | "reject_bank" | "mark_settled") => {
    const { error } = await supabase.functions.invoke("supplier-payment-action", { body: { payment_id: id, action: act } });
    if (error) { toast.error(error.message); return; }
    toast.success("Done"); load();
  };

  const viewProof = async (path: string) => {
    const { data } = await supabase.storage.from("payment-proofs").createSignedUrl(path, 300);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Supplier Payments</h1>
      {loading ? <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin" /></div> :
        rows.length === 0 ? <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">No payments yet.</CardContent></Card> :
        <div className="rounded-xl border border-border/50 bg-card/60 backdrop-blur-xl overflow-hidden">
          <Table>
            <TableHeader><TableRow><TableHead>Buyer</TableHead><TableHead>Supplier</TableHead><TableHead>Amount</TableHead><TableHead>Method</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {rows.map(p => (
                <TableRow key={p.id}>
                  <TableCell><div><p className="text-sm">{p.buyer?.first_name || p.buyer?.store_name || "—"}</p><p className="text-xs text-muted-foreground">{p.buyer?.email}</p></div></TableCell>
                  <TableCell><div><p className="text-sm">{p.supplier?.business_name}</p><p className="text-xs font-mono text-muted-foreground">{p.supplier?.supplier_code}</p></div></TableCell>
                  <TableCell><div className="text-sm"><p>{p.currency} {Number(p.amount_foreign_total).toLocaleString()}</p><p className="text-xs text-muted-foreground">UGX {Number(p.amount_ugx).toLocaleString()}</p></div></TableCell>
                  <TableCell><Badge variant="outline" className="text-[10px]">{p.method}</Badge></TableCell>
                  <TableCell><Badge className="text-[10px]" variant="outline">{p.status}</Badge></TableCell>
                  <TableCell><div className="flex gap-1 flex-wrap">
                    {p.bank_proof_url && <Button size="sm" variant="ghost" onClick={() => viewProof(p.bank_proof_url)}><FileText className="h-3.5 w-3.5" /></Button>}
                    {p.status === "pending_review" && <>
                      <Button size="sm" variant="outline" className="h-7 gap-1 text-green-600 border-green-500/30" onClick={() => action(p.id, "approve_bank")}><CheckCircle2 className="h-3 w-3" />Approve</Button>
                      <Button size="sm" variant="outline" className="h-7 gap-1 text-destructive border-destructive/30" onClick={() => action(p.id, "reject_bank")}><XCircle className="h-3 w-3" />Reject</Button>
                    </>}
                    {p.status === "funds_received" && <Button size="sm" variant="outline" className="h-7 gap-1" onClick={() => action(p.id, "mark_settled")}><Truck className="h-3 w-3" />Mark settled</Button>}
                  </div></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      }
    </div>
  );
}