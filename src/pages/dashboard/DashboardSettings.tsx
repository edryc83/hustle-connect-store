import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Sparkles, Loader2 } from "lucide-react";
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
  const [storeName, setStoreName] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [city, setCity] = useState("");
  const [storeBio, setStoreBio] = useState("");
  const [categories, setCategories] = useState<CategorySelection>({});
  const [deliveryAreas, setDeliveryAreas] = useState("");

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("store_name, whatsapp_number, city, store_bio, category, delivery_areas")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setStoreName(data.store_name ?? "");
          setWhatsappNumber(data.whatsapp_number ?? "");
          setCity(data.city ?? "");
          setStoreBio((data as any).store_bio ?? "");
          setCategories(deserializeCategories(data.category));
          setDeliveryAreas((data as any).delivery_areas ?? "");
        }
        setLoading(false);
      });
  }, [user]);

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
        store_name: storeName.trim(),
        whatsapp_number: whatsappNumber.trim(),
        city: city.trim(),
        store_bio: storeBio.trim() || null,
        category: serializeCategories(categories) || null,
        delivery_areas: deliveryAreas.trim() || null,
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

          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save Changes"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardSettings;
