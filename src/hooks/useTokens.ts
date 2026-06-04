import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function useTokens() {
  const { user } = useAuth();
  const [balance, setBalance] = useState<number>(0);
  const [enabled, setEnabled] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  const fetchBalance = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("token_balance")
      .eq("id", user.id)
      .single();
    if (data) setBalance(data.token_balance ?? 0);
  }, [user]);

  useEffect(() => {
    if (!user) { setLoading(false); return; }

    let cancelled = false;
    (async () => {
      const [profileRes, configRes] = await Promise.all([
        supabase.from("profiles").select("token_balance").eq("id", user.id).single(),
        supabase.from("app_config").select("value").eq("key", "tokens_enabled").single(),
      ]);
      if (cancelled) return;
      setBalance(profileRes.data?.token_balance ?? 0);
      setEnabled(configRes.data?.value === "true");
      setLoading(false);
    })();

    // Live-update balance when tokens are credited or spent
    const channel = supabase
      .channel(`tokens-${user.id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles", filter: `id=eq.${user.id}` },
        (payload) => {
          if ((payload.new as any)?.token_balance !== undefined) {
            setBalance((payload.new as any).token_balance);
          }
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [user]);

  return { balance, enabled, loading, refetch: fetchBalance };
}
