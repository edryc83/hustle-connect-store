import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Upload, Sparkles, Download, ArrowLeft, AlertCircle, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

const TEMPLATE_ID = "lzw71BD6Ek6350eYkn";

export default function AdStudio() {
  const { user, loading: authLoading } = useAuth();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [removeBg, setRemoveBg] = useState(true);
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [tagline, setTagline] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("store_slug, store_name")
        .eq("id", user!.id)
        .single();
      return data;
    },
  });

  if (authLoading) return null;
  if (!user) return <Navigate to="/login" replace />;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setResultUrl(null);
  };

  const uploadImage = async (file: File): Promise<string> => {
    const ext = file.name.split(".").pop() || "jpg";
    const path = `ad-studio/${user!.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file, { upsert: true });
    if (error) throw new Error(`Upload failed: ${error.message}`);
    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    return data.publicUrl;
  };

  const poll = async (uid: string): Promise<string> => {
    for (let i = 0; i < 30; i++) {
      await new Promise((r) => setTimeout(r, 2000));
      const { data, error } = await supabase.functions.invoke("bannerbear-generate", {
        body: null,
        method: "GET",
      });
      // supabase.functions.invoke doesn't support query params well, use fetch directly
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/bannerbear-generate?action=poll&uid=${uid}`,
        { headers: { "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` } }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `Poll error ${res.status}`);
      if (json.status === "completed") return json.image_url;
    }
    throw new Error("Timed out waiting for ad generation");
  };

  const handleGenerate = async () => {
    setError(null);
    if (!imageFile) { setError("Please upload a product image"); return; }
    if (!productName.trim()) { setError("Please enter a product name"); return; }
    if (!price.trim()) { setError("Please enter a price"); return; }

    setGenerating(true);
    setResultUrl(null);
    try {
      const imageUrl = await uploadImage(imageFile);

      const modifications = [
        { name: "product", image_url: imageUrl, ...(removeBg ? { remove_background: true } : {}) },
        { name: "product_name", text: productName },
        { name: "price_rectangle", text: price },
        { name: "short_description", text: tagline },
        { name: "store_name", text: profile?.store_slug || profile?.store_name || "My Store" },
      ];

      const createRes = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/bannerbear-generate?action=create`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ template: TEMPLATE_ID, modifications }),
        }
      );
      const createData = await createRes.json();
      if (!createRes.ok) throw new Error(createData.error || JSON.stringify(createData.details) || `Create error ${createRes.status}`);

      const uid = createData.uid;
      if (!uid) throw new Error("No uid returned from Bannerbear");

      const finalUrl = await poll(uid);
      setResultUrl(finalUrl);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!resultUrl) return;
    const res = await fetch(resultUrl);
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `ad-${productName.replace(/\s+/g, "-").toLowerCase()}.png`;
    a.click();
  };

  // Full-screen result view
  if (resultUrl) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 gap-6">
        <img src={resultUrl} alt="Generated Ad" className="max-w-full max-h-[75vh] rounded-2xl shadow-2xl border border-border" />
        <div className="flex gap-3">
          <Button onClick={handleDownload} size="lg" className="gap-2 shadow-lg">
            <Download className="h-5 w-5" /> Download
          </Button>
          <Button variant="outline" size="lg" onClick={() => setResultUrl(null)}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Make Another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur-xl">
        <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-lg font-bold">Ad Studio</h1>
        <Sparkles className="h-4 w-4 text-primary" />
      </header>

      <main className="max-w-md mx-auto p-4 space-y-6 pb-12">
        {/* Image upload */}
        <div className="space-y-2">
          <Label>Product Photo</Label>
          <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-xl p-6 cursor-pointer hover:border-primary/50 transition-colors bg-muted/30">
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="max-h-48 rounded-lg object-contain" />
            ) : (
              <>
                <Upload className="h-8 w-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Tap to upload a photo</span>
              </>
            )}
            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </label>
        </div>

        {/* Remove BG toggle */}
        <div className="flex items-center justify-between rounded-xl border border-border p-4 bg-card">
          <div>
            <Label className="text-sm font-medium">Remove Background</Label>
            <p className="text-xs text-muted-foreground">Auto-strip product background</p>
          </div>
          <Switch checked={removeBg} onCheckedChange={setRemoveBg} />
        </div>

        {/* Text inputs */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="product-name">Product Name</Label>
            <Input id="product-name" placeholder="e.g. Silk Bonnet" value={productName} onChange={(e) => setProductName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="price">Price</Label>
            <Input id="price" placeholder="e.g. KES 1,500" value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tagline">Tagline</Label>
            <Input id="tagline" placeholder="e.g. Sleep in luxury ✨" value={tagline} onChange={(e) => setTagline(e.target.value)} />
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription className="text-xs break-all">{error}</AlertDescription>
          </Alert>
        )}

        <Button
          onClick={handleGenerate}
          disabled={generating}
          className="w-full h-12 text-base gap-2 shadow-lg shadow-primary/20"
          size="lg"
        >
          {generating ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" /> Generating your ad…
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" /> Generate Ad
            </>
          )}
        </Button>
      </main>
    </div>
  );
}
