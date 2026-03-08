import { ATTRIBUTE_TYPES, COLOUR_HEX, getSelectableKeys } from "@/lib/productAttributes";
import { Check } from "lucide-react";

interface BuyerAttributePickerProps {
  attributes: Record<string, any>;
  selections: Record<string, string>;
  onSelect: (key: string, value: string) => void;
  validationErrors?: Record<string, boolean>;
}

/**
 * Buyer-side attribute selector with single-select chips per attribute.
 */
export function BuyerAttributePicker({
  attributes,
  selections,
  onSelect,
  validationErrors,
}: BuyerAttributePickerProps) {
  if (!attributes || attributes.chat_only) return null;

  const keys = getSelectableKeys(attributes);
  if (keys.length === 0) return null;

  return (
    <div className="space-y-4">
      {keys.map((key) => {
        const type = ATTRIBUTE_TYPES.find((t) => t.key === key);
        const emoji = type?.emoji ?? "➕";
        const label = type?.label ?? key.replace("other_", "").replace(/_/g, " ");
        const options: string[] = attributes[key];
        const selected = selections[key] ?? "";
        const hasError = validationErrors?.[key];

        return (
          <div key={key} className="space-y-2">
            <p className={`text-sm font-medium ${hasError ? "text-destructive" : ""}`}>
              {emoji} Choose {label}
              {hasError && <span className="text-xs ml-1">— required</span>}
            </p>
            <div className="flex flex-wrap gap-2">
              {options.map((opt) => {
                const isColour = key === "colour" || key.includes("colour");
                const hex = isColour ? COLOUR_HEX[opt] : undefined;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => onSelect(key, selected === opt ? "" : opt)}
                    className={`rounded-full border-2 px-4 py-2 text-sm font-medium transition-all flex items-center gap-2 ${
                      selected === opt
                        ? "border-primary bg-primary text-primary-foreground"
                        : hasError
                        ? "border-destructive/40 text-foreground hover:border-destructive/60"
                        : "border-border text-foreground hover:border-primary/40"
                    }`}
                  >
                    {isColour && hex && (
                      <span className="inline-block h-4 w-4 rounded-full border border-border/60 shrink-0" style={{ backgroundColor: hex }} />
                    )}
                    {selected === opt && <Check className="h-3 w-3 inline" />}
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Chat-only banner for products with chat_only: true
 */
export function ChatOnlyBanner() {
  return (
    <div className="rounded-xl border border-[#25D366]/30 bg-[#25D366]/10 p-4 text-center flex items-center justify-center gap-2">
      <img src={whatsappIcon} alt="WhatsApp" className="h-5 w-5" />
      <p className="text-sm font-medium text-[#25D366]">
        Tap below to discuss details with the seller on WhatsApp
      </p>
    </div>
  );
}
