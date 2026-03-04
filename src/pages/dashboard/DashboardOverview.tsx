import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

import {
  Package, CalendarDays, Copy, Share2, X, Plus,
} from "lucide-react";
import AfristallLogo from "@/components/AfristallLogo";
import { toast } from "sonner";
import DailySellingTip from "@/components/dashboard/DailySellingTip";
import CaptionGenerator from "@/components/dashboard/CaptionGenerator";

function getGreeting(): { text: string; emoji: string } {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return { text: "Good morning,", emoji: "☀️" };
  if (hour >= 12 && hour < 17) return { text: "Good afternoon,", emoji: "🌤️" };
  if (hour >= 17 && hour < 21) return { text: "Good evening,", emoji: "🌇" };
  return { text: "Hey night owl,", emoji: "🌙" };
}

function getFormattedDate() {
  const now = new Date();
  const day = now.toLocaleDateString("en-US", { weekday: "long" });
  const date = now.getDate();
  const month = now.toLocaleDateString("en-US", { month: "long" });
  return { day, date, month };
}

const DashboardOverview = () => {
  const { user } = useAuth();
  const [productCount, setProductCount] = useState(0);
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
      const [{ count }, { data: profile }] = await Promise.all([
        supabase.from("products").select("*", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("profiles").select("store_name, store_slug, first_name, profile_picture_url, category").eq("id", user.id).single(),
      ]);
      setProductCount(count ?? 0);
      const p = profile as any;
      const name = p?.first_name || p?.store_name || user.email?.split("@")[0]?.split(/[._]/)[0] || "";
      setFirstName(name.charAt(0).toUpperCase() + name.slice(1));
      setStoreSlug(p?.store_slug ?? "");
      setStoreName(p?.store_name ?? "");
      setProfilePicUrl(p?.profile_picture_url ?? "");
      setCategory(p?.category ?? "");
    };

    fetchData();
  }, [user]);

  const greeting = getGreeting();
  const { day, date, month } = getFormattedDate();

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
        await navigator.share({ title: storeName, text: "Check out my store on Afristall!", url: storeUrl });
      } catch { /* user cancelled */ }
    } else {
      copyLink();
    }
  };


  return (
    <div className="space-y-6">
      {/* Date header */}
      <div className="flex items-center gap-2 text-muted-foreground">
        <CalendarDays className="h-4 w-4" />
        <span className="text-sm font-medium">
          {day} {date} <span className="text-primary">•</span> {month}
        </span>
      </div>

      {/* Greeting with profile pic */}
      <div className="flex items-center gap-4">
        <div className="relative shrink-0">
          <div className="rounded-2xl p-[3px] bg-gradient-to-br from-primary/40 to-primary/10 backdrop-blur-xl shadow-lg shadow-primary/10">
            {profilePicUrl ? (
              <img src={profilePicUrl} alt="Profile" className="h-16 w-16 rounded-2xl object-cover border-2 border-background/50" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-card/80 backdrop-blur-sm border-2 border-background/50">
                <AfristallLogo className="h-8 w-8" />
              </div>
            )}
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-bold leading-tight">
            {greeting.text} {firstName || "there"}! {greeting.emoji}
          </h1>
        </div>
      </div>

      {/* Daily selling tip */}
      <DailySellingTip />

      {/* Onboarding banner */}
      {productCount === 0 && !bannerDismissed && (
        <div className="relative rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl p-5 shadow-sm border-l-4 border-l-primary">
          <button onClick={dismissBanner} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-start gap-3">
            <span className="text-2xl">🚀</span>
            <div>
              <h3 className="font-semibold">You're almost ready to sell</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Add your first product then share your store link on WhatsApp status — that's all it takes to get your first order.
              </p>
              <Button asChild className="mt-3 rounded-xl gap-2" size="sm">
                <Link to="/dashboard/products?add=true">
                  <Plus className="h-4 w-4" /> Add Your First Product
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Share section — compact link with copy + share icons */}
      {storeSlug && (
        <div className="flex items-center gap-2 rounded-full bg-muted/50 border border-border/50 px-4 py-2.5">
          <span className="text-sm font-medium truncate flex-1">afristall.com/{storeSlug}</span>
          <button onClick={copyLink} className="text-muted-foreground hover:text-foreground shrink-0 p-1" title="Copy link">
            <Copy className="h-4 w-4" />
          </button>
          <button onClick={shareStore} className="text-muted-foreground hover:text-primary shrink-0 p-1" title="Share store">
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* AI Captions */}
      <CaptionGenerator
        storeName={storeName}
        storeSlug={storeSlug}
        category={category}
        productCount={productCount}
      />


      <div className="flex gap-3">
        <Button asChild className="rounded-xl">
          <Link to="/dashboard/products" className="gap-2">
            <Package className="h-4 w-4" /> View Listings
          </Link>
        </Button>
        <Button asChild variant="outline" className="rounded-xl border-border/50 bg-card/60 backdrop-blur-sm">
          <Link to="/dashboard/products?add=true" className="gap-2">
            <Plus className="h-4 w-4" /> Add Listing
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default DashboardOverview;
