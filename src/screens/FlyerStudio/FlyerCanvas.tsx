import React, { forwardRef, useMemo } from 'react';

export interface TemplateJSON {
  id: string;
  name: string;
  category: string;
  thumbnail?: string;
  canvas: { width: number; height: number };
  svg: string;
  tokens: Record<string, { type: string; label: string; default: string }>;
}

interface FlyerCanvasProps {
  template: TemplateJSON;
  userState: Record<string, string>;
  width?: number;
  className?: string;
}

function resolveTemplate(svgString: string, userState: Record<string, string>): string {
  let svg = svgString;
  for (const [token, value] of Object.entries(userState)) {
    svg = svg.replaceAll(token, value ?? '');
  }
  return svg;
}

const FlyerCanvas = forwardRef<HTMLDivElement, FlyerCanvasProps>(
  ({ template, userState, width, className }, ref) => {
    const resolvedSvg = useMemo(
      () => resolveTemplate(template.svg, userState),
      [template.svg, userState]
    );

    return (
      <div
        ref={ref}
        className={className}
        style={{
          width: width ?? '100%',
          aspectRatio: `${template.canvas.width} / ${template.canvas.height}`,
          overflow: 'hidden',
          borderRadius: 12,
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
        }}
        dangerouslySetInnerHTML={{ __html: resolvedSvg }}
      />
    );
  }
);

FlyerCanvas.displayName = 'FlyerCanvas';

export default FlyerCanvas;
