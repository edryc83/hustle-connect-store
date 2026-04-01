import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface ReferredSeller {
  id: string;
  store_name: string | null;
  first_name: string | null;
  whatsapp_number: string | null;
  store_slug: string | null;
  productCount: number;
  isComplete: boolean;
}

export function useAgentData() {
  const { user } = useAuth();
  const [isAgent, setIsAgent] = useState<boolean | null>(null);
  const [agentSlug, setAgentSlug] = useState<string | null>(null);
  const [agentName, setAgentName] = useState<string>("");
  const [momoNumber, setMomoNumber] = useState<string>("");
  const [momoName, setMomoName] = useState<string>("");
  const [sellers, setSellers] = useState<ReferredSeller[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingWithdrawal, setPendingWithdrawal] = useState(false);
  const [totalWithdrawn, setTotalWithdrawn] = useState(0);

  useEffect(() => {
    if (!user) { setIsAgent(false); setLoading(false); return; }

    const load = async () => {
      // Check agent role
      const { data: roleData } = await supabase
        .from("user_roles" as any)
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "agent")
        .maybeSingle();

      if (!roleData) {
        setIsAgent(false);
        setLoading(false);
        return;
      }
      setIsAgent(true);

      // Get agent profile
      const { data: agentProfile } = await supabase
        .from("profiles")
        .select("first_name, store_slug, momo_number, momo_name")
        .eq("id", user.id)
        .single();

      setAgentName(agentProfile?.first_name || "Agent");
      setAgentSlug(agentProfile?.store_slug || user.id.slice(0, 8));
      setMomoNumber((agentProfile as any)?.momo_number || "");
      setMomoName((agentProfile as any)?.momo_name || "");

      // Check withdrawals
      const { data: withdrawals } = await (supabase
        .from("agent_withdrawals" as any)
        .select("status, amount") as any)
        .eq("agent_id", user.id);

      if (withdrawals && withdrawals.length > 0) {
        const hasPending = withdrawals.some((w: any) => w.status === "pending");
        setPendingWithdrawal(hasPending);
        const completed = withdrawals
          .filter((w: any) => w.status === "completed")
          .reduce((sum: number, w: any) => sum + Number(w.amount), 0);
        setTotalWithdrawn(completed);
      }

      // Get referred sellers
      const { data: referredProfiles } = await (supabase
        .from("profiles")
        .select("id, store_name, first_name, whatsapp_number, store_slug") as any)
        .eq("referred_by", user.id);

      if (!referredProfiles || referredProfiles.length === 0) {
        setSellers([]);
        setLoading(false);
        return;
      }

      // Get product counts for each referred seller
      const sellerIds = referredProfiles.map((p: any) => p.id);
      const { data: products } = await supabase
        .from("products")
        .select("user_id, image_url, price")
        .in("user_id", sellerIds);

      const productMap: Record<string, number> = {};
      for (const p of products || []) {
        productMap[p.user_id] = (productMap[p.user_id] || 0) + 1;
      }

      const mapped: ReferredSeller[] = referredProfiles.map((p: any) => {
        const count = productMap[p.id] || 0;
        const hasWhatsApp = !!p.whatsapp_number && p.whatsapp_number.length > 5;
        return {
          id: p.id,
          store_name: p.store_name,
          first_name: p.first_name,
          whatsapp_number: p.whatsapp_number,
          store_slug: p.store_slug,
          productCount: count,
          isComplete: hasWhatsApp && count >= 5,
        };
      });

      // Sort: complete first
      mapped.sort((a, b) => (a.isComplete === b.isComplete ? 0 : a.isComplete ? -1 : 1));
      setSellers(mapped);
      setLoading(false);
    };

    load();
  }, [user]);

  const completeCount = sellers.filter((s) => s.isComplete).length;
  const earnedTotal = completeCount * 2000;
  const balance = earnedTotal - totalWithdrawn;

  const saveMomo = async (number: string, name: string) => {
    if (!user) return;
    await supabase
      .from("profiles")
      .update({ momo_number: number, momo_name: name } as any)
      .eq("id", user.id);
    setMomoNumber(number);
    setMomoName(name);
  };

  const requestWithdrawal = async () => {
    if (!user || balance < 2000 || pendingWithdrawal) return false;
    const { error } = await (supabase.from("agent_withdrawals" as any) as any).insert({
      agent_id: user.id,
      amount: balance,
      momo_number: momoNumber,
      momo_name: momoName,
    });
    if (!error) {
      setPendingWithdrawal(true);
      return true;
    }
    return false;
  };

  return {
    isAgent, loading, agentName, agentSlug, sellers, completeCount, balance,
    momoNumber, momoName, saveMomo,
    pendingWithdrawal, requestWithdrawal,
  };
}
