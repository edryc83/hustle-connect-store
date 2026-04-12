import noirOrchidee from './template-noir-orchidee.json';
import cyberPulse from './template-cyber-pulse.json';
import flashSale from './template-flash-sale.json';
import luxeNoir from './template-luxe-noir.json';
import cleanMinimal from './template-clean-minimal.json';
import type { TemplateEntry } from '@/screens/FlyerStudio/flyerTypes';

export const TEMPLATES: TemplateEntry[] = [
  { id: 'noir-orchidee', name: 'Noir Orchidée', category: 'beauty', data: noirOrchidee as any },
  { id: 'cyber-pulse', name: 'Cyber Pulse', category: 'tech', data: cyberPulse as any },
  { id: 'flash-sale', name: 'Flash Sale', category: 'promo', data: flashSale as any },
  { id: 'luxe-noir', name: 'Luxe Noir', category: 'fashion', data: luxeNoir as any },
  { id: 'clean-minimal', name: 'Clean Minimal', category: 'beauty', data: cleanMinimal as any },
];

export const getTemplateById = (id: string): TemplateEntry | undefined => {
  return TEMPLATES.find((t) => t.id === id);
};

export const getTemplatesByCategory = (category: string): TemplateEntry[] => {
  if (category === 'all') return TEMPLATES;
  return TEMPLATES.filter((t) => t.category === category);
};
