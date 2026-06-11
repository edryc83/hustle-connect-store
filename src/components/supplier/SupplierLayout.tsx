import { ReactNode } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { LogOut, Package, Receipt, UserRound } from "lucide-react";
import AfristallLogo from "@/components/AfristallLogo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export function SupplierLayout({ children }: { children: ReactNode }) {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const nav = [
    { to: "/supplier", label: "Products", icon: Package },
    { to: "/supplier/payments", label: "Payments", icon: Receipt },
    { to: "/supplier/profile", label: "Profile", icon: UserRound },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-card/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link to="/supplier" className="flex items-center gap-2 font-extrabold">
            <AfristallLogo className="h-7 w-7" />
            <span>Supplier</span>
          </Link>
          <Button variant="ghost" size="sm" className="gap-2" onClick={async () => { await signOut(); navigate("/login", { replace: true }); }}>
            <LogOut className="h-4 w-4" /> Sign out
          </Button>
        </div>
      </header>
      <div className="mx-auto grid max-w-5xl gap-4 px-4 py-5 md:grid-cols-[180px_1fr]">
        <nav className="flex gap-2 overflow-x-auto md:flex-col">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/supplier"}
              className={({ isActive }) => `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"}`}
            >
              <item.icon className="h-4 w-4" /> {item.label}
            </NavLink>
          ))}
        </nav>
        <main>{children}</main>
      </div>
    </div>
  );
}
