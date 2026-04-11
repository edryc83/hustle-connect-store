import { useState, useCallback, useEffect } from 'react';
import { removeBackground } from '@imgly/background-removal';
import { supabase } from '@/integrations/supabase/client';
import { extractColors, getDefaultPalette } from '@/lib/colorExtractor';
import type { FlyerStyle, FlyerFormat } from '@/components/flyer-generator/templates';
import { getRandomTemplates, type FlyerTemplate } from '@/components/flyer-generator/templates';

export type FlyerStep = 'loading' | 'picking' | 'customizing';

// Available font options
export const FONT_OPTIONS = [
  { id: 'inter', name: 'Inter', family: 'Inter, sans-serif', category: 'modern' },
  { id: 'poppins', name: 'Poppins', family: 'Poppins, sans-serif', category: 'modern' },
  { id: 'montserrat', name: 'Montserrat', family: 'Montserrat, sans-serif', category: 'modern' },
  { id: 'playfair', name: 'Playfair', family: 'Playfair Display, serif', category: 'elegant' },
  { id: 'dancing', name: 'Dancing Script', family: 'Dancing Script, cursive', category: 'script' },
  { id: 'bebas', name: 'Bebas Neue', family: 'Bebas Neue, sans-serif', category: 'bold' },
  { id: 'oswald', name: 'Oswald', family: 'Oswald, sans-serif', category: 'bold' },
  { id: 'roboto', name: 'Roboto', family: 'Roboto, sans-serif', category: 'clean' },
  { id: 'lato', name: 'Lato', family: 'Lato, sans-serif', category: 'clean' },
  { id: 'raleway', name: 'Raleway', family: 'Raleway, sans-serif', category: 'elegant' },
] as const;

export type FontOption = typeof FONT_OPTIONS[number];

interface FlyerVariation {
  style: FlyerStyle;
  templateId: string;
  template: FlyerTemplate;
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
  selectedTemplate: FlyerTemplate | null;
  format: FlyerFormat;

  // Customization
  headline: string;
  tagline: string;
  cta: string;
  colors: string[];
  selectedColor: string | null;
  selectedFont: FontOption;

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
  setSelectedFont: (font: FontOption) => void;
  reset: () => void;
  goBack: () => void;
}

// Generate default variations using random templates
function generateDefaultVariations(): FlyerVariation[] {
  const randomTemplates = getRandomTemplates(3);
  const defaultCopy = [
    { headline: 'New Arrival', tagline: 'Quality you can trust', cta: 'Shop Now' },
    { headline: 'Hot Deal!', tagline: "Don't miss out on this offer", cta: 'Get Yours' },
    { headline: 'Premium Pick', tagline: 'Elevate your style today', cta: 'Discover' },
  ];

  return randomTemplates.map((template, index) => ({
    style: template.style,
    templateId: template.id,
    template,
    ...defaultCopy[index % defaultCopy.length],
  }));
}

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

  // AI-generated variations (initialize with random templates)
  const [variations, setVariations] = useState<FlyerVariation[]>(() => generateDefaultVariations());

  // Selection state
  const [selectedStyle, setSelectedStyle] = useState<FlyerStyle | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<FlyerTemplate | null>(null);
  const [format, setFormat] = useState<FlyerFormat>('square');

  // Customization state
  const [headline, setHeadline] = useState('');
  const [tagline, setTagline] = useState('');
  const [cta, setCta] = useState('');
  const [colors, setColors] = useState<string[]>(getDefaultPalette());
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedFont, setSelectedFont] = useState<FontOption>(FONT_OPTIONS[0]);

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
      setSelectedTemplate(variation.template);
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
    setSelectedTemplate(null);
  }, []);

  // Reset everything
  const reset = useCallback(() => {
    setStep('loading');
    setLoading(true);
    setError(null);
    setSelectedStyle(null);
    setSelectedTemplate(null);
    setFormat('square');
    setHeadline('');
    setTagline('');
    setCta('');
    setSelectedColor(null);
    setSelectedFont(FONT_OPTIONS[0]);
    setVariations(generateDefaultVariations());
  }, []);

  return {
    step,
    loading,
    error,
    variations,
    selectedStyle,
    selectedTemplate,
    format,
    headline,
    tagline,
    cta,
    colors,
    selectedColor,
    selectedFont,
    processedImage,
    imageProcessing,
    selectStyle,
    setFormat,
    setHeadline,
    setTagline,
    setCta,
    setSelectedColor,
    setSelectedFont,
    reset,
    goBack,
  };
}
