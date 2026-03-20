import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Sparkles, Loader2, Camera, ImagePlus, Bell, Trash2, AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { Switch } from "@/components/ui/switch";
import WallpaperPicker from "@/components/dashboard/WallpaperPicker";
import WhatsAppTestCard from "@/components/dashboard/WhatsAppTestCard";
import { CURRENCY_OPTIONS } from "@/lib/currency";
import AfristallLogo from "@/components/AfristallLogo";
import {
  CategoryPicker,
  CategorySelection,
  serializeCategories,
  deserializeCategories,
} from "@/components/CategoryPicker";
import { getDistricts, SUPPORTED_COUNTRIES } from "@/lib/locations";
function NotificationSettings() {
  const { isSubscribed, supported, loading, subscribe, unsubscribe } = usePushNotifications();

  if (!supported) return null;

  return (
    <Card className="border-border/50 bg-card/60 backdrop-blur-xl">
      <CardContent className="flex items-center justify-between gap-4 pt-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Bell className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold">Push Notifications</p>
            <p className="text-xs text-muted-foreground">Get alerted when customers place orders</p>
          </div>
        </div>
        <Switch
          checked={isSubscribed}
          disabled={loading}
          onCheckedChange={async (checked) => {
            if (checked) {
              const ok = await subscribe();
              if (ok) toast("Notifications enabled!");
              else if (Notification.permission === "denied") toast.error("Notifications blocked in browser settings.");
            } else {
              await unsubscribe();
              toast("Notifications disabled.");
            }
          }}
        />
      </CardContent>
    </Card>
  );
}

const DashboardSettings = () => {
  const { user } = useAuth();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploadingPic, setUploadingPic] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [profilePicUrl, setProfilePicUrl] = useState("");
  const [coverPhotoUrl, setCoverPhotoUrl] = useState("");
  const [storeName, setStoreName] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [country, setCountry] = useState("");
  const [district, setDistrict] = useState("");
  const [city, setCity] = useState("");
  const [street, setStreet] = useState("");
  const [shopNumber, setShopNumber] = useState("");
  const [building, setBuilding] = useState("");
  const [isOnlineOnly, setIsOnlineOnly] = useState(false);
  
  const [categories, setCategories] = useState<CategorySelection>({});
  const [deliveryAreas, setDeliveryAreas] = useState("");
  const [currency, setCurrency] = useState("UGX");
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [tiktokUrl, setTiktokUrl] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  
  const [productCount, setProductCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("first_name, profile_picture_url, store_name, store_slug, whatsapp_number, city, store_bio, category, delivery_areas, currency, welcome_message, cover_photo_url, country, district, street, shop_number, building, is_online_only, instagram_url, tiktok_url, facebook_url, ai_assistant_enabled, accent_color")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          const d = data as any;
          setFirstName(d.store_slug ?? "");
          setProfilePicUrl(d.profile_picture_url ?? "");
          setCoverPhotoUrl(d.cover_photo_url ?? "");
          setStoreName(d.store_name ?? "");
          setWhatsappNumber(d.whatsapp_number ?? "");
          const savedCountry = d.country ?? "";
          setCountry(savedCountry);
          // Auto-detect country if not set
          if (!savedCountry) {
            fetch("https://ipapi.co/json/")
              .then((r) => r.json())
              .then((geo) => {
                if (geo?.country_name) {
                  const match = SUPPORTED_COUNTRIES.find(
                    (c) => c.toLowerCase() === geo.country_name.toLowerCase()
                  );
                  if (match) setCountry(match);
                }
              })
              .catch(() => {});
          }
          setDistrict(d.district ?? "");
          setCity(d.city ?? "");
          setStreet(d.street ?? "");
          setShopNumber(d.shop_number ?? "");
          setBuilding(d.building ?? "");
          setIsOnlineOnly(d.is_online_only ?? false);
          setInstagramUrl(d.instagram_url ?? "");
          setTiktokUrl(d.tiktok_url ?? "");
          setFacebookUrl(d.facebook_url ?? "");
          
          setCategories(deserializeCategories(d.category));
          setDeliveryAreas(d.delivery_areas ?? "");
          setCurrency(d.currency ?? "UGX");
          setWelcomeMessage(d.welcome_message || d.store_bio || "");
        }
        setLoading(false);
      });
    supabase.from("products").select("*", { count: "exact", head: true }).eq("user_id", user.id).then(({ count }) => {
      setProductCount(count ?? 0);
    });
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
      const { error: uploadErr } = await supabase.storage
        .from("store-images")
        .upload(path, file, { upsert: true });
      if (uploadErr) throw uploadErr;

      const { data: urlData } = supabase.storage.from("store-images").getPublicUrl(path);
      const newUrl = `${urlData.publicUrl}?t=${Date.now()}`;

      const { error: updateErr } = await supabase
        .from("profiles")
        .update({ profile_picture_url: urlData.publicUrl } as any)
        .eq("id", user.id);
      if (updateErr) throw updateErr;

      setProfilePicUrl(newUrl);
      toast.success("Profile picture updated!");
    } catch {
      toast.error("Failed to upload picture");
    }
    setUploadingPic(false);
  };

  const handleCoverPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB"); return; }

    setUploadingCover(true);
    try {
      const { compressImage } = await import("@/lib/imageCompression");
      file = await compressImage(file);
      const ext = file.name.split(".").pop();
      const path = `${user.id}/cover.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from("store-images")
        .upload(path, file, { upsert: true });
      if (uploadErr) throw uploadErr;

      const { data: urlData } = supabase.storage.from("store-images").getPublicUrl(path);
      const newUrl = `${urlData.publicUrl}?t=${Date.now()}`;

      const { error: updateErr } = await supabase
        .from("profiles")
        .update({ cover_photo_url: urlData.publicUrl } as any)
        .eq("id", user.id);
      if (updateErr) throw updateErr;

      setCoverPhotoUrl(newUrl);
      toast.success("Cover photo updated!");
    } catch {
      toast.error("Failed to upload cover photo");
    }
    setUploadingCover(false);
  };

  const handleGenerateBio = async () => {
    setGenerating(true);
    try {
      const catNames = Object.keys(categories).join(", ") || "General";
      const res = await supabase.functions.invoke("generate-bio", {
        body: { storeName, category: catNames, city },
      });
      if (res.error) throw res.error;
      const bio = res.data?.bio;
      if (bio) {
        setWelcomeMessage(bio);
        toast.success("Welcome message generated!");
      }
    } catch {
      toast.error("Failed to generate bio");
    }
    setGenerating(false);
  };

  const slugify = (val: string) => val.toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 30);

  const handleUsernameChange = (val: string) => {
    const slug = slugify(val);
    setFirstName(slug);
    setUsernameError("");
  };

  const handleSave = async () => {
    if (!user) return;
    const username = firstName.trim();
    if (!username) { toast.error("Username is required"); return; }

    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("store_slug", username)
      .neq("id", user.id)
      .maybeSingle();

    if (existing) {
      setUsernameError("This username is already taken");
      toast.error("Username is already taken");
      return;
    }

    const normalizeSocialUrl = (value: string, platform: "instagram" | "tiktok" | "facebook") => {
      const raw = value.trim();
      if (!raw) return null;
      if (/^https?:\/\//i.test(raw)) return raw;

      const cleaned = raw.replace(/^\/+/, "");

      if (platform === "instagram") {
        const handle = cleaned.replace(/^@/, "");
        return cleaned.toLowerCase().includes("instagram.com/")
          ? `https://${cleaned}`
          : `https://instagram.com/${handle}`;
      }

      if (platform === "tiktok") {
        if (cleaned.toLowerCase().includes("tiktok.com/")) return `https://${cleaned}`;
        const handle = cleaned.startsWith("@") ? cleaned : `@${cleaned}`;
        return `https://tiktok.com/${handle}`;
      }

      const page = cleaned.replace(/^@/, "");
      return cleaned.toLowerCase().includes("facebook.com/")
        ? `https://${cleaned}`
        : `https://facebook.com/${page}`;
    };

    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        store_slug: username,
        store_name: storeName.trim(),
        whatsapp_number: whatsappNumber.trim(),
        country: country.trim() || null,
        district: district.trim() || null,
        city: city.trim() || null,
        street: street.trim() || null,
        shop_number: isOnlineOnly ? null : shopNumber.trim() || null,
        building: isOnlineOnly ? null : building.trim() || null,
        is_online_only: isOnlineOnly,
        store_bio: welcomeMessage.trim() || null,
        category: serializeCategories(categories) || null,
        delivery_areas: deliveryAreas.trim() || null,
        currency: currency,
        welcome_message: welcomeMessage.trim() || null,
        instagram_url: normalizeSocialUrl(instagramUrl, "instagram"),
        tiktok_url: normalizeSocialUrl(tiktokUrl, "tiktok"),
        facebook_url: normalizeSocialUrl(facebookUrl, "facebook"),
        
      } as any)
      .eq("id", user.id);
    if (error) toast.error("Failed to save");
    else toast.success("Settings saved!");
    setSaving(false);
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    setDeleting(true);
    try {
      // Delete user's products first
      await supabase.from("products").delete().eq("user_id", user.id);

      // Delete user's product images from storage
      const { data: files } = await supabase.storage.from("store-images").list(user.id);
      if (files && files.length > 0) {
        const filePaths = files.map((f) => `${user.id}/${f.name}`);
        await supabase.storage.from("store-images").remove(filePaths);
      }

      // Delete user's profile
      await supabase.from("profiles").delete().eq("id", user.id);

      // Sign out the user
      await supabase.auth.signOut();

      toast.success("Your account has been deleted");
      window.location.href = "/";
    } catch (err) {
      console.error("Delete account error:", err);
      toast.error("Failed to delete account. Please contact support.");
    }
    setDeleting(false);
  };

  if (loading)
    return <div className="animate-pulse text-muted-foreground py-12 text-center">Loading…</div>;

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* Store Completeness */}
      {(() => {
        const completeness =
          (profilePicUrl ? 20 : 0) +
          (storeName ? 20 : 0) +
          (whatsappNumber ? 20 : 0) +
          (productCount >= 1 ? 20 : 0) +
          (productCount >= 3 ? 20 : 0);
        const msg = completeness <= 40
          ? "Your store isn't ready yet — buyers need products to order"
          : completeness < 100
            ? "Almost there! Add more products to boost your store"
            : "🎉 Your store is ready to share!";
        return (
          <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Store Completeness</span>
              <span className="text-sm font-bold text-primary">{completeness}%</span>
            </div>
            <Progress value={completeness} className="h-2.5 bg-muted" />
            <p className="text-xs text-muted-foreground">{msg}</p>
          </div>
        );
      })()}

      <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-base">Your Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Cover Photo */}
          <div className="space-y-1.5">
            <Label>Cover Photo</Label>
            <div className="relative group rounded-xl overflow-hidden border border-border/50 bg-muted/30 h-32">
              {coverPhotoUrl ? (
                <img src={coverPhotoUrl} alt="Cover" className="w-full h-full object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <ImagePlus className="h-8 w-8" />
                </div>
              )}
              <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                {uploadingCover ? (
                  <Loader2 className="h-6 w-6 text-white animate-spin" />
                ) : (
                  <div className="text-center text-white">
                    <Camera className="h-6 w-6 mx-auto" />
                    <span className="text-xs mt-1 block">Change cover</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCoverPhotoChange}
                  disabled={uploadingCover}
                />
              </label>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Recommended: 1200×400px. Shown on your store & explore cards.</p>
              <WallpaperPicker onSelect={async (url) => {
                if (!user) return;
                const { error } = await supabase.from("profiles").update({ cover_photo_url: url } as any).eq("id", user.id);
                if (error) { toast.error("Failed to set wallpaper"); return; }
                setCoverPhotoUrl(url);
                toast.success("Cover wallpaper set!");
              }} />
            </div>
          </div>

          {/* Profile Picture */}
          <div className="flex items-center gap-4">
            <div className="relative group">
              {profilePicUrl ? (
                <img
                  src={profilePicUrl}
                  alt="Profile"
                  className="h-20 w-20 rounded-full object-cover border-2 border-primary/20"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                  <AfristallLogo className="h-10 w-10" />
                </div>
              )}
              <label className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                {uploadingPic ? (
                  <Loader2 className="h-5 w-5 text-white animate-spin" />
                ) : (
                  <Camera className="h-5 w-5 text-white" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProfilePicChange}
                  disabled={uploadingPic}
                />
              </label>
            </div>
            <div>
              <p className="text-sm font-medium">Store Logo / Photo</p>
              <p className="text-xs text-muted-foreground">Hover and click to change</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Username</Label>
            <div className="flex items-center gap-1.5">
              <span className="text-sm text-muted-foreground">afristall.com/</span>
              <Input
                value={firstName}
                onChange={(e) => handleUsernameChange(e.target.value)}
                placeholder="e.g. johndoe"
                className={usernameError ? "border-destructive" : ""}
              />
            </div>
            {usernameError && <p className="text-xs text-destructive">{usernameError}</p>}
            <p className="text-xs text-muted-foreground">This is your store URL. Only lowercase letters, numbers, hyphens and underscores.</p>
          </div>
        </CardContent>
      </div>

      <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-base">Store Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Store Name</Label>
            <Input value={storeName} onChange={(e) => setStoreName(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label>Categories & Subcategories</Label>
            <p className="text-xs text-muted-foreground mb-1">Select all that apply to your store</p>
            <CategoryPicker value={categories} onChange={setCategories} />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label>Welcome Message</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 gap-1 text-xs text-primary"
                onClick={handleGenerateBio}
                disabled={generating}
              >
                {generating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                {generating ? "Generating…" : "AI Generate"}
              </Button>
            </div>
            <Textarea
              value={welcomeMessage}
              onChange={(e) => setWelcomeMessage(e.target.value)}
              placeholder="e.g. Thanks for stopping by! Browse around and hit me up on WhatsApp to order 🧡"
              rows={3}
              maxLength={300}
            />
            <p className="text-xs text-muted-foreground">{welcomeMessage.length}/300 — greeting visitors see when they open your store</p>
          </div>

          <div className="space-y-1.5">
            <Label>WhatsApp Number</Label>
            <Input value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} />
          </div>

          {/* Location */}
          <div className="space-y-1.5">
            <Label>Country</Label>
            <Select value={country} onValueChange={(val) => { setCountry(val); setDistrict(""); setCity(""); }}>
              <SelectTrigger>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_COUNTRIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>District / Region</Label>
            <Select value={district} onValueChange={setDistrict} disabled={!country}>
              <SelectTrigger>
                <SelectValue placeholder={country ? "Select district" : "Select a country first"} />
              </SelectTrigger>
              <SelectContent>
                {getDistricts(country).map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Street <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <Input value={street} onChange={(e) => setStreet(e.target.value)} placeholder="e.g. Kira Road, Allen Avenue" />
          </div>

          {/* Online Only Toggle */}
          <div className="flex items-center justify-between rounded-lg border border-border/50 px-4 py-3">
            <div>
              <p className="text-sm font-medium">Online Only</p>
              <p className="text-xs text-muted-foreground">Toggle if you don't have a physical location</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isOnlineOnly}
                onChange={(e) => setIsOnlineOnly(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-muted rounded-full peer peer-checked:bg-primary transition-colors after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-background after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
            </label>
          </div>

          {!isOnlineOnly && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Building</Label>
                <Input value={building} onChange={(e) => setBuilding(e.target.value)} placeholder="e.g. Garden City Mall" />
              </div>
              <div className="space-y-1.5">
                <Label>Shop Number</Label>
                <Input value={shopNumber} onChange={(e) => setShopNumber(e.target.value)} placeholder="e.g. Shop 12, Floor 2" />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Delivery Areas</Label>
            <Textarea
              value={deliveryAreas}
              onChange={(e) => setDeliveryAreas(e.target.value)}
              placeholder="e.g. Kampala CBD, Ntinda, Kololo, Nakawa, Entebbe"
              rows={2}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">Comma-separated locations you deliver to</p>
          </div>

          {/* Social Links */}
          <div className="space-y-1.5">
            <Label>Instagram</Label>
            <Input
              value={instagramUrl}
              onChange={(e) => setInstagramUrl(e.target.value)}
              placeholder="e.g. https://instagram.com/yourstore"
            />
          </div>
          <div className="space-y-1.5">
            <Label>TikTok</Label>
            <Input
              value={tiktokUrl}
              onChange={(e) => setTiktokUrl(e.target.value)}
              placeholder="e.g. https://tiktok.com/@yourstore"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Facebook</Label>
            <Input
              value={facebookUrl}
              onChange={(e) => setFacebookUrl(e.target.value)}
              placeholder="e.g. https://facebook.com/yourstore"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Currency</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {CURRENCY_OPTIONS.map((c) => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save Changes"}
          </Button>
        </CardContent>
      </div>


      {/* Push Notifications */}
      <NotificationSettings />

      {/* WhatsApp Test */}
      <WhatsAppTestCard whatsappNumber={whatsappNumber} storeName={storeName} storeSlug={firstName} />

      {/* Shop Branding */}
      <Card className="border-border/50 bg-card/60 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-base">Shop Branding</CardTitle>
        </CardHeader>
        <CardContent>
          {user && (
            <AccentColorPicker
              userId={user.id}
              currentColor={accentColor}
              onColorChange={(color) => setAccentColor(color)}
            />
          )}
        </CardContent>
      </Card>
      {/* Support */}
      <Card className="border-border/50 bg-card/60 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <span>💬</span> Need Help?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Having trouble or need assistance? Chat with our support team on WhatsApp — we're happy to help!
          </p>
          <a
            href={`https://wa.me/447466719311?text=${encodeURIComponent(`Hi Afristall Support 👋\n\nI need help with my store "${storeName}".\n\nUsername: ${firstName}\nEmail: ${user?.email || "N/A"}`)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button className="w-full gap-2" variant="outline">
              <img src="/favicon.png" alt="" className="h-4 w-4" />
              Contact Support
            </Button>
          </a>
        </CardContent>
      </Card>

      {/* Delete Account - Apple App Store Compliance */}
      <Card className="border-destructive/30 bg-card/60 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-4 w-4" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full gap-2">
                <Trash2 className="h-4 w-4" />
                Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Delete Account?
                </AlertDialogTitle>
                <AlertDialogDescription className="space-y-2">
                  <p>This will permanently delete:</p>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>Your store profile and settings</li>
                    <li>All your products and images</li>
                    <li>Your order history</li>
                    <li>Your account credentials</li>
                  </ul>
                  <p className="font-medium text-destructive">This action cannot be undone.</p>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Deleting...
                    </>
                  ) : (
                    "Yes, Delete My Account"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardSettings;
