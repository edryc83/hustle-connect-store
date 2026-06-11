import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";

export function RequireSupplier({ children }: { children: ReactNode }) {
  const { role, loading } = useUserRole();
  if (loading) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Verifying access...</div>;
  if (role !== "supplier") return <Navigate to="/login" replace />;
  return <>{children}</>;
}
