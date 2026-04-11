import type { FlyerTemplate } from './index';

export const boldTemplate: FlyerTemplate = {
  id: 'bold',
  name: 'Bold',
  style: 'bold',
  description: 'Energetic, eye-catching design that demands attention',

  canvas: {
    width: 1080,
    height: 1080,
    backgroundColor: '#1a1a2e',
  },

  elements: {
    productImage: {
      x: 0.5,
      y: 0.45,
      maxWidth: 0.75,
      maxHeight: 0.55,
    },
    headline: {
      x: 0.5,
      y: 0.08,
      fontSize: 64,
      fontWeight: '900',
      fontFamily: 'Inter, sans-serif',
      color: '#ffffff',
      align: 'center',
      shadow: {
        color: 'rgba(255, 107, 53, 0.5)',
        blur: 20,
        offsetX: 0,
        offsetY: 4,
      },
    },
    tagline: {
      x: 0.5,
      y: 0.16,
      fontSize: 24,
      fontWeight: '500',
      fontFamily: 'Inter, sans-serif',
      color: '#FF6B35',
      align: 'center',
    },
    price: {
      x: 0.5,
      y: 0.82,
      fontSize: 72,
      fontWeight: '900',
      fontFamily: 'Inter, sans-serif',
      color: '#FF6B35',
      align: 'center',
      shadow: {
        color: 'rgba(0, 0, 0, 0.3)',
        blur: 10,
        offsetX: 0,
        offsetY: 4,
      },
    },
    cta: {
      x: 0.5,
      y: 0.92,
      fontSize: 28,
      fontWeight: '700',
      fontFamily: 'Inter, sans-serif',
      color: '#ffffff',
      align: 'center',
    },
    storeName: {
      x: 0.92,
      y: 0.96,
      fontSize: 16,
      fontWeight: '500',
      fontFamily: 'Inter, sans-serif',
      color: 'rgba(255, 255, 255, 0.6)',
      align: 'right',
    },
  },

  decorations: [
    // Top accent bar
    {
      type: 'rect',
      config: {
        x: 0,
        y: 0,
        width: 1,
        height: 0.02,
        color: '#FF6B35',
      },
    },
    // Bottom gradient overlay
    {
      type: 'gradient',
      config: {
        x: 0,
        y: 0.7,
        width: 1,
        height: 0.3,
        gradient: {
          type: 'linear',
          coords: { x1: 0, y1: 0, x2: 0, y2: 1 },
          colorStops: [
            { offset: 0, color: 'rgba(26, 26, 46, 0)' },
            { offset: 0.5, color: 'rgba(26, 26, 46, 0.8)' },
            { offset: 1, color: 'rgba(26, 26, 46, 1)' },
          ],
        },
      },
    },
    // Diagonal accent line
    {
      type: 'line',
      config: {
        x: 0.85,
        y: 0,
        width: 0.02,
        height: 0.25,
        color: '#FF6B35',
        opacity: 0.3,
      },
    },
  ],

  themeColors: {
    primary: '#FF6B35',
    secondary: '#1a1a2e',
    accent: '#e94560',
    text: '#ffffff',
    background: '#1a1a2e',
  },
};
