import { useState } from 'react';
import { Square, RectangleVertical, Palette, Type, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import type { FlyerFormat } from '@/hooks/useFlyerGenerator';

interface FlyerCustomizerProps {
  format: FlyerFormat;
  onFormatChange: (format: FlyerFormat) => void;
  colors: string[];
  selectedColor: string | null;
  onColorSelect: (color: string) => void;
  headline: string;
  tagline: string;
  onHeadlineChange: (value: string) => void;
  onTaglineChange: (value: string) => void;
}

export default function FlyerCustomizer({
  format,
  onFormatChange,
  colors,
  selectedColor,
  onColorSelect,
  headline,
  tagline,
  onHeadlineChange,
  onTaglineChange,
}: FlyerCustomizerProps) {
  const [textOpen, setTextOpen] = useState(false);

  return (
    <div className="space-y-4">
      {/* Format Selection */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground uppercase tracking-wide">
          Format
        </Label>
        <div className="flex gap-2">
          <Button
            variant={format === 'square' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onFormatChange('square')}
            className="flex-1 gap-2"
          >
            <Square className="h-4 w-4" />
            Square
          </Button>
          <Button
            variant={format === 'story' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onFormatChange('story')}
            className="flex-1 gap-2"
          >
            <RectangleVertical className="h-4 w-4" />
            Story
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground">
          {format === 'square' ? '1080×1080 • Instagram, Facebook' : '1080×1920 • WhatsApp Status, Stories'}
        </p>
      </div>

      {/* Color Selection */}
      {colors.length > 0 && (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
            <Palette className="h-3 w-3" />
            Accent Color
          </Label>
          <div className="flex gap-2 flex-wrap">
            {colors.map((color, index) => (
              <button
                key={index}
                onClick={() => onColorSelect(color)}
                className={cn(
                  'w-8 h-8 rounded-full transition-all duration-200',
                  'hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary',
                  'border-2',
                  selectedColor === color
                    ? 'border-foreground scale-110'
                    : 'border-transparent'
                )}
                style={{ backgroundColor: color }}
                title={color}
              >
                {selectedColor === color && (
                  <Check
                    className="h-4 w-4 mx-auto"
                    style={{
                      color: isLightColor(color) ? '#000' : '#fff',
                    }}
                  />
                )}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground">
            Colors extracted from your product image
          </p>
        </div>
      )}

      {/* Text Editing */}
      <Collapsible open={textOpen} onOpenChange={setTextOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="w-full justify-between">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground uppercase tracking-wide">
              <Type className="h-3 w-3" />
              Edit Text
            </span>
            <span className="text-xs text-muted-foreground">
              {textOpen ? '−' : '+'}
            </span>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="headline" className="text-xs">
              Headline
            </Label>
            <Input
              id="headline"
              value={headline}
              onChange={(e) => onHeadlineChange(e.target.value)}
              placeholder="e.g., Hot Deal!"
              className="h-9 text-sm"
              maxLength={40}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tagline" className="text-xs">
              Tagline
            </Label>
            <Input
              id="tagline"
              value={tagline}
              onChange={(e) => onTaglineChange(e.target.value)}
              placeholder="e.g., Don't miss out"
              className="h-9 text-sm"
              maxLength={60}
            />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

// Helper to determine if a color is light (for contrast)
function isLightColor(hex: string): boolean {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return false;
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
}
