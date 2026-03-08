import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, AlertCircle, Loader2, Sparkles, Download } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { formatPrice } from "@/lib/currency";

import ProductStep from "@/components/ad-studio/ProductStep";
import TemplateStep from "@/components/ad-studio/TemplateStep";
import TextStep from "@/components/ad-studio/TextStep";
import StepNav from "@/components/ad-studio/StepNav";

const TEMPLATE_ID = "lzw71BD6Ek6350eYkn";

export default function AdStudio() {
  const { user, loading: authLoading } = useAuth();

  // Wizard state
  const [step, setStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // Step 1 — Product
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedProductData, setSelectedProductData] = useState<{
    name: string; price: number; imageUrl: string; currency?: string;
  } | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [removeBg, setRemoveBg] = useState(true);

  // Step 2 — Template
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATE_ID);

  // Step 3 — Text
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [tagline, setTagline] = useState("");
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);

  // Generation
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("store_slug, store_name, currency")
        .eq("id", user!.id)
        .single();
      return data;
    },
  });

  if (authLoading) return null;
  if (!user) return <Navigate to="/login" replace />;

  const handleSelectProduct = (product: {
    id: string; name: string; price: number; imageUrl: string; currency?: string;
  }) => {
    setSelectedProductId(product.id);
    setSelectedProductData(product);
    setImageFile(null);
    setImagePreview(product.imageUrl);
    // Pre-fill text
    setProductName(product.name);
    setPrice(formatPrice(product.price, product.currency || profile?.currency || "UGX"));
  };

  const handleUploadImage = (file: File, preview: string) => {
    setImageFile(file);
    setImagePreview(preview);
    setSelectedProductId(null);
    setSelectedProductData(null);
  };

  const markComplete = (s: number) => {
    setCompletedSteps((prev) => (prev.includes(s) ? prev : [...prev, s]));
  };

  const goNext = () => {
    markComplete(step);
    setStep((s) => Math.min(s + 1, 3));
  };

  const canProceedStep1 = !!imagePreview;
  const canProceedStep2 = !!selectedTemplate;
  const canGenerate = !!imagePreview && !!productName.trim() && !!price.trim();

  // Upload & generate logic (same as before)
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
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/bannerbear-generate?action=poll&uid=${uid}`,
        { headers: { Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` } }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `Poll error ${res.status}`);
      if (json.status === "completed") return json.image_url;
    }
    throw new Error("Timed out waiting for ad generation");
  };

  const handleGenerate = async () => {
    setError(null);
    setGenerating(true);
    setResultUrl(null);
    try {
      let imageUrl: string;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      } else if (selectedProductData?.imageUrl) {
        imageUrl = selectedProductData.imageUrl;
      } else {
        throw new Error("No image selected");
      }

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
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ template: selectedTemplate, modifications }),
        }
      );
      const createData = await createRes.json();
      if (!createRes.ok) throw new Error(createData.error || JSON.stringify(createData.details) || `Error ${createRes.status}`);

      const uid = createData.uid;
      if (!uid) throw new Error("No uid returned");

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

  // Result screen
  if (resultUrl) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 gap-6">
        <img src={resultUrl} alt="Generated Ad" className="max-w-full max-h-[75vh] rounded-2xl shadow-2xl border border-border" />
        <div className="flex gap-3">
          <Button onClick={handleDownload} size="lg" className="gap-2 shadow-lg">
            <Download className="h-5 w-5" /> Download
          </Button>
          <Button variant="outline" size="lg" onClick={() => { setResultUrl(null); setStep(3); }}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Edit Text
          </Button>
        </div>
        <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => { setResultUrl(null); setStep(1); setCompletedSteps([]); }}>
          Start Over
        </Button>
      </div>
    );
  }

  // Generating screen
  if (generating) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium">Generating your ad…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur-xl">
        <button onClick={() => step > 1 ? setStep(step - 1) : window.history.back()} className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-bold">Ad Studio</h1>
        <Sparkles className="h-4 w-4 text-primary" />
      </header>

      {/* Content */}
      <main className="flex-1 max-w-md mx-auto w-full p-4 overflow-y-auto">
        {step === 1 && (
          <ProductStep
            selectedProductId={selectedProductId}
            onSelectProduct={handleSelectProduct}
            imageFile={imageFile}
            imagePreview={imagePreview}
            onUploadImage={handleUploadImage}
            removeBg={removeBg}
            onRemoveBgChange={setRemoveBg}
          />
        )}
        {step === 2 && (
          <TemplateStep selectedTemplate={selectedTemplate} onSelect={setSelectedTemplate} />
        )}
        {step === 3 && (
          <TextStep
            productName={productName}
            setProductName={setProductName}
            price={price}
            setPrice={setPrice}
            tagline={tagline}
            setTagline={setTagline}
            imagePreview={imagePreview}
            removeBg={removeBg}
            onRemoveBgChange={setRemoveBg}
            onProcessedImage={setProcessedImageUrl}
          />
        )}

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription className="text-xs break-all">{error}</AlertDescription>
          </Alert>
        )}
      </main>

      {/* Bottom action */}
      <div className="sticky bottom-0 border-t border-border bg-background px-4 pb-2">
        {step < 3 ? (
          <Button
            className="w-full h-11 mt-2"
            disabled={step === 1 ? !canProceedStep1 : !canProceedStep2}
            onClick={goNext}
          >
            Next
          </Button>
        ) : (
          <Button
            className="w-full h-11 mt-2 gap-2 shadow-lg shadow-primary/20"
            disabled={!canGenerate}
            onClick={handleGenerate}
          >
            <Sparkles className="h-5 w-5" /> Generate Ad
          </Button>
        )}
        <StepNav current={step} completed={completedSteps} onStep={setStep} />
      </div>
    </div>
  );
}
