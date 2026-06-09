import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, MessageCircle, Plane, Ship } from "lucide-react";

export default function ImportShipping() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lane, setLane] = useState<"all" | "UK" | "UAE">("all");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("shipping_agents" as any).select("*").eq("active", true).order("rate_amount") as any;
      setRows(data || []); setLoading(false);
    })();
  }, []);

  const filtered = rows.filter(r => lane === "all" || r.lane_from === lane);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/40 bg-card/80 backdrop-blur-lg">
        <div className="mx-auto flex h-14 max-w-2xl items-center gap-3 px-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" /></Button>
          <p className="text-sm font-bold">Shipping Agents</p>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-4 py-4 space-y-3">
        <p className="text-xs text-muted-foreground">Arrange pickup directly with the agent. Payment for shipping is handled between you and them.</p>
        <div className="flex rounded-md border border-border overflow-hidden text-xs w-fit">
          {(["all","UK","UAE"] as const).map(c => (
            <button key={c} onClick={() => setLane(c)} className={`px-3 py-2 ${lane === c ? "bg-primary text-primary-foreground" : "bg-card hover:bg-muted"}`}>{c === "all" ? "All lanes" : `from ${c}`}</button>
          ))}
        </div>
        {loading ? <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div> :
          filtered.length === 0 ? <Card><CardContent className="py-12 text-center text-sm text-muted-foreground">No shipping agents listed yet.</CardContent></Card> :
          filtered.map(a => {
            const wa = `https://wa.me/${a.whatsapp.replace(/\D/g,"")}`;
            return (
              <Card key={a.id}>
                <CardContent className="p-3 flex gap-3 items-center">
                  {a.logo_url ? <img src={a.logo_url} className="h-12 w-12 rounded object-cover" /> : <div className="h-12 w-12 rounded bg-muted flex items-center justify-center">{a.mode === "Air" ? <Plane className="h-5 w-5"/> : <Ship className="h-5 w-5"/>}</div>}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{a.name}</p>
                    <p className="text-xs text-muted-foreground">{a.lane_from} → {a.lane_to} • {a.mode}</p>
                    <p className="text-xs">{a.rate_currency} {Number(a.rate_amount).toLocaleString()} {a.rate_unit === "per_kg" ? "/kg" : "/CBM"} • ~{a.duration_days} days</p>
                  </div>
                  <a href={wa} target="_blank" rel="noreferrer"><Button size="sm" variant="outline" className="gap-1"><MessageCircle className="h-3.5 w-3.5 text-green-500"/>Chat</Button></a>
                </CardContent>
                {a.notes && <CardContent className="pt-0 pb-3 text-xs text-muted-foreground">{a.notes}</CardContent>}
              </Card>
            );
          })
        }
      </main>
    </div>
  );
}