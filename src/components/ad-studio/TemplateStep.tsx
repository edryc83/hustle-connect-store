import { Check } from "lucide-react";

const TEMPLATES = [
  {
    id: "lzw71BD6Ek6350eYkn",
    name: "Classic Card",
    thumbnail: "/templates/spotlight-1.jpeg",
  },
];

interface TemplateStepProps {
  selectedTemplate: string;
  onSelect: (id: string) => void;
}

export default function TemplateStep({ selectedTemplate, onSelect }: TemplateStepProps) {
  return (
    <div className="space-y-4 pb-4">
      <h2 className="text-base font-semibold">Choose a template</h2>
      <div className="grid grid-cols-2 gap-3">
        {TEMPLATES.map((t) => (
          <button
            key={t.id}
            onClick={() => onSelect(t.id)}
            className={`relative rounded-xl overflow-hidden border-2 transition-all aspect-[4/5] ${
              selectedTemplate === t.id
                ? "border-primary ring-2 ring-primary/30"
                : "border-border hover:border-primary/40"
            }`}
          >
            <img src={t.thumbnail} alt={t.name} className="w-full h-full object-cover" />
            {selectedTemplate === t.id && (
              <div className="absolute top-2 right-2 bg-primary rounded-full p-0.5">
                <Check className="h-4 w-4 text-primary-foreground" />
              </div>
            )}
            <span className="absolute bottom-0 inset-x-0 bg-background/80 text-xs py-1 text-center font-medium">
              {t.name}
            </span>
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground text-center">More templates coming soon ✨</p>
    </div>
  );
}
