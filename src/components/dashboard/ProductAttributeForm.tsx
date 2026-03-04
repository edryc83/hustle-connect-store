import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { PRODUCT_CATEGORIES, type ProductCategory, type AttrField } from "@/lib/productAttributes";

interface ProductAttributeFormProps {
  attributes: Record<string, any>;
  onChange: (attrs: Record<string, any>) => void;
}

/**
 * Seller-side attribute form. Shows category picker then dynamic fields.
 */
export function ProductAttributeForm({ attributes, onChange }: ProductAttributeFormProps) {
  const productType = attributes.product_type || "";
  const category = PRODUCT_CATEGORIES.find((c) => c.value === productType);

  const setAttr = (key: string, value: any) => {
    onChange({ ...attributes, [key]: value });
  };

  const setProductType = (value: string) => {
    // Reset attributes when category changes, keep product_type
    onChange({ product_type: value });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label className="text-sm font-semibold">What type of product is this?</Label>
        <div className="flex flex-wrap gap-1.5">
          {PRODUCT_CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setProductType(cat.value)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                productType === cat.value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/40"
              }`}
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>
      </div>

      {category && (
        <div className="space-y-3 rounded-xl border border-border/50 bg-muted/20 p-3">
          <p className="text-xs font-medium text-muted-foreground">
            {category.emoji} {category.label} — fill in what applies
          </p>
          {category.fields.map((field) => (
            <SellerField
              key={field.key}
              field={field}
              value={attributes[field.key]}
              onChange={(val) => setAttr(field.key, val)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SellerField({
  field,
  value,
  onChange,
}: {
  field: AttrField;
  value: any;
  onChange: (val: any) => void;
}) {
  if (field.type === "pills") {
    const selected = value || "";
    return (
      <div className="space-y-1">
        <Label className="text-xs">{field.label}</Label>
        <div className="flex flex-wrap gap-1.5">
          {field.options!.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(selected === opt ? "" : opt)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                selected === opt
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-primary/40"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (field.type === "multi-pills") {
    const selected: string[] = Array.isArray(value) ? value : [];
    const toggle = (opt: string) => {
      onChange(
        selected.includes(opt)
          ? selected.filter((s) => s !== opt)
          : [...selected, opt]
      );
    };
    return (
      <div className="space-y-1">
        <Label className="text-xs">{field.label}</Label>
        <div className="flex flex-wrap gap-1.5">
          {field.options!.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => toggle(opt)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                selected.includes(opt)
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-primary/40"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (field.type === "toggle") {
    const selected = value || "";
    return (
      <div className="space-y-1">
        <Label className="text-xs">{field.label}</Label>
        <div className="flex flex-wrap gap-1.5">
          {field.options!.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(selected === opt ? "" : opt)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                selected === opt
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-primary/40"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (field.type === "number") {
    return (
      <div className="space-y-1">
        <Label className="text-xs">{field.label}</Label>
        <Input
          type="number"
          placeholder={field.placeholder}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
          className="h-8 text-sm"
        />
      </div>
    );
  }

  // text
  return (
    <div className="space-y-1">
      <Label className="text-xs">{field.label}</Label>
      <Input
        placeholder={field.placeholder}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 text-sm"
      />
    </div>
  );
}
