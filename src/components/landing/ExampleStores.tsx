import { useRef, useState, useEffect } from "react";
import { MapPin } from "lucide-react";

const stores = [
  { name: "Mama Aisha's Kitchen", category: "Food & Drinks", city: "Kampala", emoji: "🍲", color: "from-amber-500/20 to-orange-500/10" },
  { name: "StyleHaus Nairobi", category: "Fashion", city: "Nairobi", emoji: "👗", color: "from-pink-500/20 to-rose-500/10" },
  { name: "GlowUp Beauty", category: "Beauty", city: "Lagos", emoji: "✨", color: "from-purple-500/20 to-violet-500/10" },
  { name: "TechZone Accra", category: "Electronics", city: "Accra", emoji: "📱", color: "from-blue-500/20 to-cyan-500/10" },
];

const ExampleStores = () => {
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
      const cardWidth = el.offsetWidth * 0.72;
      const idx = Math.round(el.scrollLeft / cardWidth);
      setActiveIndex(Math.min(idx, stores.length - 1));
    };
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section ref={sectionRef} className="py-8 sm:py-16 bg-secondary/30">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <h2 className="text-xl font-bold sm:text-3xl text-foreground">
            Stores on Afristall
          </h2>
          <p className="mt-1 text-muted-foreground text-sm sm:text-base">
            Join sellers across Africa
          </p>
        </div>

        {/* Desktop grid */}
        <div className="mt-8 hidden sm:grid gap-5 grid-cols-2 lg:grid-cols-4">
          {stores.map((store, i) => (
            <div
              key={store.name}
              className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <StoreCard store={store} isActive={true} />
            </div>
          ))}
        </div>

        {/* Mobile horizontal scroll */}
        <div
          ref={scrollRef}
          className="mt-6 sm:hidden flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2 -mx-4 px-4"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {stores.map((store, i) => (
            <div
              key={store.name}
              className={`snap-center shrink-0 w-[72%] transition-all duration-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <StoreCard store={store} isActive={i === activeIndex} />
            </div>
          ))}
        </div>

        {/* Dot indicators — mobile only */}
        <div className="flex sm:hidden items-center justify-center gap-2 mt-4">
          {stores.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                const el = scrollRef.current;
                if (el) {
                  const cardWidth = el.offsetWidth * 0.72;
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

const StoreCard = ({ store, isActive }: { store: typeof stores[number]; isActive: boolean }) => (
  <div
    className={`relative overflow-hidden rounded-2xl bg-card border border-border/50 h-full transition-all duration-300 ${
      isActive ? "scale-100 shadow-lg" : "scale-[0.97] opacity-80"
    }`}
  >
    <div className={`absolute inset-0 bg-gradient-to-br ${store.color} opacity-60`} />
    <div className="relative z-10">
      <div className={`flex h-24 items-center justify-center text-5xl transition-transform duration-300 ${isActive ? "scale-110" : ""}`}>
        {store.emoji}
      </div>
      <div className="p-4 bg-card/80 backdrop-blur-sm">
        <h3 className="font-semibold text-foreground text-sm truncate">{store.name}</h3>
        <div className="mt-1 flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {store.city}
          </div>
          <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
            {store.category}
          </span>
        </div>
      </div>
    </div>
  </div>
);

export default ExampleStores;
