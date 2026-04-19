import laptopElectronicsPromo from './laptop-electronics-promo.json';
import gamingConsoleSplitPromo from './gaming-console-split-promo.json';
import smartphoneEditorialPromo from './smartphone-editorial-promo.json';
import smartTvCinematicPromo from './smart-tv-cinematic-promo.json';
import tabletGridPromo from './tablet-grid-promo.json';
import desktopPcTerminalPromo from './desktop-pc-terminal-promo.json';
import refrigeratorLifestylePromo from './refrigerator-lifestyle-promo.json';
import washingMachineCircularPromo from './washing-machine-circular-promo.json';
import blenderExplosionPromo from './blender-explosion-promo.json';
import type { TemplateEntry, TemplateJSON } from '@/screens/FlyerStudio/flyerTypes';

export const TEMPLATES: TemplateEntry[] = [
  {
    id: 'laptop-electronics-promo',
    name: 'Laptop Pro',
    category: 'electronics',
    data: laptopElectronicsPromo as unknown as TemplateJSON,
  },
  {
    id: 'gaming-console-split-promo',
    name: 'Gaming Console',
    category: 'electronics',
    data: gamingConsoleSplitPromo as unknown as TemplateJSON,
  },
  {
    id: 'smartphone-editorial-promo',
    name: 'Smartphone Editorial',
    category: 'electronics',
    data: smartphoneEditorialPromo as unknown as TemplateJSON,
  },
  {
    id: 'smart-tv-cinematic-promo',
    name: 'Smart TV Cinematic',
    category: 'electronics',
    data: smartTvCinematicPromo as unknown as TemplateJSON,
  },
  {
    id: 'tablet-grid-promo',
    name: 'Tablet Grid',
    category: 'electronics',
    data: tabletGridPromo as unknown as TemplateJSON,
  },
  {
    id: 'desktop-pc-terminal-promo',
    name: 'Desktop PC Terminal',
    category: 'electronics',
    data: desktopPcTerminalPromo as unknown as TemplateJSON,
  },
  {
    id: 'refrigerator-lifestyle-promo',
    name: 'Refrigerator Lifestyle',
    category: 'electronics',
    data: refrigeratorLifestylePromo as unknown as TemplateJSON,
  },
  {
    id: 'washing-machine-circular-promo',
    name: 'Washing Machine Circular',
    category: 'electronics',
    data: washingMachineCircularPromo as unknown as TemplateJSON,
  },
  {
    id: 'blender-explosion-promo',
    name: 'Blender Explosion',
    category: 'electronics',
    data: blenderExplosionPromo as unknown as TemplateJSON,
  },
];

export const getTemplateById = (id: string): TemplateEntry | undefined => {
  return TEMPLATES.find((t) => t.id === id);
};

export const getTemplatesByCategory = (category: string): TemplateEntry[] => {
  if (category === 'all') return TEMPLATES;
  return TEMPLATES.filter((t) => t.category === category);
};
