import { useEffect, useState } from "react";
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
import { Sparkles, Loader2, Camera, ImagePlus } from "lucide-react";
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

const COUNTRIES = [
  "Uganda", "Kenya", "Nigeria", "Ghana", "Tanzania", "Rwanda",
  "South Africa", "Ethiopia", "Cameroon", "Senegal", "Other",
];

const DashboardSettings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
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
  const [storeBio, setStoreBio] = useState("");
  const [categories, setCategories] = useState<CategorySelection>({});
  const [deliveryAreas, setDeliveryAreas] = useState("");
  const [currency, setCurrency] = useState("UGX");
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [productCount, setProductCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("first_name, profile_picture_url, store_name, store_slug, whatsapp_number, city, store_bio, category, delivery_areas, currency, welcome_message, cover_photo_url, country, district")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          const d = data as any;
          setFirstName(d.store_slug ?? d.first_name ?? "");
          setProfilePicUrl(d.profile_picture_url ?? "");
          setCoverPhotoUrl(d.cover_photo_url ?? "");
          setStoreName(d.store_name ?? "");
          setWhatsappNumber(d.whatsapp_number ?? "");
          setCountry(d.country ?? "");
          setDistrict(d.district ?? "");
          setCity(d.city ?? "");
          setStoreBio(d.store_bio ?? "");
          setCategories(deserializeCategories(d.category));
          setDeliveryAreas(d.delivery_areas ?? "");
          setCurrency(d.currency ?? "UGX");
          setWelcomeMessage(d.welcome_message ?? "");
        }
        setLoading(false);
      });
    supabase.from("products").select("*", { count: "exact", head: true }).eq("user_id", user.id).then(({ count }) => {
      setProductCount(count ?? 0);
    });
  }, [user]);

  const handleProfilePicChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB"); return; }

    setUploadingPic(true);
    try {
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
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB"); return; }

    setUploadingCover(true);
    try {
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
        setStoreBio(bio);
        toast.success("Bio generated!");
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

    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: username,
        store_slug: username,
        store_name: storeName.trim(),
        whatsapp_number: whatsappNumber.trim(),
        country: country.trim() || null,
        district: district.trim() || null,
        city: city.trim(),
        store_bio: storeBio.trim() || null,
        category: serializeCategories(categories) || null,
        delivery_areas: deliveryAreas.trim() || null,
        currency: currency,
        welcome_message: welcomeMessage.trim() || null,
      } as any)
      .eq("id", user.id);
    if (error) toast.error("Failed to save");
    else toast.success("Settings saved!");
    setSaving(false);
  };

  if (loading)
    return <div className="animate-pulse text-muted-foreground py-12 text-center">Loading…</div>;

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

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
              <Label>Store Bio / Welcome Message</Label>
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
              value={storeBio}
              onChange={(e) => setStoreBio(e.target.value)}
              placeholder="e.g. Welcome to my store! We sell fresh organic food delivered to your door 🚀"
              rows={3}
              maxLength={300}
            />
            <p className="text-xs text-muted-foreground">{storeBio.length}/300 — shown on your storefront</p>
          </div>

          <div className="space-y-1.5">
            <Label>Welcome Message</Label>
            <Textarea
              value={welcomeMessage}
              onChange={(e) => setWelcomeMessage(e.target.value)}
              placeholder="e.g. Thanks for stopping by! Browse around and hit me up on WhatsApp to order 🧡"
              rows={2}
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground">{welcomeMessage.length}/200 — greeting visitors see when they open your store</p>
          </div>

          <div className="space-y-1.5">
            <Label>WhatsApp Number</Label>
            <Input value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} />
          </div>

          {/* Location */}
          <div className="space-y-1.5">
            <Label>Country</Label>
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>District / State</Label>
            <Input
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              placeholder="e.g. Wakiso, Lagos Island, Westlands"
            />
          </div>

          <div className="space-y-1.5">
            <Label>City / Town</Label>
            <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Kampala, Nairobi, Lagos" />
          </div>

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

      {/* WhatsApp Test */}
      <WhatsAppTestCard whatsappNumber={whatsappNumber} storeName={storeName} />
    </div>
  );
};

export default DashboardSettings;
