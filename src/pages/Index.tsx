import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useOnboardingCheck } from "@/hooks/useOnboardingCheck";
import Navbar from "@/components/layout/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import HowItWorks from "@/components/landing/HowItWorks";
import ExampleStores from "@/components/landing/ExampleStores";
import { Button } from "@/components/ui/button";
import { Users, ArrowRight } from "lucide-react";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { needsOnboarding, checking } = useOnboardingCheck(user?.id);

  useEffect(() => {
    if (!user || checking) return;
    if (needsOnboarding) {
      sessionStorage.setItem("onboarding_redirect", "true");
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

        {/* Become an Agent CTA */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-primary/5 py-20">
          <div className="mx-auto max-w-3xl px-4 text-center space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              <Users className="h-4 w-4" /> Agent Programme
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Earn Money Helping Businesses Go Online
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Become an Afristall Agent — sign up sellers using your referral link and earn <strong className="text-foreground">UGX 2,000</strong> for every complete shop.
            </p>
            <Button size="lg" className="gap-2 text-base" asChild>
              <Link to="/agents">
                Become an Agent <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
