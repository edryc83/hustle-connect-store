import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, CheckCircle2, Clock, CreditCard, Phone, Ship } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatMoney, SUPPLIER_CURRENCIES } from "@/lib/importUtils";
import { toast } from "sonner";

type PayStep = "details" | "review" | "momo";

const currencyLabels: Record<string, string> = {
  USD: "US dollar",
  GBP: "British pound",
  EUR: "Euro",
  AED: "UAE dirham",
};

export default function PaySupplier() {
  const [params] = useSearchParams();
  const productId = params.get("product") || "";
  const initialSupplierParam = params.get("supplier") || "";
  const rawInitialCurrencyParam = params.get("currency")?.toUpperCase() || "";
  const initialCurrencyParam = SUPPLIER_CURRENCIES.includes(rawInitialCurrencyParam) ? rawInitialCurrencyParam : "";

  const [step, setStep] = useState<PayStep>("details");
  const [supplierCode, setSupplierCode] = useState("");
  const [supplier, setSupplier] = useState<any>(null);
  const [productContext, setProductContext] = useState<any>(null);
  const [currency, setCurrency] = useState(initialCurrencyParam);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [fx, setFx] = useState<any>(null);
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!productId) return;
    supabase
      .from("supplier_products" as any)
      .select("id, supplier_id, name, currency")
      .eq("id", productId)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setProductContext(data);
          setCurrency((current) => current || data.currency || "");
        }
      });
  }, [productId]);

  useEffect(() => {
    const cleanSupplierParam = initialSupplierParam.trim().toUpperCase();
    if (!cleanSupplierParam) return;
    (async () => {
      let query = supabase
        .from("suppliers" as any)
        .select("id, supplier_code, business_name, country, currency, whatsapp, bio, status")
        .eq("status", "approved");
      query = cleanSupplierParam.startsWith("SUP-") ? query.eq("supplier_code", cleanSupplierParam) : query.eq("id", initialSupplierParam);
      const { data } = await query.maybeSingle();
      if (data) {
        setSupplier(data);
        setSupplierCode(data.supplier_code || "");
        setCurrency(initialCurrencyParam || data.currency || "");
      }
    })();
  }, [initialSupplierParam, initialCurrencyParam]);

  useEffect(() => {
    if (!currency || step === "details") return;
    setFx(null);
    fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fx-rate?currency=${currency}`, {
      headers: { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
    }).then((r) => r.json()).then(setFx).catch(() => toast.error("Could not lock exchange rate"));
  }, [currency, step]);

  const calc = useMemo(() => {
    const order = Number(amount || 0);
    const fee = order * 0.05;
    const totalForeign = order + fee;
    const amountUgx = fx?.rate ? Math.round(totalForeign * Number(fx.rate)) : 0;
    return { order, fee, totalForeign, amountUgx };
  }, [amount, fx]);

  useEffect(() => {
    if (!status?.paymentId) return;
    const t = window.setInterval(async () => {
      const { data } = await supabase.from("supplier_payments" as any).select("status").eq("id", status.paymentId).single();
      if (data?.status) setStatus((s: any) => ({ ...s, paymentStatus: data.status }));
    }, 4000);
    return () => window.clearInterval(t);
  }, [status?.paymentId]);

  const lookupSupplier = async () => {
    const cleanCode = supplierCode.trim().toUpperCase();
    const orderAmount = Number(amount);
    if (!currency) return toast.error("Select currency");
    if (!cleanCode) return toast.error("Enter supplier ID");
    if (!Number.isFinite(orderAmount) || orderAmount <= 0) return toast.error("Enter a valid order amount");

    setLoading(true);
    const { data, error } = await supabase
      .from("suppliers" as any)
      .select("id, supplier_code, business_name, country, currency, whatsapp, bio, status")
      .eq("supplier_code", cleanCode)
      .eq("status", "approved")
      .maybeSingle();
    setLoading(false);

    if (error || !data) return toast.error("Supplier ID not found");
    if (productContext?.supplier_id && productContext.supplier_id !== data.id) {
      return toast.error("This product belongs to a different supplier ID");
    }
    setSupplier(data);
    setSupplierCode(data.supplier_code);
    setStep("review");
  };

  const payMomo = async () => {
    if (!supplier || !amount) return toast.error("Confirm supplier and amount first");
    if (!currency) return toast.error("Select currency");
    if (!phone.trim()) return toast.error("Enter mobile money phone number");
    if (productContext?.supplier_id && productContext.supplier_id !== supplier.id) {
      return toast.error("Product and supplier ID do not match");
    }

    setLoading(true);
    const { data, error } = await supabase.functions.invoke("supplier-pay-momo", {
      body: { supplier_id: supplier.id, supplier_product_id: productContext ? productId : null, amount_foreign: Number(amount), currency, phone, note },
    });
    setLoading(false);

    if (error || data?.error) toast.error(data?.error || error?.message || "Payment failed");
    else setStatus({ paymentId: data.paymentId, paymentStatus: "pending", supplierName: supplier.business_name });
  };

  const paymentReceived = status && ["funds_received", "settled"].includes(status.paymentStatus);

  if (status) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardContent className="space-y-4 p-6 text-center">
            <CheckCircle2 className={`mx-auto h-10 w-10 ${paymentReceived ? "text-primary" : "text-muted-foreground"}`} />
            <h1 className="text-xl font-bold">{paymentReceived ? "Funds received" : "Enter PIN on your phone"}</h1>
            <p className="text-sm text-muted-foreground">Reference {status.paymentId} - {status.supplierName}</p>
            <div className="rounded-lg border p-3 text-sm">
              Status: <strong>{status.paymentStatus}</strong>
              {!paymentReceived && <p className="mt-1 text-xs text-muted-foreground">Waiting for Yo Uganda IPN to update supplier_payments.</p>}
            </div>
            {paymentReceived ? (
              <Button asChild className="w-full"><Link to="/import/shipping">Arrange shipping</Link></Button>
            ) : (
              <Button variant="outline" className="w-full" disabled>Waiting for confirmation...</Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link to="/dashboard" className="font-extrabold">Supplier Payments</Link>
          <Button variant="outline" size="sm" asChild><Link to="/import">Browse suppliers</Link></Button>
        </div>
      </header>
      <main className="mx-auto grid max-w-5xl gap-5 px-4 py-5 lg:grid-cols-[320px_1fr]">
        <aside className="space-y-4">
          <div className="rounded-2xl border bg-card p-5 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <CreditCard className="h-5 w-5" />
            </div>
            <h1 className="mt-4 text-2xl font-extrabold">Pay Supplier</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Enter Supplier ID, confirm the supplier details and FX lock, then pay with mobile money in UGX
            </p>
          </div>
        </aside>

        <Card className="h-fit shadow-sm">
          <CardContent className="space-y-5 p-4 sm:p-5">
            <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-start">
              <div>
                <h2 className="text-lg font-bold">
                  {step === "details" && "Step 1: Supplier ID, currency, amount"}
                  {step === "review" && "Step 2: Review + FX lock"}
                  {step === "momo" && "Step 3: Mobile money phone"}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {step === "details" && "Choose the invoice currency first, then enter the supplier ID and amount."}
                  {step === "review" && "Confirm the supplier and the UGX total before starting payment."}
                  {step === "momo" && "A Yo Uganda USSD prompt will be sent to this phone."}
                </p>
              </div>
              <Button variant="outline" size="sm" asChild><Link to="/import/shipping" className="gap-2"><Ship className="h-4 w-4" /> Shipping agents</Link></Button>
            </div>

            {step === "details" && (
              <div className="space-y-4">
                <div className="rounded-xl border bg-muted/20 p-4">
                  <Label>Invoice currency</Label>
                  <div className="mt-2 grid gap-3 sm:grid-cols-[220px_1fr] sm:items-start">
                    <Select value={currency} onValueChange={(value) => { setCurrency(value); setAmount(""); }}>
                      <SelectTrigger><SelectValue placeholder="Select currency" /></SelectTrigger>
                      <SelectContent>
                        {SUPPLIER_CURRENCIES.map((code) => (
                          <SelectItem key={code} value={code}>{code} - {currencyLabels[code]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs leading-5 text-muted-foreground">
                      Use the currency on the supplier invoice or WhatsApp agreement. Afristall converts the total to UGX at review.
                    </p>
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-[1fr_180px]">
                  <div className="space-y-1.5">
                    <Label>Supplier ID</Label>
                    <Input value={supplierCode} onChange={(e) => { setSupplierCode(e.target.value.toUpperCase()); setSupplier(null); }} placeholder="SUP-UAE-0001" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>{currency ? `Amount (${currency})` : "Amount"}</Label>
                    <Input
                      inputMode="decimal"
                      placeholder={currency ? `0.00 ${currency}` : "Select currency first"}
                      value={amount}
                      disabled={!currency}
                      onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
                    />
                  </div>
                </div>
                <div className="space-y-1.5"><Label>Note / PO ref</Label><Textarea rows={2} placeholder="Invoice number, product name, or WhatsApp agreement" value={note} onChange={(e) => setNote(e.target.value)} /></div>
                <Button className="w-full gap-2" disabled={loading} onClick={lookupSupplier}>{loading ? "Checking supplier..." : <>Continue to review <ArrowRight className="h-4 w-4" /></>}</Button>
              </div>
            )}

            {step === "review" && supplier && (
              <div className="space-y-4">
                <div className="rounded-xl border bg-muted/20 p-4 text-sm">
                  <p className="font-semibold">{supplier.business_name}</p>
                  <p className="mt-1 text-muted-foreground">{supplier.supplier_code} - {supplier.country}</p>
                  <p className="mt-1 text-muted-foreground">Payment currency: {currency}{supplier.currency && supplier.currency !== currency ? ` (supplier default: ${supplier.currency})` : ""}</p>
                  {supplier.bio && <p className="mt-2 text-muted-foreground">{supplier.bio}</p>}
                </div>
                <div className="rounded-xl border bg-muted/30 p-4 text-sm">
                  <div className="flex items-center gap-2 font-semibold"><Clock className="h-4 w-4" /> Rate locked for 15 minutes</div>
                  {fx?.rate ? (
                    <div className="mt-3 grid gap-1">
                      <p>Order amount: {formatMoney(calc.order, currency)}</p>
                      <p>Afristall fee (5%): {formatMoney(calc.fee, currency)}</p>
                      <p>Total: {formatMoney(calc.totalForeign, currency)}</p>
                      <p>Exchange rate: 1 {currency} = {Number(fx.rate).toLocaleString()} UGX</p>
                      <p className="text-lg font-extrabold">You pay: UGX {calc.amountUgx.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Lock expires {new Date(fx.locked_until).toLocaleTimeString()}.</p>
                    </div>
                  ) : (
                    <p className="mt-3 text-muted-foreground">Locking exchange rate...</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setStep("details")}>Back</Button>
                  <Button className="flex-1 gap-2" disabled={!fx?.rate} onClick={() => setStep("momo")}>Confirm details <ArrowRight className="h-4 w-4" /></Button>
                </div>
              </div>
            )}

            {step === "momo" && supplier && (
              <div className="space-y-4">
                <div className="rounded-xl border bg-muted/20 p-4 text-sm">
                  <p className="font-semibold">Ready to request payment</p>
                  <p className="mt-1 text-muted-foreground">{supplier.business_name} - UGX {calc.amountUgx.toLocaleString()}</p>
                </div>
                <div className="space-y-1.5">
                  <Label>Mobile money phone</Label>
                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input className="pl-9" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07XXXXXXXX" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setStep("review")}>Back</Button>
                  <Button className="flex-1 gap-2" disabled={loading} onClick={payMomo}>{loading ? "Sending prompt..." : <>Send PIN prompt <ArrowRight className="h-4 w-4" /></>}</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
