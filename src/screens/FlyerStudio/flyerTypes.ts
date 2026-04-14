export interface LayerOffset {
  x: number;
  y: number;
}

export interface AdditionalImage {
  id: string;
  url: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FlyerState {
  template: string;
  title: string;
  tagline: string;
  badge: string;
  cta: string;
  bodyText: string;
  phone: string;
  address: string;
  storeName: string;
  productName: string;
  productPrice: string;
  bgColor: string;
  accentColor: string;
  textColor: string; // Global text color override
  font: string;
  fontSize: number; // 0.5 to 1.5 scale factor
  productImage: string | null;
  productImageScale: number; // 0.5 to 2.0 scale factor for product image
  productImageOffset: LayerOffset; // x, y offset for product image position
  additionalImages: AdditionalImage[]; // logos, extra images
  layerOffsets: Record<string, LayerOffset>; // layer id -> offset
  fontSizeOverrides: Record<string, number>; // layer id -> font size override
  textColorOverrides: Record<string, string>; // layer id -> text color override
  deletedLayerIds: string[]; // IDs of deleted layers
  selectedLayerId: string | null; // Currently selected layer for editing
  isGenerating: boolean;
  generationStep: number;
}

export interface TemplateLayer {
  id: string;
  type: 'rect' | 'circle' | 'ellipse' | 'polygon' | 'svg-path' | 'image' | 'text';
  group?: string; // Group ID - elements with same group move together
  // rect / shared
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rx?: number; // rect corner radius OR ellipse rx
  ry?: number; // ellipse ry
  // circle
  cx?: number;
  cy?: number;
  r?: number;
  rotate?: number;
  rotateCx?: number;
  rotateCy?: number;
  // polygon
  points?: string;
  // path
  d?: string;
  // image
  src?: string;
  fit?: string;
  preserveAspectRatio?: string;
  // text
  value?: string;
  fontSize?: number;
  fontWeight?: string | number;
  fontFamily?: string;
  fontStyle?: string;
  letterSpacing?: number;
  textAnchor?: 'start' | 'middle' | 'end';
  // shared
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  strokeLinecap?: 'butt' | 'round' | 'square';
  color?: string;
  opacity?: number;
}

export interface TemplateJSON {
  id: string;
  name: string;
  category: string;
  canvas: { width: number; height: number };
  colors: Record<string, string>;
  layers: TemplateLayer[];
}

export interface TemplateEntry {
  id: string;
  name: string;
  category: string;
  data: TemplateJSON;
}

export const ACCENT_COLORS = [
  '#a0e020',
  '#6c63ff',
  '#ff4d6d',
  '#ffd60a',
  '#00b4d8',
  '#ff6d00',
  '#2ec4b6',
  '#e91e8c',
  '#9b59b6',
];

export const BG_COLORS = [
  '#9b59b6',
  '#1a1a2e',
  '#2d3a1e',
  '#0d1117',
  '#ffffff',
  '#f5f0e8',
  '#0a1628',
  '#1a0a2e',
];

export const TEXT_COLORS = [
  '#ffffff',
  '#000000',
  '#f5f5f5',
  '#333333',
  '#ffd700',
  '#ff4d6d',
  '#00b4d8',
  '#a0e020',
];

export const FONT_OPTIONS = [
  { id: 'modern', name: 'Modern', family: 'Inter' },
  { id: 'bold', name: 'Bold', family: 'Montserrat' },
  { id: 'elegant', name: 'Elegant', family: 'Playfair Display' },
];

export const CATEGORY_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'beauty', label: 'Beauty' },
  { id: 'tech', label: 'Tech' },
  { id: 'fashion', label: 'Fashion' },
  { id: 'promo', label: 'Promo' },
];

export const GENERATION_STEPS = [
  'Reading product details...',
  'Writing your copy...',
  'Removing background...',
  'Composing your flyer...',
];
