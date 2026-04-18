import { useState, useCallback, useEffect } from 'react';
import { TEMPLATES, getTemplateById } from '@/assets/templates';
import type { TemplateJSON, TemplateEntry, UserState } from './flyerTypes';

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
  template: TemplateJSON | null;
  templates: TemplateEntry[];
  userState: UserState;
  isLoading: boolean;

  // Actions
  selectTemplate: (id: string) => void;
  updateToken: (key: string, value: string) => void;
  resetToDefaults: () => void;
}

// Initialize userState from template tokens with defaults
function initializeUserState(template: TemplateJSON, product: ProductData, store: StoreData): UserState {
  const state: UserState = {};

  for (const [key, config] of Object.entries(template.tokens)) {
    // Use smart defaults based on product/store data where applicable
    let value = config.default;

    // Map common tokens to product/store data
    if (key.includes('PRODUCT_IMAGE') && product.imageUrl) {
      value = product.imageUrl;
    } else if (key.includes('STORE_NAME') && store.name) {
      value = store.name;
    } else if (key.includes('PRICE') && product.price) {
      value = product.price;
    } else if (key.includes('PHONE') && store.phone) {
      value = store.phone;
    } else if (key.includes('PRODUCT_NAME') && product.name) {
      value = product.name;
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

  // Load template when templateId changes
  useEffect(() => {
    const entry = getTemplateById(templateId);
    if (entry?.data) {
      setTemplate(entry.data);
      // Initialize userState from token defaults
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
    }
  }, [template, product, store]);

  return {
    template,
    templates: TEMPLATES,
    userState,
    isLoading,
    selectTemplate,
    updateToken,
    resetToDefaults,
  };
}
