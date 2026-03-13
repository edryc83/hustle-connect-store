import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useOnboardingCheck } from "@/hooks/useOnboardingCheck";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/landing/HeroSection";
import HowItWorks from "@/components/landing/HowItWorks";
import ExampleStores from "@/components/landing/ExampleStores";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { needsOnboarding, checking } = useOnboardingCheck(user?.id);

  useEffect(() => {
    if (!user || checking) return;
    if (needsOnboarding) {
      navigate("/signup?step=2", { replace: true });
    } else {
      navigate("/dashboard", { replace: true });
    }
  }, [user, checking, needsOnboarding, navigate]);

  if (user) return null;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <HowItWorks />
        <ExampleStores />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
