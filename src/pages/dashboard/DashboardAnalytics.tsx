import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { TrendingUp, ShoppingBag, Eye, MessageCircle } from "lucide-react";

const DashboardAnalytics = () => {
  const { user } = useAuth();
  const [weeklyOrders, setWeeklyOrders] = useState<{ day: string; orders: number }[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [viewCount, setViewCount] = useState(0);
  const [whatsappTaps, setWhatsappTaps] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);

  useEffect(() => {
    if (!user) return;

    const fetchAnalytics = async () => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
      sevenDaysAgo.setHours(0, 0, 0, 0);

      const [{ data: recentOrders }, { data: profile }, { data: productsData }, { count: orderCount }] = await Promise.all([
        supabase.from("orders").select("created_at, total").eq("seller_id", user.id).eq("status", "confirmed").gte("created_at", sevenDaysAgo.toISOString()),
        supabase.from("profiles").select("view_count").eq("id", user.id).single(),
        supabase.from("products").select("whatsapp_taps").eq("user_id", user.id),
        supabase.from("orders").select("*", { count: "exact", head: true }).eq("seller_id", user.id),
      ]);

      setViewCount((profile as any)?.view_count ?? 0);
      setTotalOrders(orderCount ?? 0);
      setWhatsappTaps((productsData ?? []).reduce((sum: number, p: any) => sum + (p.whatsapp_taps ?? 0), 0));

      // Build weekly chart
      const dayCounts: Record<string, number> = {};
      let rev = 0;
      for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        dayCounts[d.toLocaleDateString("en-US", { weekday: "short" })] = 0;
      }
      (recentOrders ?? []).forEach((o: any) => {
        const key = new Date(o.created_at).toLocaleDateString("en-US", { weekday: "short" });
        if (key in dayCounts) dayCounts[key]++;
        rev += Number(o.total ?? 0);
      });
      setWeeklyOrders(Object.entries(dayCounts).map(([day, orders]) => ({ day, orders })));
      setTotalRevenue(rev);
    };

    fetchAnalytics();
  }, [user]);

  const miniStats = [
    { label: "Total Orders", value: totalOrders, icon: ShoppingBag },
    { label: "Store Views", value: viewCount, icon: Eye },
    { label: "WhatsApp Taps", value: whatsappTaps, icon: MessageCircle },
    { label: "7-Day Revenue", value: `${totalRevenue.toLocaleString()}`, icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Analytics</h1>

      <div className="grid gap-4 grid-cols-2">
        {miniStats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">{s.label}</span>
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-primary/10">
                <s.icon className="h-3.5 w-3.5 text-primary" />
              </div>
            </div>
            <div className="text-2xl font-bold">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl p-5 shadow-sm space-y-3">
        <span className="text-sm font-medium text-muted-foreground">Orders — Last 7 Days</span>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyOrders} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} className="text-muted-foreground" tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} className="text-muted-foreground" tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", fontSize: 13 }}
                cursor={{ fill: "hsl(var(--primary) / 0.08)" }}
              />
              <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardAnalytics;
