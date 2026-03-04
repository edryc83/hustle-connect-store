import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";

const stores = [
  { name: "Mama Aisha's Kitchen", category: "Food & Drinks", city: "Kampala", image: "🍲" },
  { name: "StyleHaus Nairobi", category: "Fashion & Clothes", city: "Nairobi", image: "👗" },
  { name: "GlowUp Beauty", category: "Beauty & Skincare", city: "Lagos", image: "✨" },
  { name: "TechZone Accra", category: "Phones & Electronics", city: "Accra", image: "📱" },
];

const ExampleStores = () => (
  <section className="py-16 sm:py-24">
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <h2 className="text-center text-2xl font-bold sm:text-3xl text-foreground">
        Stores already on Afristall
      </h2>
      <p className="mx-auto mt-3 max-w-lg text-center text-muted-foreground">
        Join hundreds of sellers across Africa who are reaching more customers.
      </p>

      <div className="mt-12 grid gap-5 grid-cols-2 lg:grid-cols-4">
        {stores.map((store) => (
          <div
            key={store.name}
            className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300 cursor-pointer"
          >
            {/* Glow on hover */}
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="relative z-10">
              <div className="flex h-28 items-center justify-center bg-secondary/50 text-5xl group-hover:scale-110 transition-transform duration-300">
                {store.image}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-foreground text-sm sm:text-base truncate">{store.name}</h3>
                <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {store.city}
                </div>
                <Badge variant="secondary" className="mt-2 text-xs">
                  {store.category}
                </Badge>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default ExampleStores;
