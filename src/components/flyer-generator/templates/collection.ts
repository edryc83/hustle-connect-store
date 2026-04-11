import type { FlyerTemplate } from './index';

// Tech Blue - Inspired by gadget stores with blue gradients
export const techBlueTemplate: FlyerTemplate = {
  id: 'tech-blue',
  name: 'Tech Blue',
  style: 'bold',
  description: 'Professional tech style with blue gradient',
  canvas: { width: 1080, height: 1080, backgroundColor: '#0047AB' },
  elements: {
    productImage: { x: 0.5, y: 0.5, maxWidth: 0.65, maxHeight: 0.5 },
    headline: { x: 0.5, y: 0.12, fontSize: 56, fontWeight: '900', fontFamily: 'Montserrat, sans-serif', color: '#ffffff', align: 'center' },
    tagline: { x: 0.5, y: 0.2, fontSize: 22, fontWeight: '400', fontFamily: 'Inter, sans-serif', color: '#87CEEB', align: 'center' },
    price: { x: 0.5, y: 0.82, fontSize: 64, fontWeight: '900', fontFamily: 'Bebas Neue, sans-serif', color: '#FFD700', align: 'center' },
    cta: { x: 0.5, y: 0.92, fontSize: 24, fontWeight: '700', fontFamily: 'Inter, sans-serif', color: '#ffffff', align: 'center' },
    storeName: { x: 0.5, y: 0.04, fontSize: 20, fontWeight: '700', fontFamily: 'Montserrat, sans-serif', color: '#ffffff', align: 'center' },
  },
  decorations: [
    { type: 'gradient', config: { x: 0, y: 0.7, width: 1, height: 0.3, gradient: { type: 'linear', coords: { x1: 0, y1: 0, x2: 0, y2: 1 }, colorStops: [{ offset: 0, color: 'rgba(0, 71, 171, 0)' }, { offset: 1, color: 'rgba(0, 30, 80, 0.95)' }] } } },
    { type: 'rect', config: { x: 0, y: 0, width: 1, height: 0.008, color: '#FFD700' } },
  ],
  themeColors: { primary: '#0047AB', secondary: '#87CEEB', accent: '#FFD700', text: '#ffffff', background: '#0047AB' },
};

// Purple Vibe - Vibrant purple gradient
export const purpleVibeTemplate: FlyerTemplate = {
  id: 'purple-vibe',
  name: 'Purple Vibe',
  style: 'bold',
  description: 'Energetic purple gradient style',
  canvas: { width: 1080, height: 1080, backgroundColor: '#4A0080' },
  elements: {
    productImage: { x: 0.5, y: 0.48, maxWidth: 0.7, maxHeight: 0.55 },
    headline: { x: 0.5, y: 0.08, fontSize: 52, fontWeight: '800', fontFamily: 'Poppins, sans-serif', color: '#ffffff', align: 'center' },
    tagline: { x: 0.5, y: 0.16, fontSize: 24, fontWeight: '400', fontFamily: 'Inter, sans-serif', color: '#E0B0FF', align: 'center' },
    price: { x: 0.5, y: 0.84, fontSize: 68, fontWeight: '900', fontFamily: 'Bebas Neue, sans-serif', color: '#ffffff', align: 'center', shadow: { color: 'rgba(224, 176, 255, 0.5)', blur: 20, offsetX: 0, offsetY: 4 } },
    cta: { x: 0.5, y: 0.94, fontSize: 22, fontWeight: '600', fontFamily: 'Poppins, sans-serif', color: '#E0B0FF', align: 'center' },
    storeName: { x: 0.08, y: 0.04, fontSize: 18, fontWeight: '700', fontFamily: 'Poppins, sans-serif', color: '#ffffff', align: 'left' },
  },
  decorations: [
    { type: 'gradient', config: { x: 0, y: 0, width: 1, height: 1, gradient: { type: 'linear', coords: { x1: 0, y1: 0, x2: 1, y2: 1 }, colorStops: [{ offset: 0, color: '#7B2CBF' }, { offset: 0.5, color: '#4A0080' }, { offset: 1, color: '#2D0050' }] } } },
  ],
  themeColors: { primary: '#7B2CBF', secondary: '#E0B0FF', accent: '#FF69B4', text: '#ffffff', background: '#4A0080' },
};

// Luxury Rose - Elegant pink/coral for beauty products
export const luxuryRoseTemplate: FlyerTemplate = {
  id: 'luxury-rose',
  name: 'Luxury Rose',
  style: 'elegant',
  description: 'Elegant rose tones for luxury items',
  canvas: { width: 1080, height: 1080, backgroundColor: '#FFC0CB' },
  elements: {
    productImage: { x: 0.5, y: 0.5, maxWidth: 0.6, maxHeight: 0.5 },
    headline: { x: 0.5, y: 0.08, fontSize: 48, fontWeight: '400', fontFamily: 'Playfair Display, serif', color: '#800020', align: 'center' },
    tagline: { x: 0.5, y: 0.16, fontSize: 20, fontWeight: '300', fontFamily: 'Raleway, sans-serif', color: '#A0505A', align: 'center' },
    price: { x: 0.5, y: 0.82, fontSize: 56, fontWeight: '700', fontFamily: 'Playfair Display, serif', color: '#800020', align: 'center' },
    cta: { x: 0.5, y: 0.92, fontSize: 18, fontWeight: '500', fontFamily: 'Raleway, sans-serif', color: '#ffffff', align: 'center' },
    storeName: { x: 0.5, y: 0.96, fontSize: 14, fontWeight: '400', fontFamily: 'Raleway, sans-serif', color: '#A0505A', align: 'center' },
  },
  decorations: [
    { type: 'gradient', config: { x: 0, y: 0, width: 1, height: 1, gradient: { type: 'linear', coords: { x1: 0, y1: 0, x2: 0, y2: 1 }, colorStops: [{ offset: 0, color: '#FFB6C1' }, { offset: 0.5, color: '#FFC0CB' }, { offset: 1, color: '#FFE4E9' }] } } },
    { type: 'rect', config: { x: 0.4, y: 0.88, width: 0.2, height: 0.04, color: '#800020' } },
  ],
  themeColors: { primary: '#800020', secondary: '#FFC0CB', accent: '#FF69B4', text: '#800020', background: '#FFC0CB' },
};

// Fresh Green - Clean white with green accents
export const freshGreenTemplate: FlyerTemplate = {
  id: 'fresh-green',
  name: 'Fresh Green',
  style: 'minimal',
  description: 'Clean modern style with green accents',
  canvas: { width: 1080, height: 1080, backgroundColor: '#ffffff' },
  elements: {
    productImage: { x: 0.5, y: 0.45, maxWidth: 0.75, maxHeight: 0.55 },
    headline: { x: 0.5, y: 0.08, fontSize: 44, fontWeight: '700', fontFamily: 'Poppins, sans-serif', color: '#1a1a1a', align: 'center' },
    tagline: { x: 0.5, y: 0.15, fontSize: 20, fontWeight: '400', fontFamily: 'Inter, sans-serif', color: '#666666', align: 'center' },
    price: { x: 0.5, y: 0.82, fontSize: 60, fontWeight: '800', fontFamily: 'Poppins, sans-serif', color: '#00A86B', align: 'center' },
    cta: { x: 0.5, y: 0.92, fontSize: 20, fontWeight: '600', fontFamily: 'Inter, sans-serif', color: '#00A86B', align: 'center' },
    storeName: { x: 0.5, y: 0.04, fontSize: 16, fontWeight: '600', fontFamily: 'Poppins, sans-serif', color: '#00A86B', align: 'center' },
  },
  decorations: [
    { type: 'rect', config: { x: 0, y: 0.75, width: 1, height: 0.25, color: '#F0FFF0' } },
    { type: 'rect', config: { x: 0.35, y: 0.88, width: 0.3, height: 0.05, color: '#00A86B' } },
  ],
  themeColors: { primary: '#00A86B', secondary: '#F0FFF0', accent: '#00A86B', text: '#1a1a1a', background: '#ffffff' },
};

// Gold Premium - Dark with gold accents
export const goldPremiumTemplate: FlyerTemplate = {
  id: 'gold-premium',
  name: 'Gold Premium',
  style: 'elegant',
  description: 'Luxurious dark theme with gold',
  canvas: { width: 1080, height: 1080, backgroundColor: '#1a1a1a' },
  elements: {
    productImage: { x: 0.5, y: 0.48, maxWidth: 0.65, maxHeight: 0.5 },
    headline: { x: 0.5, y: 0.08, fontSize: 50, fontWeight: '600', fontFamily: 'Playfair Display, serif', color: '#D4AF37', align: 'center' },
    tagline: { x: 0.5, y: 0.16, fontSize: 22, fontWeight: '300', fontFamily: 'Raleway, sans-serif', color: '#888888', align: 'center' },
    price: { x: 0.5, y: 0.84, fontSize: 64, fontWeight: '700', fontFamily: 'Playfair Display, serif', color: '#D4AF37', align: 'center' },
    cta: { x: 0.5, y: 0.94, fontSize: 20, fontWeight: '500', fontFamily: 'Raleway, sans-serif', color: '#ffffff', align: 'center' },
    storeName: { x: 0.92, y: 0.04, fontSize: 14, fontWeight: '500', fontFamily: 'Raleway, sans-serif', color: '#D4AF37', align: 'right' },
  },
  decorations: [
    { type: 'rect', config: { x: 0, y: 0, width: 1, height: 0.003, color: '#D4AF37' } },
    { type: 'rect', config: { x: 0, y: 0.997, width: 1, height: 0.003, color: '#D4AF37' } },
    { type: 'rect', config: { x: 0, y: 0, width: 0.003, height: 1, color: '#D4AF37' } },
    { type: 'rect', config: { x: 0.997, y: 0, width: 0.003, height: 1, color: '#D4AF37' } },
  ],
  themeColors: { primary: '#D4AF37', secondary: '#888888', accent: '#D4AF37', text: '#ffffff', background: '#1a1a1a' },
};

// Sunset Orange - Warm gradient
export const sunsetOrangeTemplate: FlyerTemplate = {
  id: 'sunset-orange',
  name: 'Sunset Orange',
  style: 'bold',
  description: 'Warm energetic orange gradient',
  canvas: { width: 1080, height: 1080, backgroundColor: '#FF6B35' },
  elements: {
    productImage: { x: 0.5, y: 0.5, maxWidth: 0.7, maxHeight: 0.5 },
    headline: { x: 0.5, y: 0.1, fontSize: 54, fontWeight: '900', fontFamily: 'Oswald, sans-serif', color: '#ffffff', align: 'center' },
    tagline: { x: 0.5, y: 0.18, fontSize: 22, fontWeight: '400', fontFamily: 'Inter, sans-serif', color: '#FFE4CC', align: 'center' },
    price: { x: 0.5, y: 0.84, fontSize: 68, fontWeight: '700', fontFamily: 'Oswald, sans-serif', color: '#ffffff', align: 'center', shadow: { color: 'rgba(0,0,0,0.3)', blur: 10, offsetX: 0, offsetY: 4 } },
    cta: { x: 0.5, y: 0.94, fontSize: 24, fontWeight: '600', fontFamily: 'Inter, sans-serif', color: '#1a1a1a', align: 'center' },
    storeName: { x: 0.5, y: 0.04, fontSize: 18, fontWeight: '600', fontFamily: 'Inter, sans-serif', color: '#ffffff', align: 'center' },
  },
  decorations: [
    { type: 'gradient', config: { x: 0, y: 0, width: 1, height: 1, gradient: { type: 'linear', coords: { x1: 0, y1: 0, x2: 1, y2: 1 }, colorStops: [{ offset: 0, color: '#FF8C00' }, { offset: 0.5, color: '#FF6B35' }, { offset: 1, color: '#E63946' }] } } },
    { type: 'rect', config: { x: 0.3, y: 0.9, width: 0.4, height: 0.06, color: '#FFE4CC' } },
  ],
  themeColors: { primary: '#FF6B35', secondary: '#FFE4CC', accent: '#E63946', text: '#ffffff', background: '#FF6B35' },
};

// Neon Dark - Dark with neon accents
export const neonDarkTemplate: FlyerTemplate = {
  id: 'neon-dark',
  name: 'Neon Dark',
  style: 'bold',
  description: 'Dark theme with neon glow effects',
  canvas: { width: 1080, height: 1080, backgroundColor: '#0D0D0D' },
  elements: {
    productImage: { x: 0.5, y: 0.48, maxWidth: 0.65, maxHeight: 0.5 },
    headline: { x: 0.5, y: 0.08, fontSize: 52, fontWeight: '900', fontFamily: 'Bebas Neue, sans-serif', color: '#00FFFF', align: 'center', shadow: { color: '#00FFFF', blur: 20, offsetX: 0, offsetY: 0 } },
    tagline: { x: 0.5, y: 0.16, fontSize: 22, fontWeight: '400', fontFamily: 'Inter, sans-serif', color: '#888888', align: 'center' },
    price: { x: 0.5, y: 0.84, fontSize: 72, fontWeight: '900', fontFamily: 'Bebas Neue, sans-serif', color: '#FF00FF', align: 'center', shadow: { color: '#FF00FF', blur: 25, offsetX: 0, offsetY: 0 } },
    cta: { x: 0.5, y: 0.94, fontSize: 22, fontWeight: '600', fontFamily: 'Inter, sans-serif', color: '#00FF00', align: 'center', shadow: { color: '#00FF00', blur: 10, offsetX: 0, offsetY: 0 } },
    storeName: { x: 0.08, y: 0.96, fontSize: 14, fontWeight: '500', fontFamily: 'Inter, sans-serif', color: '#666666', align: 'left' },
  },
  decorations: [
    { type: 'rect', config: { x: 0, y: 0.76, width: 1, height: 0.002, color: '#FF00FF', opacity: 0.5 } },
  ],
  themeColors: { primary: '#00FFFF', secondary: '#FF00FF', accent: '#00FF00', text: '#ffffff', background: '#0D0D0D' },
};

// Pastel Pink - Soft feminine style
export const pastelPinkTemplate: FlyerTemplate = {
  id: 'pastel-pink',
  name: 'Pastel Pink',
  style: 'elegant',
  description: 'Soft pastel pink for beauty products',
  canvas: { width: 1080, height: 1080, backgroundColor: '#FFF0F5' },
  elements: {
    productImage: { x: 0.5, y: 0.45, maxWidth: 0.6, maxHeight: 0.45 },
    headline: { x: 0.5, y: 0.08, fontSize: 44, fontWeight: '400', fontFamily: 'Dancing Script, cursive', color: '#C71585', align: 'center' },
    tagline: { x: 0.5, y: 0.16, fontSize: 20, fontWeight: '400', fontFamily: 'Raleway, sans-serif', color: '#DB7093', align: 'center' },
    price: { x: 0.5, y: 0.78, fontSize: 52, fontWeight: '700', fontFamily: 'Poppins, sans-serif', color: '#C71585', align: 'center' },
    cta: { x: 0.5, y: 0.88, fontSize: 18, fontWeight: '500', fontFamily: 'Raleway, sans-serif', color: '#ffffff', align: 'center' },
    storeName: { x: 0.5, y: 0.95, fontSize: 14, fontWeight: '400', fontFamily: 'Raleway, sans-serif', color: '#DB7093', align: 'center' },
  },
  decorations: [
    { type: 'rect', config: { x: 0.35, y: 0.85, width: 0.3, height: 0.05, color: '#C71585' } },
    { type: 'circle', config: { x: 0.1, y: 0.1, radius: 0.05, color: '#FFB6C1', opacity: 0.5 } },
    { type: 'circle', config: { x: 0.9, y: 0.9, radius: 0.08, color: '#FFB6C1', opacity: 0.5 } },
  ],
  themeColors: { primary: '#C71585', secondary: '#DB7093', accent: '#FFB6C1', text: '#C71585', background: '#FFF0F5' },
};

// Ocean Blue - Fresh aqua tones
export const oceanBlueTemplate: FlyerTemplate = {
  id: 'ocean-blue',
  name: 'Ocean Blue',
  style: 'minimal',
  description: 'Fresh and clean ocean-inspired',
  canvas: { width: 1080, height: 1080, backgroundColor: '#E0F7FA' },
  elements: {
    productImage: { x: 0.5, y: 0.45, maxWidth: 0.7, maxHeight: 0.5 },
    headline: { x: 0.5, y: 0.08, fontSize: 48, fontWeight: '700', fontFamily: 'Montserrat, sans-serif', color: '#006064', align: 'center' },
    tagline: { x: 0.5, y: 0.16, fontSize: 20, fontWeight: '400', fontFamily: 'Inter, sans-serif', color: '#00838F', align: 'center' },
    price: { x: 0.5, y: 0.82, fontSize: 60, fontWeight: '800', fontFamily: 'Montserrat, sans-serif', color: '#006064', align: 'center' },
    cta: { x: 0.5, y: 0.92, fontSize: 20, fontWeight: '600', fontFamily: 'Inter, sans-serif', color: '#ffffff', align: 'center' },
    storeName: { x: 0.5, y: 0.04, fontSize: 16, fontWeight: '500', fontFamily: 'Montserrat, sans-serif', color: '#00ACC1', align: 'center' },
  },
  decorations: [
    { type: 'rect', config: { x: 0.35, y: 0.89, width: 0.3, height: 0.05, color: '#00ACC1' } },
    { type: 'gradient', config: { x: 0, y: 0.7, width: 1, height: 0.3, gradient: { type: 'linear', coords: { x1: 0, y1: 0, x2: 0, y2: 1 }, colorStops: [{ offset: 0, color: 'rgba(224, 247, 250, 0)' }, { offset: 1, color: 'rgba(178, 235, 242, 1)' }] } } },
  ],
  themeColors: { primary: '#006064', secondary: '#00ACC1', accent: '#00ACC1', text: '#006064', background: '#E0F7FA' },
};

// Royal Purple - Deep purple luxury
export const royalPurpleTemplate: FlyerTemplate = {
  id: 'royal-purple',
  name: 'Royal Purple',
  style: 'elegant',
  description: 'Regal deep purple design',
  canvas: { width: 1080, height: 1080, backgroundColor: '#2E1A47' },
  elements: {
    productImage: { x: 0.5, y: 0.5, maxWidth: 0.6, maxHeight: 0.5 },
    headline: { x: 0.5, y: 0.08, fontSize: 46, fontWeight: '600', fontFamily: 'Playfair Display, serif', color: '#E6E6FA', align: 'center' },
    tagline: { x: 0.5, y: 0.16, fontSize: 20, fontWeight: '300', fontFamily: 'Raleway, sans-serif', color: '#B39DDB', align: 'center' },
    price: { x: 0.5, y: 0.84, fontSize: 60, fontWeight: '700', fontFamily: 'Playfair Display, serif', color: '#E6E6FA', align: 'center' },
    cta: { x: 0.5, y: 0.94, fontSize: 20, fontWeight: '500', fontFamily: 'Raleway, sans-serif', color: '#9575CD', align: 'center' },
    storeName: { x: 0.5, y: 0.04, fontSize: 16, fontWeight: '500', fontFamily: 'Raleway, sans-serif', color: '#9575CD', align: 'center' },
  },
  decorations: [
    { type: 'gradient', config: { x: 0, y: 0.75, width: 1, height: 0.25, gradient: { type: 'linear', coords: { x1: 0, y1: 0, x2: 0, y2: 1 }, colorStops: [{ offset: 0, color: 'rgba(46, 26, 71, 0)' }, { offset: 1, color: 'rgba(30, 15, 50, 1)' }] } } },
  ],
  themeColors: { primary: '#9575CD', secondary: '#B39DDB', accent: '#E6E6FA', text: '#E6E6FA', background: '#2E1A47' },
};

// Electric Yellow - Bold and energetic
export const electricYellowTemplate: FlyerTemplate = {
  id: 'electric-yellow',
  name: 'Electric Yellow',
  style: 'bold',
  description: 'Bold yellow for attention-grabbing',
  canvas: { width: 1080, height: 1080, backgroundColor: '#FFD700' },
  elements: {
    productImage: { x: 0.5, y: 0.5, maxWidth: 0.7, maxHeight: 0.5 },
    headline: { x: 0.5, y: 0.1, fontSize: 56, fontWeight: '900', fontFamily: 'Oswald, sans-serif', color: '#1a1a1a', align: 'center' },
    tagline: { x: 0.5, y: 0.18, fontSize: 22, fontWeight: '500', fontFamily: 'Inter, sans-serif', color: '#333333', align: 'center' },
    price: { x: 0.5, y: 0.84, fontSize: 72, fontWeight: '900', fontFamily: 'Oswald, sans-serif', color: '#1a1a1a', align: 'center' },
    cta: { x: 0.5, y: 0.94, fontSize: 22, fontWeight: '700', fontFamily: 'Inter, sans-serif', color: '#ffffff', align: 'center' },
    storeName: { x: 0.5, y: 0.04, fontSize: 18, fontWeight: '700', fontFamily: 'Oswald, sans-serif', color: '#1a1a1a', align: 'center' },
  },
  decorations: [
    { type: 'rect', config: { x: 0, y: 0, width: 1, height: 0.008, color: '#1a1a1a' } },
    { type: 'rect', config: { x: 0.3, y: 0.9, width: 0.4, height: 0.06, color: '#1a1a1a' } },
  ],
  themeColors: { primary: '#1a1a1a', secondary: '#333333', accent: '#FFD700', text: '#1a1a1a', background: '#FFD700' },
};

// Coral Reef - Warm coral tones
export const coralReefTemplate: FlyerTemplate = {
  id: 'coral-reef',
  name: 'Coral Reef',
  style: 'minimal',
  description: 'Warm and inviting coral theme',
  canvas: { width: 1080, height: 1080, backgroundColor: '#FFF5EE' },
  elements: {
    productImage: { x: 0.5, y: 0.45, maxWidth: 0.65, maxHeight: 0.5 },
    headline: { x: 0.5, y: 0.08, fontSize: 46, fontWeight: '600', fontFamily: 'Poppins, sans-serif', color: '#FF6F61', align: 'center' },
    tagline: { x: 0.5, y: 0.16, fontSize: 20, fontWeight: '400', fontFamily: 'Inter, sans-serif', color: '#E9967A', align: 'center' },
    price: { x: 0.5, y: 0.82, fontSize: 58, fontWeight: '700', fontFamily: 'Poppins, sans-serif', color: '#FF6F61', align: 'center' },
    cta: { x: 0.5, y: 0.92, fontSize: 18, fontWeight: '600', fontFamily: 'Inter, sans-serif', color: '#ffffff', align: 'center' },
    storeName: { x: 0.5, y: 0.96, fontSize: 14, fontWeight: '500', fontFamily: 'Inter, sans-serif', color: '#E9967A', align: 'center' },
  },
  decorations: [
    { type: 'rect', config: { x: 0.35, y: 0.89, width: 0.3, height: 0.045, color: '#FF6F61' } },
  ],
  themeColors: { primary: '#FF6F61', secondary: '#E9967A', accent: '#FF6F61', text: '#FF6F61', background: '#FFF5EE' },
};

// Midnight Black - Sleek dark design
export const midnightBlackTemplate: FlyerTemplate = {
  id: 'midnight-black',
  name: 'Midnight Black',
  style: 'elegant',
  description: 'Sleek and sophisticated dark theme',
  canvas: { width: 1080, height: 1080, backgroundColor: '#0a0a0a' },
  elements: {
    productImage: { x: 0.5, y: 0.48, maxWidth: 0.65, maxHeight: 0.5 },
    headline: { x: 0.5, y: 0.08, fontSize: 50, fontWeight: '300', fontFamily: 'Raleway, sans-serif', color: '#ffffff', align: 'center' },
    tagline: { x: 0.5, y: 0.16, fontSize: 20, fontWeight: '300', fontFamily: 'Raleway, sans-serif', color: '#888888', align: 'center' },
    price: { x: 0.5, y: 0.84, fontSize: 64, fontWeight: '700', fontFamily: 'Montserrat, sans-serif', color: '#ffffff', align: 'center' },
    cta: { x: 0.5, y: 0.94, fontSize: 18, fontWeight: '500', fontFamily: 'Raleway, sans-serif', color: '#888888', align: 'center' },
    storeName: { x: 0.5, y: 0.04, fontSize: 14, fontWeight: '400', fontFamily: 'Raleway, sans-serif', color: '#666666', align: 'center' },
  },
  decorations: [
    { type: 'rect', config: { x: 0.4, y: 0.12, width: 0.2, height: 0.001, color: '#ffffff' } },
    { type: 'rect', config: { x: 0.4, y: 0.8, width: 0.2, height: 0.001, color: '#ffffff' } },
  ],
  themeColors: { primary: '#ffffff', secondary: '#888888', accent: '#ffffff', text: '#ffffff', background: '#0a0a0a' },
};

// Forest Green - Natural and organic
export const forestGreenTemplate: FlyerTemplate = {
  id: 'forest-green',
  name: 'Forest Green',
  style: 'elegant',
  description: 'Natural forest-inspired design',
  canvas: { width: 1080, height: 1080, backgroundColor: '#1B4332' },
  elements: {
    productImage: { x: 0.5, y: 0.48, maxWidth: 0.6, maxHeight: 0.5 },
    headline: { x: 0.5, y: 0.08, fontSize: 48, fontWeight: '600', fontFamily: 'Playfair Display, serif', color: '#D8F3DC', align: 'center' },
    tagline: { x: 0.5, y: 0.16, fontSize: 20, fontWeight: '300', fontFamily: 'Raleway, sans-serif', color: '#95D5B2', align: 'center' },
    price: { x: 0.5, y: 0.84, fontSize: 60, fontWeight: '700', fontFamily: 'Playfair Display, serif', color: '#D8F3DC', align: 'center' },
    cta: { x: 0.5, y: 0.94, fontSize: 20, fontWeight: '500', fontFamily: 'Raleway, sans-serif', color: '#95D5B2', align: 'center' },
    storeName: { x: 0.08, y: 0.04, fontSize: 16, fontWeight: '500', fontFamily: 'Raleway, sans-serif', color: '#95D5B2', align: 'left' },
  },
  decorations: [
    { type: 'gradient', config: { x: 0, y: 0.75, width: 1, height: 0.25, gradient: { type: 'linear', coords: { x1: 0, y1: 0, x2: 0, y2: 1 }, colorStops: [{ offset: 0, color: 'rgba(27, 67, 50, 0)' }, { offset: 1, color: 'rgba(15, 40, 30, 1)' }] } } },
  ],
  themeColors: { primary: '#D8F3DC', secondary: '#95D5B2', accent: '#40916C', text: '#D8F3DC', background: '#1B4332' },
};

// Ruby Red - Bold and passionate
export const rubyRedTemplate: FlyerTemplate = {
  id: 'ruby-red',
  name: 'Ruby Red',
  style: 'bold',
  description: 'Bold red for impactful designs',
  canvas: { width: 1080, height: 1080, backgroundColor: '#8B0000' },
  elements: {
    productImage: { x: 0.5, y: 0.5, maxWidth: 0.7, maxHeight: 0.5 },
    headline: { x: 0.5, y: 0.1, fontSize: 54, fontWeight: '900', fontFamily: 'Oswald, sans-serif', color: '#ffffff', align: 'center' },
    tagline: { x: 0.5, y: 0.18, fontSize: 22, fontWeight: '400', fontFamily: 'Inter, sans-serif', color: '#FFB3B3', align: 'center' },
    price: { x: 0.5, y: 0.84, fontSize: 68, fontWeight: '900', fontFamily: 'Oswald, sans-serif', color: '#FFD700', align: 'center', shadow: { color: 'rgba(0,0,0,0.4)', blur: 10, offsetX: 0, offsetY: 4 } },
    cta: { x: 0.5, y: 0.94, fontSize: 22, fontWeight: '600', fontFamily: 'Inter, sans-serif', color: '#ffffff', align: 'center' },
    storeName: { x: 0.5, y: 0.04, fontSize: 18, fontWeight: '600', fontFamily: 'Inter, sans-serif', color: '#FFB3B3', align: 'center' },
  },
  decorations: [
    { type: 'gradient', config: { x: 0, y: 0, width: 1, height: 1, gradient: { type: 'linear', coords: { x1: 0, y1: 0, x2: 1, y2: 1 }, colorStops: [{ offset: 0, color: '#B22222' }, { offset: 0.5, color: '#8B0000' }, { offset: 1, color: '#5C0000' }] } } },
  ],
  themeColors: { primary: '#FFD700', secondary: '#FFB3B3', accent: '#FFD700', text: '#ffffff', background: '#8B0000' },
};

// All collection templates
export const collectionTemplates = [
  techBlueTemplate,
  purpleVibeTemplate,
  luxuryRoseTemplate,
  freshGreenTemplate,
  goldPremiumTemplate,
  sunsetOrangeTemplate,
  neonDarkTemplate,
  pastelPinkTemplate,
  oceanBlueTemplate,
  royalPurpleTemplate,
  electricYellowTemplate,
  coralReefTemplate,
  midnightBlackTemplate,
  forestGreenTemplate,
  rubyRedTemplate,
];
