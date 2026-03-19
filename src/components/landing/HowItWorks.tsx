import { useRef, useState, useEffect } from "react";

const steps = [
  {
    title: "Create your store",
    description: "Sign up and set up your storefront in under 2 minutes.",
    emoji: "🏪",
    color: "from-orange-500/20 to-orange-600/10",
  },
  {
    title: "Add your products",
    description: "Upload photos, set prices, and describe what you sell.",
    emoji: "📦",
    color: "from-blue-500/20 to-blue-600/10",
  },
  {
    title: "Share your link",
    description: "Orders come straight to your WhatsApp.",
    emoji: "🚀",
    color: "from-green-500/20 to-green-600/10",
  },
];

const HowItWorks = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handleScroll = () => {
      const scrollLeft = el.scrollLeft;
      const cardWidth = el.offsetWidth * 0.85;
      const idx = Math.round(scrollLeft / cardWidth);
      setActiveIndex(Math.min(idx, steps.length - 1));
    };
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section ref={sectionRef} className="relative py-12 sm:py-24 overflow-hidden">
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
        <div className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <h2 className="text-xl font-bold sm:text-3xl text-foreground">
            How it works
          </h2>
          <p className="mt-1 text-muted-foreground text-sm sm:text-base">
            Three simple steps to start selling
          </p>
        </div>

        {/* Desktop grid */}
        <div className="mt-8 hidden sm:grid gap-6 sm:grid-cols-3">
          {steps.map((step, i) => (
            <div
              key={i}
              className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{ transitionDelay: `${i * 150}ms` }}
            >
              <StepCard step={step} index={i} isActive={true} />
            </div>
          ))}
        </div>

        {/* Mobile horizontal scroll */}
        <div
          ref={scrollRef}
          className="mt-6 sm:hidden flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2 -mx-4 px-4"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {steps.map((step, i) => (
            <div
              key={i}
              className={`snap-center shrink-0 w-[85%] transition-all duration-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <StepCard step={step} index={i} isActive={i === activeIndex} />
            </div>
          ))}
        </div>

        {/* Dot indicators — mobile only */}
        <div className="flex sm:hidden items-center justify-center gap-2 mt-4">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                const el = scrollRef.current;
                if (el) {
                  const cardWidth = el.offsetWidth * 0.85;
                  el.scrollTo({ left: i * cardWidth, behavior: "smooth" });
                }
              }}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === activeIndex ? "w-6 bg-primary" : "w-2 bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

const StepCard = ({ step, index, isActive }: { step: typeof steps[number]; index: number; isActive: boolean }) => (
  <div
    className={`relative rounded-2xl bg-card border border-border/50 p-5 h-full transition-all duration-300 ${
      isActive ? "scale-100 shadow-lg" : "scale-[0.97] opacity-80"
    }`}
  >
    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${step.color} opacity-50`} />
    <div className="relative z-10">
      <div className="flex items-start gap-4">
        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-background/80 backdrop-blur text-3xl shadow-sm transition-transform duration-300 ${isActive ? "scale-110" : ""}`}>
          {step.emoji}
        </div>
        <div className="flex-1 pt-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {index + 1}
            </span>
            <h3 className="font-semibold text-foreground">{step.title}</h3>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
        </div>
      </div>
    </div>
  </div>
);

export default HowItWorks;
