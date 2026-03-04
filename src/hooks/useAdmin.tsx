import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function useAdmin() {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    (supabase.rpc as any)("is_admin", { _user_id: user.id }).then(({ data }: any) => {
      setIsAdmin(!!data);
      setLoading(false);
    });
  }, [user, authLoading]);

  return { isAdmin, loading: loading || authLoading, user };
}
