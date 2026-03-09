import { useState, useRef, useCallback } from "react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { ZoomIn, Move } from "lucide-react";

interface ImagePositionerProps {
  src: string;
  onCropData: (data: { scale: number; offsetX: number; offsetY: number }) => void;
}

export default function ImagePositioner({ src, onCropData }: ImagePositionerProps) {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    setDragging(true);
    lastPos.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastPos.current.x;
      const dy = e.clientY - lastPos.current.y;
      lastPos.current = { x: e.clientX, y: e.clientY };
      setOffset((prev) => {
        const newOffset = { x: prev.x + dx, y: prev.y + dy };
        onCropData({ scale, offsetX: newOffset.x, offsetY: newOffset.y });
        return newOffset;
      });
    },
    [dragging, scale, onCropData]
  );

  const handlePointerUp = useCallback(() => {
    setDragging(false);
  }, []);

  const handleScaleChange = (val: number[]) => {
    const newScale = val[0];
    setScale(newScale);
    onCropData({ scale: newScale, offsetX: offset.x, offsetY: offset.y });
  };

  return (
    <div className="space-y-3">
      <div
        ref={containerRef}
        className="relative rounded-xl overflow-hidden border border-border bg-muted aspect-square max-w-[260px] mx-auto cursor-grab active:cursor-grabbing touch-none select-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <img
          src={src}
          alt="Position your image"
          className="w-full h-full object-contain pointer-events-none"
          style={{
            transform: `scale(${scale}) translate(${offset.x / scale}px, ${offset.y / scale}px)`,
            transformOrigin: "center center",
          }}
          draggable={false}
        />
        {/* Drag hint overlay */}
        {scale === 1 && offset.x === 0 && offset.y === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[1px] pointer-events-none transition-opacity">
            <div className="bg-background/80 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2 text-xs text-muted-foreground">
              <Move className="h-3.5 w-3.5" /> Drag to position
            </div>
          </div>
        )}
      </div>

      {/* Zoom slider */}
      <div className="flex items-center gap-3 px-2">
        <ZoomIn className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <Slider
          value={[scale]}
          min={0.5}
          max={3}
          step={0.05}
          onValueChange={handleScaleChange}
          className="flex-1"
        />
        <span className="text-xs text-muted-foreground w-10 text-right">{Math.round(scale * 100)}%</span>
      </div>
      <p className="text-[10px] text-muted-foreground text-center">
        <Label>Resize &amp; drag to fit your product perfectly</Label>
      </p>
    </div>
  );
}
