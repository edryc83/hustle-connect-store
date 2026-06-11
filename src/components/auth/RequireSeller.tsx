import { ReactNode, useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Store } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export function RequireSeller({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [checking, setChecking] = useState(true);
  const [isSeller, setIsSeller] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setChecking(false);
      return;
    }
    (async () => {
      const { data } = await supabase.from("profiles").select("id, store_slug").eq("id", user.id).maybeSingle();
      setIsSeller(!!data?.store_slug);
      setChecking(false);
    })();
  }, [authLoading, user]);

  if (authLoading || checking) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Checking shop owner access...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!isSeller) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="max-w-sm rounded-xl border bg-card p-6 text-center">
          <Store className="mx-auto mb-3 h-8 w-8 text-primary" />
          <h1 className="text-lg font-bold">Import is for verified Afristall shop owners</h1>
          <p className="mt-2 text-sm text-muted-foreground">Finish your shop profile to browse vetted UK and UAE suppliers.</p>
          <Button className="mt-4" asChild><Link to="/signup?step=2">Complete profile</Link></Button>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
