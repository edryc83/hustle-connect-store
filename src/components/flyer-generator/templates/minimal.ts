import type { FlyerTemplate } from './index';

export const minimalTemplate: FlyerTemplate = {
  id: 'minimal',
  name: 'Minimal',
  style: 'minimal',
  description: 'Clean, simple, elegant design with focus on the product',

  canvas: {
    width: 1080,
    height: 1080,
    backgroundColor: '#ffffff',
  },

  elements: {
    productImage: {
      x: 0.5, // Centered
      y: 0.4, // Upper-middle
      maxWidth: 0.7,
      maxHeight: 0.5,
    },
    headline: {
      x: 0.5,
      y: 0.72,
      fontSize: 48,
      fontWeight: '600',
      fontFamily: 'Inter, sans-serif',
      color: '#1a1a1a',
      align: 'center',
    },
    tagline: {
      x: 0.5,
      y: 0.78,
      fontSize: 24,
      fontWeight: '400',
      fontFamily: 'Inter, sans-serif',
      color: '#666666',
      align: 'center',
    },
    price: {
      x: 0.5,
      y: 0.86,
      fontSize: 56,
      fontWeight: '700',
      fontFamily: 'Inter, sans-serif',
      color: '#1a1a1a',
      align: 'center',
    },
    cta: {
      x: 0.5,
      y: 0.94,
      fontSize: 20,
      fontWeight: '500',
      fontFamily: 'Inter, sans-serif',
      color: '#FF6B35',
      align: 'center',
    },
    storeName: {
      x: 0.5,
      y: 0.06,
      fontSize: 18,
      fontWeight: '500',
      fontFamily: 'Inter, sans-serif',
      color: '#999999',
      align: 'center',
    },
  },

  decorations: [
    // Subtle top line
    {
      type: 'line',
      config: {
        x: 0.3,
        y: 0.1,
        width: 0.4,
        height: 0.002,
        color: '#eeeeee',
      },
    },
    // Subtle bottom line
    {
      type: 'line',
      config: {
        x: 0.3,
        y: 0.9,
        width: 0.4,
        height: 0.002,
        color: '#eeeeee',
      },
    },
  ],

  themeColors: {
    primary: '#1a1a1a',
    secondary: '#666666',
    accent: '#FF6B35',
    text: '#1a1a1a',
    background: '#ffffff',
  },
};
