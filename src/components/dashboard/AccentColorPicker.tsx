import { useState } from "react";
import { Palette, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const ACCENT_COLORS = [
  { name: "Orange", value: "#F97316" },
  { name: "Rose", value: "#F43F5E" },
  { name: "Violet", value: "#8B5CF6" },
  { name: "Blue", value: "#3B82F6" },
  { name: "Cyan", value: "#06B6D4" },
  { name: "Emerald", value: "#10B981" },
  { name: "Lime", value: "#84CC16" },
  { name: "Amber", value: "#F59E0B" },
  { name: "Pink", value: "#EC4899" },
  { name: "Teal", value: "#14B8A6" },
];

interface AccentColorPickerProps {
  userId: string;
  currentColor: string | null;
  onColorChange: (color: string) => void;
}

export function AccentColorPicker({ userId, currentColor, onColorChange }: AccentColorPickerProps) {
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSelect = async (color: string) => {
    if (color === currentColor) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ accent_color: color } as any)
      .eq("id", userId);
    if (error) {
      toast.error("Failed to save accent color");
    } else {
      onColorChange(color);
      toast.success("Store accent color updated!");
    }
    setSaving(false);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="inline-flex h-8 items-center gap-1.5 rounded-full border border-white/20 bg-black/45 px-2.5 text-white shadow-sm backdrop-blur-sm transition-colors hover:bg-black/60"
          aria-label="Choose store accent color"
        >
          {currentColor ? (
            <span
              className="h-3.5 w-3.5 rounded-full border border-white/80"
              style={{ backgroundColor: currentColor }}
            />
          ) : (
            <Palette className="h-3.5 w-3.5" />
          )}
          <span className="text-[11px] font-semibold">Theme</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-3" align="end" sideOffset={8}>
        <p className="text-xs font-medium text-muted-foreground mb-2">Store accent color</p>
        <div className="grid grid-cols-5 gap-2">
          {ACCENT_COLORS.map((c) => (
            <button
              key={c.value}
              onClick={() => handleSelect(c.value)}
              disabled={saving}
              className="h-8 w-8 rounded-full border-2 border-border/60 hover:scale-110 transition-transform flex items-center justify-center"
              style={{ backgroundColor: c.value }}
              aria-label={c.name}
              title={c.name}
            >
              {currentColor === c.value && (
                <Check className="h-3.5 w-3.5 text-white drop-shadow-md" />
              )}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
