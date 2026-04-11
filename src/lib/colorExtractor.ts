/**
 * Extract dominant colors from an image using native Canvas API
 * Uses a simple color quantization algorithm
 */

interface RGB {
  r: number;
  g: number;
  b: number;
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

function hexToRgb(hex: string): RGB | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function colorDistance(c1: RGB, c2: RGB): number {
  return Math.sqrt(
    Math.pow(c1.r - c2.r, 2) +
    Math.pow(c1.g - c2.g, 2) +
    Math.pow(c1.b - c2.b, 2)
  );
}

function getLuminance(r: number, g: number, b: number): number {
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

function isNearWhiteOrBlack(r: number, g: number, b: number, threshold = 30): boolean {
  // Skip very light colors (near white)
  if (r > 225 && g > 225 && b > 225) return true;
  // Skip very dark colors (near black)
  if (r < threshold && g < threshold && b < threshold) return true;
  return false;
}

/**
 * Extract dominant colors from an image URL
 * @param imageUrl - URL of the image to analyze
 * @param count - Number of colors to extract (default: 5)
 * @returns Promise<string[]> - Array of hex color codes
 */
export async function extractColors(imageUrl: string, count = 5): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        // Create canvas for analysis
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(getDefaultPalette());
          return;
        }

        // Scale down for faster processing
        const maxSize = 100;
        const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;

        // Collect color samples
        const colorMap = new Map<string, number>();
        const step = 4; // Sample every 4th pixel for speed

        for (let i = 0; i < pixels.length; i += 4 * step) {
          const r = pixels[i];
          const g = pixels[i + 1];
          const b = pixels[i + 2];
          const a = pixels[i + 3];

          // Skip transparent pixels
          if (a < 128) continue;

          // Skip near-white and near-black
          if (isNearWhiteOrBlack(r, g, b)) continue;

          // Quantize to reduce color space (round to nearest 16)
          const qr = Math.round(r / 16) * 16;
          const qg = Math.round(g / 16) * 16;
          const qb = Math.round(b / 16) * 16;

          const key = `${qr},${qg},${qb}`;
          colorMap.set(key, (colorMap.get(key) || 0) + 1);
        }

        // Sort by frequency
        const sortedColors = Array.from(colorMap.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, count * 3); // Get more than needed for filtering

        // Convert to RGB and filter similar colors
        const finalColors: string[] = [];
        const minDistance = 50; // Minimum color distance between palette entries

        for (const [key] of sortedColors) {
          const [r, g, b] = key.split(',').map(Number);
          const hex = rgbToHex(r, g, b);
          const rgb: RGB = { r, g, b };

          // Check if this color is too similar to already selected colors
          const isTooSimilar = finalColors.some(existingHex => {
            const existing = hexToRgb(existingHex);
            return existing && colorDistance(rgb, existing) < minDistance;
          });

          if (!isTooSimilar) {
            finalColors.push(hex);
            if (finalColors.length >= count) break;
          }
        }

        // Fill with defaults if we don't have enough
        while (finalColors.length < count) {
          const defaults = getDefaultPalette();
          const next = defaults[finalColors.length % defaults.length];
          if (!finalColors.includes(next)) {
            finalColors.push(next);
          }
        }

        resolve(finalColors);
      } catch (error) {
        console.error('Color extraction error:', error);
        resolve(getDefaultPalette());
      }
    };

    img.onerror = () => {
      console.error('Failed to load image for color extraction');
      resolve(getDefaultPalette());
    };

    img.src = imageUrl;
  });
}

/**
 * Get a contrasting text color (black or white) for a given background
 */
export function getContrastColor(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return '#000000';

  const luminance = getLuminance(rgb.r, rgb.g, rgb.b);
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

/**
 * Generate a complementary color palette from a base color
 */
export function generatePalette(baseHex: string): string[] {
  const rgb = hexToRgb(baseHex);
  if (!rgb) return getDefaultPalette();

  const palette: string[] = [baseHex];

  // Add a darker version
  const darker = rgbToHex(
    Math.max(0, rgb.r - 40),
    Math.max(0, rgb.g - 40),
    Math.max(0, rgb.b - 40)
  );
  palette.push(darker);

  // Add a lighter version
  const lighter = rgbToHex(
    Math.min(255, rgb.r + 40),
    Math.min(255, rgb.g + 40),
    Math.min(255, rgb.b + 40)
  );
  palette.push(lighter);

  // Add complementary (opposite on color wheel approximation)
  const complementary = rgbToHex(
    255 - rgb.r,
    255 - rgb.g,
    255 - rgb.b
  );
  palette.push(complementary);

  // Add neutral
  palette.push('#ffffff');

  return palette;
}

/**
 * Default color palette when extraction fails
 */
export function getDefaultPalette(): string[] {
  return [
    '#FF6B35', // Orange (brand)
    '#1a1a2e', // Dark navy
    '#16213e', // Deep blue
    '#0f3460', // Blue
    '#e94560', // Pink/red
  ];
}
