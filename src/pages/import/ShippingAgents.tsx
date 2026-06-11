import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { waLink } from "@/lib/importUtils";

export default function ShippingAgents() {
  const [agents, setAgents] = useState<any[]>([]);
  const [lane, setLane] = useState("all");
  const [sort, setSort] = useState("rate");

  useEffect(() => {
    supabase.from("shipping_agents" as any).select("*").eq("active", true).then(({ data }) => setAgents((data as any[]) || []));
  }, []);

  const filtered = useMemo(() => {
    const list = agents.filter((a) => lane === "all" || a.lane_from === lane);
    return [...list].sort((a, b) => sort === "duration" ? Number(a.duration_days || 999) - Number(b.duration_days || 999) : Number(a.rate_amount) - Number(b.rate_amount));
  }, [agents, lane, sort]);

  return (
    <div className="mx-auto max-w-4xl space-y-5 px-4 py-5">
      <Link to="/import" className="text-sm text-muted-foreground">Back to Import</Link>
      <div>
        <h1 className="text-2xl font-bold">Shipping agents</h1>
        <p className="text-sm text-muted-foreground">Contact an agent directly to arrange UK/UAE to Uganda shipping.</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Select value={lane} onValueChange={setLane}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All lanes</SelectItem><SelectItem value="UK">UK to UG</SelectItem><SelectItem value="UAE">UAE to UG</SelectItem></SelectContent></Select>
        <Select value={sort} onValueChange={setSort}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="rate">Sort by rate</SelectItem><SelectItem value="duration">Sort by duration</SelectItem></SelectContent></Select>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {filtered.map((agent) => (
          <Card key={agent.id}>
            <CardContent className="flex gap-3 p-4">
              <img src={agent.logo_url || "/placeholder.svg"} alt="" className="h-16 w-16 rounded-lg object-cover" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{agent.name}</p>
                <p className="text-sm text-muted-foreground">{agent.lane_from} to {agent.lane_to} - {agent.mode}</p>
                <p className="text-sm">UGX {Number(agent.rate_amount).toLocaleString()} / {agent.rate_unit === "per_kg" ? "kg" : "CBM"}{agent.duration_days ? ` - ${agent.duration_days} days` : ""}</p>
                {agent.notes && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{agent.notes}</p>}
                <Button asChild size="sm" className="mt-2 gap-2"><a href={waLink(agent.whatsapp, `Hi ${agent.name}, I found you on Afristall Import and need shipping help.`)} target="_blank" rel="noreferrer"><MessageCircle className="h-4 w-4" /> Contact on WhatsApp</a></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
