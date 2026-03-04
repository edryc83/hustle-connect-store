import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Store, ShoppingBag, Share2, Copy, Check, Star } from "lucide-react";
import { formatPrice } from "@/lib/currency";
import AfristallLogo from "@/components/AfristallLogo";
import { ProductImageCarousel } from "@/components/storefront/ProductImageCarousel";
import { StorefrontHeader } from "@/components/storefront/StorefrontHeader";
import { VisitorNameModal } from "@/components/storefront/VisitorNameModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Tables } from "@/integrations/supabase/types";

type Product = Tables<"products">;
type Profile = Tables<"profiles">;

function ShareButton({ storeName, storeSlug }: { storeName: string; storeSlug: string }) {
  const [copied, setCopied] = useState(false);
  const storeUrl = `${window.location.origin}/${storeSlug}`;
  const shareText = `Check out ${storeName} on Afristall!`;

  const copyLink = async () => {
    await navigator.clipboard.writeText(storeUrl);
    setCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsApp = () => window.open(`https://wa.me/?text=${encodeURIComponent(`${shareText}\n${storeUrl}`)}`, "_blank");
  const shareFacebook = () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(storeUrl)}`, "_blank");
  const shareTwitter = () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(storeUrl)}`, "_blank");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="shrink-0 rounded-full">
          <Share2 className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={copyLink} className="gap-2">
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          Copy link
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareWhatsApp} className="gap-2">
          <span className="text-base leading-none">💬</span> WhatsApp
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareFacebook} className="gap-2">
          <span className="text-base leading-none">📘</span> Facebook
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareTwitter} className="gap-2">
          <span className="text-base leading-none">𝕏</span> Twitter / X
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ProductCard({
  product,
  images,
  currency,
  onClick,
}: {
  product: Product;
  images: string[];
  currency: string;
  onClick: () => void;
}) {
  return (
    <Card
      className="group cursor-pointer overflow-hidden border-0 shadow-sm transition-all hover:shadow-lg hover:-translate-y-0.5"
      onClick={onClick}
    >
      <div className="relative aspect-square bg-muted rounded-t-xl overflow-hidden">
        <ProductImageCarousel
          images={images}
          alt={product.name}
          listingType={product.listing_type}
        />
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.is_featured && (
            <Badge className="text-[10px] px-1.5 py-0 bg-primary text-primary-foreground shadow-sm">
              <Star className="h-2.5 w-2.5 mr-0.5 fill-current" /> Featured
            </Badge>
          )}
          {product.listing_type === "service" && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 shadow-sm">Package</Badge>
          )}
          {product.condition && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-background/90 shadow-sm">
              {product.condition === "new" ? "New" : product.condition === "used" ? "Used" : "Refurbished"}
            </Badge>
          )}
        </div>
      </div>
      <CardContent className="p-3 space-y-0.5">
        <p className="font-semibold text-sm truncate">{product.name}</p>
        {(product as any).discount_price ? (
          <div className="flex items-center gap-1.5">
            <p className="text-primary font-bold text-sm">{formatPrice(Number((product as any).discount_price), currency)}</p>
            <p className="text-xs text-muted-foreground line-through">{formatPrice(Number(product.price), currency)}</p>
          </div>
        ) : (
          <p className="text-primary font-bold text-sm">{formatPrice(Number(product.price), currency)}</p>
        )}
        {product.variants_text && (
          <p className="text-xs text-muted-foreground truncate">
            {product.variants_text}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

const Storefront = () => {
  const { storeSlug, productId } = useParams<{ storeSlug: string; productId?: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [productImagesMap, setProductImagesMap] = useState<Record<string, string[]>>({});
  const [visitorName, setVisitorName] = useState<string | null>(null);
  const [showNameModal, setShowNameModal] = useState(false);

  // Load visitor name from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(`visitor_name_${storeSlug}`);
    if (stored) {
      setVisitorName(stored);
    } else {
      // Show modal after a short delay so page loads first
      const timer = setTimeout(() => setShowNameModal(true), 800);
      return () => clearTimeout(timer);
    }
  }, [storeSlug]);

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

      supabase.rpc("increment_store_views", { slug: storeSlug! }).then(() => {});

      const { data: prods } = await supabase.from("products").select("*").eq("user_id", prof.id).order("created_at", { ascending: false });

      const productIds = (prods ?? []).map((p) => p.id);
      const { data: imgs } = productIds.length > 0
        ? await supabase.from("product_images").select("*").in("product_id", productIds).order("position", { ascending: true })
        : { data: [] };

      setProducts(prods ?? []);

      const imgMap: Record<string, string[]> = {};
      const productIdSet = new Set((prods ?? []).map((p) => p.id));
      (imgs ?? []).forEach((img) => {
        if (productIdSet.has(img.product_id)) {
          if (!imgMap[img.product_id]) imgMap[img.product_id] = [];
          imgMap[img.product_id].push(img.image_url);
        }
      });
      (prods ?? []).forEach((p) => {
        if (p.image_url && (!imgMap[p.id] || imgMap[p.id].length === 0)) {
          imgMap[p.id] = [p.image_url];
        }
      });
      setProductImagesMap(imgMap);
      setLoading(false);
    };

    fetchStore();
  }, [storeSlug]);

  const handleVisitorName = (name: string) => {
    localStorage.setItem(`visitor_name_${storeSlug}`, name);
    setVisitorName(name);
    setShowNameModal(false);
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
          <Link to="/">Go to Afristall</Link>
        </Button>
      </div>
    );
  }

  const currency = profile.currency ?? "UGX";
  const featured = products.filter((p) => p.is_featured);
  const nonFeatured = products.filter((p) => !p.is_featured);

  // Product detail view
  const viewProduct = productId ? products.find((p) => p.id === productId) : null;

  if (viewProduct) {
    const imgs = productImagesMap[viewProduct.id] ?? (viewProduct.image_url ? [viewProduct.image_url] : []);
    const variants = viewProduct.variants_text?.split(",").map((v) => v.trim()).filter(Boolean) ?? [];

    return (
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
            <button onClick={() => navigate(`/${storeSlug}`)} className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-1">
              ← Back
            </button>
            <h1 className="text-sm font-semibold truncate max-w-[200px]">{viewProduct.name}</h1>
            <ShareButton storeName={profile.store_name ?? "Store"} storeSlug={storeSlug ?? ""} />
          </div>
        </header>

        <main className="mx-auto max-w-2xl px-4 py-6 space-y-6">
          <div className="aspect-square rounded-2xl overflow-hidden bg-muted">
            <ProductImageCarousel images={imgs} alt={viewProduct.name} listingType={viewProduct.listing_type} />
          </div>

          {imgs.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {imgs.map((url, i) => (
                <img key={i} src={url} alt="" className="h-16 w-16 rounded-lg object-cover border-2 border-border shrink-0" />
              ))}
            </div>
          )}

          <div>
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-2xl font-bold">{viewProduct.name}</h2>
              <div className="text-right shrink-0">
                {(viewProduct as any).discount_price ? (
                  <>
                    <p className="text-2xl font-bold text-primary">{formatPrice(Number((viewProduct as any).discount_price), currency)}</p>
                    <p className="text-sm text-muted-foreground line-through">{formatPrice(Number(viewProduct.price), currency)}</p>
                  </>
                ) : (
                  <p className="text-2xl font-bold text-primary">{formatPrice(Number(viewProduct.price), currency)}</p>
                )}
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              {viewProduct.listing_type === "service" && <Badge variant="secondary">Package</Badge>}
              {viewProduct.condition && (
                <Badge variant="outline">
                  {viewProduct.condition === "new" ? "New" : viewProduct.condition === "used" ? "Used" : "Refurbished"}
                </Badge>
              )}
              {(viewProduct as any).discount_price && (
                <Badge className="bg-green-500/10 text-green-700 border-green-300 text-xs">
                  {Math.round((1 - Number((viewProduct as any).discount_price) / Number(viewProduct.price)) * 100)}% OFF
                </Badge>
              )}
            </div>
          </div>

          {variants.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Options</p>
              <div className="flex flex-wrap gap-2">
                {variants.map((v) => (
                  <span key={v} className="rounded-full border px-3 py-1 text-sm text-muted-foreground">{v}</span>
                ))}
              </div>
            </div>
          )}

          {viewProduct.description && (
            <div>
              <p className="text-sm font-medium mb-1">Description</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{viewProduct.description}</p>
            </div>
          )}

          <Button
            size="lg"
            className="w-full gap-2 text-base"
            onClick={() => {
              const cleanNumber = (profile.whatsapp_number ?? "").replace(/[^0-9+]/g, "");
              const message = `🛒 Hi! I'd like to order *${viewProduct.name}* (${formatPrice(Number(viewProduct.price), currency)}) from your Afristall store.`;
              supabase.from("orders").insert({
                seller_id: profile.id,
                product_id: viewProduct.id,
                product_name: viewProduct.name,
                quantity: 1,
                total: Number(viewProduct.price),
                customer_name: visitorName || "Store visitor",
                customer_phone: visitorName || "WhatsApp order",
              } as any).then(() => {});
              supabase.rpc("increment_whatsapp_taps", { p_id: viewProduct.id }).then(() => {});
              window.open(`https://wa.me/${cleanNumber.replace("+", "")}?text=${encodeURIComponent(message)}`, "_blank");
            }}
          >
            <span className="text-lg">💬</span>
            Order via WhatsApp
          </Button>

          <div className="border-t pt-4">
            <Link to={`/${storeSlug}`} className="flex items-center gap-3">
              {profile.profile_picture_url ? (
                <img src={profile.profile_picture_url} alt="" className="h-10 w-10 rounded-full object-cover border" />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <AfristallLogo className="h-5 w-5" />
                </div>
              )}
              <div>
                <p className="text-sm font-semibold">{profile.store_name}</p>
                <p className="text-xs text-muted-foreground">View all listings →</p>
              </div>
            </Link>
          </div>
        </main>

        <footer className="border-t bg-background py-4 text-center">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <AfristallLogo className="h-4 w-4" />
            Powered by <span className="font-semibold">Afri<span className="text-primary">stall</span></span>
          </Link>
        </footer>
      </div>
    );
  }

  // Shop view
  return (
    <div className="min-h-screen bg-background">
      {/* Visitor Name Modal */}
      <VisitorNameModal
        open={showNameModal}
        storeName={profile.store_name ?? "this store"}
        onSubmit={handleVisitorName}
      />

      {/* Share button floating top-right */}
      <div className="fixed top-4 right-4 z-30">
        <ShareButton storeName={profile.store_name ?? "Store"} storeSlug={storeSlug ?? ""} />
      </div>

      {/* Header with profile pic, name, greeting */}
      <StorefrontHeader profile={profile} visitorName={visitorName} />

      {/* Products */}
      <main className="mx-auto max-w-5xl px-4 py-6 space-y-8">
        {products.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <ShoppingBag className="h-12 w-12 text-muted-foreground/40" />
            <p className="text-lg font-medium">No products yet</p>
            <p className="text-sm text-muted-foreground">This store hasn't added any products.</p>
          </div>
        ) : (
          <>
            {featured.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Star className="h-5 w-5 text-primary fill-primary" />
                  <h2 className="text-lg font-bold">Featured</h2>
                </div>
                <div className="grid gap-4 grid-cols-2 sm:grid-cols-3">
                  {featured.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      images={productImagesMap[product.id] ?? (product.image_url ? [product.image_url] : [])}
                      currency={currency}
                      onClick={() => navigate(`/${storeSlug}/${product.id}`)}
                    />
                  ))}
                </div>
              </section>
            )}

            <section>
              <h2 className="text-lg font-bold mb-4">
                {featured.length > 0 ? "All Listings" : `${products.length} listing${products.length !== 1 ? "s" : ""}`}
              </h2>
              <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
                {(featured.length > 0 ? nonFeatured : products).map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    images={productImagesMap[product.id] ?? (product.image_url ? [product.image_url] : [])}
                    currency={currency}
                    onClick={() => navigate(`/${storeSlug}/${product.id}`)}
                  />
                ))}
              </div>
            </section>
          </>
        )}
      </main>

      <footer className="border-t bg-background py-4 text-center">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <AfristallLogo className="h-4 w-4" />
          Powered by <span className="font-semibold">Afri<span className="text-primary">stall</span></span>
        </Link>
      </footer>
    </div>
  );
};

export default Storefront;
