import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, ExternalLink, Ban, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type SellerProfile = {
  id: string;
  email: string | null;
  first_name: string | null;
  store_name: string | null;
  store_slug: string | null;
  phone: string | null;
  whatsapp_number: string | null;
  city: string | null;
  country: string | null;
  business_type: string | null;
  view_count: number;
  created_at: string;
  category: string | null;
  is_banned?: boolean;
};

export default function AdminSellers() {
  const [sellers, setSellers] = useState<SellerProfile[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [productCounts, setProductCounts] = useState<Record<string, number>>({});

  const fetchSellers = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    const profiles = (data || []) as SellerProfile[];
    setSellers(profiles);

    // Get product counts per seller
    if (profiles.length > 0) {
      const { data: products } = await supabase
        .from("products")
        .select("user_id");
      
      const counts: Record<string, number> = {};
      (products || []).forEach((p) => {
        counts[p.user_id] = (counts[p.user_id] || 0) + 1;
      });
      setProductCounts(counts);
    }

    setLoading(false);
  };

  useEffect(() => { fetchSellers(); }, []);

  const filtered = sellers.filter((s) => {
    const q = search.toLowerCase();
    return (
      !q ||
      (s.store_name || "").toLowerCase().includes(q) ||
      (s.email || "").toLowerCase().includes(q) ||
      (s.first_name || "").toLowerCase().includes(q) ||
      (s.store_slug || "").toLowerCase().includes(q)
    );
  });

  const isActive = (s: SellerProfile) => {
    const lastActive = new Date(s.created_at);
    const daysSince = (Date.now() - lastActive.getTime()) / (1000 * 60 * 60 * 24);
    return daysSince < 30;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">All Sellers</h1>
        <Badge variant="outline">{sellers.length} total</Badge>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, email, or store..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {loading ? (
        <div className="animate-pulse text-muted-foreground">Loading sellers…</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((s) => (
            <Card key={s.id}>
              <CardContent className="py-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold truncate">{s.store_name || s.first_name || "Unnamed Seller"}</p>
                      {isActive(s) ? (
                        <Badge variant="default" className="text-[10px] px-1.5 py-0">Active</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Inactive</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{s.email}</p>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      {s.store_slug && <span>/{s.store_slug}</span>}
                      {s.city && <span>• {s.city}</span>}
                      {s.country && <span>, {s.country}</span>}
                      <span>• {productCounts[s.id] || 0} products</span>
                      <span>• {s.view_count} views</span>
                      <span>• Joined {new Date(s.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {s.store_slug && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={`/${s.store_slug}`} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3.5 w-3.5 mr-1" /> View Store
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No sellers found</p>
          )}
        </div>
      )}
    </div>
  );
}
