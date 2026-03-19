import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

export default function AdminAnalytics() {
  const [loading, setLoading] = useState(true);
  const [signupsByDay, setSignupsByDay] = useState<{ date: string; count: number }[]>([]);
  const [ordersByDay, setOrdersByDay] = useState<{ date: string; count: number }[]>([]);
  const [topSellers, setTopSellers] = useState<{ name: string; views: number }[]>([]);
  const [businessTypes, setBusinessTypes] = useState<{ name: string; value: number }[]>([]);

  useEffect(() => {
    const load = async () => {
      const [profilesRes, ordersRes] = await Promise.all([
        supabase.from("profiles").select("created_at, store_name, view_count, business_type"),
        supabase.from("orders").select("created_at"),
      ]);

      const profiles = profilesRes.data || [];
      const orders = ordersRes.data || [];

      // Signups by day (last 14 days)
      const now = new Date();
      const days14 = Array.from({ length: 14 }, (_, i) => {
        const d = new Date(now);
        d.setDate(d.getDate() - (13 - i));
        return d.toISOString().slice(0, 10);
      });

      const signupMap: Record<string, number> = {};
      const orderMap: Record<string, number> = {};
      days14.forEach((d) => { signupMap[d] = 0; orderMap[d] = 0; });

      profiles.forEach((p) => {
        const d = p.created_at.slice(0, 10);
        if (signupMap[d] !== undefined) signupMap[d]++;
      });
      orders.forEach((o) => {
        const d = (o as any).created_at.slice(0, 10);
        if (orderMap[d] !== undefined) orderMap[d]++;
      });

      setSignupsByDay(days14.map((d) => ({ date: d.slice(5), count: signupMap[d] })));
      setOrdersByDay(days14.map((d) => ({ date: d.slice(5), count: orderMap[d] })));

      // Top sellers by views
      const sorted = [...profiles].sort((a, b) => (b.view_count || 0) - (a.view_count || 0)).slice(0, 5);
      setTopSellers(sorted.map((s) => ({ name: s.store_name || "Unnamed", views: s.view_count || 0 })));

      // Business types breakdown
      const typeCount: Record<string, number> = {};
      profiles.forEach((p) => {
        const t = p.business_type || "unknown";
        typeCount[t] = (typeCount[t] || 0) + 1;
      });
      setBusinessTypes(Object.entries(typeCount).map(([name, value]) => ({ name, value })));

      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div className="animate-pulse text-muted-foreground p-8">Loading analytics…</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Platform Analytics</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">New Signups (14 days)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={signupsByDay}>
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Orders (14 days)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={ordersByDay}>
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Top Sellers by Views</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topSellers} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={100} />
                <Tooltip />
                <Bar dataKey="views" fill="hsl(var(--chart-3))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Business Types</CardTitle></CardHeader>
          <CardContent className="flex justify-center">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={businessTypes} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {businessTypes.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
