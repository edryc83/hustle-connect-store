import laptopElectronicsPromo from './laptop-electronics-promo.json';
import type { TemplateEntry, TemplateJSON } from '@/screens/FlyerStudio/flyerTypes';

export const TEMPLATES: TemplateEntry[] = [
  {
    id: 'laptop-electronics-promo',
    name: 'Laptop Pro',
    category: 'electronics',
    data: laptopElectronicsPromo as unknown as TemplateJSON,
  },
];

export const getTemplateById = (id: string): TemplateEntry | undefined => {
  return TEMPLATES.find((t) => t.id === id);
};

export const getTemplatesByCategory = (category: string): TemplateEntry[] => {
  if (category === 'all') return TEMPLATES;
  return TEMPLATES.filter((t) => t.category === category);
};
