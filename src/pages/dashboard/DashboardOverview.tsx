import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Package, Eye, MessageCircle, ClipboardList, CalendarDays,
  Copy, Share2, X, Plus, Smartphone,
} from "lucide-react";
import AfristallLogo from "@/components/AfristallLogo";
import { toast } from "sonner";


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
  const [orderCount, setOrderCount] = useState(0);
  const [viewCount, setViewCount] = useState(0);
  const [whatsappTaps, setWhatsappTaps] = useState(0);
  const [firstName, setFirstName] = useState("");
  const [storeSlug, setStoreSlug] = useState("");
  const [storeName, setStoreName] = useState("");
  const [profilePicUrl, setProfilePicUrl] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [category, setCategory] = useState("");
  const [products, setProducts] = useState<{ id: string; name: string; image_url: string | null }[]>([]);
  const [bannerDismissed, setBannerDismissed] = useState(
    () => localStorage.getItem("afristall_banner_dismissed") === "true"
  );
  const [copied, setCopied] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const [{ count }, { count: orders }, { data: profile }, { data: productsData }] = await Promise.all([
        supabase.from("products").select("*", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("orders").select("*", { count: "exact", head: true }).eq("seller_id", user.id),
        supabase.from("profiles").select("store_name, store_slug, first_name, profile_picture_url, view_count, whatsapp_number, category").eq("id", user.id).single(),
        supabase.from("products").select("id, name, image_url, whatsapp_taps").eq("user_id", user.id),
      ]);
      setProductCount(count ?? 0);
      setOrderCount(orders ?? 0);
      const p = profile as any;
      const name = p?.first_name || p?.store_name || user.email?.split("@")[0]?.split(/[._]/)[0] || "";
      setFirstName(name.charAt(0).toUpperCase() + name.slice(1));
      setStoreSlug(p?.store_slug ?? "");
      setStoreName(p?.store_name ?? "");
      setProfilePicUrl(p?.profile_picture_url ?? "");
      setViewCount(p?.view_count ?? 0);
      setWhatsappNumber(p?.whatsapp_number ?? "");
      setCategory(p?.category ?? "");
      setProducts((productsData ?? []).map((pr: any) => ({ id: pr.id, name: pr.name, image_url: pr.image_url })));
      const totalTaps = (productsData ?? []).reduce((sum: number, pr: any) => sum + (pr.whatsapp_taps ?? 0), 0);
      setWhatsappTaps(totalTaps);
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

  const completeness =
    (profilePicUrl ? 20 : 0) +
    (storeName ? 20 : 0) +
    (whatsappNumber ? 20 : 0) +
    (productCount >= 1 ? 20 : 0) +
    (productCount >= 3 ? 20 : 0);

  const completenessMessage =
    completeness <= 40
      ? "Your store isn't ready yet — buyers need products to order"
      : completeness < 100
        ? "Almost there! Add more products to boost your store"
        : "🎉 Your store is ready to share!";

  const stats = [
    { label: "Listings", value: productCount, icon: Package },
    { label: "Store Views", value: viewCount, icon: Eye },
    { label: "WhatsApp Taps", value: whatsappTaps, icon: MessageCircle },
    { label: "Orders", value: orderCount, icon: ClipboardList },
  ];

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
            {greeting.text} {greeting.emoji}
            <br />
            <span className="text-foreground">{firstName || "there"}!</span>
          </h1>
        </div>
      </div>

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

      {/* 2x2 stat cards */}
      <div className="grid gap-4 grid-cols-2">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-muted-foreground">{s.label}</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
                <s.icon className="h-4 w-4 text-primary" />
              </div>
            </div>
            <div className="text-3xl font-bold">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Share section */}
      {storeSlug && (
        <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl p-5 shadow-sm space-y-4">
          <span className="text-sm font-medium text-muted-foreground">Share Your Store</span>

          <div className="flex items-center gap-2 rounded-full bg-muted/50 border border-border/50 px-4 py-2">
            <span className="text-sm font-medium truncate flex-1">afristall.com/{storeSlug}</span>
            <button onClick={copyLink} className="text-muted-foreground hover:text-foreground shrink-0">
              <Copy className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button onClick={copyLink} variant="outline" className="rounded-xl border-primary/30 hover:bg-primary/10 gap-2">
              <Copy className="h-4 w-4" />
              {copied ? "Copied!" : "Copy Link"}
            </Button>
            <Button onClick={shareStore} className="rounded-xl gap-2">
              <Share2 className="h-4 w-4" />
              Share Store
            </Button>
          </div>

          <Button
            variant="outline"
            className="w-full rounded-xl border-primary/30 hover:bg-primary/10 gap-2"
            onClick={() => setShareModalOpen(true)}
          >
            <Smartphone className="h-4 w-4" />
            Share to WhatsApp Status
          </Button>
        </div>
      )}

      {/* Store completeness */}
      <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">Store Completeness</span>
          <span className="text-sm font-bold text-primary">{completeness}%</span>
        </div>
        <Progress value={completeness} className="h-2.5 bg-muted" />
        <p className="text-xs text-muted-foreground">{completenessMessage}</p>
      </div>

      {/* Quick actions */}
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
