import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Pencil, Plus, Check, Sparkles, Eye } from "lucide-react";
import whatsappIcon from "@/assets/whatsapp-icon.png";
import {
  ATTRIBUTE_LIBRARY,
  COLOUR_HEX,
  getRecommendedAttrs,
  getAttrDef,
  type AttributeDef,
  type AiAttributeSuggestion,
} from "@/lib/attributeLibrary";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

interface ProductAttributeFormProps {
  attributes: Record<string, any>;
  onChange: (attrs: Record<string, any>) => void;
  productCategory?: string;
  productSubcategory?: string;
  aiSuggestions?: AiAttributeSuggestion[];
  onAcceptSuggestion?: (slug: string) => void;
  onDismissSuggestion?: (slug: string) => void;
}

export function ProductAttributeForm({
  attributes,
  onChange,
  productCategory,
  productSubcategory,
  aiSuggestions = [],
  onAcceptSuggestion,
  onDismissSuggestion,
}: ProductAttributeFormProps) {
  const [typePickerOpen, setTypePickerOpen] = useState(false);
  const [activeAttr, setActiveAttr] = useState<AttributeDef | null>(null);
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);
  const [tempSelected, setTempSelected] = useState<string[]>([]);
  const [customInput, setCustomInput] = useState("");
  const [otherLabel, setOtherLabel] = useState("");
  const [otherValues, setOtherValues] = useState("");
  const [editingOtherKey, setEditingOtherKey] = useState<string | null>(null);
  const [dismissedSlugs, setDismissedSlugs] = useState<Set<string>>(new Set());
  const [showAllAttrs, setShowAllAttrs] = useState(false);

  const isChatOnly = attributes.chat_only === true;

  const filledKeys = Object.keys(attributes).filter(
    (k) =>
      k !== "chat_only" &&
      k !== "product_type" &&
      k !== "ai_suggestions" &&
      ((Array.isArray(attributes[k]) && attributes[k].length > 0) ||
        (typeof attributes[k] === "string" && attributes[k]))
  );

  // Pending AI suggestions (not yet accepted or dismissed)
  const pendingSuggestions = useMemo(
    () =>
      aiSuggestions.filter(
        (s) =>
          !dismissedSlugs.has(s.slug) &&
          !filledKeys.includes(s.slug) &&
          s.confidence !== "low"
      ),
    [aiSuggestions, dismissedSlugs, filledKeys]
  );

  const highConfSuggestions = pendingSuggestions.filter((s) => s.confidence === "high");
  const medConfSuggestions = pendingSuggestions.filter((s) => s.confidence === "medium");

  const acceptSuggestion = (suggestion: AiAttributeSuggestion) => {
    const val = suggestion.value;
    const next = { ...attributes, chat_only: undefined };
    next[suggestion.slug] = Array.isArray(val) ? val : [val];
    onChange(next);
    onAcceptSuggestion?.(suggestion.slug);
  };

  const dismissSuggestion = (slug: string) => {
    setDismissedSlugs((prev) => new Set([...prev, slug]));
    onDismissSuggestion?.(slug);
  };

  const openTypePicker = () => setTypePickerOpen(true);

  const selectAttr = (attr: AttributeDef) => {
    setActiveAttr(attr);
    const existing = attributes[attr.slug];
    setTempSelected(Array.isArray(existing) ? existing : existing ? [existing] : []);
    setCustomInput("");
    setTypePickerOpen(false);
    setDetailSheetOpen(true);
  };

  const openOtherSheet = () => {
    setActiveAttr(null);
    setOtherLabel("");
    setOtherValues("");
    setEditingOtherKey(null);
    setTypePickerOpen(false);
    setDetailSheetOpen(true);
  };

  const editAttribute = (key: string) => {
    const def = getAttrDef(key);
    if (def) {
      selectAttr(def);
      setTypePickerOpen(false);
    } else if (key.startsWith("other_")) {
      setActiveAttr(null);
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
    if (activeAttr) {
      if (tempSelected.length > 0) {
        const next = { ...attributes, chat_only: undefined };
        if (activeAttr.type === "text" || activeAttr.type === "boolean") {
          next[activeAttr.slug] = tempSelected[0];
        } else {
          next[activeAttr.slug] = tempSelected;
        }
        onChange(next);
      }
    }
    setDetailSheetOpen(false);
    setActiveAttr(null);
    setTimeout(() => setTypePickerOpen(true), 200);
  };

  const handleOtherDone = () => {
    const label = otherLabel.trim();
    const vals = otherValues
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
    if (label && vals.length > 0) {
      const key = editingOtherKey || `other_${label.toLowerCase().replace(/\s+/g, "_")}`;
      onChange({ ...attributes, chat_only: undefined, [key]: vals });
    }
    setDetailSheetOpen(false);
    setEditingOtherKey(null);
    setTimeout(() => setTypePickerOpen(true), 200);
  };

  const handleSkip = () => onChange({ chat_only: true });
  const handleUnskip = () => onChange({});

  const sourceLabel = (source: string) => {
    switch (source) {
      case "image": return "📸 From image";
      case "title": return "✏️ From title";
      case "description": return "📝 From description";
      default: return "🤖 AI detected";
    }
  };

  if (isChatOnly) {
    return (
      <div className="space-y-2">
        <div className="rounded-xl border border-[#25D366]/30 bg-[#25D366]/10 p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={whatsappIcon} alt="WhatsApp" className="h-5 w-5" />
            <span className="text-sm font-medium text-[#25D366]">Chat to order</span>
          </div>
          <button type="button" onClick={handleUnskip} className="text-xs text-primary font-medium hover:underline">
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

      {/* ── AI Suggestions Section ── */}
      {(highConfSuggestions.length > 0 || medConfSuggestions.length > 0) && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary">AI Suggestions</span>
          </div>

          {highConfSuggestions.map((s) => {
            const def = getAttrDef(s.slug);
            if (!def) return null;
            const displayVal = Array.isArray(s.value) ? s.value.join(", ") : s.value;
            return (
              <div
                key={s.slug}
                className="rounded-xl border border-primary/30 bg-primary/5 p-2.5 flex items-center gap-2"
              >
                <span className="text-lg shrink-0">{def.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold">{def.name}</span>
                    <Badge variant="outline" className="text-[9px] px-1 py-0 h-3.5 border-primary/30 text-primary">
                      {sourceLabel(s.source)}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{displayVal}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => acceptSuggestion(s)}
                    className="h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => dismissSuggestion(s.slug)}
                    className="h-7 w-7 rounded-full bg-muted text-muted-foreground flex items-center justify-center hover:bg-muted/80"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}

          {medConfSuggestions.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {medConfSuggestions.map((s) => {
                const def = getAttrDef(s.slug);
                if (!def) return null;
                const displayVal = Array.isArray(s.value) ? s.value.join(", ") : s.value;
                return (
                  <button
                    key={s.slug}
                    type="button"
                    onClick={() => acceptSuggestion(s)}
                    className="rounded-full border border-border bg-muted/30 px-2.5 py-1 text-[11px] flex items-center gap-1.5 hover:border-primary/40 hover:bg-primary/5 transition-colors"
                  >
                    <span>{def.emoji}</span>
                    <span className="font-medium">{def.name}:</span>
                    <span className="text-muted-foreground truncate max-w-[100px]">{displayVal}</span>
                    <Plus className="h-3 w-3 text-primary shrink-0" />
                  </button>
                );
              })}
            </div>
          )}

          {pendingSuggestions.length > 1 && (
            <button
              type="button"
              onClick={() => {
                pendingSuggestions.forEach((s) => {
                  if (s.confidence === "high") acceptSuggestion(s);
                });
              }}
              className="text-xs text-primary font-medium hover:underline"
            >
              Accept all confident suggestions
            </button>
          )}
        </div>
      )}

      {/* ── Filled attribute tags ── */}
      {filledKeys.length > 0 && (
        <div className="space-y-2">
          {filledKeys.map((key) => {
            const def = getAttrDef(key);
            const emoji = def?.emoji ?? "➕";
            const label = def?.name ?? key.replace("other_", "").replace(/_/g, " ");
            const rawVal = attributes[key];
            const values: string[] = Array.isArray(rawVal) ? rawVal : [rawVal];
            return (
              <div key={key} className="rounded-xl border border-border/50 bg-muted/20 p-2.5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-muted-foreground">
                    {emoji} {label}
                  </span>
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => editAttribute(key)} className="h-6 w-6 rounded-full hover:bg-muted flex items-center justify-center">
                      <Pencil className="h-3 w-3 text-muted-foreground" />
                    </button>
                    <button type="button" onClick={() => removeAttribute(key)} className="h-6 w-6 rounded-full hover:bg-destructive/10 flex items-center justify-center">
                      <X className="h-3 w-3 text-muted-foreground" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {values.map((v) => (
                    <span key={v} className="rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-xs font-medium text-primary flex items-center gap-1.5">
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

      {/* ── Add detail button ── */}
      <Button type="button" variant="outline" onClick={openTypePicker} className="w-full gap-2 rounded-full border-primary text-primary hover:bg-primary/5">
        <Plus className="h-4 w-4" />
        {filledKeys.length > 0 ? "Add more details" : "Add detail"}
      </Button>

      {filledKeys.length === 0 && pendingSuggestions.length === 0 && (
        <button type="button" onClick={handleSkip} className="w-full flex items-center justify-center gap-2 text-xs text-[#25D366] font-medium hover:text-[#128C7E] transition-colors">
          <img src={whatsappIcon} alt="" className="h-4 w-4" />
          Skip — I'll chat with buyers on WhatsApp
        </button>
      )}

      {/* ── Type Picker Sheet ── */}
      <Sheet open={typePickerOpen} onOpenChange={setTypePickerOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl max-h-[75vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-base">What detail do you want to add?</SheetTitle>
          </SheetHeader>
          {(() => {
            const { recommended, others } = getRecommendedAttrs(productCategory, productSubcategory);
            const hasRecs = recommended.length > 0;
            const displayedOthers = showAllAttrs ? others : others.slice(0, 9);

            const renderAttrButton = (attr: AttributeDef, isRecommended = false) => {
              const alreadyAdded = !!attributes[attr.slug];
              return (
                <button
                  key={attr.slug}
                  type="button"
                  onClick={() => selectAttr(attr)}
                  className={`flex flex-col items-center gap-1 rounded-xl border-2 p-2.5 text-center transition-all relative ${
                    alreadyAdded
                      ? "border-primary/30 bg-primary/5"
                      : isRecommended
                      ? "border-primary/40 bg-primary/5 hover:bg-primary/10"
                      : "border-border hover:border-primary/40 hover:bg-muted/30"
                  }`}
                >
                  <span className="text-lg">{attr.emoji}</span>
                  <span className="text-[11px] font-medium leading-tight">{attr.name}</span>
                  {alreadyAdded ? (
                    <span className="text-[9px] text-primary font-medium">✓ Added</span>
                  ) : isRecommended ? (
                    <span className="text-[9px] text-primary/70 font-medium">Suggested</span>
                  ) : null}
                </button>
              );
            };

            return (
              <div className="pt-4 pb-6 space-y-3">
                {hasRecs && (
                  <>
                    <p className="text-xs font-medium text-muted-foreground px-1">✨ Recommended for this product</p>
                    <div className="grid grid-cols-4 gap-1.5">
                      {recommended.map((a) => renderAttrButton(a, true))}
                    </div>
                    {others.length > 0 && (
                      <p className="text-xs font-medium text-muted-foreground px-1 pt-1">Other details</p>
                    )}
                  </>
                )}
                <div className="grid grid-cols-4 gap-1.5">
                  {(hasRecs ? displayedOthers : ATTRIBUTE_LIBRARY.slice(0, showAllAttrs ? undefined : 12)).map((a) =>
                    renderAttrButton(a)
                  )}
                  <button
                    type="button"
                    onClick={openOtherSheet}
                    className="flex flex-col items-center gap-1 rounded-xl border-2 border-border p-2.5 text-center transition-all hover:border-primary/40 hover:bg-muted/30"
                  >
                    <span className="text-lg">➕</span>
                    <span className="text-[11px] font-medium">Custom</span>
                  </button>
                </div>
                {!showAllAttrs && others.length > 9 && (
                  <button
                    type="button"
                    onClick={() => setShowAllAttrs(true)}
                    className="w-full flex items-center justify-center gap-1.5 text-xs text-primary font-medium hover:underline pt-1"
                  >
                    <Eye className="h-3 w-3" />
                    Show all {others.length} details
                  </button>
                )}
              </div>
            );
          })()}
        </SheetContent>
      </Sheet>

      {/* ── Detail Picker Sheet ── */}
      <Sheet open={detailSheetOpen} onOpenChange={setDetailSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl max-h-[80vh] overflow-y-auto">
          {activeAttr ? (
            <>
              <SheetHeader>
                <SheetTitle className="text-base">
                  {activeAttr.emoji} {activeAttr.name} — {activeAttr.type === "boolean" ? "select one" : "tap all you have"}
                </SheetTitle>
              </SheetHeader>
              <div className="space-y-4 pt-4 pb-6">
                {activeAttr.presets.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {activeAttr.presets.map((opt) => {
                      const isColour = activeAttr.slug === "colour";
                      const hex = isColour ? COLOUR_HEX[opt] : undefined;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            if (activeAttr.type === "single_select" || activeAttr.type === "boolean") {
                              setTempSelected([opt]);
                            } else {
                              togglePreset(opt);
                            }
                          }}
                          className={`rounded-full border-2 px-4 py-2 text-sm font-medium transition-all flex items-center gap-2 ${
                            tempSelected.includes(opt)
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border text-foreground hover:border-primary/40"
                          }`}
                        >
                          {isColour && hex && (
                            <span className="inline-block h-4 w-4 rounded-full border border-border/60 shrink-0" style={{ backgroundColor: hex }} />
                          )}
                          {tempSelected.includes(opt) && <Check className="h-3 w-3 inline" />}
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="flex gap-2">
                  <Input
                    placeholder={activeAttr.type === "text" ? `Enter ${activeAttr.name.toLowerCase()}` : "Or type your own"}
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustom())}
                    className="flex-1"
                  />
                  <Button type="button" size="sm" onClick={addCustom} disabled={!customInput.trim()}>
                    Add
                  </Button>
                </div>

                {tempSelected.filter((s) => !activeAttr.presets.includes(s)).length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {tempSelected.filter((s) => !activeAttr.presets.includes(s)).map((s) => (
                      <span key={s} className="rounded-full bg-primary text-primary-foreground px-3 py-1 text-xs font-medium flex items-center gap-1">
                        {s}
                        <button type="button" onClick={() => togglePreset(s)}>
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <Button type="button" className="w-full gap-2" onClick={handleDone} disabled={tempSelected.length === 0}>
                  <Check className="h-4 w-4" />
                  Done ({tempSelected.length} selected)
                </Button>
              </div>
            </>
          ) : (
            <>
              <SheetHeader>
                <SheetTitle className="text-base">➕ Add custom detail</SheetTitle>
              </SheetHeader>
              <div className="space-y-4 pt-4 pb-6">
                <div className="space-y-1.5">
                  <Label className="text-sm">Detail name</Label>
                  <Input placeholder="e.g. Shape, Flavour, Material" value={otherLabel} onChange={(e) => setOtherLabel(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Options (comma separated)</Label>
                  <Input placeholder="e.g. Round, Square, Heart" value={otherValues} onChange={(e) => setOtherValues(e.target.value)} />
                </div>
                <Button type="button" className="w-full gap-2" onClick={handleOtherDone} disabled={!otherLabel.trim() || !otherValues.trim()}>
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
