import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Coins, Sparkles } from "lucide-react";
import { useState } from "react";
import { TokenPackagesModal } from "./TokenPackagesModal";
import { TOKENS_PER_DESIGN } from "@/lib/tokenPackages";
import { useTokens } from "@/hooks/useTokens";

interface Props {
  open: boolean;
  onClose: () => void;
  balance: number;
}

export function InsufficientTokensModal({ open, onClose, balance }: Props) {
  const { enabled, loading } = useTokens();
  const [buyOpen, setBuyOpen] = useState(false);
  const needed = TOKENS_PER_DESIGN - balance;

  if (!enabled || loading) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
        <DialogContent className="max-w-xs text-center">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-center gap-2">
              <Coins className="h-4 w-4 text-amber-400" /> Not enough tokens
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">
              Generating a design costs{" "}
              <span className="font-semibold text-foreground">{TOKENS_PER_DESIGN} tokens</span>.
              You have{" "}
              <span className={`font-semibold ${balance === 0 ? "text-destructive" : "text-foreground"}`}>
                {balance}
              </span>{" "}
              — you need {needed} more.
            </p>
            <Button className="w-full gap-1.5" onClick={() => { onClose(); setBuyOpen(true); }}>
              <Coins className="h-4 w-4 text-amber-400" /> Buy Tokens
            </Button>
            <Button variant="outline" className="w-full" onClick={onClose}>
              Maybe later
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <TokenPackagesModal open={buyOpen} onClose={() => setBuyOpen(false)} />
    </>
  );
}
