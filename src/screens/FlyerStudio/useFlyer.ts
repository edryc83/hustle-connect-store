import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TEMPLATES, getTemplateById } from '@/assets/templates';
import type { TemplateJSON, TemplateEntry, UserState } from './flyerTypes';
import type { AdditionalImage } from './FlyerCanvas';

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

export interface TextOverrides {
  fontScale: Record<string, number>;      // token key -> scale multiplier (e.g., 0.8, 1.0, 1.5)
  position: Record<string, { x: number; y: number }>; // token key -> position offset
}

interface UseFlyerReturn {
  template: TemplateJSON | null;
  templates: TemplateEntry[];
  userState: UserState;
  isLoading: boolean;
  isRemovingBg: boolean;
  isRemovingLogoBg: boolean;
  additionalImages: AdditionalImage[];
  productImageScale: number;
  productImageOffset: { x: number; y: number };
  textOverrides: TextOverrides;

  // Actions
  selectTemplate: (id: string) => void;
  updateToken: (key: string, value: string) => void;
  resetToDefaults: () => void;
  removeBackground: () => Promise<void>;
  addLogo: (url: string) => void;
  removeLogo: (id: string) => void;
  setProductImageScale: (scale: number) => void;
  setProductImageOffset: (offset: { x: number; y: number }) => void;
  setTextFontScale: (tokenKey: string, scale: number) => void;
  setTextPosition: (tokenKey: string, offset: { x: number; y: number }) => void;
}

// Initialize userState from template tokens with defaults
function initializeUserState(template: TemplateJSON, product: ProductData, store: StoreData): UserState {
  const state: UserState = {};

  for (const [key, config] of Object.entries(template.tokens)) {
    let value = config.default;

    // Map common tokens to product/store data
    if (key.includes('PRODUCT_IMAGE') && product.imageUrl) {
      value = product.imageUrl;
    } else if (key.includes('STORE_NAME') && store.name) {
      value = store.name.toUpperCase();
    } else if (key.includes('BRAND_INITIAL') && store.name) {
      value = store.name.charAt(0).toUpperCase();
    } else if (key.includes('PRICE_VALUE') && product.price) {
      value = product.price;
    } else if (key.includes('PHONE') && store.phone) {
      value = store.phone;
    } else if (key.includes('PRODUCT_NAME') && product.name) {
      value = product.name;
    } else if (key.includes('TITLE_LINE1') && product.name) {
      // Extract first word for title
      const words = product.name.split(' ');
      value = words[0]?.toUpperCase() || 'NEW';
    } else if (key.includes('TITLE_LINE2') && product.name) {
      // Extract second word or category
      const words = product.name.split(' ');
      value = words[1]?.toUpperCase() || product.category?.toUpperCase() || 'PRODUCT';
    }

    state[key] = value;
  }

  return state;
}

export function useFlyer({ product, store }: UseFlyerProps): UseFlyerReturn {
  const [templateId, setTemplateId] = useState<string>(TEMPLATES[0]?.id ?? '');
  const [template, setTemplate] = useState<TemplateJSON | null>(null);
  const [userState, setUserState] = useState<UserState>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  const [isRemovingLogoBg, setIsRemovingLogoBg] = useState(false);
  const [additionalImages, setAdditionalImages] = useState<AdditionalImage[]>([]);
  const [productImageScale, setProductImageScale] = useState(1);
  const [productImageOffset, setProductImageOffset] = useState({ x: 0, y: 0 });
  const [textOverrides, setTextOverrides] = useState<TextOverrides>({
    fontScale: {},
    position: {},
  });

  // Load template when templateId changes
  useEffect(() => {
    const entry = getTemplateById(templateId);
    if (entry?.data) {
      setTemplate(entry.data);
      setUserState(initializeUserState(entry.data, product, store));
      setIsLoading(false);
    }
  }, [templateId, product, store]);

  // Template selection
  const selectTemplate = useCallback((id: string) => {
    setIsLoading(true);
    setTemplateId(id);
  }, []);

  // Update a single token value
  const updateToken = useCallback((key: string, value: string) => {
    setUserState(prev => ({ ...prev, [key]: value }));
  }, []);

  // Reset all tokens to defaults
  const resetToDefaults = useCallback(() => {
    if (template) {
      setUserState(initializeUserState(template, product, store));
      setAdditionalImages([]);
      setProductImageScale(1);
      setProductImageOffset({ x: 0, y: 0 });
      setTextOverrides({ fontScale: {}, position: {} });
    }
  }, [template, product, store]);

  // Set font scale for a text token
  const setTextFontScale = useCallback((tokenKey: string, scale: number) => {
    setTextOverrides(prev => ({
      ...prev,
      fontScale: { ...prev.fontScale, [tokenKey]: scale },
    }));
  }, []);

  // Set position offset for a text token
  const setTextPosition = useCallback((tokenKey: string, offset: { x: number; y: number }) => {
    setTextOverrides(prev => ({
      ...prev,
      position: { ...prev.position, [tokenKey]: offset },
    }));
  }, []);

  // Remove background using remove.bg API
  const removeBackground = useCallback(async () => {
    // Find the product image token
    const imageKey = Object.keys(userState).find(k => k.includes('PRODUCT_IMAGE'));
    const imageUrl = imageKey ? userState[imageKey] : null;

    if (!imageUrl || isRemovingBg) return;

    // Skip if already processed
    if (imageUrl.includes('bg-removed')) return;

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

      if (data?.url && imageKey) {
        const newUrl = data.url + (data.url.includes('?') ? '&' : '?') + 't=' + Date.now();
        setUserState(prev => ({ ...prev, [imageKey]: newUrl }));

        if (data.method === 'ai-fallback') {
          alert('Background removed. Note: AI processing was used, so edges may not be perfectly transparent.');
        }
      } else if (data?.error) {
        alert(data.error);
      }
    } catch (err) {
      console.error('Background removal failed:', err);
      alert('Failed to remove background. Please check your connection.');
    } finally {
      setIsRemovingBg(false);
    }
  }, [userState, isRemovingBg]);

  // Add logo with auto background removal
  const addLogo = useCallback(async (url: string) => {
    const logoId = `logo-${Date.now()}`;

    // Add logo immediately with original image
    const newLogo: AdditionalImage = {
      id: logoId,
      url,
      x: 800,
      y: 50,
      width: 150,
      height: 150,
    };
    setAdditionalImages(prev => [...prev, newLogo]);

    // Auto-remove background
    setIsRemovingLogoBg(true);
    try {
      const { data, error } = await supabase.functions.invoke('remove-background', {
        body: { image_url: url },
      });

      if (!error && data?.url) {
        const cleanUrl = data.url + (data.url.includes('?') ? '&' : '?') + 't=' + Date.now();
        // Update the logo with the transparent version
        setAdditionalImages(prev =>
          prev.map(img => img.id === logoId ? { ...img, url: cleanUrl } : img)
        );
      }
    } catch (err) {
      console.error('Logo background removal failed:', err);
      // Keep the original logo if removal fails
    } finally {
      setIsRemovingLogoBg(false);
    }
  }, []);

  // Remove logo
  const removeLogo = useCallback((id: string) => {
    setAdditionalImages(prev => prev.filter(img => img.id !== id));
  }, []);

  return {
    template,
    templates: TEMPLATES,
    userState,
    isLoading,
    isRemovingBg,
    isRemovingLogoBg,
    additionalImages,
    productImageScale,
    productImageOffset,
    textOverrides,
    selectTemplate,
    updateToken,
    resetToDefaults,
    removeBackground,
    addLogo,
    removeLogo,
    setProductImageScale,
    setProductImageOffset,
    setTextFontScale,
    setTextPosition,
  };
}
