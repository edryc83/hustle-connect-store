import { Link } from "react-router-dom";
import AfristallLogo from "@/components/AfristallLogo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Link2, Share2, Store, Wallet, CheckCircle2, ArrowRight, Users, TrendingUp, Zap,
} from "lucide-react";
import agentHeroWoman from "@/assets/agent-hero-woman.png";
import agentBgFriends from "@/assets/agent-bg-friends.jpeg";

const steps = [
  { icon: Link2, title: "Get your link", desc: "Sign up and get your unique Afristall referral link instantly." },
  { icon: Share2, title: "Share it everywhere", desc: "Send it to shop owners, market traders, and small business owners." },
  { icon: Store, title: "They open their store", desc: "Your seller creates their free shop, adds products and WhatsApp number." },
  { icon: Wallet, title: "You get paid", desc: "Shop complete — 2,000 UGX lands in your account. Instantly." },
];

const stats = [
  { value: "2,000", label: "UGX per shop", suffix: "" },
  { value: "No", label: "Earning Cap", suffix: "" },
  { value: "100%", label: "Free to Join", suffix: "" },
  { value: "5 min", label: "To Get Started", suffix: "" },
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

const audiences = ["Market Traders", "Fashion Sellers", "Food Vendors", "Salon Owners", "Event Planners"];

export default function AgentLanding() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
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

      {/* HERO — contained image like reference */}
      <section className="mx-auto max-w-6xl px-4 pt-8 pb-0">
        <div className="relative overflow-hidden rounded-2xl min-h-[420px] sm:min-h-[480px] flex items-end">
          <img
            src={agentBgFriends}
            alt="People sharing on phones"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Dark overlay for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />

          <div className="relative z-10 p-6 sm:p-10 md:p-14 w-full max-w-xl space-y-5">
            <span className="inline-block rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
              Agent Programme
            </span>
            <h1 className="text-3xl sm:text-5xl font-extralight leading-[1.1] tracking-tight text-white">
              Get Paid to Build Africa's{" "}
              <span className="text-primary">Biggest Market</span>
            </h1>
            <p className="text-sm sm:text-base text-white/80 leading-relaxed max-w-md">
              Share your link. Onboard sellers. Earn{" "}
              <span className="font-bold text-primary">2,000 UGX</span> for every complete shop.
            </p>
            <Link to="/agent-signup">
              <Button size="lg" className="gap-2 text-base font-bold mt-2">
                Become an Agent — It's Free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* STATS ROW */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center space-y-1">
              <p className="text-2xl sm:text-3xl font-extrabold text-foreground">{s.value}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS — numbered cards like "Services we provide" */}
      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">How It Works</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <Card key={i} className="border-border/50 overflow-hidden group hover:border-primary/30 transition-colors">
              <CardContent className="p-5 space-y-3">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  0{i + 1}
                </span>
                <h3 className="font-bold text-sm">{s.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* EARNINGS — side by side like "About Company" section */}
      <section className="bg-foreground text-background">
        <div className="mx-auto max-w-6xl px-4 py-20 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-5">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">The Numbers</h2>
            <p className="text-sm opacity-70 leading-relaxed max-w-md">
              There is no ceiling. The more sellers you bring in, the more you earn. Here's what it looks like.
            </p>
          </div>
          <div className="space-y-3">
            {earningsRows.map((r) => (
              <div key={r.shops} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-5 py-4">
                <span className="text-sm font-medium opacity-70">{r.shops} complete shops</span>
                <span className="text-lg font-extrabold text-primary">UGX {r.amount}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHO SHOULD BECOME AN AGENT — image + text grid like portfolio */}
      <section className="mx-auto max-w-6xl px-4 py-20 grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Who Should Become an Agent
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            You know people who sell things. Market traders. Home-based sellers. Fashion girls. Food vendors. Salon owners.
            If they sell anything, they need Afristall — and{" "}
            <span className="font-semibold text-foreground">you get paid for introducing them.</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {audiences.map((t) => (
              <span key={t} className="rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground">{t}</span>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            No tech skills needed. No money to start. Just your phone and the people you already know.
          </p>
        </div>
        <div className="flex justify-center">
          <img
            src={agentHeroWoman}
            alt="Excited Afristall agent"
            className="w-60 sm:w-72 object-contain drop-shadow-2xl"
          />
        </div>
      </section>

      {/* WHAT SELLERS GET */}
      <section className="bg-card/60">
        <div className="mx-auto max-w-6xl px-4 py-20 grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">What Your Sellers Get</h2>
          </div>
          <div className="md:col-span-2 grid sm:grid-cols-3 gap-4">
            {[
              { icon: Store, title: "Free Online Shop", desc: "Their own page at afristall.com/theirname" },
              { icon: Users, title: "Direct WhatsApp Orders", desc: "Customers order straight to their WhatsApp" },
              { icon: Zap, title: "Zero Commission", desc: "No fees taken. Ever. It's completely free." },
            ].map((item) => (
              <Card key={item.title} className="border-border/50">
                <CardContent className="p-5 space-y-3">
                  <item.icon className="h-5 w-5 text-primary" />
                  <h3 className="font-bold text-sm">{item.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* COMPLETE SHOP CHECKLIST */}
      <section className="mx-auto max-w-6xl px-4 py-20 grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            What a Complete Shop Looks Like
          </h2>
          <p className="text-sm text-muted-foreground">
            That's it. Simple for your seller. <span className="font-bold text-primary">2,000 UGX</span> for you.
          </p>
        </div>
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
      </section>

      {/* FINAL CTA */}
      <section className="bg-foreground text-background">
        <div className="mx-auto max-w-6xl px-4 py-24 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Ready to Start?</h2>
          <p className="text-sm opacity-70 max-w-md mx-auto leading-relaxed">
            There are sellers in your area right now who need this. Every day you wait is money you're not earning.
          </p>
          <Link to="/agent-signup">
            <Button size="lg" className="gap-2 text-base font-bold mt-2">
              Join the Agent Programme — Free <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <p className="text-xs opacity-50 pt-3">
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
