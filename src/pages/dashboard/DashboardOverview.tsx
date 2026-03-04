import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Package, Plus, Eye, ClipboardList, CalendarDays } from "lucide-react";
import AfristallLogo from "@/components/AfristallLogo";

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
  const [firstName, setFirstName] = useState("");
  const [storeSlug, setStoreSlug] = useState("");
  const [profilePicUrl, setProfilePicUrl] = useState("");

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const [{ count }, { count: orders }, { data: profile }] = await Promise.all([
        supabase.from("products").select("*", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("orders").select("*", { count: "exact", head: true }).eq("seller_id", user.id),
        supabase.from("profiles").select("store_name, store_slug, first_name, profile_picture_url").eq("id", user.id).single(),
      ]);
      setProductCount(count ?? 0);
      setOrderCount(orders ?? 0);
      const name = (profile as any)?.first_name || profile?.store_name || user.email?.split("@")[0]?.split(/[._]/)[0] || "";
      setFirstName(name.charAt(0).toUpperCase() + name.slice(1));
      setStoreSlug(profile?.store_slug ?? "");
      setProfilePicUrl(profile?.profile_picture_url ?? "");
    };

    fetchData();
  }, [user]);

  const greeting = getGreeting();
  const { day, date, month } = getFormattedDate();

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
          {profilePicUrl ? (
            <div className="rounded-2xl p-[3px] bg-gradient-to-br from-primary/40 to-primary/10 backdrop-blur-xl shadow-lg shadow-primary/10">
              <img
                src={profilePicUrl}
                alt="Profile"
                className="h-16 w-16 rounded-2xl object-cover border-2 border-background/50"
              />
            </div>
          ) : (
            <div className="rounded-2xl p-[3px] bg-gradient-to-br from-primary/40 to-primary/10 backdrop-blur-xl shadow-lg shadow-primary/10">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-card/80 backdrop-blur-sm border-2 border-background/50">
                <AfristallLogo className="h-8 w-8" />
              </div>
            </div>
          )}
        </div>
        <div>
          <h1 className="text-2xl font-bold leading-tight">
            {greeting.text} {greeting.emoji}
            <br />
            <span className="text-foreground">{firstName || "there"}!</span>
          </h1>
        </div>
      </div>

      {/* Glass stat cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">Listings</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
              <Package className="h-4 w-4 text-primary" />
            </div>
          </div>
          <div className="text-3xl font-bold">{productCount}</div>
        </div>

        <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">Orders</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
              <ClipboardList className="h-4 w-4 text-primary" />
            </div>
          </div>
          <div className="text-3xl font-bold">{orderCount}</div>
        </div>

        {storeSlug && (
          <div className="col-span-2 lg:col-span-1 rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-muted-foreground">Your Store</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
                <AfristallLogo className="h-4 w-4" />
              </div>
            </div>
            <Link
              to={`/${storeSlug}`}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              <Eye className="h-3.5 w-3.5" />
              afristall.com/{storeSlug}
            </Link>
          </div>
        )}
      </div>

      {/* Quick actions — glass style */}
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
