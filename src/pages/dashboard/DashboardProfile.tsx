import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useBusinessTerms } from "@/hooks/useBusinessTerms";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { formatPrice } from "@/lib/currency";
import {
  Camera, Loader2, Sparkles, Eye, ShoppingCart, Settings, Pencil, Check, X, Share2,
} from "lucide-react";
import whatsappIcon from "@/assets/whatsapp-icon.png";
import AfristallLogo from "@/components/AfristallLogo";
import type { Tables } from "@/integrations/supabase/types";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

type Product = Tables<"products">;

const DashboardProfile = () => {
  const { user } = useAuth();
  const terms = useBusinessTerms();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [productImages, setProductImages] = useState<Record<string, string>>({});
  const [viewCount, setViewCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [uploadingPic, setUploadingPic] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  // Inline bio editing
  const [editingBio, setEditingBio] = useState(false);
  const [bioText, setBioText] = useState("");
  const [savingBio, setSavingBio] = useState(false);
  const [generatingBio, setGeneratingBio] = useState(false);

  // Product detail modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      try {
        const [{ data: prof }, { data: prods }, { count: orders }] = await Promise.all([
          supabase.from("profiles").select("*").eq("id", user.id).single(),
          supabase.from("products").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
          supabase.from("orders").select("*", { count: "exact", head: true }).eq("seller_id", user.id).eq("status", "confirmed"),
        ]);

        const p = prof as any;
        setProfile(p);
        setBioText(p?.store_bio || p?.welcome_message || "");
        setViewCount(p?.view_count ?? 0);
        setOrderCount(orders ?? 0);
        setProducts(prods ?? []);

        // Fetch first image for each product
        if (prods && prods.length > 0) {
          const ids = prods.map((pr) => pr.id);
          const { data: imgs } = await supabase
            .from("product_images")
            .select("product_id, image_url")
            .in("product_id", ids)
            .order("position", { ascending: true });

          const map: Record<string, string> = {};
          imgs?.forEach((img) => {
            if (!map[img.product_id]) map[img.product_id] = img.image_url;
          });
          setProductImages(map);
        }

        // Auto-generate bio if missing
        if (p && !p.store_bio && !p.welcome_message) {
          try {
            const res = await supabase.functions.invoke("generate-bio", {
              body: { storeName: p.store_name, category: p.category || "", city: p.city || "" },
            });
            if (res.data?.bio) {
              const bio = res.data.bio;
              setBioText(bio);
              await supabase.from("profiles").update({ store_bio: bio, welcome_message: bio } as any).eq("id", user.id);
              setProfile((prev: any) => ({ ...prev, store_bio: bio, welcome_message: bio }));
            }
          } catch {
            // silent
          }
        }
      } catch {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user]);

  const handleProfilePicChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB"); return; }
    setUploadingPic(true);
    try {
      const { compressImage } = await import("@/lib/imageCompression");
      file = await compressImage(file);
      const ext = file.name.split(".").pop();
      const path = `${user.id}/profile.${ext}`;
      await supabase.storage.from("store-images").upload(path, file, { upsert: true });
      const { data: urlData } = supabase.storage.from("store-images").getPublicUrl(path);
      await supabase.from("profiles").update({ profile_picture_url: urlData.publicUrl } as any).eq("id", user.id);
      setProfile((prev: any) => ({ ...prev, profile_picture_url: `${urlData.publicUrl}?t=${Date.now()}` }));
      toast.success("Profile picture updated!");
    } catch { toast.error("Failed to upload"); }
    setUploadingPic(false);
  };

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB"); return; }
    setUploadingCover(true);
    try {
      const { compressImage } = await import("@/lib/imageCompression");
      file = await compressImage(file);
      const ext = file.name.split(".").pop();
      const path = `${user.id}/cover.${ext}`;
      await supabase.storage.from("store-images").upload(path, file, { upsert: true });
      const { data: urlData } = supabase.storage.from("store-images").getPublicUrl(path);
      await supabase.from("profiles").update({ cover_photo_url: urlData.publicUrl } as any).eq("id", user.id);
      setProfile((prev: any) => ({ ...prev, cover_photo_url: `${urlData.publicUrl}?t=${Date.now()}` }));
      toast.success("Cover photo updated!");
    } catch { toast.error("Failed to upload"); }
    setUploadingCover(false);
  };

  const handleSaveBio = async () => {
    if (!user) return;
    setSavingBio(true);
    const { error } = await supabase.from("profiles").update({
      store_bio: bioText.trim() || null,
      welcome_message: bioText.trim() || null,
    } as any).eq("id", user.id);
    if (error) toast.error("Failed to save");
    else {
      toast.success("Bio updated!");
      setProfile((prev: any) => ({ ...prev, store_bio: bioText.trim(), welcome_message: bioText.trim() }));
    }
    setSavingBio(false);
    setEditingBio(false);
  };

  const handleGenerateBio = async () => {
    if (!profile) return;
    setGeneratingBio(true);
    try {
      const res = await supabase.functions.invoke("generate-bio", {
        body: { storeName: profile.store_name, category: profile.category || "", city: profile.city || "" },
      });
      if (res.data?.bio) {
        setBioText(res.data.bio);
        toast.success("Bio generated!");
      }
    } catch { toast.error("Failed to generate"); }
    setGeneratingBio(false);
  };

  if (loading) return <div className="animate-pulse text-muted-foreground py-12 text-center">Loading…</div>;

  if (!profile) {
    return (
      <div className="max-w-lg mx-auto py-10 text-center space-y-3">
        <p className="text-sm text-muted-foreground">We couldn’t load your profile yet.</p>
        <Button asChild variant="outline" size="sm" className="rounded-xl">
          <Link to="/dashboard/settings">Open Settings</Link>
        </Button>
      </div>
    );
  }

  const currency = profile.currency || "UGX";

  return (
    <div className="max-w-lg mx-auto -mx-4 md:mx-auto -mt-4 md:mt-0">
      {/* Cover Photo */}
      <div className="relative h-36 sm:h-44 bg-gradient-to-br from-primary/15 via-primary/5 to-accent/10 overflow-hidden group">
        <img src={profile.cover_photo_url || "/default-cover.png"} alt="" className="w-full h-full object-cover" />
        <label className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
          {uploadingCover ? <Loader2 className="h-6 w-6 text-white animate-spin" /> : (
            <div className="text-white text-center">
              <Camera className="h-6 w-6 mx-auto" />
              <span className="text-xs mt-1 block">Change cover</span>
            </div>
          )}
          <input type="file" accept="image/*" className="hidden" onChange={handleCoverChange} disabled={uploadingCover} />
        </label>

        {/* Settings gear */}
        <Link
          to="/dashboard/settings"
          className="absolute top-3 right-3 h-8 w-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors"
        >
          <Settings className="h-4 w-4" />
        </Link>
      </div>

      {/* Profile section */}
      <div className="px-4 -mt-10 relative z-10">
        {/* Profile Picture */}
        <div className="relative group w-fit ig-ring">
          <img
            src={profile.profile_picture_url || "/logo-glow.png"}
            alt={profile.store_name ?? "Store"}
            className="h-20 w-20 rounded-full object-cover border-2 border-background shadow-lg"
          />
          <label className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
            {uploadingPic ? <Loader2 className="h-5 w-5 text-white animate-spin" /> : <Camera className="h-5 w-5 text-white" />}
            <input type="file" accept="image/*" className="hidden" onChange={handleProfilePicChange} disabled={uploadingPic} />
          </label>
        </div>

        {/* Name & username */}
        <h1 className="text-xl font-bold tracking-tight mt-2">{profile.store_name || "Your Store"}</h1>
        {profile.store_slug && (
          <p className="text-sm text-muted-foreground">@{profile.store_slug}</p>
        )}

        {/* Bio - inline editable */}
        <div className="mt-2">
          {editingBio ? (
            <div className="space-y-2">
              <Textarea
                value={bioText}
                onChange={(e) => setBioText(e.target.value)}
                rows={3}
                maxLength={300}
                className="text-sm"
                autoFocus
              />
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={handleSaveBio} disabled={savingBio} className="gap-1.5 rounded-xl">
                  <Check className="h-3.5 w-3.5" /> {savingBio ? "Saving…" : "Save"}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => { setEditingBio(false); setBioText(profile.store_bio || profile.welcome_message || ""); }} className="rounded-xl">
                  <X className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleGenerateBio}
                  disabled={generatingBio}
                  className="gap-1 text-xs text-primary rounded-xl ml-auto"
                >
                  {generatingBio ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                  AI
                </Button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setEditingBio(true)}
              className="text-left group/bio w-full"
            >
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                {profile.store_bio || profile.welcome_message || (
                  <span className="italic text-muted-foreground/60">Tap to add a bio…</span>
                )}
                <Pencil className="inline h-3 w-3 ml-1.5 opacity-0 group-hover/bio:opacity-100 transition-opacity text-primary" />
              </p>
            </button>
          )}
        </div>

        {/* Stats row — Instagram style */}
        <div className="flex items-center justify-around mt-4 py-3 border-y border-border/50">
          <Link to="/dashboard/products" className="text-center group">
            <p className="text-lg font-bold group-hover:text-primary transition-colors">{products.length}</p>
            <p className="text-xs text-muted-foreground">{terms.plural}</p>
          </Link>
          <Link to="/dashboard/analytics" className="text-center group">
            <p className="text-lg font-bold group-hover:text-primary transition-colors">{viewCount}</p>
            <p className="text-xs text-muted-foreground">Views</p>
          </Link>
          <Link to="/dashboard/orders" className="text-center group">
            <p className="text-lg font-bold group-hover:text-primary transition-colors">{orderCount}</p>
            <p className="text-xs text-muted-foreground">Sales</p>
          </Link>
        </div>

        {/* View as buyer button */}
        {profile.store_slug && (
          <div className="mt-3">
            <Button asChild variant="outline" className="w-full rounded-xl gap-2" size="sm">
              <Link to={`/${profile.store_slug}`} target="_blank">
                <Eye className="h-4 w-4" /> View as buyer
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* Featured Products — horizontal scroll */}
      {(() => {
        const featured = products.filter((p) => p.is_featured);
        if (featured.length === 0) return null;
        return (
          <div className="mt-5 px-3">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold">Featured {terms.plural}</h2>
              <span className="text-xs text-muted-foreground">{featured.length}</span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-3 px-3 snap-x snap-mandatory scrollbar-none">
              {featured.map((product) => {
                const imgUrl = productImages[product.id] || product.image_url;
                const displayPrice = product.discount_price ?? product.price;
                return (
                  <button
                    key={product.id}
                    onClick={() => setSelectedProduct(product)}
                    className="snap-start shrink-0 w-36 rounded-2xl border border-border/60 bg-card p-1.5 shadow-sm hover:shadow-md transition-shadow text-left"
                  >
                    <div className="aspect-square rounded-xl overflow-hidden bg-muted/30 border border-border/40">
                      {imgUrl ? (
                        <img src={imgUrl} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground/40">
                          <AfristallLogo className="h-6 w-6" />
                        </div>
                      )}
                    </div>
                    <div className="pt-1.5 px-0.5">
                      <p className="font-semibold text-xs leading-tight truncate">{product.name}</p>
                      <p className="font-extrabold text-xs truncate">{formatPrice(Number(displayPrice), currency)}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* All Products Grid */}
      <div className="mt-5 px-3">
        {products.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <span className="text-4xl">{terms.emoji}</span>
            <p className="text-sm text-muted-foreground">No {terms.plural.toLowerCase()} yet</p>
            <Button asChild size="sm" className="rounded-xl">
              <Link to="/dashboard/products?add=true">Add {terms.singular}</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold">All {terms.plural}</h2>
              <span className="text-xs text-muted-foreground">{products.length}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {products.map((product) => {
                const imgUrl = productImages[product.id] || product.image_url;
                const displayPrice = product.discount_price ?? product.price;
                const hasDiscount = !!product.discount_price;
                const discountPercent = hasDiscount
                  ? Math.round((1 - Number(product.discount_price) / Number(product.price)) * 100)
                  : 0;
                return (
                  <button
                    key={product.id}
                    onClick={() => setSelectedProduct(product)}
                    className="group cursor-pointer rounded-2xl border border-border/60 bg-card p-1.5 shadow-sm hover:shadow-md transition-shadow text-left"
                  >
                    <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-muted/30 border border-border/40">
                      {imgUrl ? (
                        <img src={imgUrl} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground/40">
                          <AfristallLogo className="h-8 w-8" />
                        </div>
                      )}
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        {product.is_featured && (
                          <span className="text-[10px] px-2 py-0.5 bg-foreground text-background shadow-sm rounded-full font-medium inline-flex items-center gap-0.5">
                            ⭐ Featured
                          </span>
                        )}
                        {hasDiscount && (
                          <span className="text-[10px] px-2 py-0.5 bg-destructive text-destructive-foreground shadow-sm rounded-full font-medium">
                            {discountPercent}% OFF
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="pt-2 px-0.5 space-y-0.5">
                      <p className="font-semibold text-sm leading-tight truncate">{product.name}</p>
                      <div className="flex flex-col">
                        <p className="font-extrabold text-sm truncate">{formatPrice(Number(displayPrice), currency)}</p>
                        {hasDiscount && (
                          <p className="text-[10px] text-muted-foreground line-through">{formatPrice(Number(product.price), currency)}</p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Product detail / edit modal */}
      <Dialog open={!!selectedProduct} onOpenChange={(open) => !open && setSelectedProduct(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="truncate">{selectedProduct?.name}</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              {(productImages[selectedProduct.id] || selectedProduct.image_url) && (
                <img
                  src={productImages[selectedProduct.id] || selectedProduct.image_url || ""}
                  alt={selectedProduct.name}
                  className="w-full aspect-square object-cover rounded-xl"
                />
              )}
              <div className="space-y-1">
                <p className="text-lg font-bold">
                  {formatPrice(selectedProduct.discount_price ?? selectedProduct.price, currency)}
                </p>
                {selectedProduct.discount_price && (
                  <p className="text-sm text-muted-foreground line-through">
                    {formatPrice(selectedProduct.price, currency)}
                  </p>
                )}
              </div>
              {selectedProduct.description && (
                <p className="text-sm text-muted-foreground">{selectedProduct.description}</p>
              )}
              <Button asChild className="w-full rounded-xl gap-2">
                <Link to={`/dashboard/products?edit=${selectedProduct.id}`} onClick={() => setSelectedProduct(null)}>
                  <Pencil className="h-4 w-4" /> Edit {terms.singular}
                </Link>
              </Button>
              <Button
                variant="outline"
                className="w-full rounded-xl gap-2 border-[#25D366]/30 text-[#25D366] hover:bg-[#25D366]/10"
                onClick={async () => {
                  const imgUrl = productImages[selectedProduct.id] || selectedProduct.image_url;
                  const price = formatPrice(selectedProduct.discount_price ?? selectedProduct.price, currency);
                  const shopLink = profile.store_slug ? `https://afristall.com/${profile.store_slug}` : "";
                  const caption = `🔥 ${selectedProduct.name} — ${price}\n\nShop here 👉 ${shopLink}`;

                  try {
                    if (imgUrl && navigator.canShare) {
                      const res = await fetch(imgUrl);
                      const blob = await res.blob();
                      const ext = blob.type.split("/")[1] || "jpg";
                      const file = new File([blob], `product.${ext}`, { type: blob.type });

                      if (navigator.canShare({ files: [file] })) {
                        await navigator.share({ files: [file], text: caption });
                        return;
                      }
                    }
                  } catch (err: any) {
                    if (err?.name === "AbortError") return;
                  }
                  // Fallback: text-only WhatsApp share
                  window.open(`https://wa.me/?text=${encodeURIComponent(caption)}`, "_blank");
                }}
              >
                <img src={whatsappIcon} alt="" className="h-4 w-4" /> Share to Status
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardProfile;
