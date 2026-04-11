import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import FlyerCanvas from './FlyerCanvas';
import type { FlyerStyle, FlyerTemplate } from './templates';

interface FlyerVariation {
  style: FlyerStyle;
  templateId: string;
  template: FlyerTemplate;
  headline: string;
  tagline: string;
  cta: string;
}

interface FlyerStylePickerProps {
  variations: FlyerVariation[];
  selectedStyle: FlyerStyle | null;
  onSelect: (style: FlyerStyle) => void;
  productImage: string | null;
  price: string;
  storeName: string;
}

export default function FlyerStylePicker({
  variations,
  selectedStyle,
  onSelect,
  productImage,
  price,
  storeName,
}: FlyerStylePickerProps) {
  return (
    <div className="space-y-4">
      <div className="text-center space-y-1">
        <h3 className="text-lg font-semibold">Pick Your Style</h3>
        <p className="text-sm text-muted-foreground">
          AI generated 3 unique designs for you
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {variations.map((variation) => {
          const isSelected = selectedStyle === variation.style;

          return (
            <button
              key={variation.templateId}
              onClick={() => onSelect(variation.style)}
              className={cn(
                'relative rounded-xl overflow-hidden transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                'hover:scale-[1.02] active:scale-[0.98]',
                isSelected && 'ring-2 ring-primary ring-offset-2'
              )}
            >
              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2 z-20 bg-primary rounded-full p-1">
                  <Check className="h-3 w-3 text-primary-foreground" />
                </div>
              )}

              {/* Preview canvas */}
              <div className="pointer-events-none">
                <FlyerCanvas
                  template={variation.template}
                  format="square"
                  productImage={productImage}
                  headline={variation.headline}
                  tagline={variation.tagline}
                  price={price}
                  cta={variation.cta}
                  storeName={storeName}
                  isPreview
                />
              </div>

              {/* Style label */}
              <div className={cn(
                'absolute bottom-0 inset-x-0 py-2 px-3',
                'bg-gradient-to-t from-black/80 to-transparent'
              )}>
                <span className="text-xs font-medium text-white">
                  {variation.template.name}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {selectedStyle && (
        <p className="text-center text-sm text-muted-foreground">
          Tap again or swipe to customize
        </p>
      )}
    </div>
  );
}
