import { LayoutDashboard, Package, Settings, ClipboardList } from "lucide-react";
import { NavLink } from "@/components/NavLink";

const navItems = [
  { title: "Overview", url: "/dashboard", icon: LayoutDashboard },
  { title: "Listings", url: "/dashboard/products", icon: Package },
  { title: "Orders", url: "/dashboard/orders", icon: ClipboardList },
  { title: "Settings", url: "/dashboard/settings", icon: Settings },
];

export function MobileBottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background md:hidden">
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
