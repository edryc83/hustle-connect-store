import { Image } from "lucide-react";
import type { Template } from "@/components/ad-studio/TemplatePicker";
import type { ImageSlotData } from "@/components/ad-studio/ImageSourceStep";

interface Props {
  template: Template | null;
  imageSlots: ImageSlotData[];
  productName: string;
  subtitle: string;
  tagline: string;
  price: string;
  storeName: string;
}

export default function LivePreview({
  template, imageSlots, productName, subtitle, tagline, price, storeName,
}: Props) {
  if (!template) {
    return (
      <div className="w-full max-w-sm aspect-[4/5] rounded-2xl border-2 border-dashed border-border flex items-center justify-center text-muted-foreground">
        <div className="text-center space-y-2 p-4">
          <Image className="h-10 w-10 mx-auto opacity-30" />
          <p className="text-sm">Select a template to see preview</p>
        </div>
      </div>
    );
  }

  const mainImage = imageSlots[0]?.processedUrl || imageSlots[0]?.url;

  return (
    <div className="w-full max-w-sm">
      <div className="relative aspect-[4/5] rounded-2xl overflow-hidden border border-border bg-card shadow-xl">
        {/* Background / Main image */}
        {mainImage ? (
          <img src={mainImage} alt="Product" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-muted flex items-center justify-center">
            <Image className="h-12 w-12 text-muted-foreground/30" />
          </div>
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Additional images thumbnails */}
        {imageSlots.length > 1 && (
          <div className="absolute top-3 right-3 flex gap-1.5">
            {imageSlots.slice(1).map((slot, i) => (
              <div key={i} className="w-12 h-12 rounded-lg overflow-hidden border border-white/20 bg-black/30 backdrop-blur-sm">
                {(slot.processedUrl || slot.url) ? (
                  <img src={slot.processedUrl || slot.url!} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Image className="h-4 w-4 text-white/30" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Text overlay */}
        <div className="absolute bottom-0 inset-x-0 p-4 space-y-1">
          {storeName && (
            <p className="text-[10px] font-medium text-white/60 uppercase tracking-wider">{storeName}</p>
          )}
          <h3 className="text-lg font-bold text-white leading-tight">
            {productName || "Product Name"}
          </h3>
          {subtitle && <p className="text-xs text-white/80">{subtitle}</p>}
          {tagline && <p className="text-[10px] text-white/60 italic">{tagline}</p>}
          {price && (
            <div className="inline-block mt-1 bg-white/20 backdrop-blur-sm rounded-md px-2 py-0.5">
              <span className="text-sm font-bold text-white">{price}</span>
            </div>
          )}
        </div>

        {/* Template label */}
        <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-sm rounded-md px-2 py-0.5">
          <span className="text-[10px] text-white/70">{template.name}</span>
        </div>
      </div>
      <p className="text-[10px] text-muted-foreground text-center mt-2">Live Preview — approximate layout</p>
    </div>
  );
}
