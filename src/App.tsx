import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { AdminLayout } from "@/components/admin/AdminLayout";
import Index from "./pages/Index";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import DashboardOverview from "./pages/dashboard/DashboardOverview";
import DashboardProducts from "./pages/dashboard/DashboardProducts";
import DashboardSettings from "./pages/dashboard/DashboardSettings";
import DashboardProfile from "./pages/dashboard/DashboardProfile";
import DashboardOrders from "./pages/dashboard/DashboardOrders";
import DashboardAnalytics from "./pages/dashboard/DashboardAnalytics";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminSellers from "./pages/admin/AdminSellers";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminAnalyticsPage from "./pages/admin/AdminAnalytics";
import Storefront from "./pages/Storefront";
import Explore from "./pages/Explore";
import ResetPassword from "./pages/ResetPassword";
import SuperAdminLogin from "./pages/SuperAdminLogin";
import AdStudio from "./pages/AdStudio";
import AgentPortal from "./pages/AgentPortal";
import JoinRedirect from "./pages/JoinRedirect";
import AgentLogin from "./pages/AgentLogin";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import CookiePolicy from "./pages/CookiePolicy";
import RefundPolicy from "./pages/RefundPolicy";
import DeleteAccount from "./pages/DeleteAccount";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

import { useForceUpdate } from "@/hooks/useForceUpdate";

const AppInner = () => {
  useForceUpdate();
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppInner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/login" element={<Login />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/dashboard" element={<DashboardLayout><DashboardOverview /></DashboardLayout>} />
              <Route path="/dashboard/products" element={<DashboardLayout><DashboardProducts /></DashboardLayout>} />
              <Route path="/dashboard/profile" element={<DashboardLayout><DashboardProfile /></DashboardLayout>} />
              <Route path="/dashboard/settings" element={<DashboardLayout><DashboardSettings /></DashboardLayout>} />
              <Route path="/dashboard/orders" element={<DashboardLayout><DashboardOrders /></DashboardLayout>} />
              <Route path="/dashboard/analytics" element={<DashboardLayout><DashboardAnalytics /></DashboardLayout>} />

              <Route path="/admin" element={<AdminLayout><AdminOverview /></AdminLayout>} />
              <Route path="/admin/sellers" element={<AdminLayout><AdminSellers /></AdminLayout>} />
              <Route path="/admin/orders" element={<AdminLayout><AdminOrders /></AdminLayout>} />
              <Route path="/admin/analytics" element={<AdminLayout><AdminAnalyticsPage /></AdminLayout>} />

              <Route path="/superadmin" element={<SuperAdminLogin />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/ad-studio" element={<AdStudio />} />
              <Route path="/agent" element={<AgentPortal />} />
              <Route path="/agent-login" element={<AgentLogin />} />
              <Route path="/join" element={<JoinRedirect />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/cookies" element={<CookiePolicy />} />
              <Route path="/refund-policy" element={<RefundPolicy />} />
              <Route path="/delete-account" element={<DeleteAccount />} />
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
