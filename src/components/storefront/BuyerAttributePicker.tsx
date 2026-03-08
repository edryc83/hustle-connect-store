import { ATTRIBUTE_TYPES, getSelectableKeys } from "@/lib/productAttributes";
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
              {options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => onSelect(key, selected === opt ? "" : opt)}
                  className={`rounded-full border-2 px-4 py-2 text-sm font-medium transition-all ${
                    selected === opt
                      ? "border-primary bg-primary text-primary-foreground"
                      : hasError
                      ? "border-destructive/40 text-foreground hover:border-destructive/60"
                      : "border-border text-foreground hover:border-primary/40"
                  }`}
                >
                  {selected === opt && <Check className="h-3 w-3 inline mr-1" />}
                  {opt}
                </button>
              ))}
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
    <div className="rounded-xl border border-border/60 bg-muted/30 p-4 text-center">
      <p className="text-sm text-muted-foreground">
        💬 Tap below to discuss details with the seller on WhatsApp
      </p>
    </div>
  );
}
