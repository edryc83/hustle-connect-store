import { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import html2canvas from 'html2canvas';
import { Loader2 } from 'lucide-react';
import type { HTMLTemplate, FlyerData } from './templates/html-templates';

interface FlyerHTMLRendererProps {
  template: HTMLTemplate;
  data: FlyerData;
  format: 'square' | 'story';
  isPreview?: boolean;
}

export interface FlyerHTMLRendererRef {
  exportImage: (format?: 'png' | 'jpeg') => Promise<Blob | null>;
}

const FlyerHTMLRenderer = forwardRef<FlyerHTMLRendererRef, FlyerHTMLRendererProps>(({
  template,
  data,
  format,
  isPreview = false,
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  // Dimensions
  const width = 1080;
  const height = format === 'square' ? 1080 : 1920;
  const scale = isPreview ? 0.3 : 1;
  const displayWidth = width * scale;
  const displayHeight = height * scale;

  useEffect(() => {
    // Simulate loading for smooth transition
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, [template, data]);

  // Export to image
  useImperativeHandle(ref, () => ({
    exportImage: async (imgFormat = 'png') => {
      const element = containerRef.current?.querySelector('.flyer-content') as HTMLElement;
      if (!element) return null;

      try {
        // Remove transform for export
        const originalTransform = element.style.transform;
        element.style.transform = 'none';

        const canvas = await html2canvas(element, {
          width,
          height,
          scale: 2, // 2x for high quality
          useCORS: true,
          allowTaint: true,
          backgroundColor: null,
          logging: false,
        });

        // Restore transform
        element.style.transform = originalTransform;

        return new Promise<Blob | null>((resolve) => {
          canvas.toBlob(
            (blob) => resolve(blob),
            `image/${imgFormat}`,
            1
          );
        });
      } catch (error) {
        console.error('Export error:', error);
        return null;
      }
    },
  }));

  return (
    <div
      ref={containerRef}
      className="relative mx-auto overflow-hidden rounded-xl border border-border shadow-lg"
      style={{
        width: displayWidth,
        height: displayHeight,
        background: '#f0f0f0',
      }}
    >
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-muted/80 backdrop-blur-sm">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}

      {/* The actual flyer content */}
      <div
        className="flyer-content"
        style={{
          width,
          height,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      >
        {template.render(data, format)}
      </div>
    </div>
  );
});

FlyerHTMLRenderer.displayName = 'FlyerHTMLRenderer';

export default FlyerHTMLRenderer;
