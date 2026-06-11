import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CreditCard, Filter, Search, ShieldCheck, Ship } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatMoney } from "@/lib/importUtils";

export default function ImportHub() {
  const [products, setProducts] = useState<any[]>([]);
  const [country, setCountry] = useState("all");
  const [category, setCategory] = useState("");
  const [maxMoq, setMaxMoq] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("supplier_products" as any)
        .select("*, suppliers:supplier_id!inner(id, supplier_code, business_name, country, logo_url, whatsapp, status)")
        .eq("active", true)
        .eq("suppliers.status", "approved")
        .order("created_at", { ascending: false });
      setProducts((data as any[]) || []);
    })();
  }, []);

  const categories = useMemo(() => Array.from(new Set(products.map((p) => p.category).filter(Boolean))), [products]);
  const filtered = products.filter((p) => {
    if (country !== "all" && p.suppliers?.country !== country) return false;
    if (category && !String(p.category || "").toLowerCase().includes(category.toLowerCase())) return false;
    if (maxMoq && Number(p.moq || 0) > Number(maxMoq)) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link to="/dashboard" className="font-extrabold">Global Sourcing</Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild><Link to="/import/pay" className="gap-2"><CreditCard className="h-4 w-4" /> Pay</Link></Button>
            <Button variant="outline" size="sm" asChild><Link to="/import/shipping" className="gap-2"><Ship className="h-4 w-4" /> Shipping</Link></Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl space-y-5 px-4 py-5">
        <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
          <div className="p-5 sm:p-6">
            <div className="max-w-3xl space-y-5">
              <div className="flex flex-wrap gap-2 text-xs font-semibold">
                <span className="inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1 text-muted-foreground"><ShieldCheck className="h-3.5 w-3.5 text-primary" /> Verified Suppliers</span>
                <span className="inline-flex items-center rounded-full border bg-background px-3 py-1 text-muted-foreground">USD</span>
                <span className="inline-flex items-center rounded-full border bg-background px-3 py-1 text-muted-foreground">GBP</span>
                <span className="inline-flex items-center rounded-full border bg-background px-3 py-1 text-muted-foreground">EUR</span>
                <span className="inline-flex items-center rounded-full border bg-background px-3 py-1 text-muted-foreground">AED</span>
              </div>
              <div className="max-w-2xl space-y-2">
                <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Import Stock and Pay in Local Currency</h1>
                <p className="text-sm leading-6 text-muted-foreground sm:text-base">
                  Browse available products, engage supplier on WhatsApp, pay using Mobile Money, then arrange shipping to Uganda
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button asChild className="gap-2"><Link to="/import/pay">Pay a supplier <ArrowRight className="h-4 w-4" /></Link></Button>
                <Button variant="outline" asChild className="gap-2"><Link to="/import/shipping"><Ship className="h-4 w-4" /> Find shipping</Link></Button>
              </div>
            </div>
          </div>
        </section>
        <div className="grid gap-3 rounded-xl border bg-card p-3 md:grid-cols-[160px_1fr_160px]">
          <Select value={country} onValueChange={setCountry}>
            <SelectTrigger><SelectValue placeholder="Country" /></SelectTrigger>
            <SelectContent><SelectItem value="all">All countries</SelectItem><SelectItem value="UK">UK</SelectItem><SelectItem value="UAE">UAE</SelectItem></SelectContent>
          </Select>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" list="import-categories" placeholder="Search category" value={category} onChange={(e) => setCategory(e.target.value)} />
          </div>
          <datalist id="import-categories">{categories.map((c) => <option key={c} value={c} />)}</datalist>
          <Input placeholder="Max MOQ" inputMode="numeric" value={maxMoq} onChange={(e) => setMaxMoq(e.target.value.replace(/\D/g, ""))} />
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground"><Filter className="h-4 w-4" /> {filtered.length} products from vetted suppliers</div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((product) => (
            <Link key={product.id} to={`/import/products/${product.id}`}>
              <Card className="h-full overflow-hidden transition-colors hover:border-primary/40">
                <img src={product.images?.[0] || "/placeholder.svg"} alt="" className="aspect-square w-full object-cover" />
                <CardContent className="space-y-2 p-3">
                  <p className="line-clamp-1 font-semibold">{product.name}</p>
                  <p className="text-sm font-medium">{formatMoney(Number(product.unit_price), product.currency)}</p>
                  <p className="text-xs text-muted-foreground">{product.suppliers?.business_name} - {product.suppliers?.country}{product.moq ? ` - MOQ ${product.moq}` : ""}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
