import noirOrchidee from './template-noir-orchidee.json';
import marvelFrequency from './template_01_marvel_frequency_hub.json';
import lorealSerum from './template_02_loreal_serum.json';
import dreamGadget from './template_03_dream_gadget.json';
import novaCarry from './template_04_nova_carry.json';
import albertGadget from './template_05_albert_gadget_hub.json';
import nadiesCommunications from './template_06_nadies_communications.json';
import bellezaFloral from './template_07_belleza_floral.json';
import classyStyle from './template_08_classy_style.json';
import rosevaPerfume from './template_09_roseva_perfume.json';
import sandrasLuxuryBags from './template_10_sandras_luxury_bags.json';
import realmeBuds from './template_11_realme_buds.json';
import smartSpeaker from './template_12_smart_speaker.json';
import airpodsDark from './template_13_airpods_dark.json';
import astorynPs5 from './template_14_astoryn_ps5.json';
import airpodsMax from './template_15_airpods_max.json';
import richieGadgets from './template_16_richie_gadgets.json';
import emGadgets from './template_17_em_gadgets.json';
import proGadgetsJune from './template_18_pro_gadgets_june.json';
import allaHaji from './template_19_alla_haji.json';
import type { TemplateEntry } from '@/screens/FlyerStudio/flyerTypes';

// Helper to transform template JSON - convert 'text' to 'value' for text layers
// and set product image to use PLACEHOLDER_IMAGE
function transformTemplate(json: any): any {
  const transformed = { ...json };
  transformed.layers = json.layers.map((layer: any) => {
    const newLayer = { ...layer };

    // Convert 'text' to 'value' for text layers
    if (layer.type === 'text' && layer.text !== undefined) {
      newLayer.value = layer.text;
      delete newLayer.text;
    }

    // Set product image to use placeholder
    if (layer.type === 'image' &&
        (layer.id.includes('product') || layer.label?.toLowerCase().includes('product'))) {
      newLayer.src = 'PLACEHOLDER_IMAGE';
    }

    return newLayer;
  });

  return transformed;
}

export const TEMPLATES: TemplateEntry[] = [
  { id: 'noir-orchidee', name: 'Noir Orchidée', category: 'beauty', data: noirOrchidee as any },
  { id: 'marvel-frequency', name: 'Marvel Frequency Hub', category: 'electronics', data: transformTemplate(marvelFrequency) },
  { id: 'loreal-serum', name: "L'Oréal Serum", category: 'beauty', data: transformTemplate(lorealSerum) },
  { id: 'dream-gadget', name: 'Dream Gadget', category: 'electronics', data: transformTemplate(dreamGadget) },
  { id: 'nova-carry', name: 'Nova Carry', category: 'fashion', data: transformTemplate(novaCarry) },
  { id: 'albert-gadget', name: 'Albert Gadget Hub', category: 'electronics', data: transformTemplate(albertGadget) },
  { id: 'nadies-communications', name: 'Nadies Communications', category: 'electronics', data: transformTemplate(nadiesCommunications) },
  { id: 'belleza-floral', name: 'Belleza Floral', category: 'beauty', data: transformTemplate(bellezaFloral) },
  { id: 'classy-style', name: 'Classy Style', category: 'fashion', data: transformTemplate(classyStyle) },
  { id: 'roseva-perfume', name: 'Roséva Perfume', category: 'beauty', data: transformTemplate(rosevaPerfume) },
  { id: 'sandras-luxury', name: "Sandra's Luxury Bags", category: 'fashion', data: transformTemplate(sandrasLuxuryBags) },
  { id: 'realme-buds', name: 'Realme Buds T110', category: 'electronics', data: transformTemplate(realmeBuds) },
  { id: 'smart-speaker', name: 'Smart Speaker', category: 'electronics', data: transformTemplate(smartSpeaker) },
  { id: 'airpods-dark', name: 'AirPods Dark', category: 'electronics', data: transformTemplate(airpodsDark) },
  { id: 'astoryn-ps5', name: 'Astoryn PS5', category: 'electronics', data: transformTemplate(astorynPs5) },
  { id: 'airpods-max', name: 'AirPods Max', category: 'electronics', data: transformTemplate(airpodsMax) },
  { id: 'richie-gadgets', name: 'Richie Gadgets', category: 'electronics', data: transformTemplate(richieGadgets) },
  { id: 'em-gadgets', name: 'EM Gadgets', category: 'electronics', data: transformTemplate(emGadgets) },
  { id: 'pro-gadgets-june', name: 'PRO Gadgets June', category: 'electronics', data: transformTemplate(proGadgetsJune) },
  { id: 'alla-haji', name: 'Alla Haji Phone Store', category: 'electronics', data: transformTemplate(allaHaji) },
];

export const getTemplateById = (id: string): TemplateEntry | undefined => {
  return TEMPLATES.find((t) => t.id === id);
};

export const getTemplatesByCategory = (category: string): TemplateEntry[] => {
  if (category === 'all') return TEMPLATES;
  return TEMPLATES.filter((t) => t.category === category);
};
