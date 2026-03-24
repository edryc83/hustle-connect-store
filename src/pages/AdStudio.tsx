import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { formatPrice } from "@/lib/currency";

import TemplatePicker from "@/components/ad-studio/TemplatePicker";
import type { Template } from "@/components/ad-studio/TemplatePicker";
import ImageSourceStep from "@/components/ad-studio/ImageSourceStep";
import type { ImageSlotData } from "@/components/ad-studio/ImageSourceStep";
import TextStep from "@/components/ad-studio/TextStep";
import ResultScreen from "@/components/ad-studio/ResultScreen";
import StepNav from "@/components/ad-studio/StepNav";

export default function AdStudio() {
  const { user, loading: authLoading } = useAuth();

  const [step, setStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // Step 1 — Template
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  // Step 2 — Images
  const [imageSlots, setImageSlots] = useState<ImageSlotData[]>([]);

  // Step 3 — Text
  const [productName, setProductName] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [price, setPrice] = useState("");

  // Generation
  const [generating, setGenerating] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("store_slug, store_name, currency, profile_picture_url")
        .eq("id", user!.id)
        .single();
      return data;
    },
  });

  // Initialize image slots when template changes
  useEffect(() => {
    if (selectedTemplate) {
      setImageSlots(
        Array.from({ length: selectedTemplate.image_slots }, () => ({
          url: null, file: null, removeBg: false, processedUrl: null,
        }))
      );
      // Clear text when template changes
      setProductName("");
      setSubtitle("");
      setTagline("");
      setPrice("");
    }
  }, [selectedTemplate]);

  if (authLoading) return null;
  if (!user) return <Navigate to="/login" replace />;

  const markComplete = (s: number) => {
    setCompletedSteps((prev) => (prev.includes(s) ? prev : [...prev, s]));
  };

  const goNext = () => {
    markComplete(step);
    // Pre-fill text from product when entering step 3
    if (step === 2) {
      const firstSlot = imageSlots[0];
      if (firstSlot?.productName) setProductName(firstSlot.productName);
      if (firstSlot?.productPrice) {
        setPrice(formatPrice(firstSlot.productPrice, profile?.currency || "UGX"));
      }
    }
    setStep((s) => Math.min(s + 1, 3));
  };

  const updateSlot = (index: number, data: Partial<ImageSlotData>) => {
    setImageSlots((prev) => prev.map((s, i) => (i === index ? { ...s, ...data } : s)));
  };

  const canProceed1 = !!selectedTemplate;
  const canProceed2 = imageSlots.length > 0 && imageSlots.every((s) => s.url || s.processedUrl);
  const canGenerate = canProceed2 && !!productName.trim() && !!price.trim();

  const handleGenerate = async () => {
    setError(null);
    setGenerating(true);
    try {
      // Build Bannerbear modifications array from template layers
      const layers = selectedTemplate!.layers || [];
      const modifications: Array<{ name: string; text?: string; image_url?: string }> = [];

      // Map text fields to layer names
      const textValues: Record<string, string> = {
        product_name: productName,
        price: price,
        subtitle: subtitle || " ",
        tagline: tagline || " ",
        store_name: profile?.store_name || profile?.store_slug || "My Store",
      };

      for (const layer of layers) {
        if (layer.type === "text") {
          // Match layer name to known fields (case-insensitive, flexible matching)
          const lowerName = layer.name.toLowerCase().replace(/[\s_-]+/g, "_");
          const value = textValues[lowerName]
            || Object.entries(textValues).find(([k]) => lowerName.includes(k))?.[1];
          if (value) {
            modifications.push({ name: layer.name, text: value });
          }
        } else if (layer.type === "image") {
          // Assign images to image layers in order
          const imageIndex = layers
            .filter((l) => l.type === "image")
            .indexOf(layer);
          const slot = imageSlots[imageIndex];
          const imgUrl = slot?.processedUrl || slot?.url;
          if (imgUrl) {
            modifications.push({ name: layer.name, image_url: imgUrl });
          }
        }
      }

      // If no layers metadata, use field names directly as layer names
      if (modifications.length === 0) {
        const fields = selectedTemplate!.fields || [];
        for (const field of fields) {
          if (textValues[field]) {
            modifications.push({ name: field, text: textValues[field] });
          }
        }
        imageSlots.forEach((slot, i) => {
          const imgUrl = slot.processedUrl || slot.url;
          if (imgUrl) {
            modifications.push({ name: `image${i + 1}`, image_url: imgUrl });
          }
        });
      }

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ad-render`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            template_uid: selectedTemplate!.id,
            modifications,
          }),
        }
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: "Generation failed" }));
        throw new Error(errData.error || `Error ${res.status}`);
      }

      const data = await res.json();
      const finalUrl = data.url || data.image_url;
      if (!finalUrl) throw new Error("No image URL returned");
      setResultUrl(finalUrl);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setGenerating(false);
    }
  };

  if (resultUrl) {
    return (
      <ResultScreen
        resultUrl={resultUrl}
        productName={productName}
        onEdit={() => { setResultUrl(null); setStep(3); }}
        onStartOver={() => {
          setResultUrl(null); setStep(1); setCompletedSteps([]);
          setSelectedTemplate(null); setImageSlots([]);
          setProductName(""); setSubtitle(""); setTagline(""); setPrice("");
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-border/50 bg-background/80 px-4 backdrop-blur-xl">
        <button
          onClick={() => (step > 1 ? setStep(step - 1) : window.history.back())}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-bold flex items-center gap-2">
          Ad Studio <Sparkles className="h-4 w-4 text-primary" />
        </h1>
        <div className="ml-auto">
          <StepNav current={step} completed={completedSteps} onStep={setStep} />
        </div>
      </header>

      {/* Main content — single column, no side panel */}
      <main className="flex-1 overflow-y-auto p-4 max-w-lg mx-auto w-full">
        {step === 1 && (
          <TemplatePicker selected={selectedTemplate} onSelect={setSelectedTemplate} />
        )}
        {step === 2 && (
          <ImageSourceStep slots={imageSlots} onUpdateSlot={updateSlot} userId={user.id} />
        )}
        {step === 3 && (
          <TextStep
            productName={productName}
            setProductName={setProductName}
            subtitle={subtitle}
            setSubtitle={setSubtitle}
            tagline={tagline}
            setTagline={setTagline}
            price={price}
            setPrice={setPrice}
            template={selectedTemplate}
            imageSlots={imageSlots}
            storeName={profile?.store_name || profile?.store_slug || ""}
            profilePicture={profile?.profile_picture_url || ""}
            autoSuggest
            onUpdateSlot={updateSlot}
          />
        )}

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            {error}
          </div>
        )}
      </main>

      {/* Bottom action bar */}
      <div className="sticky bottom-0 border-t border-border/50 bg-background/95 backdrop-blur-xl px-4 py-3 flex gap-3 max-w-lg mx-auto w-full">
        {step > 1 && (
          <Button variant="outline" onClick={() => setStep((s) => s - 1)} className="flex-shrink-0">
            Back
          </Button>
        )}
        {step < 3 ? (
          <Button
            className="flex-1"
            disabled={step === 1 ? !canProceed1 : !canProceed2}
            onClick={goNext}
          >
            Next
          </Button>
        ) : (
          <Button
            className="flex-1 gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white border-0 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-shadow"
            disabled={!canGenerate || generating}
            onClick={handleGenerate}
          >
            {generating ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Generating…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" /> Generate Ad
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
