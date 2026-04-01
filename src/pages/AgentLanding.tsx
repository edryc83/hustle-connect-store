import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import AfristallLogo from "@/components/AfristallLogo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Link2, Share2, Store, Wallet, CheckCircle2, ArrowRight,
} from "lucide-react";
import agentHeroWoman from "@/assets/agent-hero-woman.png";
import agentBgFriends from "@/assets/agent-bg-friends.jpeg";

const steps = [
  { icon: Link2, title: "Get your link", desc: "Sign up as an agent and get your unique Afristall referral link instantly." },
  { icon: Share2, title: "Share it everywhere", desc: "Send it to shop owners, market traders, influencers, and small business owners in your area." },
  { icon: Store, title: "They open their store", desc: "Your seller creates their free Afristall shop, adds their products and their WhatsApp number." },
  { icon: Wallet, title: "You get paid", desc: "The moment their shop is complete — products added, WhatsApp number confirmed — 2,000 UGX lands in your account." },
];

const earningsRows = [
  { shops: 10, amount: "20,000" },
  { shops: 50, amount: "100,000" },
  { shops: 100, amount: "200,000" },
];

const checklist = [
  "Store created",
  "At least one product added with a photo and price",
  "WhatsApp number confirmed",
];

export default function AgentLanding() {
  const heroImgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (heroImgRef.current) {
        const y = window.scrollY;
        heroImgRef.current.style.transform = `translateY(${y * 0.35}px) scale(1.1)`;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border/40 bg-card/80 backdrop-blur-lg">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <AfristallLogo className="h-7 w-7" />
            <span className="text-base font-extrabold tracking-tight">
              Afri<span className="text-primary">stall</span>
            </span>
          </Link>
          <Link to="/agent-login">
            <Button variant="ghost" size="sm">Log in</Button>
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative overflow-hidden min-h-[80vh] flex items-center">
        {/* Background image */}
        <img
          src={agentBgFriends}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Gradient overlay: strong on left, fading to transparent on right */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

        <div className="relative z-10 mx-auto max-w-5xl px-4 py-20 w-full">
          <div className="max-w-xl space-y-8">
            <span className="inline-block rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary backdrop-blur-sm">
              Agent Programme
            </span>
            <h1 className="text-4xl sm:text-6xl font-extralight leading-[1.1] tracking-tight">
              Get Paid to Build Africa's{" "}
              <span className="text-primary font-light">Biggest Market</span>
            </h1>
            <p className="max-w-lg text-base sm:text-lg text-muted-foreground leading-relaxed">
              Join the Afristall Agent Programme. Share your link. Onboard sellers. Earn{" "}
              <span className="font-bold text-primary">2,000 UGX</span> for every complete shop you add. No cap. No limit.
            </p>
            <Link to="/agent-signup">
              <Button size="lg" className="gap-2 text-base font-bold shadow-lg shadow-primary/25 mt-4">
                Become an Agent — It's Free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-3xl sm:text-4xl font-extralight tracking-tight mb-14">
            How It Works
          </h2>
          <div className="grid gap-5 sm:grid-cols-2">
            {steps.map((s, i) => (
              <Card key={i} className="border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-sm">
                      {i + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm mb-1.5">{s.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* THE NUMBERS */}
      <section className="px-4 py-20 bg-card/50">
        <div className="mx-auto max-w-md text-center space-y-8">
          <h2 className="text-3xl sm:text-4xl font-extralight tracking-tight">The Numbers</h2>
          <div className="space-y-3">
            {earningsRows.map((r) => (
              <div key={r.shops} className="flex items-center justify-between rounded-xl border border-border/50 bg-background px-5 py-4">
                <span className="text-sm font-medium text-muted-foreground">{r.shops} complete shops</span>
                <span className="text-lg font-extrabold text-primary">UGX {r.amount}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            There is no ceiling. The more sellers you bring in, the more you earn.
          </p>
        </div>
      </section>

      {/* WHO SHOULD BECOME AN AGENT */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-2 items-center gap-12">
          <div className="flex justify-center order-2 md:order-1">
            <img
              src={agentHeroWoman}
              alt="Excited Afristall seller"
              className="w-64 sm:w-72 md:w-80 object-contain drop-shadow-2xl"
            />
          </div>
          <div className="text-center md:text-left space-y-6 order-1 md:order-2">
            <h2 className="text-3xl sm:text-4xl font-extralight tracking-tight">
              Who Should Become an Agent
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              You know people who sell things. Market traders. Home-based sellers. Fashion girls. Food vendors. Salon owners. Barbers. Event planners.
              If they sell anything, they need Afristall — and <span className="font-semibold text-foreground">you get paid for introducing them.</span>
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-2.5 pt-3">
              {["Market Traders", "Fashion Sellers", "Food Vendors", "Salon Owners", "Event Planners"].map((t) => (
                <span key={t} className="rounded-full border border-border bg-muted/50 px-4 py-1.5 text-xs font-medium text-muted-foreground">{t}</span>
              ))}
            </div>
            <p className="text-sm text-muted-foreground pt-2">
              You don't need to be technical. You don't need any money to start. You just need your phone and the people you already know.
            </p>
          </div>
        </div>
      </section>

      {/* WHAT YOUR SELLERS GET */}
      <section className="px-4 py-20 bg-card/50">
        <div className="mx-auto max-w-2xl text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extralight tracking-tight">
            What Your Sellers Get
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Every seller you bring onto Afristall gets their own free online shop at{" "}
            <span className="font-mono text-foreground font-semibold">afristall.com/theirname</span>. Their customers can see all their products, prices, and order directly to their WhatsApp. No commission taken. Ever.
          </p>
          <p className="text-sm font-semibold text-primary">
            When you share something this good, people say yes.
          </p>
        </div>
      </section>

      {/* WHAT A COMPLETE SHOP LOOKS LIKE */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-md space-y-8">
          <h2 className="text-center text-3xl sm:text-4xl font-extralight tracking-tight">
            What a Complete Shop Looks Like
          </h2>
          <Card className="border-primary/20">
            <CardContent className="p-6 space-y-4">
              {checklist.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500 mt-0.5" />
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </CardContent>
          </Card>
          <p className="text-center text-sm text-muted-foreground">
            That's it. Simple for your seller. <span className="font-bold text-primary">2,000 UGX</span> for you.
          </p>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="px-4 py-24 text-center">
        <div className="mx-auto max-w-lg space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extralight tracking-tight">Ready to Start?</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            There are sellers in your area right now who need this. Every day you wait is money you're not earning.
          </p>
          <Link to="/agent-signup">
            <Button size="lg" className="gap-2 text-base font-bold shadow-lg shadow-primary/25">
              Join the Agent Programme — Free <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <p className="text-xs text-muted-foreground pt-3">
            Already an agent?{" "}
            <Link to="/agent-login" className="text-primary font-medium hover:underline">Log in to your dashboard →</Link>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 px-4 py-8 text-center">
        <p className="text-xs text-muted-foreground">
          Afristall Agent Programme · afristall.com · Built for African sellers. Powered by their communities.
        </p>
      </footer>
    </div>
  );
}
