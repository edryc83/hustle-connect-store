import { useState, useRef, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** Aspect ratio class e.g. "aspect-square", "aspect-[4/5]" — applied to wrapper */
  wrapperClassName?: string;
}

/**
 * Image with native lazy loading, IntersectionObserver deferred src,
 * and a skeleton placeholder while loading.
 */
export function LazyImage({
  src,
  alt = "",
  className,
  wrapperClassName,
  ...rest
}: LazyImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const isRounded = wrapperClassName?.includes("rounded-full");

  return (
    <div ref={ref} className={cn("relative overflow-hidden", wrapperClassName)}>
      {!loaded && (
        <Skeleton className={cn("absolute inset-0 h-full w-full", isRounded ? "rounded-full" : "rounded-none")} />
      )}
      {inView && src && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          className={cn(
            "transition-opacity duration-300",
            loaded ? "opacity-100" : "opacity-0",
            className
          )}
          {...rest}
        />
      )}
    </div>
  );
}
