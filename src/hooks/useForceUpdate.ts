import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

const POLL_INTERVAL = 30_000; // 30 seconds

export function useForceUpdate() {
  const knownTimestamp = useRef<string | null>(null);

  useEffect(() => {
    const check = async () => {
      const { data } = await supabase
        .from("app_config")
        .select("value")
        .eq("key", "force_update_at")
        .single();

      if (!data) return;

      if (knownTimestamp.current === null) {
        // First check — just store the current value
        knownTimestamp.current = data.value;
      } else if (data.value !== knownTimestamp.current) {
        // Timestamp changed — force reload
        window.location.reload();
      }
    };

    check();
    const interval = setInterval(check, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, []);
}
