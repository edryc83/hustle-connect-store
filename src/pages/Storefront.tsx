import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Store, MapPin, ImageIcon, ShoppingBag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OrderModal } from "@/components/storefront/OrderModal";
import type { Tables } from "@/integrations/supabase/types";

type Product = Tables<"products">;
type Profile = Tables<"profiles">;

const Storefront = () => {
  const { storeSlug } = useParams<{ storeSlug: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [orderOpen, setOrderOpen] = useState(false);

  useEffect(() => {
    const fetchStore = async () => {
      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .eq("store_slug", storeSlug)
        .single();

      if (!prof) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setProfile(prof);

      const { data: prods } = await supabase
        .from("products")
        .select("*")
        .eq("user_id", prof.id)
        .order("created_at", { ascending: false });

      setProducts(prods ?? []);
      setLoading(false);
    };

    fetchStore();
  }, [storeSlug]);

  const openOrder = (product: Product) => {
    setSelectedProduct(product);
    setOrderOpen(true);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading store…</div>
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <Store className="h-12 w-12 text-muted-foreground/40" />
        <h1 className="text-2xl font-bold">Store not found</h1>
        <p className="text-muted-foreground">The store you're looking for doesn't exist.</p>
        <Button asChild variant="outline">
          <Link to="/">Go to AfroDuka</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      {/* Header */}
      <header className="bg-background border-b">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:py-8">
          <div className="flex items-center gap-4">
            {profile.profile_picture_url ? (
              <img
                src={profile.profile_picture_url}
                alt={profile.store_name ?? "Store"}
                className="h-16 w-16 rounded-full object-cover border-2 border-primary/20"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Store className="h-7 w-7 text-primary" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold">{profile.store_name}</h1>
              <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                {profile.city && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> {profile.city}
                  </span>
                )}
                {profile.category && (
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                    {profile.category}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Products */}
      <main className="mx-auto max-w-5xl px-4 py-6">
        {products.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <ShoppingBag className="h-12 w-12 text-muted-foreground/40" />
            <p className="text-lg font-medium">No products yet</p>
            <p className="text-sm text-muted-foreground">This store hasn't added any products.</p>
          </div>
        ) : (
          <>
            <p className="mb-4 text-sm text-muted-foreground">
              {products.length} product{products.length !== 1 ? "s" : ""}
            </p>
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
              {products.map((product) => (
                <Card
                  key={product.id}
                  className="group cursor-pointer overflow-hidden transition-shadow hover:shadow-md"
                  onClick={() => openOrder(product)}
                >
                  <div className="relative aspect-square bg-muted">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-3">
                    <p className="font-medium text-sm truncate">{product.name}</p>
                    <p className="text-primary font-bold text-sm">
                      UGX {Number(product.price).toLocaleString()}
                    </p>
                    {product.variants_text && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {product.variants_text}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-background py-4 text-center">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <Store className="h-4 w-4 text-primary" />
          Powered by <span className="font-semibold">Afro<span className="text-primary">Duka</span></span>
        </Link>
      </footer>

      {/* Order Modal */}
      <OrderModal
        product={selectedProduct}
        whatsappNumber={profile.whatsapp_number ?? ""}
        storeName={profile.store_name ?? ""}
        open={orderOpen}
        onOpenChange={setOrderOpen}
      />
    </div>
  );
};

export default Storefront;
