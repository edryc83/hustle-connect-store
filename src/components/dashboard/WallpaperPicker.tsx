import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Search, ImagePlus } from "lucide-react";
import { toast } from "sonner";

type WallpaperResult = {
  id: string;
  url: string;
  thumb: string;
  source: string;
  photographer?: string;
};

interface WallpaperPickerProps {
  onSelect: (url: string) => void;
  children?: React.ReactNode;
}

const WallpaperPicker = ({ onSelect, children }: WallpaperPickerProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<WallpaperResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selecting, setSelecting] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("search-wallpapers", {
        body: { query: query.trim() },
      });
      if (error) throw error;
      setResults(data?.results || []);
      if (!data?.results?.length) toast.info("No results found, try another keyword");
    } catch {
      toast.error("Failed to search wallpapers");
    }
    setLoading(false);
  };

  const handlePick = async (wp: WallpaperResult) => {
    setSelecting(wp.id);
    onSelect(wp.url);
    toast.success(`Cover photo set from ${wp.source}`);
    setSelecting(null);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm" className="gap-1.5">
            <ImagePlus className="h-4 w-4" /> Browse Wallpapers
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Search Wallpapers</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
          className="flex gap-2"
        >
          <Input
            placeholder="e.g. abstract, fashion, food, nature..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" size="sm" disabled={loading} className="gap-1">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Search
          </Button>
        </form>

        <div className="flex-1 overflow-y-auto mt-2">
          {results.length === 0 && !loading && (
            <p className="text-center text-sm text-muted-foreground py-8">
              Search Unsplash & Pexels for free cover photos
            </p>
          )}
          <div className="grid grid-cols-2 gap-2">
            {results.map((wp) => (
              <button
                key={wp.id}
                onClick={() => handlePick(wp)}
                disabled={selecting === wp.id}
                className="group relative rounded-lg overflow-hidden border border-border/50 hover:border-primary/50 transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <img
                  src={wp.thumb}
                  alt={`Wallpaper by ${wp.photographer}`}
                  className="w-full h-24 object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-end">
                  <span className="text-[10px] text-white/0 group-hover:text-white/90 px-1.5 pb-1 truncate w-full text-left transition-colors">
                    {wp.photographer} · {wp.source}
                  </span>
                </div>
                {selecting === wp.id && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <Loader2 className="h-5 w-5 text-white animate-spin" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WallpaperPicker;
