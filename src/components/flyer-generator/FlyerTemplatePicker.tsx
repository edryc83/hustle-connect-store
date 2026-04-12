import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import FlyerHTMLRenderer from './FlyerHTMLRenderer';
import type { HTMLTemplate, FlyerData } from './templates/html-templates';

interface FlyerVariation {
  template: HTMLTemplate;
  headline: string;
  tagline: string;
}

interface FlyerTemplatePickerProps {
  variations: FlyerVariation[];
  selectedTemplate: HTMLTemplate | null;
  onSelect: (template: HTMLTemplate) => void;
  flyerData: FlyerData;
}

export default function FlyerTemplatePicker({
  variations,
  selectedTemplate,
  onSelect,
  flyerData,
}: FlyerTemplatePickerProps) {
  return (
    <div className="space-y-4">
      <div className="text-center space-y-1">
        <h3 className="text-lg font-semibold">Pick Your Design</h3>
        <p className="text-sm text-muted-foreground">
          3 professional designs created for you
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {variations.map((variation) => {
          const isSelected = selectedTemplate?.id === variation.template.id;

          return (
            <button
              key={variation.template.id}
              onClick={() => onSelect(variation.template)}
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

              {/* Preview */}
              <div className="pointer-events-none" style={{ transform: 'scale(0.28)', transformOrigin: 'top left', width: 1080, height: 1080 }}>
                <div style={{ width: 1080, height: 1080 }}>
                  {variation.template.render({
                    ...flyerData,
                    headline: variation.headline,
                    tagline: variation.tagline,
                  }, 'square')}
                </div>
              </div>

              {/* Overlay to make it the right size */}
              <div className="absolute inset-0" style={{ background: 'transparent' }} />

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

      <p className="text-center text-sm text-muted-foreground">
        Tap to select and customize
      </p>
    </div>
  );
}
