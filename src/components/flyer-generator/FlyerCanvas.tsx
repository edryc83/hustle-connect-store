import { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import * as fabric from 'fabric';
import { Loader2 } from 'lucide-react';
import type { FlyerTemplate, FlyerFormat, FORMAT_DIMENSIONS } from './templates';

interface FlyerCanvasProps {
  template: FlyerTemplate;
  format: FlyerFormat;
  productImage: string | null;
  headline: string;
  tagline: string;
  price: string;
  cta: string;
  storeName: string;
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
  isPreview?: boolean;
}

export interface FlyerCanvasRef {
  exportImage: (format?: 'png' | 'jpeg') => Promise<Blob | null>;
  exportDataUrl: (format?: 'png' | 'jpeg') => string | null;
}

// Preview dimensions (scaled down for display)
const PREVIEW_WIDTH = 320;

function loadImage(url: string, timeoutMs = 15000): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = document.createElement('img');
    img.crossOrigin = 'anonymous';
    const timer = setTimeout(() => {
      img.src = '';
      reject(new Error('Image load timeout'));
    }, timeoutMs);
    img.onload = () => {
      clearTimeout(timer);
      resolve(img);
    };
    img.onerror = () => {
      clearTimeout(timer);
      reject(new Error('Image load failed'));
    };
    img.src = url;
  });
}

const FlyerCanvas = forwardRef<FlyerCanvasRef, FlyerCanvasProps>(({
  template,
  format,
  productImage,
  headline,
  tagline,
  price,
  cta,
  storeName,
  primaryColor,
  secondaryColor,
  fontFamily,
  isPreview = false,
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const [loading, setLoading] = useState(true);

  // Get canvas dimensions based on format
  const dimensions = format === 'square'
    ? { width: 1080, height: 1080 }
    : { width: 1080, height: 1920 };

  // Scale factor for preview
  const scale = isPreview ? PREVIEW_WIDTH / dimensions.width : 1;
  const canvasWidth = dimensions.width * scale;
  const canvasHeight = dimensions.height * scale;

  // Export methods
  useImperativeHandle(ref, () => ({
    exportImage: async (imgFormat = 'png') => {
      const canvas = fabricRef.current;
      if (!canvas) return null;

      // For export, we need full resolution
      // Create a temporary high-res canvas
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = dimensions.width;
      exportCanvas.height = dimensions.height;
      const ctx = exportCanvas.getContext('2d');
      if (!ctx) return null;

      // Get the current canvas data
      const dataUrl = canvas.toDataURL({
        format: imgFormat,
        multiplier: dimensions.width / canvasWidth,
        quality: 1,
      });

      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0, dimensions.width, dimensions.height);
          exportCanvas.toBlob((blob) => {
            resolve(blob);
          }, `image/${imgFormat}`, 1);
        };
        img.src = dataUrl;
      });
    },
    exportDataUrl: (imgFormat = 'png') => {
      const canvas = fabricRef.current;
      if (!canvas) return null;
      return canvas.toDataURL({
        format: imgFormat,
        multiplier: dimensions.width / canvasWidth,
        quality: 1,
      });
    },
  }));

  // Build canvas
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clear previous canvas
    container.innerHTML = '';

    const canvasEl = document.createElement('canvas');
    container.appendChild(canvasEl);

    const canvas = new fabric.Canvas(canvasEl, {
      width: canvasWidth,
      height: canvasHeight,
      backgroundColor: template.canvas.backgroundColor,
      selection: false,
    });
    fabricRef.current = canvas;

    // CSS scaling for container
    const wrapper = container.querySelector('.canvas-container') as HTMLElement;
    if (wrapper) {
      wrapper.style.width = '100%';
      wrapper.style.height = 'auto';
    }
    container.querySelectorAll('canvas').forEach((c) => {
      c.style.width = '100%';
      c.style.height = 'auto';
    });

    let cancelled = false;

    const buildCanvas = async () => {
      setLoading(true);

      const effectivePrimary = primaryColor || template.themeColors.primary;
      const effectiveSecondary = secondaryColor || template.themeColors.secondary;

      // Draw background
      const bg = new fabric.Rect({
        width: canvasWidth,
        height: canvasHeight,
        fill: template.canvas.backgroundColor,
        selectable: false,
        evented: false,
      });
      canvas.add(bg);

      // Draw decorations
      for (const decoration of template.decorations || []) {
        if (cancelled) return;

        const x = (decoration.config.x || 0) * canvasWidth;
        const y = (decoration.config.y || 0) * canvasHeight;
        const w = (decoration.config.width || 0) * canvasWidth;
        const h = (decoration.config.height || 0) * canvasHeight;

        if (decoration.type === 'rect' || decoration.type === 'line') {
          const rect = new fabric.Rect({
            left: x,
            top: y,
            width: w,
            height: h || 2,
            fill: decoration.config.color === template.themeColors.primary
              ? effectivePrimary
              : decoration.config.color,
            opacity: decoration.config.opacity ?? 1,
            selectable: false,
            evented: false,
          });
          canvas.add(rect);
        } else if (decoration.type === 'gradient' && decoration.config.gradient) {
          const grad = decoration.config.gradient;
          const rect = new fabric.Rect({
            left: x,
            top: y,
            width: w,
            height: h,
            selectable: false,
            evented: false,
          });
          rect.set('fill', new fabric.Gradient({
            type: grad.type,
            coords: {
              x1: grad.coords.x1 * w,
              y1: grad.coords.y1 * h,
              x2: grad.coords.x2 * w,
              y2: grad.coords.y2 * h,
            },
            colorStops: grad.colorStops,
          }));
          canvas.add(rect);
        }
      }

      // Draw product image
      if (productImage) {
        try {
          const imgEl = await loadImage(productImage);
          if (cancelled) return;

          const img = new fabric.FabricImage(imgEl);
          const pos = template.elements.productImage;
          const maxW = (pos.maxWidth || 0.6) * canvasWidth;
          const maxH = (pos.maxHeight || 0.5) * canvasHeight;

          // Scale to fit within bounds
          const imgScale = Math.min(
            maxW / (img.width || 1),
            maxH / (img.height || 1)
          );

          img.set({
            scaleX: imgScale,
            scaleY: imgScale,
            left: pos.x * canvasWidth,
            top: pos.y * canvasHeight,
            originX: 'center',
            originY: 'center',
            selectable: false,
            evented: false,
          });
          canvas.add(img);
        } catch (e) {
          console.error('Product image load error:', e);
        }
      }

      // Helper to get effective color based on template theme
      const getEffectiveColor = (color?: string) => {
        if (!color) return template.themeColors.text;
        if (color === template.themeColors.primary) return effectivePrimary;
        if (color === template.themeColors.secondary) return effectiveSecondary;
        return color;
      };

      // Draw text elements
      const addText = (
        text: string,
        config: typeof template.elements.headline,
        key: string
      ) => {
        if (!text) return;

        const fontSize = (config.fontSize || 24) * scale;
        // Use selected font for main text elements, keep store name in default font
        const effectiveFont = key === 'storeName'
          ? (config.fontFamily || 'Inter, sans-serif')
          : (fontFamily || config.fontFamily || 'Inter, sans-serif');

        const textObj = new fabric.Textbox(text, {
          left: config.x * canvasWidth,
          top: config.y * canvasHeight,
          originX: config.align === 'center' ? 'center' : config.align === 'right' ? 'right' : 'left',
          originY: 'center',
          fontSize,
          fontWeight: config.fontWeight || '400',
          fontFamily: effectiveFont,
          fill: getEffectiveColor(config.color),
          textAlign: config.align || 'center',
          width: canvasWidth * 0.9,
          selectable: false,
          evented: false,
        });

        // Apply shadow if specified
        if (config.shadow) {
          textObj.set('shadow', new fabric.Shadow({
            color: config.shadow.color,
            blur: config.shadow.blur * scale,
            offsetX: config.shadow.offsetX * scale,
            offsetY: config.shadow.offsetY * scale,
          }));
        }

        canvas.add(textObj);
      };

      // Add all text elements
      addText(storeName, template.elements.storeName, 'storeName');
      addText(headline, template.elements.headline, 'headline');
      addText(tagline, template.elements.tagline, 'tagline');
      addText(price, template.elements.price, 'price');
      addText(cta, template.elements.cta, 'cta');

      canvas.renderAll();
      setLoading(false);
    };

    buildCanvas();

    return () => {
      cancelled = true;
      canvas.dispose();
      fabricRef.current = null;
    };
  }, [
    template,
    format,
    productImage,
    headline,
    tagline,
    price,
    cta,
    storeName,
    primaryColor,
    secondaryColor,
    fontFamily,
    canvasWidth,
    canvasHeight,
    scale,
    dimensions.width,
  ]);

  return (
    <div className="w-full">
      <div
        className="relative rounded-xl overflow-hidden border border-border shadow-lg bg-muted mx-auto"
        style={{
          maxWidth: isPreview ? PREVIEW_WIDTH : '100%',
          aspectRatio: `${dimensions.width}/${dimensions.height}`,
        }}
      >
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-muted/80 backdrop-blur-sm">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
        <div
          ref={containerRef}
          className="w-full"
          style={{ aspectRatio: `${dimensions.width}/${dimensions.height}` }}
        />
      </div>
    </div>
  );
});

FlyerCanvas.displayName = 'FlyerCanvas';

export default FlyerCanvas;
