import { minimalTemplate } from './minimal';
import { boldTemplate } from './bold';
import { elegantTemplate } from './elegant';

export type FlyerStyle = 'minimal' | 'bold' | 'elegant';
export type FlyerFormat = 'square' | 'story';

export interface ElementPosition {
  x: number; // 0-1 relative to canvas width
  y: number; // 0-1 relative to canvas height
  maxWidth?: number; // 0-1 relative to canvas width
  maxHeight?: number; // 0-1 relative to canvas height
  fontSize?: number; // Base font size (will scale with canvas)
  fontWeight?: string;
  fontFamily?: string;
  color?: string;
  align?: 'left' | 'center' | 'right';
  shadow?: {
    color: string;
    blur: number;
    offsetX: number;
    offsetY: number;
  };
}

export interface Decoration {
  type: 'gradient' | 'rect' | 'circle' | 'line';
  config: {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    radius?: number;
    color?: string;
    gradient?: {
      type: 'linear' | 'radial';
      coords: { x1: number; y1: number; x2: number; y2: number };
      colorStops: { offset: number; color: string }[];
    };
    opacity?: number;
  };
}

export interface FlyerTemplate {
  id: string;
  name: string;
  style: FlyerStyle;
  description: string;

  // Canvas base config (for square format)
  canvas: {
    width: number;
    height: number;
    backgroundColor: string;
  };

  // Element positions (relative 0-1 scale)
  elements: {
    productImage: ElementPosition;
    headline: ElementPosition;
    tagline: ElementPosition;
    price: ElementPosition;
    cta: ElementPosition;
    storeName: ElementPosition;
  };

  // Optional decorations
  decorations?: Decoration[];

  // Theme colors that can be customized
  themeColors: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    background: string;
  };
}

// Template dimensions for different formats
export const FORMAT_DIMENSIONS: Record<FlyerFormat, { width: number; height: number }> = {
  square: { width: 1080, height: 1080 },
  story: { width: 1080, height: 1920 },
};

// All available templates
export const templates: Record<FlyerStyle, FlyerTemplate> = {
  minimal: minimalTemplate,
  bold: boldTemplate,
  elegant: elegantTemplate,
};

// Get template by style
export function getTemplate(style: FlyerStyle): FlyerTemplate {
  return templates[style];
}

// Get all templates as array
export function getAllTemplates(): FlyerTemplate[] {
  return Object.values(templates);
}

// Adjust template positions for different formats
export function adjustForFormat(
  template: FlyerTemplate,
  format: FlyerFormat
): FlyerTemplate {
  if (format === 'square') return template;

  // For story format, we need to adjust Y positions
  // Story is taller, so elements should be more spread out
  const aspectRatioChange = (1920 / 1080) / (1080 / 1080); // ~1.78

  const adjustPosition = (pos: ElementPosition): ElementPosition => ({
    ...pos,
    // Shift elements down and spread them out more for story format
    y: pos.y * 0.7 + 0.1, // Compress into middle portion
  });

  return {
    ...template,
    canvas: {
      ...template.canvas,
      width: FORMAT_DIMENSIONS.story.width,
      height: FORMAT_DIMENSIONS.story.height,
    },
    elements: {
      productImage: {
        ...adjustPosition(template.elements.productImage),
        maxHeight: (template.elements.productImage.maxHeight || 0.5) * 0.7,
      },
      headline: adjustPosition(template.elements.headline),
      tagline: adjustPosition(template.elements.tagline),
      price: adjustPosition(template.elements.price),
      cta: adjustPosition(template.elements.cta),
      storeName: adjustPosition(template.elements.storeName),
    },
    decorations: template.decorations?.map(d => ({
      ...d,
      config: {
        ...d.config,
        y: d.config.y ? d.config.y * 0.7 + 0.1 : d.config.y,
        height: d.config.height ? d.config.height * 0.7 : d.config.height,
      },
    })),
  };
}
