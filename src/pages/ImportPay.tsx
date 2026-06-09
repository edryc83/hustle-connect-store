import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, Smartphone, Building2, CheckCircle2, Clock, Truck } from "lucide-react";
import { toast } from "sonner";

type Supplier = { id: string; supplier_code: string; business_name: string; country: string; currency: string };
type FxResp = { from: string; to: string; rate: number; fee_pct: number; fetched_at: string; locked_until: string };

const AFRISTALL_BANK = {
  bank: "Stanbic Bank Uganda",
  account_name: "Afristall Limited",
  account_number: "9030020012345",
  branch: "Kampala Main Branch",
  swift: "SBICUGKX",
};

export default function ImportPay() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [params] = useSearchParams();
  const initSupplierId = params.get("supplier") || "";
  const initProductId = params.get("product") || "";

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [supplierId, setSupplierId] = useState(initSupplierId);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [method, setMethod] = useState<"momo" | "bank_transfer">("momo");
  const [phone, setPhone] = useState("");
  const [fx, setFx] = useState<FxResp | null>(null);
  const [fxLoading, setFxLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string>("");
  const [proofFile, setProofFile] = useState<File | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/login", { replace: true }); return; }
    (async () => {
      const { data } = await supabase.from("suppliers_public" as any).select("id, supplier_code, business_name, country, currency").order("business_name") as any;
      setSuppliers(data || []);
    })();
  }, [user, authLoading]);

  const supplier = useMemo(() => suppliers.find(s => s.id === supplierId), [suppliers, supplierId]);

  const loadFx = async () => {
    if (!supplier) return;
    setFxLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("fx-rate", {
        body: null,
        method: "GET" as any,
      } as any);
      // supabase.functions.invoke doesn't support query params nicely — use direct fetch
      const url = `${(import.meta as any).env.VITE_SUPABASE_URL}/functions/v1/fx-rate?from=${supplier.currency}&to=UGX&fee=5`;
      const r = await fetch(url, { headers: { Authorization: `Bearer ${(import.meta as any).env.VITE_SUPABASE_PUBLISHABLE_KEY}` } });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "FX error");
      setFx(j);
    } catch (e: any) { toast.error(e.message || "Could not fetch exchange rate"); }
    finally { setFxLoading(false); }
  };

  const goConfirm = async () => {
    if (!supplier || !amount || Number(amount) <= 0) { toast.error("Select supplier and enter amount"); return; }
    await loadFx();
    setStep(2);
  };

  const totalForeign = fx && amount ? Number(amount) * (1 + fx.fee_pct / 100) : 0;
  const totalUgx = fx && amount ? Math.round(totalForeign * fx.rate) : 0;

  // Countdown
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  const lockedMsLeft = fx ? new Date(fx.locked_until).getTime() - now : 0;
  const expired = fx && lockedMsLeft <= 0;

  const submitPayment = async () => {
    if (!supplier || !fx) return;
    if (expired) { toast.error("Rate expired. Refresh."); return; }
    if (method === "momo" && !phone) { toast.error("Enter phone number"); return; }
    if (method === "bank_transfer" && !proofFile) { toast.error("Upload payment proof"); return; }
    setSubmitting(true);
    try {
      if (method === "momo") {
        const { data, error } = await supabase.functions.invoke("supplier-pay-momo", {
          body: {
            supplier_id: supplier.id,
            supplier_product_id: initProductId || null,
            amount_foreign: Number(amount),
            currency: supplier.currency,
            fee_pct: fx.fee_pct,
            fx_rate: fx.rate,
            fx_locked_at: fx.fetched_at,
            phone,
            note: note || null,
          },
        });
        if (error) throw new Error(error.message);
        if ((data as any)?.error) throw new Error((data as any).error);
        setPaymentId((data as any).paymentId);
        setStep(4);
        pollStatus((data as any).paymentId);
      } else {
        // Bank transfer: insert pending_review row, upload proof
        const insertPayload: any = {
          buyer_id: user!.id,
          supplier_id: supplier.id,
          supplier_product_id: initProductId || null,
          amount_foreign: Number(amount),
          currency: supplier.currency,
          fee_pct: fx.fee_pct,
          amount_foreign_total: +totalForeign.toFixed(2),
          fx_rate: fx.rate,
          fx_locked_at: fx.fetched_at,
          amount_ugx: totalUgx,
          method: "bank_transfer",
          note: note || null,
          status: "pending_review",
        };
        const { data: created, error: insErr } = await (supabase.from("supplier_payments" as any).insert(insertPayload).select("id").single() as any);
        if (insErr || !created) throw new Error(insErr?.message || "Failed");
        const ext = (proofFile!.name.split(".").pop() || "jpg").toLowerCase();
        const path = `${user!.id}/${created.id}.${ext}`;
        const { error: upErr } = await supabase.storage.from("payment-proofs").upload(path, proofFile!, { upsert: true });
        if (upErr) throw upErr;
        await supabase.from("supplier_payments" as any).update({ bank_proof_url: path }).eq("id", created.id);
        setPaymentId(created.id);
        setPaymentStatus("pending_review");
        setStep(4);
      }
    } catch (e: any) { toast.error(e.message || "Payment failed"); }
    finally { setSubmitting(false); }
  };

  const pollStatus = async (id: string) => {
    for (let i = 0; i < 40; i++) {
      await new Promise(r => setTimeout(r, 3000));
      const { data } = await supabase.from("supplier_payments" as any).select("status").eq("id", id).maybeSingle() as any;
      if (data?.status && data.status !== "pending") {
        setPaymentStatus(data.status);
        if (["funds_received", "settled", "failed"].includes(data.status)) return;
      }
    }
  };

  return (
    <div className="min-h-screen bg-background pb-12">
      <header className="sticky top-0 z-40 border-b border-border/40 bg-card/80 backdrop-blur-lg">
        <div className="mx-auto flex h-14 max-w-xl items-center gap-3 px-4">
          <Button variant="ghost" size="icon" onClick={() => step > 1 ? setStep((step - 1) as any) : navigate(-1)}><ArrowLeft className="h-4 w-4" /></Button>
          <p className="text-sm font-bold">Pay Supplier</p>
          <span className="ml-auto text-[10px] text-muted-foreground">Step {step} of 4</span>
        </div>
      </header>

      <main className="mx-auto max-w-xl px-4 py-5 space-y-4">
        {step === 1 && (
          <Card><CardContent className="p-4 space-y-4">
            <div>
              <Label>Supplier</Label>
              <select className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" value={supplierId} onChange={e => setSupplierId(e.target.value)}>
                <option value="">— Select supplier —</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.supplier_code} — {s.business_name} ({s.country})</option>)}
              </select>
            </div>
            {supplier && (
              <>
                <div>
                  <Label>Amount ({supplier.currency})</Label>
                  <Input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="e.g. 1000" />
                </div>
                <div>
                  <Label>Note / PO Reference (optional)</Label>
                  <Textarea value={note} onChange={e => setNote(e.target.value)} rows={2} placeholder="e.g. 200 shirts size M as agreed on WhatsApp" />
                </div>
              </>
            )}
            <Button className="w-full" disabled={!supplier || !amount || fxLoading} onClick={goConfirm}>
              {fxLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Continue"}
            </Button>
          </CardContent></Card>
        )}

        {step === 2 && supplier && fx && (
          <Card><CardContent className="p-4 space-y-3">
            <p className="text-sm font-semibold">Review your payment</p>
            <div className="space-y-2 text-sm">
              <Row label="Supplier" value={`${supplier.business_name}`} sub={supplier.supplier_code} />
              <Row label="Order amount" value={`${supplier.currency} ${Number(amount).toLocaleString()}`} />
              <Row label="Afristall fee (5%)" value={`${supplier.currency} ${(Number(amount) * 0.05).toFixed(2)}`} sub="Covers payment & transfer charges" />
              <Row label="Total" value={`${supplier.currency} ${totalForeign.toFixed(2)}`} bold />
              <Row label="Exchange rate" value={`1 ${supplier.currency} = ${fx.rate.toFixed(2)} UGX`} sub={expired ? "Expired — refresh" : `Locked ${Math.floor(lockedMsLeft / 60000)}:${String(Math.floor((lockedMsLeft % 60000) / 1000)).padStart(2, "0")}`} />
              <div className="rounded-lg bg-primary/10 border border-primary/20 p-3 mt-2">
                <p className="text-xs text-muted-foreground">You pay</p>
                <p className="text-2xl font-extrabold text-primary">UGX {totalUgx.toLocaleString()}</p>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground">The exchange rate refreshes if it expires before you pay. Afristall holds your funds and settles to the supplier after confirmation.</p>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={loadFx} disabled={fxLoading}>Refresh rate</Button>
              <Button className="flex-1" disabled={!!expired} onClick={() => setStep(3)}>Choose payment method</Button>
            </div>
          </CardContent></Card>
        )}

        {step === 3 && supplier && fx && (
          <Card><CardContent className="p-4 space-y-4">
            <p className="text-sm font-semibold">Payment method</p>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setMethod("momo")} className={`rounded-lg border p-3 text-left ${method === "momo" ? "border-primary bg-primary/5" : "border-border"}`}>
                <Smartphone className="h-4 w-4 text-primary mb-1" />
                <p className="text-sm font-semibold">Mobile Money</p>
                <p className="text-[10px] text-muted-foreground">Instant via Yo Uganda</p>
              </button>
              <button onClick={() => setMethod("bank_transfer")} className={`rounded-lg border p-3 text-left ${method === "bank_transfer" ? "border-primary bg-primary/5" : "border-border"}`}>
                <Building2 className="h-4 w-4 text-primary mb-1" />
                <p className="text-sm font-semibold">Bank Transfer</p>
                <p className="text-[10px] text-muted-foreground">Upload payment slip</p>
              </button>
            </div>

            {method === "momo" ? (
              <div>
                <Label>Mobile money number</Label>
                <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="07XXXXXXXX" />
                <p className="text-[10px] text-muted-foreground mt-1">You will receive a PIN prompt on your phone. Enter your PIN to confirm payment of UGX {totalUgx.toLocaleString()}.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="rounded-lg border border-border bg-muted/40 p-3 text-xs space-y-1">
                  <p><span className="text-muted-foreground">Bank:</span> {AFRISTALL_BANK.bank}</p>
                  <p><span className="text-muted-foreground">Account name:</span> {AFRISTALL_BANK.account_name}</p>
                  <p><span className="text-muted-foreground">Account number:</span> {AFRISTALL_BANK.account_number}</p>
                  <p><span className="text-muted-foreground">Branch:</span> {AFRISTALL_BANK.branch}</p>
                  <p><span className="text-muted-foreground">Reference:</span> Use your name + supplier code <code>{supplier.supplier_code}</code></p>
                </div>
                <div>
                  <Label>Upload payment slip</Label>
                  <input type="file" accept="image/*,.pdf" onChange={e => setProofFile(e.target.files?.[0] || null)} className="text-sm w-full mt-1" />
                </div>
              </div>
            )}

            <div className="rounded-lg bg-primary/10 border border-primary/20 p-3">
              <p className="text-xs text-muted-foreground">You will pay</p>
              <p className="text-xl font-extrabold text-primary">UGX {totalUgx.toLocaleString()}</p>
            </div>

            <Button className="w-full" onClick={submitPayment} disabled={submitting || !!expired}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : method === "momo" ? "Send PIN prompt" : "Submit payment for review"}
            </Button>
          </CardContent></Card>
        )}

        {step === 4 && (
          <Card><CardContent className="p-6 text-center space-y-4">
            {paymentStatus === "funds_received" || paymentStatus === "settled" ? (
              <>
                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
                <h2 className="text-xl font-bold">Payment received!</h2>
                <p className="text-sm text-muted-foreground">We've received your funds. Your supplier has been notified and will prepare your goods.</p>
              </>
            ) : paymentStatus === "failed" ? (
              <>
                <p className="text-destructive font-semibold">Payment failed</p>
                <p className="text-xs text-muted-foreground">Please try again.</p>
                <Button onClick={() => setStep(3)}>Try again</Button>
              </>
            ) : paymentStatus === "pending_review" ? (
              <>
                <Clock className="h-12 w-12 text-orange-500 mx-auto" />
                <h2 className="text-xl font-bold">Submitted for review</h2>
                <p className="text-sm text-muted-foreground">We're verifying your bank transfer. You'll be notified once confirmed (usually within a few hours).</p>
              </>
            ) : (
              <>
                <Loader2 className="h-12 w-12 text-primary mx-auto animate-spin" />
                <h2 className="text-xl font-bold">Waiting for confirmation…</h2>
                <p className="text-sm text-muted-foreground">Check your phone and enter your Mobile Money PIN to authorize <strong>UGX {totalUgx.toLocaleString()}</strong>.</p>
              </>
            )}
            <div className="flex flex-col gap-2 pt-4">
              <Button variant="outline" onClick={() => navigate("/import/shipping")} className="gap-1.5"><Truck className="h-4 w-4" />Now arrange shipping →</Button>
              <Button variant="ghost" onClick={() => navigate("/import")}>Back to Import</Button>
            </div>
          </CardContent></Card>
        )}
      </main>
    </div>
  );
}

function Row({ label, value, sub, bold }: { label: string; value: string; sub?: string; bold?: boolean }) {
  return (
    <div className="flex justify-between items-start">
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
      </div>
      <p className={`text-sm ${bold ? "font-extrabold" : "font-semibold"}`}>{value}</p>
    </div>
  );
}