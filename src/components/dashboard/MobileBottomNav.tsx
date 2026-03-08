import { LayoutDashboard, Package, User, ClipboardList, BarChart3 } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useBusinessTerms } from "@/hooks/useBusinessTerms";

export function MobileBottomNav() {
  const terms = useBusinessTerms();

  const navItems = [
    { title: "Home", url: "/dashboard", icon: LayoutDashboard },
    { title: terms.plural, url: "/dashboard/products", icon: Package },
    { title: "Orders", url: "/dashboard/orders", icon: ClipboardList },
    { title: "Analytics", url: "/dashboard/analytics", icon: BarChart3 },
    { title: "Profile", url: "/dashboard/profile", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/40 bg-background/60 backdrop-blur-2xl backdrop-saturate-150 md:hidden supports-[padding:env(safe-area-inset-bottom)]:pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => (
          <NavLink
            key={item.title}
            to={item.url}
            end
            className="flex flex-col items-center gap-0.5 px-3 py-1 text-xs text-muted-foreground transition-colors"
            activeClassName="text-primary font-medium"
          >
            <item.icon className="h-5 w-5" />
            <span>{item.title}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
