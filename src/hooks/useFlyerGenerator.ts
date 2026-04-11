import { useState, useCallback, useEffect } from 'react';
import { removeBackground } from '@imgly/background-removal';
import { supabase } from '@/integrations/supabase/client';
import { extractColors, getDefaultPalette } from '@/lib/colorExtractor';
import type { FlyerStyle, FlyerFormat } from '@/components/flyer-generator/templates';

export type FlyerStep = 'loading' | 'picking' | 'customizing';

interface FlyerVariation {
  style: FlyerStyle;
  headline: string;
  tagline: string;
  cta: string;
}

interface UseFlyerGeneratorProps {
  productName: string;
  price: string;
  description?: string;
  category?: string;
  storeName: string;
  productImageUrl: string | null;
}

interface UseFlyerGeneratorReturn {
  // State
  step: FlyerStep;
  loading: boolean;
  error: string | null;

  // Variations
  variations: FlyerVariation[];

  // Selection
  selectedStyle: FlyerStyle | null;
  format: FlyerFormat;

  // Customization
  headline: string;
  tagline: string;
  cta: string;
  colors: string[];
  selectedColor: string | null;

  // Processed image (with background removed)
  processedImage: string | null;
  imageProcessing: boolean;

  // Actions
  selectStyle: (style: FlyerStyle) => void;
  setFormat: (format: FlyerFormat) => void;
  setHeadline: (value: string) => void;
  setTagline: (value: string) => void;
  setCta: (value: string) => void;
  setSelectedColor: (color: string) => void;
  reset: () => void;
  goBack: () => void;
}

const DEFAULT_VARIATIONS: FlyerVariation[] = [
  { style: 'minimal', headline: 'New Arrival', tagline: 'Quality you can trust', cta: 'Shop Now' },
  { style: 'bold', headline: 'Hot Deal!', tagline: "Don't miss out on this offer", cta: 'Get Yours' },
  { style: 'elegant', headline: 'Premium Pick', tagline: 'Elevate your style today', cta: 'Discover' },
];

export function useFlyerGenerator({
  productName,
  price,
  description,
  category,
  storeName,
  productImageUrl,
}: UseFlyerGeneratorProps): UseFlyerGeneratorReturn {
  // Core state
  const [step, setStep] = useState<FlyerStep>('loading');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // AI-generated variations
  const [variations, setVariations] = useState<FlyerVariation[]>(DEFAULT_VARIATIONS);

  // Selection state
  const [selectedStyle, setSelectedStyle] = useState<FlyerStyle | null>(null);
  const [format, setFormat] = useState<FlyerFormat>('square');

  // Customization state
  const [headline, setHeadline] = useState('');
  const [tagline, setTagline] = useState('');
  const [cta, setCta] = useState('');
  const [colors, setColors] = useState<string[]>(getDefaultPalette());
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  // Image processing
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [imageProcessing, setImageProcessing] = useState(false);

  // Initialize: Generate AI content + process image
  useEffect(() => {
    let cancelled = false;

    const initialize = async () => {
      setLoading(true);
      setError(null);

      // Start both tasks in parallel
      const contentPromise = generateContent();
      const imagePromise = processImage();

      await Promise.all([contentPromise, imagePromise]);

      if (!cancelled) {
        setLoading(false);
        setStep('picking');
      }
    };

    const generateContent = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('generate-flyer-content', {
          body: {
            productName,
            price,
            description,
            category,
            storeName,
          },
        });

        if (error) throw error;

        if (data?.variations && Array.isArray(data.variations)) {
          if (!cancelled) {
            setVariations(data.variations);
          }
        }
      } catch (err) {
        console.error('AI content generation error:', err);
        // Use fallbacks - already set as default
      }
    };

    const processImage = async () => {
      if (!productImageUrl) return;

      setImageProcessing(true);

      try {
        // Extract colors from original image first
        const extractedColors = await extractColors(productImageUrl);
        if (!cancelled) {
          setColors(extractedColors);
          setSelectedColor(extractedColors[0] || null);
        }

        // Remove background
        const blob = await removeBackground(productImageUrl);
        if (!cancelled) {
          const url = URL.createObjectURL(blob);
          setProcessedImage(url);
        }
      } catch (err) {
        console.error('Image processing error:', err);
        // Use original image as fallback
        if (!cancelled) {
          setProcessedImage(productImageUrl);
        }
      } finally {
        if (!cancelled) {
          setImageProcessing(false);
        }
      }
    };

    initialize();

    return () => {
      cancelled = true;
    };
  }, [productName, price, description, category, storeName, productImageUrl]);

  // Select a style and populate content
  const selectStyle = useCallback((style: FlyerStyle) => {
    setSelectedStyle(style);

    // Find the variation for this style
    const variation = variations.find(v => v.style === style);
    if (variation) {
      setHeadline(variation.headline);
      setTagline(variation.tagline);
      setCta(variation.cta);
    }

    setStep('customizing');
  }, [variations]);

  // Go back to style picker
  const goBack = useCallback(() => {
    setStep('picking');
    setSelectedStyle(null);
  }, []);

  // Reset everything
  const reset = useCallback(() => {
    setStep('loading');
    setLoading(true);
    setError(null);
    setSelectedStyle(null);
    setFormat('square');
    setHeadline('');
    setTagline('');
    setCta('');
    setSelectedColor(null);
  }, []);

  return {
    step,
    loading,
    error,
    variations,
    selectedStyle,
    format,
    headline,
    tagline,
    cta,
    colors,
    selectedColor,
    processedImage,
    imageProcessing,
    selectStyle,
    setFormat,
    setHeadline,
    setTagline,
    setCta,
    setSelectedColor,
    reset,
    goBack,
  };
}
