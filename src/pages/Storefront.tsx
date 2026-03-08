import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Store, ShoppingBag, Share2, Copy, Check, Star, ShoppingCart, Sun, Moon, LayoutDashboard, Minus, Plus, Heart } from "lucide-react";
import { formatPrice } from "@/lib/currency";
import AfristallLogo from "@/components/AfristallLogo";
import { ProductImageCarousel } from "@/components/storefront/ProductImageCarousel";
import { StorefrontHeader } from "@/components/storefront/StorefrontHeader";

import { CartDrawer } from "@/components/storefront/CartDrawer";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { CartProvider, useCart } from "@/hooks/useCart";
import { WishlistProvider, useWishlist } from "@/hooks/useWishlist";
import { BuyerAttributePicker, ChatOnlyBanner } from "@/components/storefront/BuyerAttributePicker";
import { getAttributeSummary, getSelectableKeys, buildAttributeLines } from "@/lib/productAttributes";
import { StorefrontFilters, applyFilters, type FilterState } from "@/components/storefront/StorefrontFilters";
import { StoreAssistantButton } from "@/components/storefront/StoreAssistant";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Tables } from "@/integrations/supabase/types";

type Product = Tables<"products">;
type Profile = Tables<"profiles">;

function ShareButton({ storeName, storeSlug }: { storeName: string; storeSlug: string }) {
  const [copied, setCopied] = useState(false);
  const storeUrl = `https://afristall.com/${storeSlug}`;
  const shareText = `🛍️ Check out ${storeName} on Afristall — order directly on WhatsApp!`;

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

function getAttributeChips(product: Product): string[] {
  const attrs = (product as any).attributes as Record<string, any> | null;
  if (!attrs) return [];
  if (attrs.chat_only) return ["💬 Chat to order"];
  const summary = getAttributeSummary(attrs);
  return summary ? summary.split("  •  ").slice(0, 3) : [];
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
  const { addItem } = useCart();
  const { toggle, isWished } = useWishlist();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    const imageUrl = images[0] || product.image_url || undefined;
    addItem(product, imageUrl);
  };

  const displayPrice = (product as any).discount_price ?? product.price;
  const hasDiscount = !!(product as any).discount_price;
  const discountPercent = hasDiscount
    ? Math.round((1 - Number((product as any).discount_price) / Number(product.price)) * 100)
    : 0;

  const attrChips = getAttributeChips(product);

  return (
    <div
      className="group cursor-pointer rounded-2xl border border-border/60 bg-card p-1.5 shadow-sm hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      {/* Framed Image */}
      <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-muted/30 border border-border/40">
        <ProductImageCarousel
          images={images}
          alt={product.name}
          listingType={product.listing_type}
        />
        {/* Badges top-left */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.is_featured && (
            <Badge className="text-[10px] px-2 py-0.5 bg-foreground text-background shadow-sm rounded-full font-medium">
              <Star className="h-2.5 w-2.5 mr-0.5 fill-current" /> Featured
            </Badge>
          )}
          {hasDiscount && (
            <Badge className="text-[10px] px-2 py-0.5 bg-destructive text-destructive-foreground shadow-sm rounded-full font-medium">
              {discountPercent}% OFF
            </Badge>
          )}
          {product.listing_type === "service" && (
            <Badge variant="secondary" className="text-[10px] px-2 py-0.5 shadow-sm rounded-full">Service</Badge>
          )}
          {product.condition && product.condition !== "new" && (
            <Badge variant="outline" className="text-[10px] px-2 py-0.5 bg-background/90 shadow-sm rounded-full">
              {product.condition === "used" ? "Used" : "Refurbished"}
            </Badge>
          )}
        </div>
        {/* Wishlist heart top-right */}
        <button
          onClick={(e) => { e.stopPropagation(); toggle(product.id); }}
          className="absolute top-2 right-2 h-7 w-7 rounded-full bg-background/80 backdrop-blur flex items-center justify-center shadow-sm border border-border/40 hover:bg-background transition-colors"
          aria-label="Toggle wishlist"
        >
          <Heart className={`h-3.5 w-3.5 transition-colors ${isWished(product.id) ? "fill-destructive text-destructive" : "text-muted-foreground"}`} />
        </button>
      </div>

      {/* Info */}
      <div className="pt-2.5 px-0.5 space-y-1">
        <p className="font-semibold text-sm leading-tight truncate">{product.name}</p>
        {product.description && (
          <p className="text-[11px] text-muted-foreground line-clamp-1">{product.description}</p>
        )}
        {/* Attribute chips */}
        {attrChips.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {attrChips.map((chip) => (
              <span key={chip} className="rounded-full bg-muted/80 border border-border/40 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                {chip}
              </span>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between gap-1 pt-0.5">
          <div className="flex flex-col min-w-0">
            <p className="font-extrabold text-sm truncate">{formatPrice(Number(displayPrice), currency)}</p>
            {hasDiscount && (
              <p className="text-[10px] text-muted-foreground line-through shrink-0">{formatPrice(Number(product.price), currency)}</p>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            className="shrink-0 flex items-center gap-1 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-accent transition-colors"
          >
            Add <ShoppingCart className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
function ProductDetailView({
  product,
  images,
  variants,
  suggestions,
  productImagesMap,
  currency,
  profile,
  storeSlug,
  visitorName,
  onBack,
  onNavigate,
}: {
  product: Product;
  images: string[];
  variants: string[];
  suggestions: Product[];
  productImagesMap: Record<string, string[]>;
  currency: string;
  profile: Profile;
  storeSlug: string;
  visitorName: string | null;
  onBack: () => void;
  onNavigate: (id: string) => void;
}) {
  const { addItem } = useCart();
  const { toggle, isWished } = useWishlist();
  const [selectedImg, setSelectedImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [attrSelections, setAttrSelections] = useState<Record<string, string>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, boolean>>({});
  const [deliveryAddress, setDeliveryAddress] = useState("");

  const attrs = (product as any).attributes as Record<string, any> | null;
  const isChatOnly = attrs?.chat_only === true;
  const selectableKeys = attrs ? getSelectableKeys(attrs) : [];
  const hasAttributes = selectableKeys.length > 0;

  const handleAttrSelect = (key: string, value: string) => {
    setAttrSelections((prev) => ({ ...prev, [key]: value }));
    setValidationErrors((prev) => ({ ...prev, [key]: false }));
  };

  const validateSelections = (): boolean => {
    if (isChatOnly || !hasAttributes) return true;
    const errors: Record<string, boolean> = {};
    let valid = true;
    for (const key of selectableKeys) {
      if (!attrSelections[key]) {
        errors[key] = true;
        valid = false;
      }
    }
    setValidationErrors(errors);
    return valid;
  };

  const buildWhatsAppMessage = () => {
    const dp = Number(displayPrice);
    const productUrl = `https://afristall.com/${storeSlug}/${product.id}`;
    const lines: string[] = [
      `Hello, I would like to order:`,
      ``,
      `*${product.name}*${qty > 1 ? ` x${qty}` : ""}`,
      `Price: ${formatPrice(dp * qty, currency)}`,
    ];

    if (isChatOnly) {
      lines.push(``, `I'd like to discuss the details with you directly.`);
    } else if (hasAttributes && attrs) {
      const attrLines = buildAttributeLines(attrs, attrSelections);
      if (attrLines.length > 0) {
        lines.push(``, `📋 Order Details:`);
        lines.push(...attrLines);
      }
    }

    if (deliveryAddress.trim()) {
      lines.push(``, `📍 Delivery address: ${deliveryAddress.trim()}`);
    }
    lines.push(``, productUrl);

    return lines.join("\n");
  };

  const displayPrice = product.discount_price ?? product.price;
  const hasDiscount = !!product.discount_price;
  const discountPercent = hasDiscount
    ? Math.round((1 - Number(product.discount_price) / Number(product.price)) * 100)
    : 0;

  const handleAddToCart = () => {
    const imageUrl = images[0] || product.image_url || undefined;
    for (let i = 0; i < qty; i++) addItem(product, imageUrl);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
          <button onClick={onBack} className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-1">
            ← Back
          </button>
          <h1 className="text-sm font-semibold truncate max-w-[200px]">{product.name}</h1>
          <div className="flex items-center gap-2">
              <button
                onClick={() => toggle(product.id)}
                className="h-9 w-9 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
                aria-label="Toggle wishlist"
              >
                <Heart className={`h-4 w-4 transition-colors ${isWished(product.id) ? "fill-destructive text-destructive" : "text-muted-foreground"}`} />
              </button>
              <ShareButton storeName={profile.store_name ?? "Store"} storeSlug={storeSlug} />
            </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6 space-y-6">
        {/* Main Image */}
        <div className="aspect-square rounded-2xl overflow-hidden bg-muted border border-border/40 relative">
          {images.length > 0 ? (
            <>
              <img src={images[selectedImg]} alt="" className="absolute inset-0 h-full w-full object-cover scale-110 blur-2xl opacity-60" aria-hidden="true" />
              <img src={images[selectedImg]} alt={product.name} className="relative h-full w-full object-contain" />
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ShoppingBag className="h-12 w-12 text-muted-foreground/30" />
            </div>
          )}
        </div>

        {/* Thumbnail Strip */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {images.map((url, i) => (
              <button
                key={i}
                onClick={() => setSelectedImg(i)}
                className={`h-16 w-16 rounded-lg overflow-hidden border-2 shrink-0 transition-colors ${
                  i === selectedImg ? "border-primary ring-1 ring-primary/30" : "border-border hover:border-muted-foreground/40"
                }`}
              >
                <img src={url} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Product Info */}
        <div>
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-2xl font-bold">{product.name}</h2>
            <div className="text-right shrink-0">
              {hasDiscount ? (
                <>
                  <p className="text-2xl font-bold text-primary">{formatPrice(Number(displayPrice), currency)}</p>
                  <p className="text-sm text-muted-foreground line-through">{formatPrice(Number(product.price), currency)}</p>
                </>
              ) : (
                <p className="text-2xl font-bold text-primary">{formatPrice(Number(product.price), currency)}</p>
              )}
            </div>
          </div>
          <div className="flex gap-2 mt-2">
            {product.listing_type === "service" && <Badge variant="secondary">Service</Badge>}
            {product.condition && (
              <Badge variant="outline">
                {product.condition === "new" ? "New" : product.condition === "used" ? "Used" : "Refurbished"}
              </Badge>
            )}
            {hasDiscount && (
              <Badge className="bg-destructive/10 text-destructive border-destructive/30 text-xs">
                {discountPercent}% OFF
              </Badge>
            )}
          </div>
        </div>

        {/* Variants */}
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

        {/* Description */}
        {product.description && (
          <div>
            <p className="text-sm font-medium mb-1">Description</p>
            <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
          </div>
        )}

        {/* Dynamic Attribute Selectors */}
        {isChatOnly && (
          <ChatOnlyBanner />
        )}
        {hasAttributes && attrs && !isChatOnly && (
          <div className="rounded-2xl border border-border/60 bg-card p-4 space-y-4">
            <p className="text-sm font-semibold">Customize your order</p>
            <BuyerAttributePicker
              attributes={attrs}
              selections={attrSelections}
              onSelect={handleAttrSelect}
              validationErrors={validationErrors}
            />
          </div>
        )}

        {/* Quantity Controls + Add to Cart */}
        <div className="rounded-2xl border border-border/60 bg-card p-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Quantity</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="h-8 w-8 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="text-base font-semibold w-6 text-center">{qty}</span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="h-8 w-8 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total</span>
            <span className="font-bold text-lg">{formatPrice(Number(displayPrice) * qty, currency)}</span>
          </div>

          {/* Delivery Address */}
          <div className="space-y-1.5">
            <Label htmlFor="deliveryAddr" className="text-sm font-medium">Delivery address (optional)</Label>
            <Textarea
              id="deliveryAddr"
              placeholder="Where should we deliver? e.g. Plot 12, Kampala Road"
              rows={2}
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              className="text-sm"
            />
          </div>

          <div className="flex gap-3">
            <Button
              size="lg"
              className="flex-1 gap-2 text-base"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="h-5 w-5" />
              Add to Cart
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="gap-2 text-base"
              onClick={() => {
                // Validate required attribute selections
                if (!validateSelections()) {
                  toast.error("Please select all required options before ordering");
                  return;
                }

                const cleanNumber = (profile.whatsapp_number ?? "").replace(/[^0-9+]/g, "");
                const message = buildWhatsAppMessage();
                supabase.from("orders").insert({
                  seller_id: profile.id,
                  product_id: product.id,
                  product_name: product.name,
                  quantity: qty,
                  total: Number(displayPrice) * qty,
                  customer_name: visitorName || "Store visitor",
                  customer_phone: visitorName || "WhatsApp order",
                  delivery_address: deliveryAddress.trim() || null,
                } as any).then(() => {});
                supabase.rpc("increment_whatsapp_taps", { p_id: product.id }).then(() => {});
                window.open(`https://wa.me/${cleanNumber.replace("+", "")}?text=${encodeURIComponent(message)}`, "_blank");
              }}
            >
              <span className="text-lg">💬</span>
              WhatsApp
            </Button>
          </div>
        </div>

        {/* Store Link */}
        <div className="border-t pt-4">
          <button onClick={onBack} className="flex items-center gap-3 w-full text-left">
            {profile.profile_picture_url ? (
              <img src={profile.profile_picture_url} alt="" className="h-10 w-10 rounded-full object-cover border" />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <AfristallLogo className="h-5 w-5" />
              </div>
            )}
            <div>
              <p className="text-sm font-semibold">{profile.store_name}</p>
              <p className="text-xs text-muted-foreground">View all products →</p>
            </div>
          </button>
        </div>

        {/* More from this store */}
        {suggestions.length > 0 && (
          <div className="border-t pt-6">
            <h3 className="text-base font-bold mb-4">More from this store</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {suggestions.map((p) => {
                const pImgs = productImagesMap[p.id] ?? (p.image_url ? [p.image_url] : []);
                const pPrice = p.discount_price ?? p.price;
                return (
                  <button
                    key={p.id}
                    onClick={() => onNavigate(p.id)}
                    className="rounded-xl border border-border/60 bg-card p-2 text-left hover:shadow-md transition-shadow"
                  >
                    <div className="aspect-square rounded-lg overflow-hidden bg-muted/30 border border-border/30 mb-2 relative">
                      {pImgs[0] ? (
                        <>
                          <img src={pImgs[0]} alt="" className="absolute inset-0 h-full w-full object-cover scale-110 blur-2xl opacity-60" aria-hidden="true" />
                          <img src={pImgs[0]} alt={p.name} className="relative h-full w-full object-contain" />
                        </>
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <ShoppingBag className="h-6 w-6 text-muted-foreground/20" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs font-semibold truncate">{p.name}</p>
                    <p className="text-xs font-bold text-primary">{formatPrice(Number(pPrice), currency)}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </main>

      <footer className="border-t bg-background py-4 text-center space-y-1">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <AfristallLogo className="h-4 w-4" />
          Powered by <span className="font-semibold">Afri<span className="text-primary">stall</span></span>
        </Link>
      </footer>

      <CartDrawer
        currency={currency}
        whatsappNumber={profile.whatsapp_number ?? ""}
        storeName={profile.store_name ?? "Store"}
        storeSlug={storeSlug}
        sellerId={profile.id}
        visitorName={visitorName}
      />
    </div>
  );
}

const StorefrontInner = () => {
  const { addItem } = useCart();
  const { items: wishlistItems } = useWishlist();
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const { storeSlug, productId } = useParams<{ storeSlug: string; productId?: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [productImagesMap, setProductImagesMap] = useState<Record<string, string[]>>({});
  const [visitorName, setVisitorName] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({ search: "", category: "", condition: "", priceRange: null });

  // Load visitor name from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(`visitor_name_${storeSlug}`);
    if (stored) {
      setVisitorName(stored);
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

  // Set dynamic OG meta tags for social sharing
  useEffect(() => {
    if (!profile) return;
    const title = `${profile.store_name || storeSlug} — Shop on Afristall`;
    const description = profile.store_bio ||
      `Check out ${profile.store_name || storeSlug}${profile.category ? ` for ${profile.category}` : ""}${profile.city ? ` in ${profile.city}` : ""}. Order directly on WhatsApp! 🛒`;
    const image = profile.profile_picture_url || "/logo-glow.png";

    document.title = title;
    const setMeta = (property: string, content: string) => {
      let el = document.querySelector(`meta[property="${property}"]`) || document.querySelector(`meta[name="${property}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(property.startsWith("og:") ? "property" : "name", property);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };
    setMeta("og:title", title);
    setMeta("og:description", description);
    setMeta("og:image", image);
    setMeta("og:url", `${window.location.origin}/${storeSlug}`);
    setMeta("twitter:title", title);
    setMeta("twitter:description", description);
    setMeta("twitter:image", image);

    return () => { document.title = "Afristall — Your Shop, Your WhatsApp, Your Hustle"; };
  }, [profile, storeSlug]);

  // Default to light mode on storefront
  useEffect(() => {
    const root = document.documentElement;
    if (!localStorage.getItem(`storefront_theme_${storeSlug}`)) {
      root.classList.remove("dark");
      root.classList.add("light");
    }
  }, []);


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
  const hasActiveSearch = filters.search || filters.category || filters.condition || filters.priceRange;
  const filteredProducts = hasActiveSearch ? applyFilters(products, filters) : products;
  const featured = filteredProducts.filter((p) => p.is_featured);
  const nonFeatured = filteredProducts.filter((p) => !p.is_featured);

  // Product detail view
  const viewProduct = productId ? products.find((p) => p.id === productId) : null;

  if (viewProduct) {
    const imgs = productImagesMap[viewProduct.id] ?? (viewProduct.image_url ? [viewProduct.image_url] : []);
    const variants = viewProduct.variants_text?.split(",").map((v) => v.trim()).filter(Boolean) ?? [];

    // Suggestions: other products from same store
    const suggestions = products.filter((p) => p.id !== viewProduct.id).slice(0, 6);

    return (
      <ProductDetailView
        product={viewProduct}
        images={imgs}
        variants={variants}
        suggestions={suggestions}
        productImagesMap={productImagesMap}
        currency={currency}
        profile={profile}
        storeSlug={storeSlug ?? ""}
        visitorName={visitorName}
        onBack={() => navigate(`/${storeSlug}`)}
        onNavigate={(id) => navigate(`/${storeSlug}/${id}`)}
      />
    );
  }

  // Shop view
  return (
    <div className="min-h-screen bg-background">

      {/* Floating top-left: Dashboard / Sign In + Create Store for non-owners */}
      <div className="fixed top-4 left-4 z-30 flex items-center gap-2">
        {user && profile && user.id === profile.id ? (
          <Button variant="outline" size="icon" className="shrink-0 rounded-full" asChild>
            <Link to="/dashboard"><LayoutDashboard className="h-4 w-4" /></Link>
          </Button>
        ) : (
          <Button size="sm" className="rounded-full text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 backdrop-blur-sm" asChild>
            <Link to="/"><Store className="h-3.5 w-3.5" /> Create Your Store</Link>
          </Button>
        )}
      </div>

      {/* Theme toggle + Share button floating top-right */}
      <div className="fixed top-4 right-4 z-30 flex items-center gap-2">
        <Button variant="outline" size="icon" className="shrink-0 rounded-full" onClick={toggleTheme}>
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <ShareButton storeName={profile.store_name ?? "Store"} storeSlug={storeSlug ?? ""} />
      </div>

      {/* Owner banner */}
      {user && profile && user.id === profile.id && (
        <div className="bg-primary text-primary-foreground text-center text-sm py-2 px-4">
          You're viewing your store as a buyer.{" "}
          <Link to="/dashboard" className="underline font-semibold hover:opacity-80">
            Manage Store →
          </Link>
        </div>
      )}

      {/* Header with profile pic, name, greeting */}
      <StorefrontHeader profile={profile} visitorName={visitorName} />

      {/* Products */}
      <main className="mx-auto max-w-5xl px-4 py-6 space-y-8">
        {/* Search & Filters */}
        {products.length > 0 && (
          <StorefrontFilters
            filters={filters}
            onChange={setFilters}
            totalCount={products.length}
            filteredCount={filteredProducts.length}
            products={products}
          />
        )}

        {/* Wishlist Section */}
        {(() => {
          const wishedProducts = filteredProducts.filter((p) => wishlistItems.includes(p.id));
          if (wishedProducts.length === 0) return null;
          return (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Heart className="h-5 w-5 text-destructive fill-destructive" />
                <h2 className="text-lg font-bold">Your Wishlist</h2>
                <span className="text-xs text-muted-foreground">({wishedProducts.length})</span>
              </div>
              <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3">
                {wishedProducts.map((product) => (
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
          );
        })()}

        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <ShoppingBag className="h-12 w-12 text-muted-foreground/40" />
            {hasActiveSearch ? (
              <>
                <p className="text-lg font-medium">No products match your filters</p>
                <p className="text-sm text-muted-foreground">Try adjusting your search or filters.</p>
                <button onClick={() => setFilters({ search: "", category: "", condition: "", priceRange: null })} className="text-sm text-primary font-medium hover:underline">
                  Clear all filters
                </button>
              </>
            ) : (
              <>
                <p className="text-lg font-medium">No products yet</p>
                <p className="text-sm text-muted-foreground">This store hasn't added any products.</p>
              </>
            )}
          </div>
        ) : (
          <>
            {featured.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Star className="h-5 w-5 text-primary fill-primary" />
                  <h2 className="text-lg font-bold">Featured</h2>
                </div>
                <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3">
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
                {featured.length > 0 ? "All Products" : `${filteredProducts.length} product${filteredProducts.length !== 1 ? "s" : ""}`}
              </h2>
              <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
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

      <footer className="border-t bg-background py-4 text-center space-y-1">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <AfristallLogo className="h-4 w-4" />
          Powered by <span className="font-semibold">Afri<span className="text-primary">stall</span></span>
        </Link>
        <div>
          <Link to="/dashboard" className="text-xs text-muted-foreground/60 hover:text-foreground transition-colors">
            Are you the seller? Go to Dashboard →
          </Link>
        </div>
      </footer>

      {/* Cart Drawer */}
      <CartDrawer
        currency={currency}
        whatsappNumber={profile.whatsapp_number ?? ""}
        storeName={profile.store_name ?? "Store"}
        storeSlug={storeSlug}
        sellerId={profile.id}
        visitorName={visitorName}
      />

      {/* WhatsApp Button */}
      {profile.whatsapp_number && (
        <StoreAssistantButton
          whatsappNumber={profile.whatsapp_number}
        />
      )}
    </div>
  );
};

const Storefront = () => {
  const { storeSlug } = useParams<{ storeSlug: string }>();
  return (
    <CartProvider>
      <WishlistProvider storeSlug={storeSlug ?? ""}>
        <StorefrontInner />
      </WishlistProvider>
    </CartProvider>
  );
};

export default Storefront;
