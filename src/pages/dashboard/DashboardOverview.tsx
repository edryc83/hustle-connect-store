import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useBusinessTerms } from "@/hooks/useBusinessTerms";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { Button } from "@/components/ui/button";
import {
  Package, Copy, Share2, X, Plus, Download, Eye, ShoppingCart, TrendingUp, Bell,
} from "lucide-react";
import AfristallLogo from "@/components/AfristallLogo";
import { toast } from "sonner";
import CaptionGenerator from "@/components/dashboard/CaptionGenerator";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";

function getGreeting(): { text: string; emoji: string } {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return { text: "Good morning,", emoji: "☀️" };
  if (hour >= 12 && hour < 17) return { text: "Good afternoon,", emoji: "🌤️" };
  if (hour >= 17 && hour < 21) return { text: "Good evening,", emoji: "🌇" };
  return { text: "Hey night owl,", emoji: "🌙" };
}

const DashboardOverview = () => {
  const { user } = useAuth();
  const terms = useBusinessTerms();
  const { canInstall, isInstalled, promptInstall } = useInstallPrompt();
  const [productCount, setProductCount] = useState(0);
  const [viewCount, setViewCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [firstName, setFirstName] = useState("");
  const [storeSlug, setStoreSlug] = useState("");
  const [storeName, setStoreName] = useState("");
  const [profilePicUrl, setProfilePicUrl] = useState("");
  const [category, setCategory] = useState("");
  const [bannerDismissed, setBannerDismissed] = useState(
    () => localStorage.getItem("afristall_banner_dismissed") === "true"
  );
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const [{ count }, { data: profile }, { count: orders }] = await Promise.all([
        supabase.from("products").select("*", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("profiles").select("store_name, store_slug, first_name, profile_picture_url, category, view_count").eq("id", user.id).single(),
        supabase.from("orders").select("*", { count: "exact", head: true }).eq("seller_id", user.id).eq("status", "confirmed"),
      ]);
      setProductCount(count ?? 0);
      setOrderCount(orders ?? 0);
      const p = profile as any;
      const name = p?.first_name || p?.store_name || user.email?.split("@")[0]?.split(/[._]/)[0] || "";
      setFirstName(name.charAt(0).toUpperCase() + name.slice(1));
      setStoreSlug(p?.store_slug ?? "");
      setStoreName(p?.store_name ?? "");
      setProfilePicUrl(p?.profile_picture_url ?? "");
      setCategory(p?.category ?? "");
      setViewCount(p?.view_count ?? 0);
    };

    fetchData();
  }, [user]);

  const greeting = getGreeting();

  const storeUrl = `${window.location.origin}/${storeSlug}`;

  const dismissBanner = () => {
    setBannerDismissed(true);
    localStorage.setItem("afristall_banner_dismissed", "true");
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(storeUrl);
    setCopied(true);
    toast.success("Copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const shareStore = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: storeName, text: `🛍️ Check out ${storeName || "my store"} on Afristall — order directly on WhatsApp!`, url: storeUrl });
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(storeUrl);
      setCopied(true);
      toast.success("Share link copied!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-5">
      {/* Greeting */}
      <div className="flex items-center gap-3.5">
        <div className="shrink-0">
          <div className="rounded-2xl p-[2px] bg-gradient-to-br from-primary/40 to-primary/10">
            {profilePicUrl ? (
              <img src={profilePicUrl} alt="Profile" className="h-14 w-14 rounded-2xl object-cover border-2 border-background/50" />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-card/80 border-2 border-background/50">
                <AfristallLogo className="h-7 w-7" />
              </div>
            )}
          </div>
        </div>
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{greeting.text}</p>
          <h1 className="text-xl font-bold truncate">{firstName || "there"} {greeting.emoji}</h1>
        </div>
      </div>

      {/* Stat Cards — glassmorphism grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Products / Packages */}
        <Link
          to="/dashboard/products"
          className="rounded-2xl border border-border/40 bg-card/40 backdrop-blur-xl p-4 shadow-sm hover:bg-card/60 transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <span className="text-lg">{terms.emoji}</span>
            </div>
            <TrendingUp className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-primary transition-colors" />
          </div>
          <p className="text-2xl font-bold">{productCount}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{terms.plural}</p>
        </Link>

        {/* Store Views */}
        <Link
          to="/dashboard/analytics"
          className="rounded-2xl border border-border/40 bg-card/40 backdrop-blur-xl p-4 shadow-sm hover:bg-card/60 transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Eye className="h-5 w-5 text-blue-500" />
            </div>
            <TrendingUp className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-blue-500 transition-colors" />
          </div>
          <p className="text-2xl font-bold">{viewCount}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Store Views</p>
        </Link>

        {/* Confirmed Sales */}
        <Link
          to="/dashboard/orders"
          className="col-span-2 rounded-2xl border border-border/40 bg-card/40 backdrop-blur-xl p-4 shadow-sm hover:bg-card/60 transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center">
              <ShoppingCart className="h-6 w-6 text-green-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-2xl font-bold">{orderCount}</p>
              <p className="text-xs text-muted-foreground">Confirmed Sales</p>
            </div>
            <TrendingUp className="h-4 w-4 text-muted-foreground/50 group-hover:text-green-500 transition-colors" />
          </div>
        </Link>
      </div>

      {/* Share bar */}
      {storeSlug && (
        <div className="flex items-center gap-2 rounded-2xl bg-card/40 backdrop-blur-xl border border-border/40 px-4 py-3">
          <span className="text-sm font-medium truncate flex-1 text-muted-foreground">afristall.com/{storeSlug}</span>
          <button onClick={copyLink} className="text-muted-foreground hover:text-foreground shrink-0 p-1.5 rounded-lg hover:bg-muted/50 transition-colors" title="Copy link">
            <Copy className="h-4 w-4" />
          </button>
          <button onClick={shareStore} className="text-muted-foreground hover:text-primary shrink-0 p-1.5 rounded-lg hover:bg-muted/50 transition-colors" title="Share store">
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Install app banner */}
      {!isInstalled && (
        <button
          onClick={async () => {
            if (canInstall) {
              await promptInstall();
            } else {
              window.location.href = "/dashboard/settings#install-app";
            }
          }}
          className="flex w-full items-center gap-3 rounded-2xl border-2 border-primary bg-primary/5 backdrop-blur-xl p-4 shadow-sm hover:bg-primary/10 transition-colors text-left animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite] ring-2 ring-primary/30"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Download className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">Install App</p>
            <p className="text-xs text-muted-foreground">
              {canInstall ? "Tap to install now" : "Add to home screen"}
            </p>
          </div>
          <span className="text-xs text-primary font-medium">{canInstall ? "Install" : "How →"}</span>
        </button>
      )}

      {/* Push notifications banner */}
      {pushSupported && !isSubscribed && (
        <button
          onClick={async () => {
            const ok = await subscribePush();
            if (ok) toast.success("Notifications enabled! You'll be notified of new orders.");
            else if (Notification.permission === "denied") toast.error("Notifications blocked. Please enable them in your browser settings.");
          }}
          disabled={pushLoading}
          className="flex w-full items-center gap-3 rounded-2xl border border-border/40 bg-card/40 backdrop-blur-xl p-4 shadow-sm hover:bg-card/60 transition-colors text-left"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
            <Bell className="h-5 w-5 text-amber-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">Enable Notifications</p>
            <p className="text-xs text-muted-foreground">Get alerted when customers place orders</p>
          </div>
          <span className="text-xs text-primary font-medium">{pushLoading ? "…" : "Enable"}</span>
        </button>
      )}

      {/* Onboarding banner */}
      {productCount === 0 && !bannerDismissed && (
        <div className="relative rounded-2xl border border-border/40 bg-card/40 backdrop-blur-xl p-4 shadow-sm border-l-4 border-l-primary">
          <button onClick={dismissBanner} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-start gap-3">
            <span className="text-2xl">🚀</span>
            <div>
              <h3 className="font-semibold text-sm">Ready to sell?</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Add your first {terms.singular.toLowerCase()} & share on WhatsApp status.
              </p>
              <Button asChild className="mt-2.5 rounded-xl gap-2" size="sm">
                <Link to="/dashboard/products?add=true">
                  <Plus className="h-3.5 w-3.5" /> Add {terms.singular}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* AI Captions */}
      <CaptionGenerator
        storeName={storeName}
        storeSlug={storeSlug}
        category={category}
        productCount={productCount}
      />
    </div>
  );
};

export default DashboardOverview;
