import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import Index from "./pages/Index";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import DashboardOverview from "./pages/dashboard/DashboardOverview";
import DashboardProducts from "./pages/dashboard/DashboardProducts";
import DashboardSettings from "./pages/dashboard/DashboardSettings";
import DashboardOrders from "./pages/dashboard/DashboardOrders";
import DashboardAnalytics from "./pages/dashboard/DashboardAnalytics";
import DashboardShareCard from "./pages/dashboard/DashboardShareCard";
import Storefront from "./pages/Storefront";
import Explore from "./pages/Explore";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<DashboardLayout><DashboardOverview /></DashboardLayout>} />
              <Route path="/dashboard/products" element={<DashboardLayout><DashboardProducts /></DashboardLayout>} />
              <Route path="/dashboard/settings" element={<DashboardLayout><DashboardSettings /></DashboardLayout>} />
              <Route path="/dashboard/orders" element={<DashboardLayout><DashboardOrders /></DashboardLayout>} />
              <Route path="/dashboard/analytics" element={<DashboardLayout><DashboardAnalytics /></DashboardLayout>} />
              <Route path="/dashboard/share" element={<DashboardLayout><DashboardShareCard /></DashboardLayout>} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/:storeSlug" element={<Storefront />} />
              <Route path="/:storeSlug/:productId" element={<Storefront />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);
export default App;
