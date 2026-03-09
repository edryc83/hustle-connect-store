import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Pencil, Plus, Check } from "lucide-react";
import whatsappIcon from "@/assets/whatsapp-icon.png";
import { ATTRIBUTE_TYPES, COLOUR_HEX, getRecommendedAttributes, type AttributeType } from "@/lib/productAttributes";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface ProductAttributeFormProps {
  attributes: Record<string, any>;
  onChange: (attrs: Record<string, any>) => void;
}

export function ProductAttributeForm({ attributes, onChange }: ProductAttributeFormProps) {
  const [typePickerOpen, setTypePickerOpen] = useState(false);
  const [activeType, setActiveType] = useState<AttributeType | null>(null);
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);
  const [tempSelected, setTempSelected] = useState<string[]>([]);
  const [customInput, setCustomInput] = useState("");
  // For "Other" type
  const [otherLabel, setOtherLabel] = useState("");
  const [otherValues, setOtherValues] = useState("");
  const [editingOtherKey, setEditingOtherKey] = useState<string | null>(null);

  const isChatOnly = attributes.chat_only === true;

  // Get attribute keys that have values
  const filledKeys = Object.keys(attributes).filter(
    (k) => k !== "chat_only" && Array.isArray(attributes[k]) && attributes[k].length > 0
  );

  const openTypePicker = () => {
    setTypePickerOpen(true);
  };

  const selectType = (type: AttributeType) => {
    setActiveType(type);
    setTempSelected(attributes[type.key] ?? []);
    setCustomInput("");
    setTypePickerOpen(false);
    setDetailSheetOpen(true);
  };

  const openOtherSheet = () => {
    setActiveType(null);
    setOtherLabel("");
    setOtherValues("");
    setEditingOtherKey(null);
    setTypePickerOpen(false);
    setDetailSheetOpen(true);
  };

  const editAttribute = (key: string) => {
    // Check if it's a standard type or custom "other_"
    const type = ATTRIBUTE_TYPES.find((t) => t.key === key);
    if (type) {
      setActiveType(type);
      setTempSelected(attributes[key] ?? []);
      setCustomInput("");
      setDetailSheetOpen(true);
    } else if (key.startsWith("other_")) {
      setActiveType(null);
      setEditingOtherKey(key);
      setOtherLabel(key.replace("other_", "").replace(/_/g, " "));
      setOtherValues((attributes[key] ?? []).join(", "));
      setDetailSheetOpen(true);
    }
  };

  const removeAttribute = (key: string) => {
    const next = { ...attributes };
    delete next[key];
    onChange(next);
  };

  const togglePreset = (opt: string) => {
    setTempSelected((prev) =>
      prev.includes(opt) ? prev.filter((s) => s !== opt) : [...prev, opt]
    );
  };

  const addCustom = () => {
    const val = customInput.trim();
    if (val && !tempSelected.includes(val)) {
      setTempSelected((prev) => [...prev, val]);
    }
    setCustomInput("");
  };

  const handleDone = () => {
    if (activeType) {
      if (tempSelected.length > 0) {
        onChange({ ...attributes, chat_only: undefined, [activeType.key]: tempSelected });
      }
    }
    setDetailSheetOpen(false);
    setActiveType(null);
    // Reopen type picker so seller can add another
    setTimeout(() => setTypePickerOpen(true), 200);
  };

  const handleOtherDone = () => {
    const label = otherLabel.trim();
    const vals = otherValues.split(",").map((v) => v.trim()).filter(Boolean);
    if (label && vals.length > 0) {
      const key = editingOtherKey || `other_${label.toLowerCase().replace(/\s+/g, "_")}`;
      onChange({ ...attributes, chat_only: undefined, [key]: vals });
    }
    setDetailSheetOpen(false);
    setEditingOtherKey(null);
    setTimeout(() => setTypePickerOpen(true), 200);
  };

  const handleSkip = () => {
    onChange({ chat_only: true });
  };

  const handleUnskip = () => {
    onChange({});
  };

  // Chat-only state
  if (isChatOnly) {
    return (
      <div className="space-y-2">
        <div className="rounded-xl border border-[#25D366]/30 bg-[#25D366]/10 p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={whatsappIcon} alt="WhatsApp" className="h-5 w-5" />
            <span className="text-sm font-medium text-[#25D366]">Chat to order</span>
          </div>
          <button
            type="button"
            onClick={handleUnskip}
            className="text-xs text-primary font-medium hover:underline"
          >
            Add details instead
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Add all options you have — buyers will pick what they want when ordering
      </p>

      {/* Filled attribute tag groups */}
      {filledKeys.length > 0 && (
        <div className="space-y-2">
          {filledKeys.map((key) => {
            const type = ATTRIBUTE_TYPES.find((t) => t.key === key);
            const emoji = type?.emoji ?? "➕";
            const label = type?.label ?? key.replace("other_", "").replace(/_/g, " ");
            const values: string[] = attributes[key];
            return (
              <div key={key} className="rounded-xl border border-border/50 bg-muted/20 p-2.5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-muted-foreground">
                    {emoji} {label}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => editAttribute(key)}
                      className="h-6 w-6 rounded-full hover:bg-muted flex items-center justify-center"
                    >
                      <Pencil className="h-3 w-3 text-muted-foreground" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeAttribute(key)}
                      className="h-6 w-6 rounded-full hover:bg-destructive/10 flex items-center justify-center"
                    >
                      <X className="h-3 w-3 text-muted-foreground" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {values.map((v) => (
                    <span
                      key={v}
                      className="rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-xs font-medium text-primary flex items-center gap-1.5"
                    >
                      {key === "colour" && COLOUR_HEX[v] && (
                        <span className="inline-block h-3 w-3 rounded-full border border-border/60 shrink-0" style={{ backgroundColor: COLOUR_HEX[v] }} />
                      )}
                      {v}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add detail button */}
      <Button
        type="button"
        variant="outline"
        onClick={openTypePicker}
        className="w-full gap-2 rounded-full border-primary text-primary hover:bg-primary/5"
      >
        <Plus className="h-4 w-4" />
        Add detail
      </Button>

      {filledKeys.length === 0 && (
        <button
          type="button"
          onClick={handleSkip}
          className="w-full flex items-center justify-center gap-2 text-xs text-[#25D366] font-medium hover:text-[#128C7E] transition-colors"
        >
          <img src={whatsappIcon} alt="" className="h-4 w-4" />
          Skip — I'll chat with buyers on WhatsApp
        </button>
      )}

      {/* Type picker sheet */}
      <Sheet open={typePickerOpen} onOpenChange={setTypePickerOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl max-h-[70vh]">
          <SheetHeader>
            <SheetTitle className="text-base">What detail do you want to add?</SheetTitle>
          </SheetHeader>
          <div className="grid grid-cols-3 gap-2 pt-4 pb-6">
            {ATTRIBUTE_TYPES.map((type) => {
              const alreadyAdded = !!attributes[type.key];
              return (
                <button
                  key={type.key}
                  type="button"
                  onClick={() => selectType(type)}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 text-center transition-all ${
                    alreadyAdded
                      ? "border-primary/30 bg-primary/5"
                      : "border-border hover:border-primary/40 hover:bg-muted/30"
                  }`}
                >
                  <span className="text-xl">{type.emoji}</span>
                  <span className="text-xs font-medium">{type.label}</span>
                  {alreadyAdded && (
                    <span className="text-[10px] text-primary font-medium">✓ Added</span>
                  )}
                </button>
              );
            })}
            {/* Other */}
            <button
              type="button"
              onClick={openOtherSheet}
              className="flex flex-col items-center gap-1.5 rounded-xl border-2 border-border p-3 text-center transition-all hover:border-primary/40 hover:bg-muted/30"
            >
              <span className="text-xl">➕</span>
              <span className="text-xs font-medium">Other</span>
            </button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Detail picker sheet */}
      <Sheet open={detailSheetOpen} onOpenChange={setDetailSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl max-h-[80vh] overflow-y-auto">
          {activeType ? (
            <>
              <SheetHeader>
                <SheetTitle className="text-base">
                  {activeType.emoji} {activeType.label} — tap all you have in stock
                </SheetTitle>
              </SheetHeader>
              <div className="space-y-4 pt-4 pb-6">
                {/* Preset chips */}
                {activeType.presets.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {activeType.presets.map((opt) => {
                      const isColour = activeType.key === "colour";
                      const hex = isColour ? COLOUR_HEX[opt] : undefined;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => togglePreset(opt)}
                          className={`rounded-full border-2 px-4 py-2 text-sm font-medium transition-all flex items-center gap-2 ${
                            tempSelected.includes(opt)
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border text-foreground hover:border-primary/40"
                          }`}
                        >
                          {isColour && hex && (
                            <span
                              className="inline-block h-4 w-4 rounded-full border border-border/60 shrink-0"
                              style={{ backgroundColor: hex }}
                            />
                          )}
                          {tempSelected.includes(opt) && <Check className="h-3 w-3 inline" />}
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Custom input */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Or type your own"
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustom())}
                    className="flex-1"
                  />
                  <Button type="button" size="sm" onClick={addCustom} disabled={!customInput.trim()}>
                    Add
                  </Button>
                </div>

                {/* Custom additions shown as chips */}
                {tempSelected.filter((s) => !activeType.presets.includes(s)).length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {tempSelected
                      .filter((s) => !activeType.presets.includes(s))
                      .map((s) => (
                        <span
                          key={s}
                          className="rounded-full bg-primary text-primary-foreground px-3 py-1 text-xs font-medium flex items-center gap-1"
                        >
                          {s}
                          <button type="button" onClick={() => togglePreset(s)}>
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                  </div>
                )}

                <Button
                  type="button"
                  className="w-full gap-2"
                  onClick={handleDone}
                  disabled={tempSelected.length === 0}
                >
                  <Check className="h-4 w-4" />
                  Done ({tempSelected.length} selected)
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Other / Custom attribute */}
              <SheetHeader>
                <SheetTitle className="text-base">➕ Add custom detail</SheetTitle>
              </SheetHeader>
              <div className="space-y-4 pt-4 pb-6">
                <div className="space-y-1.5">
                  <Label className="text-sm">Detail name</Label>
                  <Input
                    placeholder='e.g. Shape, Flavour, Material'
                    value={otherLabel}
                    onChange={(e) => setOtherLabel(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Options (comma separated)</Label>
                  <Input
                    placeholder="e.g. Round, Square, Heart"
                    value={otherValues}
                    onChange={(e) => setOtherValues(e.target.value)}
                  />
                </div>
                <Button
                  type="button"
                  className="w-full gap-2"
                  onClick={handleOtherDone}
                  disabled={!otherLabel.trim() || !otherValues.trim()}
                >
                  <Check className="h-4 w-4" />
                  Done
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
