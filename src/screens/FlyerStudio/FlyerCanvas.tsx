import React, { forwardRef, useMemo, useEffect, useRef } from 'react';
import type { TextOverrides } from './useFlyer';

export interface TemplateJSON {
  id: string;
  name: string;
  category: string;
  thumbnail?: string;
  canvas: { width: number; height: number };
  svg: string;
  tokens: Record<string, { type: string; label: string; default: string }>;
}

export interface AdditionalImage {
  id: string;
  url: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface FlyerCanvasProps {
  template: TemplateJSON;
  userState: Record<string, string>;
  additionalImages?: AdditionalImage[];
  productImageScale?: number;
  productImageOffset?: { x: number; y: number };
  textOverrides?: TextOverrides;
  onTextDrag?: (tokenKey: string, offset: { x: number; y: number }) => void;
  width?: number;
  className?: string;
  style?: React.CSSProperties;
}

function applyTextOverrides(
  svgString: string,
  textOverrides: TextOverrides,
  tokens: Record<string, { type: string; label: string; default: string }>
): string {
  let svg = svgString;

  // Get all text tokens
  const textTokens = Object.entries(tokens).filter(([, config]) => config.type === 'text');

  for (const [tokenKey] of textTokens) {
    const fontScale = textOverrides.fontScale[tokenKey];
    const posOffset = textOverrides.position[tokenKey];

    // Find text element containing this token and apply overrides
    // Match: <text ... >TOKEN</text> or <text ...>TOKEN</text>
    const textRegex = new RegExp(
      `(<text[^>]*)(>)(${tokenKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})(</text>)`,
      'g'
    );

    svg = svg.replace(textRegex, (match, openTagStart, openTagEnd, content, closeTag) => {
      let modifiedOpenTag = openTagStart;

      // Apply font scale
      if (fontScale && fontScale !== 1) {
        const fontSizeMatch = openTagStart.match(/font-size="([^"]*)"/);
        if (fontSizeMatch) {
          const originalSize = parseFloat(fontSizeMatch[1]);
          const newSize = originalSize * fontScale;
          modifiedOpenTag = modifiedOpenTag.replace(
            /font-size="[^"]*"/,
            `font-size="${newSize}"`
          );
        }
      }

      // Apply position offset via transform
      if (posOffset && (posOffset.x !== 0 || posOffset.y !== 0)) {
        // Check if transform already exists
        if (modifiedOpenTag.includes('transform="')) {
          modifiedOpenTag = modifiedOpenTag.replace(
            /transform="([^"]*)"/,
            `transform="$1 translate(${posOffset.x}, ${posOffset.y})"`
          );
        } else {
          modifiedOpenTag = modifiedOpenTag + ` transform="translate(${posOffset.x}, ${posOffset.y})"`;
        }
      }

      // Always add data attribute for drag detection (even without overrides)
      modifiedOpenTag = modifiedOpenTag.replace(
        '<text',
        `<text data-token="${tokenKey}" style="cursor:move;-webkit-user-select:none;user-select:none"`
      );

      return modifiedOpenTag + openTagEnd + content + closeTag;
    });
  }

  return svg;
}

function resolveTemplate(svgString: string, userState: Record<string, string>): string {
  let svg = svgString;
  for (const [token, value] of Object.entries(userState)) {
    svg = svg.replaceAll(token, value ?? '');
  }
  return svg;
}

function applyProductImageTransform(
  svgString: string,
  scale: number,
  offset: { x: number; y: number }
): string {
  if (scale === 1 && offset.x === 0 && offset.y === 0) {
    return svgString;
  }

  // Find the product image element (usually has id containing "product" or "main-image")
  // We'll wrap it in a group with transform
  const imageRegex = /(<image[^>]*(?:id="[^"]*product[^"]*"|href="[^"]*")[^>]*)(\/?>)/gi;

  return svgString.replace(imageRegex, (match, imageStart, imageEnd) => {
    // Extract current x, y, width, height
    const xMatch = imageStart.match(/\bx="([^"]*)"/);
    const yMatch = imageStart.match(/\by="([^"]*)"/);
    const widthMatch = imageStart.match(/\bwidth="([^"]*)"/);
    const heightMatch = imageStart.match(/\bheight="([^"]*)"/);

    const x = xMatch ? parseFloat(xMatch[1]) : 0;
    const y = yMatch ? parseFloat(yMatch[1]) : 0;
    const width = widthMatch ? parseFloat(widthMatch[1]) : 0;
    const height = heightMatch ? parseFloat(heightMatch[1]) : 0;

    // Calculate center point for scaling
    const centerX = x + width / 2;
    const centerY = y + height / 2;

    // Apply scale from center and add offset
    const newWidth = width * scale;
    const newHeight = height * scale;
    const newX = centerX - newWidth / 2 + offset.x;
    const newY = centerY - newHeight / 2 + offset.y;

    // Replace dimensions in the image element
    let modified = imageStart;
    if (xMatch) modified = modified.replace(/\bx="[^"]*"/, `x="${newX}"`);
    if (yMatch) modified = modified.replace(/\by="[^"]*"/, `y="${newY}"`);
    if (widthMatch) modified = modified.replace(/\bwidth="[^"]*"/, `width="${newWidth}"`);
    if (heightMatch) modified = modified.replace(/\bheight="[^"]*"/, `height="${newHeight}"`);

    return modified + imageEnd;
  });
}

const FlyerCanvas = forwardRef<HTMLDivElement, FlyerCanvasProps>(
  ({ template, userState, additionalImages = [], productImageScale = 1, productImageOffset = { x: 0, y: 0 }, textOverrides = { fontScale: {}, position: {} }, onTextDrag, width, className, style }, ref) => {
    const svgContainerRef = useRef<HTMLDivElement>(null);
    const dragStateRef = useRef<{ tokenKey: string; startX: number; startY: number; initialOffset: { x: number; y: number } } | null>(null);

    // First apply text overrides (before token replacement so we can find placeholders)
    const svgWithTextOverrides = useMemo(
      () => applyTextOverrides(template.svg, textOverrides, template.tokens),
      [template.svg, textOverrides, template.tokens]
    );

    // Then resolve tokens
    const resolvedSvg = useMemo(
      () => resolveTemplate(svgWithTextOverrides, userState),
      [svgWithTextOverrides, userState]
    );

    // Apply product image transformations
    const svgWithTransforms = useMemo(
      () => applyProductImageTransform(resolvedSvg, productImageScale, productImageOffset),
      [resolvedSvg, productImageScale, productImageOffset]
    );

    // Inject additional images (logos) into the SVG before closing tag
    const svgWithLogos = useMemo(() => {
      if (additionalImages.length === 0) return svgWithTransforms;

      const logoElements = additionalImages.map(img =>
        `<image href="${img.url}" x="${img.x}" y="${img.y}" width="${img.width}" height="${img.height}" preserveAspectRatio="xMidYMid meet"/>`
      ).join('\n');

      // Insert before </svg>
      return svgWithTransforms.replace('</svg>', `${logoElements}\n</svg>`);
    }, [svgWithTransforms, additionalImages]);

    // Setup drag handlers for text elements
    useEffect(() => {
      const container = svgContainerRef.current;
      if (!container || !onTextDrag) return;

      const svg = container.querySelector('svg');
      if (!svg) return;

      // Get SVG dimensions for coordinate scaling
      const getScale = () => {
        const rect = svg.getBoundingClientRect();
        return {
          scaleX: template.canvas.width / rect.width,
          scaleY: template.canvas.height / rect.height,
        };
      };

      const handlePointerDown = (e: PointerEvent) => {
        const target = e.target as Element;
        // Check if target is a text element or inside one
        const textEl = target.tagName === 'text' ? target : target.closest('text');
        if (!textEl) return;

        const tokenKey = textEl.getAttribute('data-token');
        if (!tokenKey) return;

        e.preventDefault();
        e.stopPropagation();

        // Capture pointer for smooth dragging
        try {
          container.setPointerCapture(e.pointerId);
        } catch (err) {
          // Ignore capture errors
        }

        const currentOffset = textOverrides.position[tokenKey] || { x: 0, y: 0 };
        dragStateRef.current = {
          tokenKey,
          startX: e.clientX,
          startY: e.clientY,
          initialOffset: { ...currentOffset },
        };
      };

      const handlePointerMove = (e: PointerEvent) => {
        if (!dragStateRef.current) return;

        e.preventDefault();
        const { tokenKey, startX, startY, initialOffset } = dragStateRef.current;
        const scale = getScale();

        const deltaX = (e.clientX - startX) * scale.scaleX;
        const deltaY = (e.clientY - startY) * scale.scaleY;

        onTextDrag(tokenKey, {
          x: Math.round(initialOffset.x + deltaX),
          y: Math.round(initialOffset.y + deltaY),
        });
      };

      const handlePointerUp = (e: PointerEvent) => {
        if (dragStateRef.current) {
          try {
            container.releasePointerCapture(e.pointerId);
          } catch (err) {
            // Ignore release errors
          }
        }
        dragStateRef.current = null;
      };

      // Use capture phase for better event handling
      container.addEventListener('pointerdown', handlePointerDown, { capture: true });
      container.addEventListener('pointermove', handlePointerMove, { capture: true });
      container.addEventListener('pointerup', handlePointerUp, { capture: true });
      container.addEventListener('pointercancel', handlePointerUp, { capture: true });

      return () => {
        container.removeEventListener('pointerdown', handlePointerDown, { capture: true });
        container.removeEventListener('pointermove', handlePointerMove, { capture: true });
        container.removeEventListener('pointerup', handlePointerUp, { capture: true });
        container.removeEventListener('pointercancel', handlePointerUp, { capture: true });
      };
    }, [onTextDrag, template.canvas.width, template.canvas.height, textOverrides.position]);

    return (
      <div
        ref={ref}
        className={className}
        style={{
          width: width ?? '100%',
          aspectRatio: `${template.canvas.width} / ${template.canvas.height}`,
          overflow: 'hidden',
          borderRadius: 12,
          ...style,
        }}
      >
        <div
          ref={svgContainerRef}
          style={{
            width: '100%',
            height: '100%',
            touchAction: 'none',
          }}
          dangerouslySetInnerHTML={{ __html: svgWithLogos }}
          className="[&>svg]:w-full [&>svg]:h-full [&>svg]:block"
        />
      </div>
    );
  }
);

FlyerCanvas.displayName = 'FlyerCanvas';

export default FlyerCanvas;
