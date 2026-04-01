import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAgentData, type ReferredSeller } from "@/hooks/useAgentData";
import AfristallLogo from "@/components/AfristallLogo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, Share2, MessageCircle, Store, CheckCircle2, Users, Wallet, Loader2, Package, LogOut } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const REWARD_PER_SHOP = 2_000;

export default function AgentPortal() {
  const navigate = useNavigate();
  const { isAgent, loading, agentName, agentSlug, sellers, completeCount, balance } = useAgentData();

  useEffect(() => {
    if (!loading && isAgent === false) navigate("/", { replace: true });
  }, [loading, isAgent, navigate]);

  if (loading || isAgent === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAgent) return null;

  const referralUrl = `https://afristall.com/${agentSlug}`;

  const copyLink = () => {
    navigator.clipboard.writeText(referralUrl);
    toast.success("Referral link copied!");
  };

  const shareLink = () => {
    if (navigator.share) {
      navigator.share({
        title: "Join Afristall",
        text: `Create your free online store on Afristall! Use my referral link:`,
        url: referralUrl,
      }).catch(() => {});
    } else {
      copyLink();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-card/80 backdrop-blur-lg">
        <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <AfristallLogo className="h-7 w-7" />
            <span className="text-base font-extrabold tracking-tight">
              Afri<span className="text-primary">stall</span>
            </span>
          </div>
          <span className="text-sm font-medium text-muted-foreground">{agentName}</span>
        </div>
      </header>

      <main className="mx-auto max-w-lg space-y-4 px-4 py-5">
        {/* Balance Card */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
              <Wallet className="h-4 w-4" /> Account Balance
            </div>
            <p className="text-3xl font-extrabold text-foreground">
              UGX {balance.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {REWARD_PER_SHOP.toLocaleString()} UGX per complete shop
            </p>
          </CardContent>
        </Card>

        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="flex flex-col items-center p-4">
              <Users className="h-5 w-5 text-primary mb-1" />
              <span className="text-2xl font-bold">{sellers.length}</span>
              <span className="text-xs text-muted-foreground">Total Shops</span>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center p-4">
              <CheckCircle2 className="h-5 w-5 text-green-500 mb-1" />
              <span className="text-2xl font-bold">{completeCount}</span>
              <span className="text-xs text-muted-foreground">Complete Shops</span>
            </CardContent>
          </Card>
        </div>

        {/* Referral Link */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <p className="text-sm font-semibold">Your Referral Link</p>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2.5">
              <span className="flex-1 truncate text-xs text-foreground font-mono">{referralUrl}</span>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="flex-1 gap-1.5" onClick={copyLink}>
                <Copy className="h-3.5 w-3.5" /> Copy
              </Button>
              <Button size="sm" className="flex-1 gap-1.5" onClick={shareLink}>
                <Share2 className="h-3.5 w-3.5" /> Share
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Referred sellers list */}
        <div>
          <h2 className="text-sm font-semibold mb-3 text-muted-foreground">Your Shops ({sellers.length})</h2>
          {sellers.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center py-10 text-center">
                <Store className="h-10 w-10 text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">No shops yet. Share your referral link to get started!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {sellers.map((seller) => (
                <SellerRow key={seller.id} seller={seller} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function SellerRow({ seller }: { seller: ReferredSeller }) {
  const whatsappLink = seller.whatsapp_number
    ? `https://wa.me/${seller.whatsapp_number.replace(/^\+/, "").replace(/\D/g, "")}`
    : null;

  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
          {(seller.first_name || "?")[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{seller.store_name || "Unnamed Store"}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{seller.first_name || "—"}</span>
            <span className="flex items-center gap-0.5">
              <Package className="h-3 w-3" /> {seller.productCount}
            </span>
          </div>
        </div>
        {whatsappLink && (
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="shrink-0">
            <MessageCircle className="h-5 w-5 text-green-500" />
          </a>
        )}
        <Badge
          className={
            seller.isComplete
              ? "bg-green-500/15 text-green-600 border-green-500/30 hover:bg-green-500/15"
              : "bg-orange-500/15 text-orange-600 border-orange-500/30 hover:bg-orange-500/15"
          }
        >
          {seller.isComplete ? "Complete" : "Incomplete"}
        </Badge>
      </CardContent>
    </Card>
  );
}
