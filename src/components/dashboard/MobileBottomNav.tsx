import { Home, Package, User, ClipboardList, Sparkles, BarChart3 } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useBusinessTerms } from "@/hooks/useBusinessTerms";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function MobileBottomNav() {
  const terms = useBusinessTerms();
  const { pathname } = useLocation();
  const isProfileActive = pathname === "/dashboard/profile";
  const { user } = useAuth();

  const { data: profilePic } = useQuery({
    queryKey: ["profile-pic", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("profiles")
        .select("profile_picture_url")
        .eq("id", user.id)
        .single();
      return data?.profile_picture_url ?? null;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  const navItems = [
    { title: "Home", url: "/dashboard", icon: Home },
    { title: terms.plural, url: "/dashboard/products", icon: Package },
    { title: "Design", url: "/ad-studio", icon: Sparkles },
    { title: "Analytics", url: "/dashboard/analytics", icon: BarChart3 },
    { title: "Profile", url: "/dashboard/profile", icon: null as any },
  ];

  return (
    <nav className="mobile-bottom-nav fixed inset-x-0 bottom-0 z-[70] border-t border-border/40 bg-background/60 shadow-lg backdrop-blur-2xl backdrop-saturate-150 md:hidden [transform:translateZ(0)]">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => (
          <NavLink
            key={item.title}
            to={item.url}
            end
            className="flex flex-col items-center gap-0.5 px-3 py-1 text-xs text-foreground/60 transition-colors"
            activeClassName="text-primary font-medium"
          >
            {item.title === "Profile" ? (
              profilePic ? (
                <div className={`ig-ring ig-ring-sm ${isProfileActive ? "" : "opacity-70"}`}>
                  <img
                    src={profilePic}
                    alt="Profile"
                    className="h-5 w-5 rounded-full object-cover border-[1.5px] border-background"
                  />
                </div>
              ) : (
                <User className="h-5 w-5" />
              )
            ) : (
              <item.icon className="h-5 w-5" />
            )}
            <span>{item.title}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
