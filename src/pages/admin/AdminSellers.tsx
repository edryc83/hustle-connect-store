import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, ExternalLink, MapPin, Trash2 } from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/sonner";
import { useAdmin } from "@/hooks/useAdmin";
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
  const [deleteTarget, setDeleteTarget] = useState<SellerProfile | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { user } = useAdmin();

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
        <div className="rounded-xl border border-border/50 bg-card/60 backdrop-blur-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Seller</TableHead>
                <TableHead className="hidden sm:table-cell">Email</TableHead>
                <TableHead className="hidden md:table-cell">Location</TableHead>
                <TableHead className="text-center">Products</TableHead>
                <TableHead className="text-center">Views</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Store</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => {
                const location = getLocation(s);
                return (
                  <TableRow key={s.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {s.profile_picture_url ? (
                          <img src={s.profile_picture_url} alt={s.store_name ?? ""} className="h-9 w-9 rounded-full object-cover border border-border" loading="lazy" />
                        ) : (
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted border border-border">
                            <AfristallLogo className="h-4 w-4" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{s.store_name || s.first_name || "Unnamed"}</p>
                          {s.store_slug && <p className="text-xs text-muted-foreground">@{s.store_slug}</p>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-xs text-muted-foreground truncate max-w-[180px]">{s.email}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {location ? (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3 shrink-0" /> {location}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center text-sm">{productCounts[s.id] || 0}</TableCell>
                    <TableCell className="text-center text-sm">{s.view_count}</TableCell>
                    <TableCell className="text-center">
                      {isActive(s) ? (
                        <Badge variant="default" className="text-[10px]">Active</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px]">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {s.store_slug ? (
                        <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
                          <a href={`/${s.store_slug}`} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3 w-3 mr-1" /> View
                          </a>
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">No sellers found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}