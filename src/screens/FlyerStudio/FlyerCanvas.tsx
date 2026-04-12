import React, { forwardRef, useMemo, useState, useRef } from 'react';
import RenderLayer from './RenderLayer';
import type { TemplateJSON, FlyerState, AdditionalImage } from './flyerTypes';

interface FlyerCanvasProps {
  templateJson: TemplateJSON;
  flyer: FlyerState;
  width: number;
  height?: number;
  className?: string;
  onImageUpdate?: (id: string, updates: Partial<AdditionalImage>) => void;
}

// Draggable additional image component (for logos only)
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
  ({ templateJson, flyer, width, height, className, onImageUpdate }, ref) => {
    const aspectRatio = templateJson.canvas.height / templateJson.canvas.width;
    const displayHeight = height || width * aspectRatio;

    const scale = useMemo(() => {
      return width / templateJson.canvas.width;
    }, [width, templateJson.canvas.width]);

    // Prevent any drag/scroll on the canvas container
    const preventDrag = (e: React.DragEvent | React.TouchEvent) => {
      e.preventDefault();
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
          touchAction: 'none', // Prevent touch scrolling on canvas
          userSelect: 'none', // Prevent text selection
        }}
        onDragStart={preventDrag}
        draggable={false}
      >
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${templateJson.canvas.width} ${templateJson.canvas.height}`}
          preserveAspectRatio="xMidYMid meet"
          style={{
            display: 'block',
            pointerEvents: 'auto', // Allow pointer events
          }}
          draggable={false}
          onDragStart={preventDrag}
        >
          {/* Template layers - NOT draggable */}
          <g style={{ pointerEvents: 'none' }}>
            {templateJson.layers.map((layer) => (
              <RenderLayer
                key={layer.id}
                layer={layer}
                flyer={flyer}
              />
            ))}
          </g>

          {/* Additional images (logos) - DRAGGABLE */}
          <g style={{ pointerEvents: 'auto' }}>
            {flyer.additionalImages.map((img) => (
              <DraggableImage
                key={img.id}
                image={img}
                scale={scale}
                onUpdate={onImageUpdate ? (updates) => onImageUpdate(img.id, updates) : undefined}
              />
            ))}
          </g>
        </svg>
      </div>
    );
  }
);

FlyerCanvas.displayName = 'FlyerCanvas';

export default FlyerCanvas;
