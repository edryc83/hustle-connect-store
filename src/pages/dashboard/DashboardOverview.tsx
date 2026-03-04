import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Plus, Store, Eye } from "lucide-react";

const DashboardOverview = () => {
  const { user } = useAuth();
  const [productCount, setProductCount] = useState(0);
  const [storeName, setStoreName] = useState("");
  const [storeSlug, setStoreSlug] = useState("");

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const [{ count }, { data: profile }] = await Promise.all([
        supabase.from("products").select("*", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("profiles").select("store_name, store_slug").eq("id", user.id).single(),
      ]);
      setProductCount(count ?? 0);
      setStoreName(profile?.store_name ?? "");
      setStoreSlug(profile?.store_slug ?? "");
    };

    fetchData();
  }, [user]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          Welcome back{storeName ? `, ${storeName}` : ""} 👋
        </h1>
        <p className="text-muted-foreground text-sm">Here's how your store is doing.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{productCount}</div>
          </CardContent>
        </Card>

        {storeSlug && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Your Store</CardTitle>
              <Store className="h-4 w-4 text-muted-foreground" />
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
            <Package className="h-4 w-4" /> View Products
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/dashboard/products?add=true" className="gap-2">
            <Plus className="h-4 w-4" /> Add Product
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default DashboardOverview;
