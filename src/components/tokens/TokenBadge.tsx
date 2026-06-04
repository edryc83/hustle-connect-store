import { Coins } from "lucide-react";
import { useTokens } from "@/hooks/useTokens";
import { useState } from "react";
import { TokenPackagesModal } from "./TokenPackagesModal";

export function TokenBadge() {
  const { balance, enabled, loading } = useTokens();
  const [open, setOpen] = useState(false);

  if (!enabled || loading) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 h-9 px-3 rounded-full border bg-card/60 backdrop-blur-sm text-sm font-semibold hover:bg-primary/10 transition-colors"
        aria-label="Token balance — buy more"
      >
        <Coins className="h-3.5 w-3.5 text-amber-400" />
        <span className={balance < 10 ? "text-destructive" : "text-foreground"}>
          {balance}
        </span>
      </button>
      <TokenPackagesModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
