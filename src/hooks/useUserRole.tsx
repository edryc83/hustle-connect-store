import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type AppRole = "supplier" | "agent" | "admin" | null;

export function useUserRole() {
  const { user, loading: authLoading } = useAuth();
  const [role, setRole] = useState<AppRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { setRole(null); setLoading(false); return; }
    let cancelled = false;
    (async () => {
      // Check admin via RPC
      const [{ data: adminFlag }, { data: roles }] = await Promise.all([
        supabase.rpc("is_admin", { _user_id: user.id }),
        (supabase.from("user_roles" as any).select("role, status").eq("user_id", user.id) as any),
      ]);
      if (cancelled) return;
      let r: AppRole = null;
      const approvedRoles = (roles || []).filter((x: any) => (x.status || "approved") === "approved");
      if (adminFlag) r = "admin";
      else if (approvedRoles.some((x: any) => x.role === "supplier")) r = "supplier";
      else if (approvedRoles.some((x: any) => x.role === "agent")) r = "agent";
      setRole(r);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [user, authLoading]);

  return { role, loading, isSupplier: role === "supplier", isAgent: role === "agent", isAdmin: role === "admin" };
}
