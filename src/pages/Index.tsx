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
import agentCtaImage from "@/assets/agent-cta-home.jpeg";

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
        <section className="relative overflow-hidden py-0">
          <div className="mx-auto max-w-6xl px-4 py-20">
            <div className="relative overflow-hidden rounded-2xl min-h-[360px] flex items-center">
              <img
                src={agentCtaImage}
                alt="People sharing Afristall on their phones"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/20" />
              <div className="relative z-10 p-8 sm:p-12 max-w-lg space-y-5">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
                  <Users className="h-4 w-4" /> Agent Programme
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  Earn Money Helping Businesses Go Online
                </h2>
                <p className="text-white/80 text-sm sm:text-base leading-relaxed">
                  Become an Afristall Agent — sign up sellers using your referral link and earn <strong className="text-primary">UGX 2,000</strong> for every complete shop.
                </p>
                <Button size="lg" className="gap-2 text-base font-bold" asChild>
                  <Link to="/agents">
                    Become an Agent <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
