import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/sonner";
import { Users, Wallet, CheckCircle2, Clock, Loader2 } from "lucide-react";

type AgentRow = {
  id: string;
  first_name: string | null;
  email: string | null;
  store_slug: string | null;
  momo_number: string | null;
  momo_name: string | null;
  shopCount: number;
  completeShopCount: number;
  earned: number;
  withdrawn: number;
  balance: number;
  pendingWithdrawal: { id: string; amount: number; created_at: string; momo_number: string | null; momo_name: string | null } | null;
};

export default function AdminAgents() {
  const [agents, setAgents] = useState<AgentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [approveTarget, setApproveTarget] = useState<{ agent: AgentRow; withdrawal: NonNullable<AgentRow["pendingWithdrawal"]> } | null>(null);
  const [approving, setApproving] = useState(false);

  const fetchAgents = async () => {
    setLoading(true);

    // Get all agent user IDs
    const { data: roles } = await supabase
      .from("user_roles" as any)
      .select("user_id")
      .eq("role", "agent") as any;

    if (!roles || roles.length === 0) { setAgents([]); setLoading(false); return; }

    const agentIds = roles.map((r: any) => r.user_id) as string[];

    // Get agent profiles
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, first_name, email, store_slug, momo_number, momo_name")
      .in("id", agentIds) as any;

    // Get all referred sellers
    const { data: referredProfiles } = await supabase
      .from("profiles")
      .select("id, referred_by, whatsapp_number")
      .in("referred_by", agentIds) as any;

    // Get products for referred sellers to determine "complete" status
    const referredIds = (referredProfiles || []).map((p: any) => p.id);
    let productMap: Record<string, number> = {};
    if (referredIds.length > 0) {
      const { data: products } = await supabase
        .from("products")
        .select("user_id")
        .in("user_id", referredIds);
      for (const p of products || []) {
        productMap[p.user_id] = (productMap[p.user_id] || 0) + 1;
      }
    }

    // Build per-agent shop counts
    const agentShops: Record<string, { total: number; complete: number }> = {};
    for (const p of referredProfiles || []) {
      const agentId = p.referred_by;
      if (!agentShops[agentId]) agentShops[agentId] = { total: 0, complete: 0 };
      agentShops[agentId].total++;
      const hasWhatsApp = !!p.whatsapp_number && p.whatsapp_number.length > 5;
      if (hasWhatsApp && productMap[p.id]) agentShops[agentId].complete++;
    }

    // Get all withdrawals
    const { data: withdrawals } = await (supabase
      .from("agent_withdrawals" as any)
      .select("*") as any)
      .in("agent_id", agentIds);

    const withdrawalMap: Record<string, { withdrawn: number; pending: any | null }> = {};
    for (const w of withdrawals || []) {
      if (!withdrawalMap[w.agent_id]) withdrawalMap[w.agent_id] = { withdrawn: 0, pending: null };
      if (w.status === "completed") withdrawalMap[w.agent_id].withdrawn += Number(w.amount);
      if (w.status === "pending") withdrawalMap[w.agent_id].pending = w;
    }

    const mapped: AgentRow[] = (profiles || []).map((p: any) => {
      const shops = agentShops[p.id] || { total: 0, complete: 0 };
      const wdata = withdrawalMap[p.id] || { withdrawn: 0, pending: null };
      const earned = shops.complete * 2000;
      return {
        id: p.id,
        first_name: p.first_name,
        email: p.email,
        store_slug: p.store_slug,
        momo_number: p.momo_number,
        momo_name: p.momo_name,
        shopCount: shops.total,
        completeShopCount: shops.complete,
        earned,
        withdrawn: wdata.withdrawn,
        balance: earned - wdata.withdrawn,
        pendingWithdrawal: wdata.pending,
      };
    });

    mapped.sort((a, b) => b.shopCount - a.shopCount);
    setAgents(mapped);
    setLoading(false);
  };

  useEffect(() => { fetchAgents(); }, []);

  const handleApprove = async () => {
    if (!approveTarget) return;
    setApproving(true);

    // Use edge function or direct update via service role — we'll use the supabase client
    // Since RLS only allows service_role to update, we need an edge function
    const { error } = await supabase.functions.invoke("approve-withdrawal", {
      body: { withdrawal_id: approveTarget.withdrawal.id },
    });

    setApproving(false);
    setApproveTarget(null);
    if (error) {
      toast.error("Failed to approve withdrawal");
    } else {
      toast.success("Withdrawal approved!");
      fetchAgents();
    }
  };

  const totalShops = agents.reduce((s, a) => s + a.shopCount, 0);
  const totalEarned = agents.reduce((s, a) => s + a.earned, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Agents</h1>
        <Badge variant="outline">{agents.length} agents</Badge>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="flex flex-col items-center p-4">
            <Users className="h-5 w-5 text-primary mb-1" />
            <span className="text-2xl font-bold">{totalShops}</span>
            <span className="text-xs text-muted-foreground">Total Shops</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center p-4">
            <Wallet className="h-5 w-5 text-primary mb-1" />
            <span className="text-lg font-bold">UGX {totalEarned.toLocaleString()}</span>
            <span className="text-xs text-muted-foreground">Total Earned</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center p-4">
            <Clock className="h-5 w-5 text-orange-500 mb-1" />
            <span className="text-2xl font-bold">{agents.filter(a => a.pendingWithdrawal).length}</span>
            <span className="text-xs text-muted-foreground">Pending Payouts</span>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="rounded-xl border border-border/50 bg-card/60 backdrop-blur-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agent</TableHead>
                <TableHead className="text-center">Shops</TableHead>
                <TableHead className="text-center">Complete</TableHead>
                <TableHead className="text-right">Earned</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead className="text-center">Payout</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agents.map((agent) => (
                <TableRow key={agent.id}>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">{agent.first_name || "Unnamed"}</p>
                      <p className="text-xs text-muted-foreground">{agent.email}</p>
                      {agent.momo_number && (
                        <p className="text-xs text-muted-foreground">MoMo: {agent.momo_number} ({agent.momo_name})</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center text-sm">{agent.shopCount}</TableCell>
                  <TableCell className="text-center text-sm">{agent.completeShopCount}</TableCell>
                  <TableCell className="text-right text-sm font-medium">UGX {agent.earned.toLocaleString()}</TableCell>
                  <TableCell className="text-right text-sm font-medium">UGX {agent.balance.toLocaleString()}</TableCell>
                  <TableCell className="text-center">
                    {agent.pendingWithdrawal ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs gap-1 border-orange-500/30 text-orange-600 hover:bg-orange-500/10"
                        onClick={() => setApproveTarget({ agent, withdrawal: agent.pendingWithdrawal! })}
                      >
                        <Clock className="h-3 w-3" /> UGX {Number(agent.pendingWithdrawal.amount).toLocaleString()} — Approve
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {agents.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">No agents found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog open={!!approveTarget} onOpenChange={(open) => !open && setApproveTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Withdrawal?</AlertDialogTitle>
            <AlertDialogDescription>
              Send <strong>UGX {approveTarget ? Number(approveTarget.withdrawal.amount).toLocaleString() : 0}</strong> to{" "}
              <strong>{approveTarget?.withdrawal.momo_name || approveTarget?.agent.momo_name}</strong> ({approveTarget?.withdrawal.momo_number || approveTarget?.agent.momo_number})?
              This will mark the withdrawal as complete and reset the agent's balance.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={approving}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleApprove} disabled={approving}>
              {approving ? "Approving…" : "Mark as Sent"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
