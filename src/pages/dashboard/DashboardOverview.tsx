import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Plus, Eye, ShoppingBag, ClipboardList } from "lucide-react";
import AfristallLogo from "@/components/AfristallLogo";

function getGreeting(): { text: string; emoji: string } {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return { text: "Good morning", emoji: "☀️" };
  if (hour >= 12 && hour < 17) return { text: "Good afternoon", emoji: "🌤️" };
  if (hour >= 17 && hour < 21) return { text: "Good evening", emoji: "🌇" };
  return { text: "Hey night owl", emoji: "🌙" };
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

  return (
    <div className="space-y-6">
      {/* Greeting with profile pic */}
      <div className="flex items-center gap-4">
        <div className="relative shrink-0">
          {profilePicUrl ? (
            <div className="rounded-full p-[3px] bg-gradient-to-br from-primary/30 to-primary/10 backdrop-blur-sm">
              <img
                src={profilePicUrl}
                alt="Profile"
                className="h-14 w-14 rounded-full object-cover border-2 border-background"
              />
            </div>
          ) : (
            <div className="rounded-full p-[3px] bg-gradient-to-br from-primary/30 to-primary/10 backdrop-blur-sm">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-background border-2 border-background">
                <AfristallLogo className="h-7 w-7" />
              </div>
            </div>
          )}
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{greeting.text} {greeting.emoji}</p>
          <h1 className="text-xl font-bold">{firstName || "there"}</h1>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Listings</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{productCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Orders</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{orderCount}</div>
          </CardContent>
        </Card>

        {storeSlug && (
          <Card className="col-span-2 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Your Store</CardTitle>
              <AfristallLogo className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Link
                to={`/${storeSlug}`}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
              >
                <Eye className="h-3.5 w-3.5" />
                afristall.com/{storeSlug}
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="flex gap-3">
        <Button asChild>
          <Link to="/dashboard/products" className="gap-2">
            <Package className="h-4 w-4" /> View Listings
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/dashboard/products?add=true" className="gap-2">
            <Plus className="h-4 w-4" /> Add Listing
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default DashboardOverview;
