import React from 'react';
import { resolveToken } from './resolveToken';
import type { TemplateLayer, FlyerState } from './flyerTypes';

interface RenderLayerProps {
  layer: TemplateLayer;
  flyer: FlyerState;
}

// Template layers are NOT draggable - only additional images (logos) are
export default function RenderLayer({ layer, flyer }: RenderLayerProps) {
  const r = (val: string | number | undefined) => resolveToken(val, flyer);
  const fontScale = flyer.fontSize;

  switch (layer.type) {
    case 'rect':
      return (
        <rect
          key={layer.id}
          x={layer.x ?? 0}
          y={layer.y ?? 0}
          width={layer.width}
          height={layer.height}
          rx={layer.rx ?? 0}
          fill={r(layer.fill ?? 'transparent')}
          stroke={layer.stroke ? r(layer.stroke) : undefined}
          strokeWidth={layer.strokeWidth}
          opacity={layer.opacity ?? 1}
        />
      );

    case 'circle':
      return (
        <circle
          key={layer.id}
          cx={layer.cx ?? 0}
          cy={layer.cy ?? 0}
          r={layer.r}
          fill={r(layer.fill ?? 'transparent')}
          stroke={layer.stroke ? r(layer.stroke) : undefined}
          strokeWidth={layer.strokeWidth}
          opacity={layer.opacity ?? 1}
        />
      );

    case 'ellipse':
      return (
        <g
          key={layer.id}
          transform={
            layer.rotate
              ? `rotate(${layer.rotate}, ${layer.rotateCx ?? layer.cx ?? 0}, ${layer.rotateCy ?? layer.cy ?? 0})`
              : undefined
          }
        >
          <ellipse
            cx={layer.cx ?? 0}
            cy={layer.cy ?? 0}
            rx={layer.rx}
            ry={layer.ry}
            fill={r(layer.fill ?? 'transparent')}
            stroke={layer.stroke ? r(layer.stroke) : undefined}
            strokeWidth={layer.strokeWidth}
            opacity={layer.opacity ?? 1}
          />
        </g>
      );

    case 'polygon':
      return (
        <polygon
          key={layer.id}
          points={r(layer.points)}
          fill={r(layer.fill ?? 'transparent')}
          opacity={layer.opacity ?? 1}
        />
      );

    case 'svg-path':
      return (
        <path
          key={layer.id}
          d={layer.d}
          fill={r(layer.fill ?? 'none')}
          stroke={layer.stroke ? r(layer.stroke) : undefined}
          strokeWidth={layer.strokeWidth}
          strokeLinecap={layer.strokeLinecap ?? 'round'}
          opacity={layer.opacity ?? 1}
        />
      );

    case 'image':
      if (!flyer.productImage) return null;
      return (
        <image
          key={layer.id}
          x={layer.x ?? 0}
          y={layer.y ?? 0}
          width={layer.width}
          height={layer.height}
          href={r(layer.src)}
          preserveAspectRatio={layer.preserveAspectRatio ?? 'xMidYMid meet'}
          opacity={layer.opacity ?? 1}
          style={{ pointerEvents: 'none', userSelect: 'none', background: 'transparent' }}
          draggable={false}
          crossOrigin="anonymous"
        />
      );

    case 'text': {
      const baseFontSize = layer.fontSize ?? 24;
      // Check for font size override
      const overriddenFontSize = flyer.fontSizeOverrides[layer.id];
      const scaledFontSize = overriddenFontSize ?? Math.round(baseFontSize * fontScale);
      // Check for text color override
      const textColor = flyer.textColorOverrides[layer.id] ?? r(layer.color ?? '#ffffff');

      return (
        <text
          key={layer.id}
          x={layer.x ?? 0}
          y={layer.y ?? 0}
          fontSize={scaledFontSize}
          fontWeight={layer.fontWeight?.toString()}
          fontFamily={
            layer.fontFamily === 'PLACEHOLDER_FONT'
              ? flyer.font
              : layer.fontFamily
          }
          fontStyle={layer.fontStyle ?? 'normal'}
          fill={textColor}
          opacity={layer.opacity ?? 1}
          textAnchor={layer.textAnchor ?? 'start'}
          letterSpacing={layer.letterSpacing ?? 0}
          dominantBaseline="auto"
          style={{ userSelect: 'none' }}
        >
          {r(layer.value)}
        </text>
      );
    }

    default:
      return null;
  }
}
