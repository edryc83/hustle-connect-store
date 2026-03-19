import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Order = {
  id: string;
  product_name: string;
  customer_name: string;
  customer_phone: string;
  quantity: number;
  total: number;
  status: string;
  variant: string | null;
  notes: string | null;
  created_at: string;
  seller_id: string;
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [sellerMap, setSellerMap] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: ordersData } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      setOrders((ordersData || []) as Order[]);

      // Map seller IDs to names
      const sellerIds = [...new Set((ordersData || []).map((o: any) => o.seller_id))];
      if (sellerIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, store_name, first_name")
          .in("id", sellerIds);

        const map: Record<string, string> = {};
        (profiles || []).forEach((p: any) => {
          map[p.id] = p.store_name || p.first_name || "Unknown";
        });
        setSellerMap(map);
      }

      setLoading(false);
    };
    load();
  }, []);

  const filtered = orders.filter((o) => {
    const matchSearch = !search || 
      o.product_name.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statusColor = (s: string) => {
    if (s === "delivered") return "default";
    if (s === "cancelled") return "destructive";
    return "secondary";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">All Orders</h1>
        <Badge variant="outline">{orders.length} total</Badge>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by product or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="animate-pulse text-muted-foreground">Loading orders…</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((o) => (
            <Card key={o.id}>
              <CardContent className="py-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{o.product_name}</p>
                      <Badge variant={statusColor(o.status)} className="text-[10px] px-1.5 py-0">{o.status}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Customer: {o.customer_name} • Qty: {o.quantity} • Total: {o.total.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Seller: {sellerMap[o.seller_id] || "Unknown"} • {new Date(o.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No orders found</p>
          )}
        </div>
      )}
    </div>
  );
}
