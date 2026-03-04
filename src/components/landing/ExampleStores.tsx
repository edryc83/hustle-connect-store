import { useRef, useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";

const stores = [
  { name: "Mama Aisha's Kitchen", category: "Food & Drinks", city: "Kampala", image: "🍲" },
  { name: "StyleHaus Nairobi", category: "Fashion & Clothes", city: "Nairobi", image: "👗" },
  { name: "GlowUp Beauty", category: "Beauty & Skincare", city: "Lagos", image: "✨" },
  { name: "TechZone Accra", category: "Phones & Electronics", city: "Accra", image: "📱" },
];

const ExampleStores = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handleScroll = () => {
      const cardWidth = el.offsetWidth * 0.65;
      const idx = Math.round(el.scrollLeft / cardWidth);
      setActiveIndex(Math.min(idx, stores.length - 1));
    };
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-center text-2xl font-bold sm:text-3xl text-foreground">
          Stores already on Afristall
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-center text-muted-foreground text-sm sm:text-base">
          Join hundreds of sellers across Africa who are reaching more customers.
        </p>

        {/* Desktop grid */}
        <div className="mt-12 hidden sm:grid gap-5 grid-cols-2 lg:grid-cols-4">
          {stores.map((store) => (
            <StoreCard key={store.name} store={store} />
          ))}
        </div>

        {/* Mobile swipable */}
        <div
          ref={scrollRef}
          className="mt-8 sm:hidden flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 -mx-4 px-4"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {stores.map((store) => (
            <div key={store.name} className="snap-center shrink-0 w-[65%]">
              <StoreCard store={store} />
            </div>
          ))}
        </div>

        {/* Dot indicators — mobile only */}
        <div className="flex sm:hidden items-center justify-center gap-2 mt-3">
          {stores.map((_, i) => (
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

const StoreCard = ({ store }: { store: typeof stores[number] }) => (
  <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300 cursor-pointer h-full">
    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    <div className="relative z-10">
      <div className="flex h-24 sm:h-28 items-center justify-center bg-secondary/50 text-4xl sm:text-5xl group-hover:scale-110 transition-transform duration-300">
        {store.image}
      </div>
      <div className="p-3 sm:p-4">
        <h3 className="font-semibold text-foreground text-sm truncate">{store.name}</h3>
        <div className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />
          {store.city}
        </div>
        <Badge variant="secondary" className="mt-1.5 text-xs">
          {store.category}
        </Badge>
      </div>
    </div>
  </div>
);

export default ExampleStores;
