import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import EmojiGrid from "./EmojiGrid";

const HeroSection = () => (
  <section className="relative overflow-hidden py-20 sm:py-28 lg:py-36">
    {/* Emoji grid background */}
    <EmojiGrid />

    {/* Gradient orbs */}
    <div className="pointer-events-none absolute -top-40 -left-20 h-[500px] w-[500px] rounded-full bg-primary/8 blur-[100px]" />
    <div className="pointer-events-none absolute -bottom-32 right-0 h-[400px] w-[400px] rounded-full bg-primary/6 blur-[80px]" />

    <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 text-center">
      {/* Glass pill badge */}
      <div className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-card/60 backdrop-blur-xl px-4 py-1.5 text-sm font-medium text-muted-foreground mb-8 shadow-sm">
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        Free to start — no fees, no fuss
      </div>

      <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-foreground leading-[1.1]">
        Your shop. Your WhatsApp.
        <br />
        <span className="text-primary">Your hustle.</span>
      </h1>

      <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl leading-relaxed">
        Create your online storefront in minutes, add your products, and let customers order directly on WhatsApp. No complicated setup — just share your link and start selling.
      </p>

      <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Link to="/signup">
          <Button size="lg" className="gap-2 text-base px-8 h-12 shadow-lg shadow-primary/20">
            Create Your Store
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
        <Link to="/explore">
          <Button variant="outline" size="lg" className="text-base px-8 h-12 border-border/50 bg-card/40 backdrop-blur-sm">
            Explore Stores
          </Button>
        </Link>
      </div>
    </div>
  </section>
);

export default HeroSection;
