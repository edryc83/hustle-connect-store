import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import AfristallLogo from "@/components/AfristallLogo";
import { Globe, Loader2, ArrowLeft, Truck, MapPin, Search } from "lucide-react";

type Row = {
  id: string; name: string; description: string | null; images: string[];
  category: string | null; moq: number; unit_price: number; currency: string;
  lead_time_days: number | null; supplier_id: string;
  supplier: { id: string; business_name: string; country: string; supplier_code: string };
};

export default function Import() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [country, setCountry] = useState<"all" | "UK" | "UAE">("all");
  const [q, setQ] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/login", { replace: true }); return; }
    (async () => {
      const { data: prods } = await (supabase
        .from("supplier_products" as any)
        .select("id, name, description, images, category, moq, unit_price, currency, lead_time_days, supplier_id")
        .eq("active", true)
        .order("created_at", { ascending: false }) as any);
      const supIds = Array.from(new Set((prods || []).map((p: any) => p.supplier_id)));
      const { data: sups } = supIds.length
        ? await (supabase.from("suppliers_public" as any).select("id, business_name, country, supplier_code").in("id", supIds) as any)
        : { data: [] };
      const supMap: Record<string, any> = {};
      for (const s of sups || []) supMap[s.id] = s;
      const merged: Row[] = (prods || [])
        .filter((p: any) => supMap[p.supplier_id])
        .map((p: any) => ({ ...p, supplier: supMap[p.supplier_id] }));
      setRows(merged);
      setLoading(false);
    })();
  }, [user, authLoading]);

  const filtered = rows.filter(r =>
    (country === "all" || r.supplier.country === country) &&
    (q.trim() === "" || r.name.toLowerCase().includes(q.toLowerCase()) || (r.category || "").toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/40 bg-card/80 backdrop-blur-lg">
        <div className="mx-auto flex h-14 max-w-3xl items-center gap-3 px-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}><ArrowLeft className="h-4 w-4" /></Button>
          <AfristallLogo className="h-6 w-6" />
          <div className="flex-1">
            <p className="text-sm font-bold flex items-center gap-1.5"><Globe className="h-3.5 w-3.5 text-primary" />Import</p>
            <p className="text-[10px] text-muted-foreground">Vetted suppliers from UK & UAE</p>
          </div>
          <Link to="/import/shipping"><Button variant="outline" size="sm" className="gap-1.5"><Truck className="h-3.5 w-3.5" />Shipping</Button></Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-4 space-y-4">
        <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5 p-4">
          <p className="text-sm font-semibold">Source directly. Pay safely.</p>
          <p className="text-xs text-muted-foreground mt-1">Browse vetted suppliers, chat on WhatsApp, then pay in UGX. Afristall holds your funds until your supplier delivers.</p>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search products or category" value={q} onChange={e => setQ(e.target.value)} />
          </div>
          <div className="flex rounded-md border border-border overflow-hidden text-xs">
            {(["all","UK","UAE"] as const).map(c => (
              <button key={c} onClick={() => setCountry(c)} className={`px-3 py-2 ${country === c ? "bg-primary text-primary-foreground" : "bg-card hover:bg-muted"}`}>{c === "all" ? "All" : c}</button>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <Link to="/import/pay"><Button size="sm" variant="outline">Pay a supplier directly →</Button></Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : filtered.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-sm text-muted-foreground">No products match your filters yet.</CardContent></Card>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filtered.map(r => (
              <Link key={r.id} to={`/import/product/${r.id}`} className="block">
                <Card className="overflow-hidden hover:border-primary/50 transition-colors">
                  <div className="aspect-square bg-muted">
                    {r.images?.[0] ? <img src={r.images[0]} className="h-full w-full object-cover" /> : null}
                  </div>
                  <CardContent className="p-2.5 space-y-1">
                    <p className="text-xs font-semibold truncate">{r.name}</p>
                    <p className="text-xs text-primary font-bold">{r.currency} {Number(r.unit_price).toLocaleString()}<span className="text-[10px] text-muted-foreground font-normal">/unit</span></p>
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                      <span>MOQ {r.moq}</span>
                      <Badge variant="outline" className="text-[9px] gap-0.5 px-1.5"><MapPin className="h-2.5 w-2.5" />{r.supplier.country}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}