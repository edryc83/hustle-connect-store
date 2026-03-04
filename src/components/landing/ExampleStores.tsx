import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin } from "lucide-react";

const stores = [
  {
    name: "Mama Aisha's Kitchen",
    category: "Food & Drinks",
    city: "Kampala",
    image: "🍲",
  },
  {
    name: "StyleHaus Nairobi",
    category: "Fashion & Clothes",
    city: "Nairobi",
    image: "👗",
  },
  {
    name: "GlowUp Beauty",
    category: "Beauty & Skincare",
    city: "Lagos",
    image: "✨",
  },
  {
    name: "TechZone Accra",
    category: "Phones & Electronics",
    city: "Accra",
    image: "📱",
  },
];

const ExampleStores = () => (
  <section className="py-16 sm:py-24">
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <h2 className="text-center text-2xl font-bold sm:text-3xl text-foreground">
        Stores already on AfroDuka
      </h2>
      <p className="mx-auto mt-3 max-w-lg text-center text-muted-foreground">
        Join hundreds of sellers across Africa who are reaching more customers.
      </p>

      <div className="mt-12 grid gap-5 grid-cols-2 lg:grid-cols-4">
        {stores.map((store) => (
          <Card key={store.name} className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex h-28 items-center justify-center bg-secondary text-5xl">
              {store.image}
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold text-foreground text-sm sm:text-base truncate">{store.name}</h3>
              <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {store.city}
              </div>
              <Badge variant="secondary" className="mt-2 text-xs">
                {store.category}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </section>
);

export default ExampleStores;
