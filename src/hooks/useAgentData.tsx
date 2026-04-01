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
  const [sellers, setSellers] = useState<ReferredSeller[]>([]);
  const [loading, setLoading] = useState(true);

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
        .select("first_name, store_slug")
        .eq("id", user.id)
        .single();

      setAgentName(agentProfile?.first_name || "Agent");
      setAgentSlug(agentProfile?.store_slug || user.id.slice(0, 8));

      // Get referred sellers
      const { data: referredProfiles } = await supabase
        .from("profiles")
        .select("id, store_name, first_name, whatsapp_number, store_slug")
        .eq("referred_by" as any, user.id);

      if (!referredProfiles || referredProfiles.length === 0) {
        setSellers([]);
        setLoading(false);
        return;
      }

      // Get product counts for each referred seller
      const sellerIds = referredProfiles.map((p) => p.id);
      const { data: products } = await supabase
        .from("products")
        .select("user_id, image_url, price")
        .in("user_id", sellerIds);

      const productMap: Record<string, { count: number; hasComplete: boolean }> = {};
      for (const p of products || []) {
        if (!productMap[p.user_id]) productMap[p.user_id] = { count: 0, hasComplete: false };
        productMap[p.user_id].count++;
        if (p.image_url && p.price > 0) productMap[p.user_id].hasComplete = true;
      }

      const mapped: ReferredSeller[] = referredProfiles.map((p) => {
        const pm = productMap[p.id] || { count: 0, hasComplete: false };
        const hasWhatsApp = !!p.whatsapp_number && p.whatsapp_number.length > 5;
        return {
          id: p.id,
          store_name: p.store_name,
          first_name: p.first_name,
          whatsapp_number: p.whatsapp_number,
          store_slug: p.store_slug,
          productCount: pm.count,
          isComplete: hasWhatsApp && pm.hasComplete,
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
  const balance = completeCount * 2000;

  return { isAgent, loading, agentName, agentSlug, sellers, completeCount, balance };
}
