import React from 'react';
import { resolveToken, resolveGradient } from './resolveToken';
import type { TemplateLayer, FlyerState, GradientFill } from './flyerTypes';

interface RenderLayerProps {
  layer: TemplateLayer;
  flyer: FlyerState;
}

// Check if fill is a gradient object
const isGradient = (fill: string | GradientFill | undefined): fill is GradientFill => {
  return typeof fill === 'object' && fill !== null && 'type' in fill;
};

// Generate a unique gradient ID
const getGradientId = (layerId: string, gradientId: string) => `${layerId}-${gradientId}`;

// Render gradient definition
function GradientDef({ gradient, layerId, flyer }: { gradient: GradientFill; layerId: string; flyer: FlyerState }) {
  const resolved = resolveGradient(gradient, flyer);
  const id = getGradientId(layerId, gradient.id);

  if (resolved.type === 'linearGradient') {
    return (
      <linearGradient id={id} x1={resolved.x1} y1={resolved.y1} x2={resolved.x2} y2={resolved.y2}>
        {resolved.stops.map((stop, i) => (
          <stop
            key={i}
            offset={stop.offset}
            stopColor={stop.color}
            stopOpacity={stop.opacity ?? 1}
          />
        ))}
      </linearGradient>
    );
  }

  if (resolved.type === 'radialGradient') {
    return (
      <radialGradient id={id} cx={resolved.cx} cy={resolved.cy} r={resolved.r}>
        {resolved.stops.map((stop, i) => (
          <stop
            key={i}
            offset={stop.offset}
            stopColor={stop.color}
            stopOpacity={stop.opacity ?? 1}
          />
        ))}
      </radialGradient>
    );
  }

  return null;
}

// Template layers are NOT draggable - only additional images (logos) are
export default function RenderLayer({ layer, flyer }: RenderLayerProps) {
  const r = (val: string | number | undefined) => resolveToken(val, flyer);
  const fontScale = flyer.fontSize;

  // Check visibility
  if (layer.visible === false) return null;

  // Helper to get fill value (handles gradients)
  const getFill = () => {
    if (isGradient(layer.fill)) {
      return `url(#${getGradientId(layer.id, layer.fill.id)})`;
    }
    return r(layer.fill ?? 'transparent');
  };

  // Render gradient defs if needed
  const gradientDef = isGradient(layer.fill) ? (
    <GradientDef gradient={layer.fill} layerId={layer.id} flyer={flyer} />
  ) : null;

  switch (layer.type) {
    case 'rect':
      return (
        <>
          {gradientDef && <defs>{gradientDef}</defs>}
          <rect
            key={layer.id}
            x={layer.x ?? 0}
            y={layer.y ?? 0}
            width={layer.width}
            height={layer.height}
            rx={layer.rx ?? 0}
            fill={getFill()}
            fillOpacity={layer.fillOpacity}
            stroke={layer.stroke && layer.stroke !== 'none' ? r(layer.stroke) : undefined}
            strokeWidth={layer.strokeWidth}
            strokeOpacity={layer.strokeOpacity}
            opacity={layer.opacity ?? 1}
          />
        </>
      );

    case 'circle':
      return (
        <>
          {gradientDef && <defs>{gradientDef}</defs>}
          <circle
            key={layer.id}
            cx={layer.cx ?? 0}
            cy={layer.cy ?? 0}
            r={layer.r}
            fill={getFill()}
            fillOpacity={layer.fillOpacity}
            stroke={layer.stroke && layer.stroke !== 'none' ? r(layer.stroke) : undefined}
            strokeWidth={layer.strokeWidth}
            strokeOpacity={layer.strokeOpacity}
            opacity={layer.opacity ?? 1}
          />
        </>
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
          {gradientDef && <defs>{gradientDef}</defs>}
          <ellipse
            cx={layer.cx ?? 0}
            cy={layer.cy ?? 0}
            rx={layer.rx}
            ry={layer.ry}
            fill={getFill()}
            fillOpacity={layer.fillOpacity}
            stroke={layer.stroke && layer.stroke !== 'none' ? r(layer.stroke) : undefined}
            strokeWidth={layer.strokeWidth}
            strokeOpacity={layer.strokeOpacity}
            opacity={layer.opacity ?? 1}
          />
        </g>
      );

    case 'polygon':
      return (
        <>
          {gradientDef && <defs>{gradientDef}</defs>}
          <polygon
            key={layer.id}
            points={r(layer.points)}
            fill={getFill()}
            fillOpacity={layer.fillOpacity}
            stroke={layer.stroke && layer.stroke !== 'none' ? r(layer.stroke) : undefined}
            strokeWidth={layer.strokeWidth}
            strokeOpacity={layer.strokeOpacity}
            opacity={layer.opacity ?? 1}
          />
        </>
      );

    case 'svg-path':
      return (
        <>
          {gradientDef && <defs>{gradientDef}</defs>}
          <path
            key={layer.id}
            d={layer.d}
            fill={layer.fill === 'none' ? 'none' : getFill()}
            fillOpacity={layer.fillOpacity}
            stroke={layer.stroke && layer.stroke !== 'none' ? r(layer.stroke) : undefined}
            strokeWidth={layer.strokeWidth}
            strokeOpacity={layer.strokeOpacity}
            strokeLinecap={layer.strokeLinecap ?? 'round'}
            opacity={layer.opacity ?? 1}
          />
        </>
      );

    case 'image': {
      if (!flyer.productImage) return null;
      const baseX = layer.x ?? 0;
      const baseY = layer.y ?? 0;
      const baseWidth = layer.width ?? 300;
      const baseHeight = layer.height ?? 300;
      const scale = flyer.productImageScale ?? 1;
      const offset = flyer.productImageOffset ?? { x: 0, y: 0 };

      // Calculate scaled dimensions and centered position
      const scaledWidth = baseWidth * scale;
      const scaledHeight = baseHeight * scale;
      // Adjust position to keep image centered when scaling
      const centerX = baseX + baseWidth / 2;
      const centerY = baseY + baseHeight / 2;
      const scaledX = centerX - scaledWidth / 2 + offset.x;
      const scaledY = centerY - scaledHeight / 2 + offset.y;

      return (
        <image
          key={layer.id}
          x={scaledX}
          y={scaledY}
          width={scaledWidth}
          height={scaledHeight}
          href={r(layer.src)}
          preserveAspectRatio={layer.preserveAspectRatio ?? 'xMidYMid meet'}
          opacity={layer.opacity ?? 1}
          style={{ pointerEvents: 'none', userSelect: 'none' }}
          crossOrigin="anonymous"
        />
      );
    }

    case 'text': {
      const baseFontSize = layer.fontSize ?? 24;
      // Check for font size override
      const overriddenFontSize = flyer.fontSizeOverrides[layer.id];
      const scaledFontSize = overriddenFontSize ?? Math.round(baseFontSize * fontScale);
      // Check for text color override - support both 'color' and 'fill' properties
      const layerColor = layer.color ?? (typeof layer.fill === 'string' ? layer.fill : undefined) ?? '#ffffff';
      const textColor = flyer.textColorOverrides[layer.id] ?? r(layerColor);
      // Support both 'value' and 'content' for text
      const textContent = layer.value ?? layer.content ?? '';
      // Resolve font family placeholders
      const fontFamily = r(layer.fontFamily ?? 'PLACEHOLDER_FONT');

      return (
        <text
          key={layer.id}
          x={layer.x ?? 0}
          y={layer.y ?? 0}
          fontSize={scaledFontSize}
          fontWeight={layer.fontWeight?.toString()}
          fontFamily={fontFamily}
          fontStyle={layer.fontStyle ?? 'normal'}
          fill={textColor}
          fillOpacity={layer.fillOpacity}
          opacity={layer.opacity ?? 1}
          textAnchor={layer.textAnchor ?? 'start'}
          letterSpacing={layer.letterSpacing ?? 0}
          dominantBaseline="auto"
          style={{ userSelect: 'none' }}
        >
          {r(textContent)}
        </text>
      );
    }

    default:
      return null;
  }
}
