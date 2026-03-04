import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Sparkles, Loader2, Camera } from "lucide-react";
import { CURRENCY_OPTIONS } from "@/lib/currency";
import AfristallLogo from "@/components/AfristallLogo";
import {
  CategoryPicker,
  CategorySelection,
  serializeCategories,
  deserializeCategories,
} from "@/components/CategoryPicker";

const DashboardSettings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [uploadingPic, setUploadingPic] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [profilePicUrl, setProfilePicUrl] = useState("");
  const [storeName, setStoreName] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [city, setCity] = useState("");
  const [storeBio, setStoreBio] = useState("");
  const [categories, setCategories] = useState<CategorySelection>({});
  const [deliveryAreas, setDeliveryAreas] = useState("");
  const [currency, setCurrency] = useState("UGX");

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("first_name, profile_picture_url, store_name, whatsapp_number, city, store_bio, category, delivery_areas, currency")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setFirstName((data as any).first_name ?? "");
          setProfilePicUrl(data.profile_picture_url ?? "");
          setStoreName(data.store_name ?? "");
          setWhatsappNumber(data.whatsapp_number ?? "");
          setCity(data.city ?? "");
          setStoreBio((data as any).store_bio ?? "");
          setCategories(deserializeCategories(data.category));
          setDeliveryAreas((data as any).delivery_areas ?? "");
          setCurrency((data as any).currency ?? "UGX");
        }
        setLoading(false);
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

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: firstName.trim() || null,
        store_name: storeName.trim(),
        whatsapp_number: whatsappNumber.trim(),
        city: city.trim(),
        store_bio: storeBio.trim() || null,
        category: serializeCategories(categories) || null,
        delivery_areas: deliveryAreas.trim() || null,
        currency: currency,
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

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
            <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="e.g. johndoe" />
          </div>
        </CardContent>
      </Card>

      <Card>
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
            <Label>WhatsApp Number</Label>
            <Input value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label>City</Label>
            <Input value={city} onChange={(e) => setCity(e.target.value)} />
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
      </Card>
    </div>
  );
};

export default DashboardSettings;
