import { useState } from "react";
import { Input } from "@/components/ui/input";
import { getCategoryByValue, parseTextToOptions, type AttrField } from "@/lib/productAttributes";

interface BuyerAttributePickerProps {
  attributes: Record<string, any>;
  selections: Record<string, string | string[]>;
  textInputs: Record<string, string>;
  onSelectionChange: (key: string, value: string | string[]) => void;
  onTextInputChange: (key: string, value: string) => void;
}

/**
 * Buyer-side attribute selector. Shows dynamic fields based on what the seller filled in.
 */
export function BuyerAttributePicker({
  attributes,
  selections,
  textInputs,
  onSelectionChange,
  onTextInputChange,
}: BuyerAttributePickerProps) {
  const category = getCategoryByValue(attributes.product_type);
  if (!category) return null;

  const visibleFields = category.fields.filter((field) => {
    const val = attributes[field.key];
    if (!val) return false;
    if (Array.isArray(val) && val.length === 0) return false;
    if (typeof val === "string" && !val.trim()) return false;
    return true;
  });

  if (visibleFields.length === 0) return null;

  return (
    <div className="space-y-4">
      {visibleFields.map((field) => (
        <BuyerField
          key={field.key}
          field={field}
          sellerValue={attributes[field.key]}
          buyerSelection={selections[field.key]}
          buyerText={textInputs[field.key]}
          onSelect={(val) => onSelectionChange(field.key, val)}
          onTextInput={(val) => onTextInputChange(field.key, val)}
        />
      ))}
    </div>
  );
}

function BuyerField({
  field,
  sellerValue,
  buyerSelection,
  buyerText,
  onSelect,
  onTextInput,
}: {
  field: AttrField;
  sellerValue: any;
  buyerSelection?: string | string[];
  buyerText?: string;
  onSelect: (val: string | string[]) => void;
  onTextInput: (val: string) => void;
}) {
  // Toggle and number types are info-only (shown as badges)
  if (field.type === "toggle") {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">{field.label}:</span>
        <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">
          {sellerValue}
        </span>
      </div>
    );
  }

  if (field.type === "number") {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">{field.label}:</span>
        <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">
          {sellerValue} {field.key === "days_notice" ? "days" : ""}
        </span>
      </div>
    );
  }

  // For pills and multi-pills, show the seller's options as selectable pills
  if (field.type === "pills" || field.type === "multi-pills") {
    const options: string[] = Array.isArray(sellerValue) ? sellerValue : [sellerValue];
    const selected = buyerSelection;

    if (field.type === "multi-pills") {
      // Buyer picks ONE from multi-pills (seller offered multiple)
      const sel = typeof selected === "string" ? selected : "";
      return (
        <div className="space-y-1.5">
          <p className="text-sm font-medium">Select {field.label}</p>
          <div className="flex flex-wrap gap-2">
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => onSelect(sel === opt ? "" : opt)}
                className={`rounded-full border-2 px-4 py-2 text-sm font-medium transition-all ${
                  sel === opt
                    ? "border-[hsl(24,100%,50%)] bg-[hsl(24,100%,50%)]/10 text-[hsl(24,100%,50%)]"
                    : "border-border text-muted-foreground hover:border-muted-foreground/50"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      );
    }

    // Single pills — buyer picks one
    const sel = typeof selected === "string" ? selected : "";
    return (
      <div className="space-y-1.5">
        <p className="text-sm font-medium">Select {field.label}</p>
        <div className="flex flex-wrap gap-2">
          {options.filter(Boolean).map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => onSelect(sel === opt ? "" : opt)}
              className={`rounded-full border-2 px-4 py-2 text-sm font-medium transition-all ${
                sel === opt
                  ? "border-[hsl(24,100%,50%)] bg-[hsl(24,100%,50%)]/10 text-[hsl(24,100%,50%)]"
                  : "border-border text-muted-foreground hover:border-muted-foreground/50"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Text type — parse comma-separated into pills for buyer
  if (field.type === "text") {
    const options = parseTextToOptions(sellerValue);
    if (options.length === 0) return null;

    // If it's "custom_options" or only 1 long option, show as free text
    if (field.key === "custom_options" || (options.length === 1 && options[0].length > 30)) {
      return (
        <div className="space-y-1.5">
          <p className="text-sm font-medium">{field.label}</p>
          <Input
            placeholder={`Enter your ${field.label.toLowerCase()}`}
            value={buyerText ?? ""}
            onChange={(e) => onTextInput(e.target.value)}
            className="h-10"
          />
        </div>
      );
    }

    const sel = typeof buyerSelection === "string" ? buyerSelection : "";
    return (
      <div className="space-y-1.5">
        <p className="text-sm font-medium">Select {field.label}</p>
        <div className="flex flex-wrap gap-2">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => onSelect(sel === opt ? "" : opt)}
              className={`rounded-full border-2 px-4 py-2 text-sm font-medium transition-all ${
                sel === opt
                  ? "border-[hsl(24,100%,50%)] bg-[hsl(24,100%,50%)]/10 text-[hsl(24,100%,50%)]"
                  : "border-border text-muted-foreground hover:border-muted-foreground/50"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return null;
}

/**
 * Check if a cake_message toggle is "Yes" and show text input for buyer
 */
export function BuyerCakeMessageInput({
  attributes,
  value,
  onChange,
}: {
  attributes: Record<string, any>;
  value: string;
  onChange: (val: string) => void;
}) {
  if (attributes.product_type !== "cakes" || attributes.cake_message !== "Yes") return null;

  return (
    <div className="space-y-1.5">
      <p className="text-sm font-medium">Message on cake</p>
      <Input
        placeholder='e.g. Happy 30th Sarah! 🎂'
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10"
      />
    </div>
  );
}

/**
 * For jewellery personalisation
 */
export function BuyerPersonalisationInput({
  attributes,
  value,
  onChange,
}: {
  attributes: Record<string, any>;
  value: string;
  onChange: (val: string) => void;
}) {
  if (attributes.product_type !== "jewellery" || attributes.personalisation !== "Yes") return null;

  return (
    <div className="space-y-1.5">
      <p className="text-sm font-medium">Personalisation (name/initials)</p>
      <Input
        placeholder="e.g. Sarah, S.A."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10"
      />
    </div>
  );
}
