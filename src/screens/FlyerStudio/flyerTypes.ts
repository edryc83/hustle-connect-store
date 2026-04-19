// New simplified types for string-injection renderer

export interface TokenConfig {
  type: 'text' | 'color' | 'image' | 'font';
  label: string;
  default: string;
}

export interface TemplateJSON {
  id: string;
  name: string;
  category: string;
  thumbnail?: string;
  canvas: { width: number; height: number };
  svg: string;
  tokens: Record<string, TokenConfig>;
}

export interface TemplateEntry {
  id: string;
  name: string;
  category: string;
  data: TemplateJSON;
}

// User state is just a map of token keys to current values
export type UserState = Record<string, string>;

// Categories for filtering templates
export const CATEGORY_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'beauty', label: 'Beauty' },
  { id: 'electronics', label: 'Electronics' },
  { id: 'fashion', label: 'Fashion' },
  { id: 'promo', label: 'Promo' },
];

// Available fonts
export const FONT_OPTIONS = [
  { id: 'syne', name: 'Syne', family: 'Syne' },
  { id: 'inter', name: 'Inter', family: 'Inter' },
  { id: 'montserrat', name: 'Montserrat', family: 'Montserrat' },
  { id: 'playfair', name: 'Playfair Display', family: 'Playfair Display' },
  { id: 'poppins', name: 'Poppins', family: 'Poppins' },
  { id: 'roboto', name: 'Roboto', family: 'Roboto' },
  { id: 'oswald', name: 'Oswald', family: 'Oswald' },
  { id: 'bebas', name: 'Bebas Neue', family: 'Bebas Neue' },
  { id: 'raleway', name: 'Raleway', family: 'Raleway' },
  { id: 'lato', name: 'Lato', family: 'Lato' },
  { id: 'rajdhani', name: 'Rajdhani', family: 'Rajdhani' },
  { id: 'barlow-condensed', name: 'Barlow Condensed', family: 'Barlow Condensed' },
  { id: 'dm-sans', name: 'DM Sans', family: 'DM Sans' },
  { id: 'space-mono', name: 'Space Mono', family: 'Space Mono' },
  { id: 'unbounded', name: 'Unbounded', family: 'Unbounded' },
  { id: 'ibm-plex-sans', name: 'IBM Plex Sans', family: 'IBM Plex Sans' },
];

// Generation steps for loading overlay
export const GENERATION_STEPS = [
  'Loading template...',
  'Preparing editor...',
  'Ready!',
];
