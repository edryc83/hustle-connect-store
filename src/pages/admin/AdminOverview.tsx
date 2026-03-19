import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, ShoppingBag, Package, Eye, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function AdminOverview() {
  const [stats, setStats] = useState({ sellers: 0, products: 0, orders: 0, totalViews: 0 });
  const [recentSellers, setRecentSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [profilesRes, productsRes, ordersRes, recentRes] = await Promise.all([
        supabase.from("profiles").select("id, view_count", { count: "exact" }),
        supabase.from("products").select("id", { count: "exact" }),
        supabase.from("orders").select("id", { count: "exact" }),
        supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(5),
      ]);

      const totalViews = (profilesRes.data || []).reduce((s, p) => s + (p.view_count || 0), 0);

      setStats({
        sellers: profilesRes.count || 0,
        products: productsRes.count || 0,
        orders: ordersRes.count || 0,
        totalViews,
      });
      setRecentSellers(recentRes.data || []);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div className="animate-pulse text-muted-foreground p-8">Loading…</div>;

  const cards = [
    { label: "Total Sellers", value: stats.sellers, icon: Users, color: "text-blue-500" },
    { label: "Total Products", value: stats.products, icon: Package, color: "text-green-500" },
    { label: "Total Orders", value: stats.orders, icon: ShoppingBag, color: "text-orange-500" },
    { label: "Total Store Views", value: stats.totalViews.toLocaleString(), icon: Eye, color: "text-purple-500" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Platform Overview</h1>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={async () => {
            const { error } = await supabase
              .from("app_config")
              .update({ value: new Date().toISOString() })
              .eq("key", "force_update_at");
            if (error) {
              toast.error("Failed to push update");
            } else {
              toast.success("Update pushed — all users will refresh within 30s");
            }
          }}
        >
          <RefreshCw className="h-4 w-4" />
          Push Update
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{c.label}</p>
                  <p className="text-2xl font-bold mt-1">{c.value}</p>
                </div>
                <c.icon className={`h-8 w-8 ${c.color} opacity-70`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Sellers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentSellers.map((s) => (
              <div key={s.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                <div>
                  <p className="text-sm font-medium">{s.store_name || s.first_name || "Unnamed"}</p>
                  <p className="text-xs text-muted-foreground">{s.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{s.store_slug ? `/${s.store_slug}` : "No store"}</p>
                  <p className="text-xs text-muted-foreground">{new Date(s.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
