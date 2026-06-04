import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Coins, Loader2, CheckCircle2, Sparkles, Phone, ArrowLeft } from "lucide-react";
import { TOKEN_PACKAGES, formatUGX, type TokenPackage } from "@/lib/tokenPackages";
import { supabase } from "@/integrations/supabase/client";
import { useTokens } from "@/hooks/useTokens";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onClose: () => void;
}

type Stage = "packages" | "phone" | "waiting" | "confirmed";

export function TokenPackagesModal({ open, onClose }: Props) {
  const { balance, refetch } = useTokens();
  const [stage, setStage] = useState<Stage>("packages");
  const [selectedPkg, setSelectedPkg] = useState<TokenPackage | null>(null);
  const [phone, setPhone] = useState("");
  const [paying, setPaying] = useState(false);
  const [pendingPaymentId, setPendingPaymentId] = useState<string | null>(null);
  const [confirmedTokens, setConfirmedTokens] = useState(0);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Pre-fill phone from profile
  useEffect(() => {
    if (!open) return;
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      supabase.from("profiles").select("phone, whatsapp_number").eq("id", data.user.id).single()
        .then(({ data: p }) => {
          const num = p?.phone || p?.whatsapp_number || "";
          if (num) setPhone(num.replace(/^\+/, ""));
        });
    });
  }, [open]);

  // Reset state on close
  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => {
        setStage("packages");
        setSelectedPkg(null);
        setPaying(false);
        setPendingPaymentId(null);
      }, 300);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Realtime: listen for payment confirmation
  useEffect(() => {
    if (!pendingPaymentId || stage !== "waiting") return;

    const channel = supabase
      .channel(`payment-${pendingPaymentId}`)
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "token_payments",
        filter: `id=eq.${pendingPaymentId}`,
      }, (payload) => {
        const row = payload.new as any;
        if (row.status === "completed") {
          setConfirmedTokens(row.tokens);
          setStage("confirmed");
          refetch();
        } else if (row.status === "failed") {
          toast.error("Payment failed or was cancelled. Please try again.");
          setStage("phone");
          setPaying(false);
        }
      })
      .subscribe();

    channelRef.current = channel;
    return () => { supabase.removeChannel(channel); };
  }, [pendingPaymentId, stage, refetch]);

  const handleSelectPackage = (pkg: TokenPackage) => {
    setSelectedPkg(pkg);
    setStage("phone");
  };

  const handlePay = async () => {
    if (!selectedPkg || !phone.trim()) return;
    setPaying(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-payment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session?.access_token}`,
            "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ packageId: selectedPkg.id, phone: phone.trim() }),
        }
      );
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.error || "Payment request failed");
      setPendingPaymentId(data.paymentId);
      setStage("waiting");
    } catch (e: any) {
      toast.error(e?.message || "Could not start payment");
    } finally {
      setPaying(false);
    }
  };

  const handleCheckNow = async () => {
    if (!pendingPaymentId) return;
    const { data } = await supabase
      .from("token_payments")
      .select("status, tokens")
      .eq("id", pendingPaymentId)
      .single();
    if (data?.status === "completed") {
      setConfirmedTokens(data.tokens);
      setStage("confirmed");
      refetch();
    } else {
      toast.info("Not confirmed yet — please check your phone and enter your PIN.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {stage === "phone" && (
              <button onClick={() => setStage("packages")} className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <Coins className="h-4 w-4 text-amber-400" />
            {stage === "packages" && "Buy Tokens"}
            {stage === "phone"    && `Pay — ${selectedPkg?.name}`}
            {stage === "waiting"  && "Confirm on your phone"}
            {stage === "confirmed" && "Payment confirmed!"}
          </DialogTitle>
        </DialogHeader>

        {/* ── Package list ── */}
        {stage === "packages" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Your balance</span>
              <span className="font-bold flex items-center gap-1">
                <Coins className="h-3.5 w-3.5 text-amber-400" /> {balance} tokens
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              10 tokens = 1 design. Pay with MTN or Airtel Mobile Money — you'll get a USSD prompt on your phone.
            </p>
            <div className="space-y-2">
              {TOKEN_PACKAGES.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`relative rounded-xl border bg-gradient-to-br ${pkg.accent} p-3 flex items-center gap-3`}
                >
                  {pkg.popular && (
                    <span className="absolute -top-2 left-3 text-[10px] font-bold bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                      Most popular
                    </span>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-foreground">{pkg.name}</span>
                      {pkg.discount && (
                        <span className="text-[10px] font-semibold bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-full">
                          {pkg.discount}% off
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {pkg.tokens} tokens · {pkg.designs} designs
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold text-foreground">{formatUGX(pkg.priceUGX)}</div>
                    <Button
                      size="sm"
                      className="h-7 px-3 text-xs mt-1"
                      onClick={() => handleSelectPackage(pkg)}
                    >
                      Buy
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground text-center">
              Powered by Yo Uganda · MTN &amp; Airtel Money accepted
            </p>
          </div>
        )}

        {/* ── Phone number entry ── */}
        {stage === "phone" && selectedPkg && (
          <div className="space-y-4">
            <div className="rounded-xl border border-border/60 bg-card/40 p-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Package</span>
                <span className="font-semibold">{selectedPkg.name}</span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-muted-foreground">Tokens</span>
                <span className="font-semibold">{selectedPkg.tokens}</span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-bold text-foreground">{formatUGX(selectedPkg.priceUGX)}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-medium">
                Mobile Money number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="07XXXXXXXX or 256XXXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  inputMode="tel"
                  disabled={paying}
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Works with MTN (077/078) and Airtel (070/075/074) numbers.
              </p>
            </div>

            <Button
              className="w-full gap-2"
              disabled={paying || phone.trim().length < 9}
              onClick={handlePay}
            >
              {paying
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending request…</>
                : <><Coins className="h-4 w-4 text-amber-400" /> Pay {formatUGX(selectedPkg.priceUGX)}</>
              }
            </Button>
          </div>
        )}

        {/* ── Waiting for USSD confirmation ── */}
        {stage === "waiting" && (
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
              <Phone className="h-7 w-7 text-primary animate-pulse" />
            </div>
            <div>
              <p className="font-semibold">Check your phone</p>
              <p className="text-[12px] text-muted-foreground mt-1">
                A USSD prompt has been sent to <span className="font-semibold text-foreground">{phone}</span>.
                Dial or approve the prompt and enter your Mobile Money PIN to complete payment.
              </p>
            </div>
            <Button className="w-full" variant="outline" onClick={handleCheckNow}>
              I've confirmed — check now
            </Button>
            <button
              className="text-[11px] text-muted-foreground underline"
              onClick={() => { setStage("phone"); setPendingPaymentId(null); }}
            >
              Cancel / use a different number
            </button>
          </div>
        )}

        {/* ── Success ── */}
        {stage === "confirmed" && (
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <div className="h-14 w-14 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
            <div>
              <p className="font-bold text-lg">Payment confirmed!</p>
              <p className="text-sm text-muted-foreground mt-1">
                <span className="font-semibold text-foreground">{confirmedTokens} tokens</span> added to your account.
              </p>
              <div className="mt-2 flex items-center justify-center gap-1.5 text-sm font-semibold">
                <Coins className="h-4 w-4 text-amber-400" /> New balance: {balance} tokens
              </div>
            </div>
            <Button className="w-full gap-1.5" onClick={onClose}>
              <Sparkles className="h-4 w-4" /> Start designing
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
