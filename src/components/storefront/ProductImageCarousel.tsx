import { useState } from "react";
import { ChevronLeft, ChevronRight, ImageIcon, Wrench } from "lucide-react";

interface ProductImageCarouselProps {
  images: string[];
  alt: string;
  listingType?: string;
  className?: string;
}

export function ProductImageCarousel({ images, alt, listingType, className = "" }: ProductImageCarouselProps) {
  const [current, setCurrent] = useState(0);

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

  return (
    <div className={`relative h-full w-full ${className}`}>
      <img src={images[current]} alt={`${alt} ${current + 1}`} className="h-full w-full object-cover" loading="lazy" />
      
      {/* Navigation arrows */}
      <button
        onClick={(e) => { e.stopPropagation(); setCurrent((c) => (c - 1 + images.length) % images.length); }}
        className="absolute left-1 top-1/2 -translate-y-1/2 rounded-full bg-background/70 p-1 text-foreground shadow hover:bg-background transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); setCurrent((c) => (c + 1) % images.length); }}
        className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-background/70 p-1 text-foreground shadow hover:bg-background transition-colors"
      >
        <ChevronRight className="h-4 w-4" />
      </button>

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
