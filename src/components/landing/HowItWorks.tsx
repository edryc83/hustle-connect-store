import { useRef, useState, useEffect } from "react";
import { Store, PackagePlus, Share2 } from "lucide-react";

const steps = [
  {
    icon: Store,
    title: "Create your store",
    description: "Sign up, pick a name, and set up your storefront in under 2 minutes.",
    emoji: "🏪",
  },
  {
    icon: PackagePlus,
    title: "Add your products",
    description: "Upload photos, set prices, and describe what you sell. Simple as that.",
    emoji: "📦",
  },
  {
    icon: Share2,
    title: "Share your link",
    description: "Send your store link to customers. Orders come straight to your WhatsApp.",
    emoji: "🚀",
  },
];

const HowItWorks = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handleScroll = () => {
      const scrollLeft = el.scrollLeft;
      const cardWidth = el.offsetWidth * 0.78;
      const idx = Math.round(scrollLeft / cardWidth);
      setActiveIndex(Math.min(idx, steps.length - 1));
    };
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="relative py-16 sm:py-24 overflow-hidden">
      <div className="absolute inset-0 bg-secondary/30" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-center text-2xl font-bold sm:text-3xl text-foreground">
          How it works
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-center text-muted-foreground text-sm sm:text-base">
          Three steps to start selling online — no technical skills needed.
        </p>

        {/* Desktop grid */}
        <div className="mt-12 hidden sm:grid gap-6 sm:grid-cols-3">
          {steps.map((step, i) => (
            <StepCard key={i} step={step} index={i} />
          ))}
        </div>

        {/* Mobile swipable */}
        <div
          ref={scrollRef}
          className="mt-8 sm:hidden flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 -mx-4 px-4"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {steps.map((step, i) => (
            <div key={i} className="snap-center shrink-0 w-[78%]">
              <StepCard step={step} index={i} />
            </div>
          ))}
        </div>

        {/* Dot indicators — mobile only */}
        <div className="flex sm:hidden items-center justify-center gap-2 mt-4">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === activeIndex ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

const StepCard = ({ step, index }: { step: typeof steps[number]; index: number }) => (
  <div className="group relative rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl p-6 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300 h-full">
    <div className="absolute inset-0 rounded-2xl bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    <div className="relative z-10 flex flex-col items-center text-center">
      <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4 sm:mb-5 text-2xl sm:text-3xl group-hover:scale-110 transition-transform duration-300">
        {step.emoji}
      </div>
      <div className="mb-1 text-sm font-bold text-primary">Step {index + 1}</div>
      <h3 className="text-base sm:text-lg font-semibold text-foreground">{step.title}</h3>
      <p className="mt-2 text-muted-foreground text-sm max-w-xs">{step.description}</p>
    </div>
  </div>
);

export default HowItWorks;
