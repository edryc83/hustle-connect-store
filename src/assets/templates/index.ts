import laptopElectronicsPromo from './laptop-electronics-promo.json';
import gamingConsoleSplitPromo from './gaming-console-split-promo.json';
import smartphoneEditorialPromo from './smartphone-editorial-promo.json';
import smartTvCinematicPromo from './smart-tv-cinematic-promo.json';
import tabletGridPromo from './tablet-grid-promo.json';
import desktopPcTerminalPromo from './desktop-pc-terminal-promo.json';
import refrigeratorLifestylePromo from './refrigerator-lifestyle-promo.json';
import washingMachineCircularPromo from './washing-machine-circular-promo.json';
import blenderExplosionPromo from './blender-explosion-promo.json';
import airFryerStackedPromo from './air-fryer-stacked-promo.json';
import cameraDslrViewfinderPromo from './camera-dslr-viewfinder-promo.json';
import coffeeMakerArtisanPromo from './coffee-maker-artisan-promo.json';
import coffeeMakerMenuPromo from './coffee-maker-menu-promo.json';
import dinnerSetLuxuryPromo from './dinner-set-luxury-promo.json';
import pressureCookerGaugePromo from './pressure-cooker-gauge-promo.json';
import riceCookerJapanesePromo from './rice-cooker-japanese-promo.json';
import speakerSoundbarWavePromo from './speaker-soundbar-wave-promo.json';
import womensDressBluePromo from './womens-dress-blue-promo.json';
import womensDressEditorialPromo from './womens-dress-editorial-promo.json';
import womensDressPinkPromo from './womens-dress-pink-promo.json';
import womensDressPurplePromo from './womens-dress-purple-promo.json';
import womensDressPurpleAltPromo from './womens-dress-purple-alt-promo.json';
import type { TemplateEntry, TemplateJSON } from '@/screens/FlyerStudio/flyerTypes';

export const TEMPLATES: TemplateEntry[] = [
  // Electronics
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
    id: 'camera-dslr-viewfinder-promo',
    name: 'Camera DSLR',
    category: 'electronics',
    data: cameraDslrViewfinderPromo as unknown as TemplateJSON,
  },
  {
    id: 'speaker-soundbar-wave-promo',
    name: 'Soundbar Wave',
    category: 'electronics',
    data: speakerSoundbarWavePromo as unknown as TemplateJSON,
  },
  // Home Appliances
  {
    id: 'refrigerator-lifestyle-promo',
    name: 'Refrigerator Lifestyle',
    category: 'electronics',
    data: refrigeratorLifestylePromo as unknown as TemplateJSON,
  },
  {
    id: 'washing-machine-circular-promo',
    name: 'Washing Machine',
    category: 'electronics',
    data: washingMachineCircularPromo as unknown as TemplateJSON,
  },
  {
    id: 'blender-explosion-promo',
    name: 'Blender Explosion',
    category: 'electronics',
    data: blenderExplosionPromo as unknown as TemplateJSON,
  },
  {
    id: 'air-fryer-stacked-promo',
    name: 'Air Fryer Stacked',
    category: 'electronics',
    data: airFryerStackedPromo as unknown as TemplateJSON,
  },
  {
    id: 'coffee-maker-artisan-promo',
    name: 'Coffee Maker Artisan',
    category: 'electronics',
    data: coffeeMakerArtisanPromo as unknown as TemplateJSON,
  },
  {
    id: 'coffee-maker-menu-promo',
    name: 'Coffee Maker Menu',
    category: 'electronics',
    data: coffeeMakerMenuPromo as unknown as TemplateJSON,
  },
  {
    id: 'dinner-set-luxury-promo',
    name: 'Dinner Set Luxury',
    category: 'electronics',
    data: dinnerSetLuxuryPromo as unknown as TemplateJSON,
  },
  {
    id: 'pressure-cooker-gauge-promo',
    name: 'Pressure Cooker',
    category: 'electronics',
    data: pressureCookerGaugePromo as unknown as TemplateJSON,
  },
  {
    id: 'rice-cooker-japanese-promo',
    name: 'Rice Cooker Japanese',
    category: 'electronics',
    data: riceCookerJapanesePromo as unknown as TemplateJSON,
  },
  // Fashion
  {
    id: 'womens-dress-blue-promo',
    name: 'Dress Blue',
    category: 'fashion',
    data: womensDressBluePromo as unknown as TemplateJSON,
  },
  {
    id: 'womens-dress-pink-promo',
    name: 'Dress Pink',
    category: 'fashion',
    data: womensDressPinkPromo as unknown as TemplateJSON,
  },
  {
    id: 'womens-dress-purple-promo',
    name: 'Dress Purple',
    category: 'fashion',
    data: womensDressPurplePromo as unknown as TemplateJSON,
  },
  {
    id: 'womens-dress-purple-alt-promo',
    name: 'Dress Purple Alt',
    category: 'fashion',
    data: womensDressPurpleAltPromo as unknown as TemplateJSON,
  },
  {
    id: 'womens-dress-editorial-promo',
    name: 'Dress Editorial',
    category: 'fashion',
    data: womensDressEditorialPromo as unknown as TemplateJSON,
  },
];

export const getTemplateById = (id: string): TemplateEntry | undefined => {
  return TEMPLATES.find((t) => t.id === id);
};

export const getTemplatesByCategory = (category: string): TemplateEntry[] => {
  if (category === 'all') return TEMPLATES;
  return TEMPLATES.filter((t) => t.category === category);
};
