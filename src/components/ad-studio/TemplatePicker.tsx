import { useState, useEffect } from "react";
import { Check, Image, LayoutGrid } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export interface Template {
  id: string;
  name: string;
  image_slots: number;
  thumbnail?: string;
  preview_url?: string;
}

interface Props {
  selected: Template | null;
  onSelect: (t: Template) => void;
}

// Local reference thumbnails per template ID
const TEMPLATE_THUMBNAILS: Record<string, string> = {
  dark_fire: "/templates/dark_fire.jpeg",
  split_panel: "/templates/split_panel.jpg",
  full_bleed: "/templates/full_bleed.jpeg",
  editorial_left: "/templates/editorial_left.jpeg",
  warm_glow: "/templates/warm_glow.jpeg",
  dark_overlay: "/templates/dark_overlay.jpeg",
  minimal_center: "/templates/minimal_center.jpeg",
  clean_white: "/templates/clean_white.jpeg",
  bold_orange: "/templates/bold_orange.jpeg",
};

export default function TemplatePicker({ selected, onSelect }: Props) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ad-templates`,
          { headers: { Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` } }
        );
        if (!res.ok) throw new Error("Failed to load templates");
        const data = await res.json();
        const raw = Array.isArray(data) ? data : data.templates || [];
        // Map API field "images" to our "image_slots" and attach local thumbnails
        setTemplates(raw.map((t: any) => ({
          ...t,
          image_slots: t.image_slots ?? t.images ?? 1,
          thumbnail: TEMPLATE_THUMBNAILS[t.id] || t.thumbnail || t.preview_url || null,
        })));
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-base font-semibold">Choose a template</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/5] rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 space-y-2">
        <LayoutGrid className="h-10 w-10 mx-auto text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">Failed to load templates</p>
        <p className="text-xs text-destructive">{error}</p>
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        <p className="text-sm">No templates available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-4">
      <h2 className="text-base font-semibold">Choose a template</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[65vh] overflow-y-auto pr-1">
        {templates.map((t) => (
          <button
            key={t.id}
            onClick={() => onSelect(t)}
            className={`relative rounded-xl overflow-hidden border-2 transition-all aspect-[4/5] group ${
              selected?.id === t.id
                ? "border-primary ring-2 ring-primary/30 scale-[1.02]"
                : "border-border hover:border-primary/40"
            }`}
          >
            {t.thumbnail || t.preview_url ? (
              <img src={t.thumbnail || t.preview_url} alt={t.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <Image className="h-8 w-8 text-muted-foreground/40" />
              </div>
            )}
            {selected?.id === t.id && (
              <div className="absolute top-2 right-2 bg-primary rounded-full p-0.5 shadow-lg">
                <Check className="h-4 w-4 text-primary-foreground" />
              </div>
            )}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-2 pt-6">
              <span className="text-xs font-medium text-white block truncate">{t.name}</span>
              <span className="text-[10px] text-white/70">
                {t.image_slots} image{t.image_slots !== 1 ? "s" : ""}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
