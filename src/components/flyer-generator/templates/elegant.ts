import type { FlyerTemplate } from './index';

export const elegantTemplate: FlyerTemplate = {
  id: 'elegant',
  name: 'Elegant',
  style: 'elegant',
  description: 'Premium, refined design with a luxurious feel',

  canvas: {
    width: 1080,
    height: 1080,
    backgroundColor: '#0a0a0a',
  },

  elements: {
    productImage: {
      x: 0.5,
      y: 0.42,
      maxWidth: 0.65,
      maxHeight: 0.5,
    },
    headline: {
      x: 0.5,
      y: 0.74,
      fontSize: 42,
      fontWeight: '300',
      fontFamily: 'Georgia, serif',
      color: '#d4af37', // Gold
      align: 'center',
    },
    tagline: {
      x: 0.5,
      y: 0.81,
      fontSize: 20,
      fontWeight: '300',
      fontFamily: 'Georgia, serif',
      color: '#cccccc',
      align: 'center',
    },
    price: {
      x: 0.5,
      y: 0.89,
      fontSize: 48,
      fontWeight: '400',
      fontFamily: 'Georgia, serif',
      color: '#ffffff',
      align: 'center',
    },
    cta: {
      x: 0.5,
      y: 0.96,
      fontSize: 16,
      fontWeight: '400',
      fontFamily: 'Georgia, serif',
      color: '#d4af37',
      align: 'center',
    },
    storeName: {
      x: 0.5,
      y: 0.05,
      fontSize: 14,
      fontWeight: '400',
      fontFamily: 'Georgia, serif',
      color: '#888888',
      align: 'center',
    },
  },

  decorations: [
    // Top gold line
    {
      type: 'line',
      config: {
        x: 0.35,
        y: 0.09,
        width: 0.3,
        height: 0.001,
        color: '#d4af37',
        opacity: 0.5,
      },
    },
    // Bottom gold line
    {
      type: 'line',
      config: {
        x: 0.35,
        y: 0.91,
        width: 0.3,
        height: 0.001,
        color: '#d4af37',
        opacity: 0.5,
      },
    },
    // Subtle radial gradient for depth
    {
      type: 'gradient',
      config: {
        x: 0,
        y: 0,
        width: 1,
        height: 1,
        gradient: {
          type: 'radial',
          coords: { x1: 0.5, y1: 0.4, x2: 0.5, y2: 0.4 },
          colorStops: [
            { offset: 0, color: 'rgba(30, 30, 30, 1)' },
            { offset: 0.7, color: 'rgba(10, 10, 10, 1)' },
            { offset: 1, color: 'rgba(5, 5, 5, 1)' },
          ],
        },
      },
    },
    // Corner accent - top left
    {
      type: 'line',
      config: {
        x: 0.03,
        y: 0.03,
        width: 0.08,
        height: 0.001,
        color: '#d4af37',
        opacity: 0.3,
      },
    },
    {
      type: 'line',
      config: {
        x: 0.03,
        y: 0.03,
        width: 0.001,
        height: 0.08,
        color: '#d4af37',
        opacity: 0.3,
      },
    },
    // Corner accent - bottom right
    {
      type: 'line',
      config: {
        x: 0.89,
        y: 0.97,
        width: 0.08,
        height: 0.001,
        color: '#d4af37',
        opacity: 0.3,
      },
    },
    {
      type: 'line',
      config: {
        x: 0.97,
        y: 0.89,
        width: 0.001,
        height: 0.08,
        color: '#d4af37',
        opacity: 0.3,
      },
    },
  ],

  themeColors: {
    primary: '#d4af37', // Gold
    secondary: '#1a1a1a',
    accent: '#d4af37',
    text: '#ffffff',
    background: '#0a0a0a',
  },
};
