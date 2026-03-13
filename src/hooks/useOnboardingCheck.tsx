import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Checks if the authenticated user has completed onboarding (has store_name).
 * Returns { needsOnboarding, checking }.
 */
export function useOnboardingCheck(userId: string | undefined) {
  const [checking, setChecking] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    if (!userId) {
      setChecking(false);
      return;
    }

    supabase
      .from("profiles")
      .select("store_name")
      .eq("id", userId)
      .maybeSingle()
      .then(({ data }) => {
        setNeedsOnboarding(!data?.store_name);
        setChecking(false);
      });
  }, [userId]);

  return { needsOnboarding, checking };
}
