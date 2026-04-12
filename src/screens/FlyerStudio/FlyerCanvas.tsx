import React, { forwardRef, useMemo, useState, useRef } from 'react';
import RenderLayer from './RenderLayer';
import type { TemplateJSON, FlyerState, AdditionalImage, TemplateLayer, LayerOffset } from './flyerTypes';

interface FlyerCanvasProps {
  templateJson: TemplateJSON;
  flyer: FlyerState;
  width: number;
  height?: number;
  className?: string;
  onImageUpdate?: (id: string, updates: Partial<AdditionalImage>) => void;
  onLayerMove?: (id: string, offset: LayerOffset) => void;
  onLayerSelect?: (id: string | null) => void;
}

// Draggable wrapper for any layer
function DraggableLayer({
  layer,
  flyer,
  scale,
  onMove,
  onSelect,
  children,
}: {
  layer: TemplateLayer;
  flyer: FlyerState;
  scale: number;
  onMove?: (offset: LayerOffset) => void;
  onSelect?: () => void;
  children: React.ReactNode;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; offsetX: number; offsetY: number } | null>(null);
  const offset = flyer.layerOffsets[layer.id] || { x: 0, y: 0 };
  const isSelected = flyer.selectedLayerId === layer.id;

  // Only text and image layers are draggable (not background, decorations)
  const isDraggable = layer.type === 'text' || layer.type === 'image';

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!isDraggable || !onMove) return;
    e.stopPropagation();
    onSelect?.();
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      offsetX: offset.x,
      offsetY: offset.y,
    };
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !dragStartRef.current || !onMove) return;
    e.preventDefault();
    const dx = (e.clientX - dragStartRef.current.x) / scale;
    const dy = (e.clientY - dragStartRef.current.y) / scale;
    onMove({
      x: dragStartRef.current.offsetX + dx,
      y: dragStartRef.current.offsetY + dy,
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    dragStartRef.current = null;
    (e.target as Element).releasePointerCapture(e.pointerId);
  };

  return (
    <g
      transform={`translate(${offset.x}, ${offset.y})`}
      style={{
        cursor: isDraggable ? 'move' : 'default',
        touchAction: 'none',
        pointerEvents: isDraggable ? 'auto' : 'none',
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {children}
      {/* Selection indicator */}
      {isSelected && isDraggable && (
        <rect
          x={(layer.x ?? layer.cx ?? 0) - 10}
          y={(layer.y ?? layer.cy ?? 0) - 30}
          width={(layer.width ?? 200) + 20}
          height={(layer.fontSize ?? 40) + 20}
          fill="none"
          stroke="#6366f1"
          strokeWidth={3}
          strokeDasharray="8 4"
          rx={4}
        />
      )}
    </g>
  );
}

// Draggable additional image component (for logos)
function DraggableImage({
  image,
  scale,
  onUpdate,
}: {
  image: AdditionalImage;
  scale: number;
  onUpdate?: (updates: Partial<AdditionalImage>) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; imgX: number; imgY: number } | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!onUpdate) return;
    e.stopPropagation();
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      imgX: image.x,
      imgY: image.y,
    };
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !dragStartRef.current || !onUpdate) return;
    e.preventDefault();
    const dx = (e.clientX - dragStartRef.current.x) / scale;
    const dy = (e.clientY - dragStartRef.current.y) / scale;
    onUpdate({
      x: dragStartRef.current.imgX + dx,
      y: dragStartRef.current.imgY + dy,
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    dragStartRef.current = null;
    (e.target as Element).releasePointerCapture(e.pointerId);
  };

  return (
    <image
      href={image.url}
      x={image.x}
      y={image.y}
      width={image.width}
      height={image.height}
      preserveAspectRatio="xMidYMid meet"
      style={{ cursor: 'move', touchAction: 'none' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    />
  );
}

const FlyerCanvas = forwardRef<HTMLDivElement, FlyerCanvasProps>(
  ({ templateJson, flyer, width, height, className, onImageUpdate, onLayerMove, onLayerSelect }, ref) => {
    const aspectRatio = templateJson.canvas.height / templateJson.canvas.width;
    const displayHeight = height || width * aspectRatio;

    const scale = useMemo(() => {
      return width / templateJson.canvas.width;
    }, [width, templateJson.canvas.width]);

    // Filter out deleted layers
    const visibleLayers = templateJson.layers.filter(
      (layer) => !flyer.deletedLayerIds.includes(layer.id)
    );

    // Handle click on canvas background to deselect
    const handleBackgroundClick = () => {
      onLayerSelect?.(null);
    };

    return (
      <div
        ref={ref}
        className={className}
        style={{
          width,
          height: displayHeight,
          overflow: 'hidden',
          borderRadius: 12,
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          touchAction: 'none',
          userSelect: 'none',
        }}
        draggable={false}
      >
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${templateJson.canvas.width} ${templateJson.canvas.height}`}
          preserveAspectRatio="xMidYMid meet"
          style={{ display: 'block' }}
          onClick={handleBackgroundClick}
        >
          {/* Template layers - draggable text and images */}
          {visibleLayers.map((layer) => (
            <DraggableLayer
              key={layer.id}
              layer={layer}
              flyer={flyer}
              scale={scale}
              onMove={onLayerMove ? (offset) => onLayerMove(layer.id, offset) : undefined}
              onSelect={onLayerSelect ? () => onLayerSelect(layer.id) : undefined}
            >
              <RenderLayer layer={layer} flyer={flyer} />
            </DraggableLayer>
          ))}

          {/* Additional images (logos) - draggable */}
          {flyer.additionalImages.map((img) => (
            <DraggableImage
              key={img.id}
              image={img}
              scale={scale}
              onUpdate={onImageUpdate ? (updates) => onImageUpdate(img.id, updates) : undefined}
            />
          ))}
        </svg>
      </div>
    );
  }
);

FlyerCanvas.displayName = 'FlyerCanvas';

export default FlyerCanvas;
