import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

const HeroSection = () => (
  <section className="relative overflow-hidden py-16 sm:py-24 lg:py-32">
    {/* Subtle background accent */}
    <div className="pointer-events-none absolute -top-40 right-0 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />

    <div className="mx-auto max-w-6xl px-4 sm:px-6 text-center">
      <div className="inline-flex items-center gap-1.5 rounded-full border bg-secondary px-3 py-1 text-sm font-medium text-muted-foreground mb-6">
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        Free to start — no fees, no fuss
      </div>

      <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-foreground leading-tight">
        Your shop. Your WhatsApp.
        <br />
        <span className="text-primary">Your hustle.</span>
      </h1>

      <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
        Create your online storefront in minutes, add your products, and let customers order directly on WhatsApp. No complicated setup — just share your link and start selling.
      </p>

      <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Link to="/signup">
          <Button size="lg" className="gap-2 text-base px-8 h-12">
            Create Your Store
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
        <Link to="/explore">
          <Button variant="outline" size="lg" className="text-base px-8 h-12">
            Explore Stores
          </Button>
        </Link>
      </div>
    </div>
  </section>
);

export default HeroSection;
