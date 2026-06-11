import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { MessageCircle, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatMoney, waLink } from "@/lib/importUtils";

export default function ImportProductDetail() {
  const { productId } = useParams();
  const [product, setProduct] = useState<any>(null);

  useEffect(() => {
    supabase
      .from("supplier_products" as any)
      .select("*, suppliers:supplier_id!inner(*)")
      .eq("id", productId)
      .eq("active", true)
      .eq("suppliers.status", "approved")
      .single()
      .then(({ data }) => setProduct(data));
  }, [productId]);

  if (!product) return <div className="p-6 text-muted-foreground">Loading product...</div>;
  const url = `${window.location.origin}/import/products/${product.id}`;
  const supplier = product.suppliers;
  if (!supplier || supplier.status !== "approved") {
    return <div className="p-6 text-muted-foreground">This product is not available.</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-5xl items-center px-4"><Link to="/import" className="font-semibold">Global Sourcing</Link></div>
      </header>
      <main className="mx-auto grid max-w-5xl gap-6 px-4 py-5 md:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <img src={product.images?.[0] || "/placeholder.svg"} alt="" className="aspect-square w-full rounded-xl object-cover md:aspect-[4/3]" />
          {product.images?.length > 1 && <div className="grid grid-cols-5 gap-2">{product.images.slice(1).map((img: string) => <img key={img} src={img} alt="" className="aspect-square rounded-lg object-cover" />)}</div>}
        </div>
        <aside className="space-y-4">
          <div>
            <Badge variant="outline">{supplier.country}</Badge>
            <h1 className="mt-2 text-2xl font-bold">{product.name}</h1>
            <p className="mt-1 text-xl font-extrabold">{formatMoney(Number(product.unit_price), product.currency)}</p>
            <p className="text-sm text-muted-foreground">{product.moq ? `MOQ ${product.moq} units` : "MOQ negotiated directly"}{product.lead_time_days ? ` - ${product.lead_time_days} days lead time` : ""}</p>
          </div>
          {product.description && <p className="text-sm leading-6 text-muted-foreground">{product.description}</p>}
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /><p className="font-semibold">{supplier.business_name}</p></div>
            <p className="mt-1 text-xs text-muted-foreground">{supplier.supplier_code} - {supplier.bio || "Vetted Afristall import supplier"}</p>
          </div>
          <div className="grid gap-2">
            <Button asChild variant="outline" className="gap-2"><a href={waLink(supplier.whatsapp, `Hi ${supplier.business_name}, I saw ${product.name} on Afristall Global Sourcing: ${url}`)} target="_blank" rel="noreferrer"><MessageCircle className="h-4 w-4" /> Chat on WhatsApp</a></Button>
            <Button asChild><Link to={`/import/pay?supplier=${supplier.supplier_code}&currency=${product.currency}&product=${product.id}`}>Pay Supplier</Link></Button>
          </div>
        </aside>
      </main>
    </div>
  );
}
