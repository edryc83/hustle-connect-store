import { useState, useCallback, useEffect } from 'react';
import { removeBackground } from '@imgly/background-removal';
import { supabase } from '@/integrations/supabase/client';
import { extractColors, getDefaultPalette } from '@/lib/colorExtractor';
import { htmlTemplates, getRandomHTMLTemplates, type HTMLTemplate } from '@/components/flyer-generator/templates/html-templates';

export type FlyerStep = 'loading' | 'picking' | 'customizing';
export type FlyerFormat = 'square' | 'story';

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
  template: HTMLTemplate;
  headline: string;
  tagline: string;
}

interface UseFlyerGeneratorProps {
  productName: string;
  price: string;
  description?: string;
  category?: string;
  storeName: string;
  storeSlug: string;
  productImageUrl: string | null;
  whatsappNumber?: string;
}

interface UseFlyerGeneratorReturn {
  // State
  step: FlyerStep;
  loading: boolean;
  error: string | null;

  // Variations (templates to pick from)
  variations: FlyerVariation[];

  // Selection
  selectedTemplate: HTMLTemplate | null;
  format: FlyerFormat;

  // Customization
  headline: string;
  tagline: string;
  colors: string[];
  selectedColor: string | null;

  // Processed image (with background removed)
  processedImage: string | null;
  imageProcessing: boolean;

  // Product info
  productName: string;
  price: string;
  storeName: string;
  storeSlug: string;
  whatsappNumber?: string;

  // Actions
  selectTemplate: (template: HTMLTemplate) => void;
  setFormat: (format: FlyerFormat) => void;
  setHeadline: (value: string) => void;
  setTagline: (value: string) => void;
  setSelectedColor: (color: string) => void;
  goBack: () => void;
}

// Default copy for each template
const defaultCopy = [
  { headline: 'Hot Deal Alert!', tagline: 'Quality you can trust at prices you\'ll love' },
  { headline: 'Premium Quality', tagline: 'Shop now and save big on your favorites' },
  { headline: 'New Arrival', tagline: 'Be the first to get the best products' },
];

export function useFlyerGenerator({
  productName,
  price,
  description,
  category,
  storeName,
  storeSlug,
  productImageUrl,
  whatsappNumber,
}: UseFlyerGeneratorProps): UseFlyerGeneratorReturn {
  // Core state
  const [step, setStep] = useState<FlyerStep>('loading');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Template variations
  const [variations, setVariations] = useState<FlyerVariation[]>(() => {
    const templates = getRandomHTMLTemplates(3);
    return templates.map((template, index) => ({
      template,
      ...defaultCopy[index % defaultCopy.length],
    }));
  });

  // Selection state
  const [selectedTemplate, setSelectedTemplate] = useState<HTMLTemplate | null>(null);
  const [format, setFormat] = useState<FlyerFormat>('square');

  // Customization state
  const [headline, setHeadline] = useState('');
  const [tagline, setTagline] = useState('');
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
            // Map AI variations to our template variations
            const templates = getRandomHTMLTemplates(3);
            setVariations(templates.map((template, index) => ({
              template,
              headline: data.variations[index]?.headline || defaultCopy[index].headline,
              tagline: data.variations[index]?.tagline || defaultCopy[index].tagline,
            })));
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

  // Select a template and populate content
  const selectTemplate = useCallback((template: HTMLTemplate) => {
    setSelectedTemplate(template);

    // Find the variation for this template
    const variation = variations.find(v => v.template.id === template.id);
    if (variation) {
      setHeadline(variation.headline);
      setTagline(variation.tagline);
    }

    setStep('customizing');
  }, [variations]);

  // Go back to style picker
  const goBack = useCallback(() => {
    setStep('picking');
    setSelectedTemplate(null);
  }, []);

  return {
    step,
    loading,
    error,
    variations,
    selectedTemplate,
    format,
    headline,
    tagline,
    colors,
    selectedColor,
    processedImage,
    imageProcessing,
    productName,
    price,
    storeName,
    storeSlug,
    whatsappNumber,
    selectTemplate,
    setFormat,
    setHeadline,
    setTagline,
    setSelectedColor,
    goBack,
  };
}
