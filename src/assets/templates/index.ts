import noirOrchidee from './template-noir-orchidee.json';
import type { TemplateEntry } from '@/screens/FlyerStudio/flyerTypes';

export const TEMPLATES: TemplateEntry[] = [
  { id: 'noir-orchidee', name: 'Noir Orchidée', category: 'beauty', data: noirOrchidee as any },
];

export const getTemplateById = (id: string): TemplateEntry | undefined => {
  return TEMPLATES.find((t) => t.id === id);
};

export const getTemplatesByCategory = (category: string): TemplateEntry[] => {
  if (category === 'all') return TEMPLATES;
  return TEMPLATES.filter((t) => t.category === category);
};
