import { useState, useEffect } from "react";
import { Copy, Check, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type Caption = { vibe: string; text: string };

const getFallbacks = (slug: string, storeName: string): Caption[] => {
  const link = slug ? `afristall.com/${slug}` : "afristall.com/yourname";
  const name = storeName || "My store";
  return [
    { vibe: "🆕 Fresh", text: `New stuff just dropped at ${name} 👀\nCheck before it's gone\n${link}` },
    { vibe: "🔥 Hustle", text: `${name} is still open. Still the plug.\n${link}` },
    { vibe: "💛 Real", text: `Small business, big heart 🧡\nShop ${name}\n${link}` },
  ];
};

interface Props {
  storeName: string;
  storeSlug: string;
  category: string;
  productCount: number;
}

const CaptionGenerator = ({ storeName, storeSlug, category, productCount }: Props) => {
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const fallbacks = getFallbacks(storeSlug, storeName);

  const fetchCaptions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-captions", {
        body: { storeName, storeSlug, category, productCount },
      });
      if (error) throw error;
      setCaptions(data?.captions?.length ? data.captions : fallbacks);
    } catch {
      setCaptions(fallbacks);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (storeName || storeSlug) fetchCaptions();
    else setCaptions(fallbacks);
    setLoading(false);
  }, [storeName, storeSlug]);

  const handleCopy = async (text: string, idx: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    toast.success("Copied! Paste on your WhatsApp status 🚀");
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="space-y-3 pt-2">
      <div className="border-t border-border/50 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-base font-semibold">For your WhatsApp status 🔥</span>
            <p className="text-xs text-muted-foreground mt-0.5">Tap copy → paste on WhatsApp status → stays up for 24hrs</p>
          </div>
          <button
            onClick={fetchCaptions}
            disabled={loading}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            New
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border/50 bg-card/40 backdrop-blur-xl p-3 animate-pulse">
                <div className="h-3 w-16 rounded-full bg-muted/60 mb-2" />
                <div className="h-3 w-full rounded bg-muted/50" />
                <div className="h-3 w-3/4 rounded bg-muted/50 mt-1" />
              </div>
            ))
          : captions.map((c, i) => (
              <div
                key={i}
                className="rounded-xl border border-border/50 bg-card/40 backdrop-blur-xl p-3 flex items-start gap-3"
              >
                <div className="flex-1 min-w-0">
                  <span className="inline-block rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 text-[10px] font-medium mb-1.5">
                    {c.vibe}
                  </span>
                  <p className="text-xs leading-relaxed whitespace-pre-line">{c.text}</p>
                </div>
                <button
                  onClick={() => handleCopy(c.text, i)}
                  className={`shrink-0 mt-1 p-1.5 rounded-lg transition-colors ${
                    copiedIdx === i
                      ? "text-green-500"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  {copiedIdx === i ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            ))}
      </div>
    </div>
  );
};

export default CaptionGenerator;
