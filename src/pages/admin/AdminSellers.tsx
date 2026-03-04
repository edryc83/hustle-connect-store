import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, ExternalLink, MapPin } from "lucide-react";
import AfristallLogo from "@/components/AfristallLogo";

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
  district: string | null;
  business_type: string | null;
  view_count: number;
  created_at: string;
  category: string | null;
  profile_picture_url: string | null;
  cover_photo_url: string | null;
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
    return !q ||
      (s.store_name || "").toLowerCase().includes(q) ||
      (s.email || "").toLowerCase().includes(q) ||
      (s.first_name || "").toLowerCase().includes(q) ||
      (s.store_slug || "").toLowerCase().includes(q);
  });

  const isActive = (s: SellerProfile) => {
    const daysSince = (Date.now() - new Date(s.created_at).getTime()) / (1000 * 60 * 60 * 24);
    return daysSince < 30;
  };

  const getLocation = (s: SellerProfile) =>
    [s.city, s.district, s.country].filter(Boolean).join(", ");

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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((s) => {
            const location = getLocation(s);
            return (
              <div key={s.id} className="group rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl overflow-hidden transition-all hover:shadow-lg hover:border-primary/20">
                {/* Cover Photo */}
                <div className="h-20 bg-gradient-to-br from-primary/10 to-primary/5 overflow-hidden relative">
                  {s.cover_photo_url ? (
                    <img src={s.cover_photo_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/15 via-primary/5 to-accent/10" />
                  )}
                  <div className="absolute top-1.5 right-1.5">
                    {isActive(s) ? (
                      <Badge variant="default" className="text-[9px] px-1.5 py-0">Active</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[9px] px-1.5 py-0">Inactive</Badge>
                    )}
                  </div>
                </div>

                {/* Profile pic overlapping cover */}
                <div className="flex flex-col items-center -mt-7 px-3 pb-3">
                  {s.profile_picture_url ? (
                    <img src={s.profile_picture_url} alt={s.store_name ?? "Seller"} className="h-12 w-12 rounded-full object-cover border-2 border-background shadow-md" loading="lazy" />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-card border-2 border-background shadow-md">
                      <AfristallLogo className="h-5 w-5" />
                    </div>
                  )}

                  <p className="font-semibold text-sm mt-1.5 truncate max-w-full">{s.store_name || s.first_name || "Unnamed"}</p>
                  {s.store_slug && <p className="text-[11px] text-muted-foreground">@{s.store_slug}</p>}
                  <p className="text-[10px] text-muted-foreground truncate max-w-full">{s.email}</p>

                  {location && (
                    <p className="flex items-center gap-1 text-[10px] text-muted-foreground mt-1">
                      <MapPin className="h-2.5 w-2.5 shrink-0" /> {location}
                    </p>
                  )}

                  <div className="flex gap-2 text-[10px] text-muted-foreground mt-1.5">
                    <span>{productCounts[s.id] || 0} products</span>
                    <span>•</span>
                    <span>{s.view_count} views</span>
                  </div>

                  {s.store_slug && (
                    <Button variant="outline" size="sm" className="w-full mt-2 h-7 text-xs" asChild>
                      <a href={`/${s.store_slug}`} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3 mr-1" /> View Store
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground py-8 col-span-full">No sellers found</p>
          )}
        </div>
      )}
    </div>
  );
}