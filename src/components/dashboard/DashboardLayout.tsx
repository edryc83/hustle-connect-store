import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "./DashboardSidebar";
import { MobileBottomNav } from "./MobileBottomNav";
import AfristallLogo from "@/components/AfristallLogo";
import { useTheme } from "@/hooks/useTheme";
import { Moon, Sun, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading…</div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <div className="hidden md:block">
          <DashboardSidebar />
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-3 border-b bg-background/80 px-4 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="hidden md:flex" />
              <div className="flex items-center gap-2 md:hidden">
                <AfristallLogo className="h-5 w-5" />
                <span className="text-sm font-bold">
                  Afri<span className="text-primary">stall</span>
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/ad-studio"
                className="flex h-9 items-center gap-1.5 rounded-full border-0 bg-gradient-to-r from-violet-600 to-fuchsia-500 px-3 text-xs font-medium text-white shadow-md shadow-violet-500/25 hover:shadow-violet-500/40 transition-shadow md:hidden"
              >
                <Sparkles className="h-3.5 w-3.5" /> AI Design
              </Link>
              <button
                onClick={toggleTheme}
                className="flex h-9 w-9 items-center justify-center rounded-full border bg-card/60 backdrop-blur-sm text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-6">
            {children}
          </main>
        </div>
      </div>

      <MobileBottomNav />
    </SidebarProvider>
  );
}
