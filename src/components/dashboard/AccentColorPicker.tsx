import { useState } from "react";
import { Palette, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

  const handleSelect = async (color: string) => {
    if (color === currentColor || saving) return;
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
  };

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
      <div className="flex items-center gap-1.5 text-muted-foreground shrink-0">
        <Palette className="h-4 w-4" />
        <span className="text-xs font-medium">Theme</span>
      </div>
      <div className="flex items-center gap-1.5 flex-wrap">
        {ACCENT_COLORS.map((c) => (
          <button
            key={c.value}
            onClick={() => handleSelect(c.value)}
            disabled={saving}
            className="h-7 w-7 rounded-full border-2 border-border/60 hover:scale-110 transition-transform flex items-center justify-center shrink-0"
            style={{ backgroundColor: c.value }}
            aria-label={c.name}
            title={c.name}
          >
            {currentColor === c.value && (
              <Check className="h-3 w-3 text-white drop-shadow-md" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
