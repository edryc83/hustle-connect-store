import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { extractColors, getDefaultPalette } from '@/lib/colorExtractor';
import { TEMPLATES, getTemplateById } from '@/assets/templates';
import type { FlyerState, TemplateJSON, TemplateEntry, LayerOffset, AdditionalImage } from './flyerTypes';

export interface ProductData {
  id: string;
  name: string;
  price: string;
  description?: string;
  category?: string;
  imageUrl: string | null;
}

export interface StoreData {
  name: string;
  slug: string;
  phone?: string;
  address?: string;
}

interface UseFlyerProps {
  product: ProductData;
  store: StoreData;
}

interface UseFlyerReturn {
  flyer: FlyerState;
  templateJson: TemplateJSON | null;
  templates: TemplateEntry[];
  extractedColors: string[];
  isRemovingBg: boolean;

  // Actions
  selectTemplate: (id: string) => void;
  setTitle: (v: string) => void;
  setTagline: (v: string) => void;
  setBadge: (v: string) => void;
  setCta: (v: string) => void;
  setBodyText: (v: string) => void;
  setPhone: (v: string) => void;
  setAddress: (v: string) => void;
  setBgColor: (v: string) => void;
  setAccentColor: (v: string) => void;
  setTextColor: (v: string) => void;
  setFont: (v: string) => void;
  setFontSize: (size: number) => void;
  setProductImage: (url: string) => void;
  setLayerOffset: (layerId: string, offset: LayerOffset) => void;
  setFontSizeOverride: (layerId: string, size: number) => void;
  setTextColorOverride: (layerId: string, color: string) => void;
  deleteLayer: (layerId: string) => void;
  restoreDeletedLayers: () => void;
  selectLayer: (layerId: string | null) => void;
  addImage: (url: string) => void;
  updateImage: (id: string, updates: Partial<AdditionalImage>) => void;
  removeImage: (id: string) => void;
  removeBackground: () => Promise<void>;
  regenerate: () => void;
}

// Generate smart initial text from product name
function generateInitialText(productName: string, price: string) {
  // Extract key words from product name for smart headlines
  const words = productName.split(' ').filter(w => w.length > 2);
  const firstWord = words[0] || 'New';

  // Generate category-aware taglines
  const lowerName = productName.toLowerCase();
  let tagline = 'Quality you\'ll love';

  if (lowerName.includes('shoe') || lowerName.includes('sneaker') || lowerName.includes('boot')) {
    tagline = 'Step into style';
  } else if (lowerName.includes('shirt') || lowerName.includes('dress') || lowerName.includes('jacket')) {
    tagline = 'Elevate your wardrobe';
  } else if (lowerName.includes('phone') || lowerName.includes('laptop') || lowerName.includes('watch')) {
    tagline = 'Tech that impresses';
  } else if (lowerName.includes('bag') || lowerName.includes('purse') || lowerName.includes('wallet')) {
    tagline = 'Carry with confidence';
  } else if (lowerName.includes('cream') || lowerName.includes('lotion') || lowerName.includes('beauty')) {
    tagline = 'Glow like never before';
  }

  return {
    title: firstWord.toUpperCase(),
    tagline,
    badge: price.includes('%') ? price : 'HOT',
    cta: 'ORDER NOW',
  };
}

const DEFAULT_FLYER: FlyerState = {
  template: 'noir-orchidee',
  title: 'NEW',
  tagline: 'Quality you\'ll love',
  badge: 'HOT',
  cta: 'ORDER NOW',
  bodyText: '',
  phone: '',
  address: '',
  storeName: '',
  productName: '',
  productPrice: '',
  bgColor: '#9b59b6',
  accentColor: '#8B2FC9',
  textColor: '#ffffff',
  font: 'Inter',
  fontSize: 1.0,
  productImage: null,
  additionalImages: [],
  layerOffsets: {},
  fontSizeOverrides: {},
  textColorOverrides: {},
  deletedLayerIds: [],
  selectedLayerId: null,
  isGenerating: true,
  generationStep: 0,
};

export function useFlyer({ product, store }: UseFlyerProps): UseFlyerReturn {
  // Generate smart initial text based on product
  const initialText = generateInitialText(product.name, product.price);

  const [flyer, setFlyer] = useState<FlyerState>({
    ...DEFAULT_FLYER,
    // Smart defaults based on product
    title: initialText.title,
    tagline: initialText.tagline,
    badge: initialText.badge,
    cta: initialText.cta,
    // Store and product info
    storeName: store.name,
    productName: product.name,
    productPrice: product.price,
    phone: store.phone || '',
    address: store.address || '',
    productImage: product.imageUrl,
  });

  const [templateJson, setTemplateJson] = useState<TemplateJSON | null>(null);
  const [extractedColors, setExtractedColors] = useState<string[]>(getDefaultPalette());
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  const hasInitialized = useRef(false);

  // Load template JSON when template changes
  useEffect(() => {
    const entry = getTemplateById(flyer.template);
    if (entry) {
      setTemplateJson(entry.data);
      // Set colors from template if available
      if (entry.data.colors?.bg) {
        setFlyer((prev) => ({
          ...prev,
          bgColor: entry.data.colors.bg,
          accentColor: entry.data.colors.accent || prev.accentColor,
        }));
      }
    }
  }, [flyer.template]);

  // Initialize: generate AI content + extract colors
  const initialize = useCallback(async () => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    setFlyer((prev) => ({ ...prev, isGenerating: true, generationStep: 0 }));

    // Step 1: Reading product details
    await new Promise((r) => setTimeout(r, 400));
    setFlyer((prev) => ({ ...prev, generationStep: 1 }));

    // Step 2: Generate AI copy
    let aiTitle = DEFAULT_FLYER.title;
    let aiTagline = DEFAULT_FLYER.tagline;
    let aiBadge = DEFAULT_FLYER.badge;
    let aiCta = DEFAULT_FLYER.cta;

    try {
      const { data, error } = await supabase.functions.invoke('generate-flyer-content', {
        body: {
          productName: product.name,
          price: product.price,
          description: product.description,
          category: product.category,
          storeName: store.name,
        },
      });

      if (!error && data?.variations?.length > 0) {
        const v = data.variations[0];
        aiTitle = v.headline || aiTitle;
        aiTagline = v.tagline || aiTagline;
        aiCta = v.cta || aiCta;
        // Use price as badge if product has a discount indicator
        if (product.price.includes('%')) {
          aiBadge = product.price;
        } else {
          // Generate a random discount between 10-30%
          aiBadge = `-${Math.floor(Math.random() * 20 + 10)}%`;
        }
      }
    } catch (err) {
      console.error('AI generation error:', err);
    }

    setFlyer((prev) => ({
      ...prev,
      title: aiTitle,
      tagline: aiTagline,
      badge: aiBadge,
      cta: aiCta,
      generationStep: 2,
    }));

    // Step 3: Extract colors from product image
    if (product.imageUrl) {
      try {
        const colors = await extractColors(product.imageUrl);
        setExtractedColors(colors);
      } catch (err) {
        console.error('Color extraction error:', err);
      }
    }

    setFlyer((prev) => ({ ...prev, generationStep: 3 }));

    // Step 4: Composing flyer
    await new Promise((r) => setTimeout(r, 300));

    setFlyer((prev) => ({
      ...prev,
      isGenerating: false,
      generationStep: 4,
    }));
  }, [product, store]);

  // Run initialization on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Remove background using remove.bg API (server-side)
  const removeBackgroundFn = useCallback(async () => {
    const imageUrl = flyer.productImage;
    if (!imageUrl || isRemovingBg) return;

    // Skip if already processed (check for bg-removed in URL)
    if (imageUrl.includes('bg-removed')) {
      console.log('Image already has background removed');
      return;
    }

    setIsRemovingBg(true);

    try {
      const { data, error } = await supabase.functions.invoke('remove-background', {
        body: { image_url: imageUrl },
      });

      if (error) {
        console.error('Background removal error:', error);
        alert('Failed to remove background. Please try again.');
        return;
      }

      if (data?.url) {
        // Add cache-busting parameter to force reload
        const newUrl = data.url + (data.url.includes('?') ? '&' : '?') + 't=' + Date.now();
        setFlyer((prev) => ({ ...prev, productImage: newUrl }));

        if (data.hasTransparency === false) {
          console.warn('Image may not have full transparency');
        }
      } else if (data?.error) {
        console.error('API error:', data.error);
        alert(data.error);
      }
    } catch (err) {
      console.error('Background removal failed:', err);
      alert('Failed to remove background. Please check your connection.');
    } finally {
      setIsRemovingBg(false);
    }
  }, [flyer.productImage, isRemovingBg]);

  // Template selection
  const selectTemplate = useCallback((id: string) => {
    setFlyer((prev) => ({ ...prev, template: id }));
  }, []);

  // Setters
  const setTitle = useCallback((v: string) => setFlyer((prev) => ({ ...prev, title: v })), []);
  const setTagline = useCallback((v: string) => setFlyer((prev) => ({ ...prev, tagline: v })), []);
  const setBadge = useCallback((v: string) => setFlyer((prev) => ({ ...prev, badge: v })), []);
  const setCta = useCallback((v: string) => setFlyer((prev) => ({ ...prev, cta: v })), []);
  const setBodyText = useCallback((v: string) => setFlyer((prev) => ({ ...prev, bodyText: v })), []);
  const setPhone = useCallback((v: string) => setFlyer((prev) => ({ ...prev, phone: v })), []);
  const setAddress = useCallback((v: string) => setFlyer((prev) => ({ ...prev, address: v })), []);
  const setBgColor = useCallback((v: string) => setFlyer((prev) => ({ ...prev, bgColor: v })), []);
  const setAccentColor = useCallback((v: string) => setFlyer((prev) => ({ ...prev, accentColor: v })), []);
  const setTextColor = useCallback((v: string) => setFlyer((prev) => ({ ...prev, textColor: v })), []);
  const setFont = useCallback((v: string) => setFlyer((prev) => ({ ...prev, font: v })), []);
  const setFontSize = useCallback((size: number) => setFlyer((prev) => ({ ...prev, fontSize: size })), []);
  const setProductImage = useCallback((url: string) => setFlyer((prev) => ({ ...prev, productImage: url })), []);
  const setLayerOffset = useCallback((layerId: string, offset: LayerOffset) => {
    setFlyer((prev) => ({
      ...prev,
      layerOffsets: { ...prev.layerOffsets, [layerId]: offset },
    }));
  }, []);

  // Font size override for individual text elements
  const setFontSizeOverride = useCallback((layerId: string, size: number) => {
    setFlyer((prev) => ({
      ...prev,
      fontSizeOverrides: { ...prev.fontSizeOverrides, [layerId]: size },
    }));
  }, []);

  // Text color override for individual text elements
  const setTextColorOverride = useCallback((layerId: string, color: string) => {
    setFlyer((prev) => ({
      ...prev,
      textColorOverrides: { ...prev.textColorOverrides, [layerId]: color },
    }));
  }, []);

  // Delete a layer
  const deleteLayer = useCallback((layerId: string) => {
    setFlyer((prev) => ({
      ...prev,
      deletedLayerIds: [...prev.deletedLayerIds, layerId],
      selectedLayerId: null,
    }));
  }, []);

  // Restore all deleted layers
  const restoreDeletedLayers = useCallback(() => {
    setFlyer((prev) => ({
      ...prev,
      deletedLayerIds: [],
    }));
  }, []);

  // Select a layer
  const selectLayer = useCallback((layerId: string | null) => {
    setFlyer((prev) => ({ ...prev, selectedLayerId: layerId }));
  }, []);

  // Additional images (logos, etc)
  const addImage = useCallback((url: string) => {
    const newImage: AdditionalImage = {
      id: `img-${Date.now()}`,
      url,
      x: 50,
      y: 50,
      width: 150,
      height: 150,
    };
    setFlyer((prev) => ({
      ...prev,
      additionalImages: [...prev.additionalImages, newImage],
    }));
  }, []);

  const updateImage = useCallback((id: string, updates: Partial<AdditionalImage>) => {
    setFlyer((prev) => ({
      ...prev,
      additionalImages: prev.additionalImages.map((img) =>
        img.id === id ? { ...img, ...updates } : img
      ),
    }));
  }, []);

  const removeImage = useCallback((id: string) => {
    setFlyer((prev) => ({
      ...prev,
      additionalImages: prev.additionalImages.filter((img) => img.id !== id),
    }));
  }, []);

  // Regenerate AI content
  const regenerate = useCallback(() => {
    hasInitialized.current = false;
    initialize();
  }, [initialize]);

  return {
    flyer,
    templateJson,
    templates: TEMPLATES,
    extractedColors,
    isRemovingBg,
    selectTemplate,
    setTitle,
    setTagline,
    setBadge,
    setCta,
    setBodyText,
    setPhone,
    setAddress,
    setBgColor,
    setAccentColor,
    setTextColor,
    setFont,
    setFontSize,
    setProductImage,
    setLayerOffset,
    setFontSizeOverride,
    setTextColorOverride,
    deleteLayer,
    restoreDeletedLayers,
    selectLayer,
    addImage,
    updateImage,
    removeImage,
    removeBackground: removeBackgroundFn,
    regenerate,
  };
}
