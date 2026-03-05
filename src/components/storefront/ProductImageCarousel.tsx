import { useState, useRef } from "react";
import { ImageIcon, Wrench } from "lucide-react";

interface ProductImageCarouselProps {
  images: string[];
  alt: string;
  listingType?: string;
  className?: string;
}

export function ProductImageCarousel({ images, alt, listingType, className = "" }: ProductImageCarouselProps) {
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  if (images.length === 0) {
    return (
      <div className={`flex h-full w-full items-center justify-center bg-muted ${className}`}>
        {listingType === "service" ? (
          <Wrench className="h-8 w-8 text-muted-foreground/30" />
        ) : (
          <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
        )}
      </div>
    );
  }

  if (images.length === 1) {
    return <img src={images[0]} alt={alt} className={`h-full w-full object-cover ${className}`} loading="lazy" />;
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.stopPropagation();
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        setCurrent((c) => (c + 1) % images.length);
      } else {
        setCurrent((c) => (c - 1 + images.length) % images.length);
      }
    }
  };

  return (
    <div
      className={`relative h-full w-full ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <img src={images[current]} alt={`${alt} ${current + 1}`} className="h-full w-full object-cover" loading="lazy" />

      {/* Dots */}
      <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1">
        {images.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 w-1.5 rounded-full transition-colors ${i === current ? "bg-primary" : "bg-background/60"}`}
          />
        ))}
      </div>
    </div>
  );
}
