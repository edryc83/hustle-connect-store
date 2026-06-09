import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, MessageCircle, Wallet, MapPin } from "lucide-react";

export default function ImportProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<any>(null);
  const [supplier, setSupplier] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/login", { replace: true }); return; }
    (async () => {
      const { data: p } = await supabase.from("supplier_products" as any).select("*").eq("id", id).maybeSingle() as any;
      if (!p) { setLoading(false); return; }
      setData(p);
      const { data: s } = await supabase.from("suppliers_public" as any).select("*").eq("id", p.supplier_id).maybeSingle() as any;
      setSupplier(s);
      setLoading(false);
    })();
  }, [id, user, authLoading]);

  if (loading) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!data || !supplier) return <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">Product not found.</div>;

  const wa = supplier.whatsapp ? `https://wa.me/${supplier.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi, interested in ${data.name} from Afristall Import.`)}` : null;

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-40 border-b border-border/40 bg-card/80 backdrop-blur-lg">
        <div className="mx-auto flex h-14 max-w-2xl items-center gap-3 px-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" /></Button>
          <p className="text-sm font-bold truncate">{data.name}</p>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-4 py-4 space-y-4">
        {data.images?.[0] && <img src={data.images[0]} className="w-full aspect-square object-cover rounded-xl" />}
        <div>
          <div className="flex items-start justify-between">
            <h1 className="text-xl font-bold">{data.name}</h1>
            <Badge variant="outline" className="gap-0.5"><MapPin className="h-3 w-3" />{supplier.country}</Badge>
          </div>
          <p className="text-2xl font-extrabold text-primary mt-2">{data.currency} {Number(data.unit_price).toLocaleString()}<span className="text-sm font-normal text-muted-foreground"> / unit</span></p>
          <p className="text-xs text-muted-foreground mt-1">Minimum order: <span className="font-semibold text-foreground">{data.moq} units</span> • Lead time: {data.lead_time_days || supplier.lead_time_days || "—"} days</p>
        </div>
        {data.description && <p className="text-sm text-muted-foreground whitespace-pre-line">{data.description}</p>}

        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Supplier</p>
            <p className="text-sm font-semibold">{supplier.business_name}</p>
            <p className="text-xs font-mono text-muted-foreground">{supplier.supplier_code}</p>
            {supplier.bio && <p className="text-xs mt-2">{supplier.bio}</p>}
          </CardContent>
        </Card>

        <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-background/95 backdrop-blur-lg p-3">
          <div className="mx-auto max-w-2xl flex gap-2">
            {wa && <a href={wa} target="_blank" rel="noreferrer" className="flex-1"><Button variant="outline" className="w-full gap-1.5"><MessageCircle className="h-4 w-4 text-green-500" />Chat</Button></a>}
            <Link to={`/import/pay?supplier=${supplier.id}&product=${data.id}`} className="flex-1">
              <Button className="w-full gap-1.5"><Wallet className="h-4 w-4" />Pay Supplier</Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}