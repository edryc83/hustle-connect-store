import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Coins, Loader2, CheckCircle2, Sparkles } from "lucide-react";
import { TOKEN_PACKAGES, formatUGX, type TokenPackage } from "@/lib/tokenPackages";
import { supabase } from "@/integrations/supabase/client";
import { useTokens } from "@/hooks/useTokens";
import { toast } from "sonner";
import { Capacitor } from "@capacitor/core";

interface Props {
  open: boolean;
  onClose: () => void;
}

type Stage = "packages" | "paying" | "confirmed";

export function TokenPackagesModal({ open, onClose }: Props) {
  const { balance, refetch } = useTokens();
  const [stage, setStage] = useState<Stage>("packages");
  const [buying, setBuying] = useState<string | null>(null);
  const [pendingPaymentId, setPendingPaymentId] = useState<string | null>(null);
  const [confirmedTokens, setConfirmedTokens] = useState<number>(0);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setTimeout(() => { setStage("packages"); setBuying(null); setPendingPaymentId(null); }, 300);
    }
  }, [open]);

  // Realtime: watch for payment confirmation
  useEffect(() => {
    if (!pendingPaymentId || stage !== "paying") return;

    const channel = supabase
      .channel(`payment-${pendingPaymentId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "token_payments",
          filter: `id=eq.${pendingPaymentId}`,
        },
        (payload) => {
          const row = payload.new as any;
          if (row.status === "completed") {
            setConfirmedTokens(row.tokens);
            setStage("confirmed");
            refetch();
          } else if (row.status === "failed" || row.status === "cancelled") {
            toast.error("Payment was not completed. Please try again.");
            setStage("packages");
            setBuying(null);
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [pendingPaymentId, stage, refetch]);

  const handleBuy = async (pkg: TokenPackage) => {
    setBuying(pkg.id);
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
          body: JSON.stringify({ packageId: pkg.id }),
        }
      );
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.error || "Payment setup failed");

      setPendingPaymentId(data.paymentId);
      setStage("paying");

      // Open payment URL in system browser (safe for payment flows)
      const url: string = data.paymentUrl;
      if (Capacitor.isNativePlatform()) {
        window.open(url, "_system");
      } else {
        window.open(url, "_blank");
      }
    } catch (e: any) {
      toast.error(e?.message || "Could not start payment");
      setBuying(null);
    }
  };

  const handleCheckManually = async () => {
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
      toast.info("Payment not confirmed yet — check again shortly");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="h-4 w-4 text-amber-400" /> Buy Tokens
          </DialogTitle>
        </DialogHeader>

        {stage === "packages" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Your balance</span>
              <span className="font-bold flex items-center gap-1">
                <Coins className="h-3.5 w-3.5 text-amber-400" /> {balance} tokens
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">10 tokens = 1 design. Pay via mobile money — MTN, Airtel, M-Pesa and more.</p>

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
                      disabled={!!buying}
                      onClick={() => handleBuy(pkg)}
                    >
                      {buying === pkg.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Buy"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground text-center">Prices in Ugandan Shillings. Other currencies coming soon.</p>
          </div>
        )}

        {stage === "paying" && (
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
            </div>
            <div>
              <p className="font-semibold">Waiting for your payment</p>
              <p className="text-[12px] text-muted-foreground mt-1">
                Complete the payment in your browser. Tokens will be added automatically once confirmed.
              </p>
            </div>
            <Button variant="outline" className="w-full" onClick={handleCheckManually}>
              I've paid — check now
            </Button>
            <button
              className="text-[11px] text-muted-foreground underline"
              onClick={() => { setStage("packages"); setBuying(null); }}
            >
              Cancel
            </button>
          </div>
        )}

        {stage === "confirmed" && (
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <div className="h-14 w-14 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
            <div>
              <p className="font-bold text-lg">Payment confirmed!</p>
              <p className="text-sm text-muted-foreground mt-1">
                <span className="font-semibold text-foreground">{confirmedTokens} tokens</span> have been added to your account.
              </p>
              <div className="mt-2 flex items-center justify-center gap-1.5 text-sm font-semibold">
                <Coins className="h-4 w-4 text-amber-400" />
                New balance: {balance} tokens
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
