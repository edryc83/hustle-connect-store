import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

function parseTokensEnabled(value: string | null | undefined) {
  return value?.trim().toLowerCase() === "true";
}

type TokenBalancePayload = {
  token_balance?: number | null;
};

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
    if (!user) {
      setBalance(0);
      setEnabled(false);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    (async () => {
      const [profileRes, configRes] = await Promise.all([
        supabase.from("profiles").select("token_balance").eq("id", user.id).single(),
        supabase.from("app_config").select("value").eq("key", "tokens_enabled").single(),
      ]);
      if (cancelled) return;
      setBalance(profileRes.data?.token_balance ?? 0);
      setEnabled(parseTokensEnabled(configRes.data?.value));
      setLoading(false);
    })();

    // Live-update balance when tokens are credited or spent
    const channel = supabase
      .channel(`tokens-${user.id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles", filter: `id=eq.${user.id}` },
        (payload) => {
          const profile = payload.new as TokenBalancePayload;
          if (profile.token_balance !== undefined) {
            setBalance(profile.token_balance ?? 0);
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
