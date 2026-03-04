import { useState, useEffect } from "react";
import { Copy, Check, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

type Caption = { vibe: string; text: string };

const FALLBACKS: Caption[] = [
  { vibe: "😂 Funny", text: "Me: I'm going to save money this month\nAlso me: *adds to cart at 2am*\n\nAt least buy from someone local 😭\nafristall.com/yourname" },
  { vibe: "🔥 Hustle", text: "While you're thinking about it, someone else is buying it.\n\nDon't sleep on this.\nafristall.com/yourname" },
  { vibe: "💛 Real", text: "I started this business with just my phone and a dream. Every order means the world to me 🧡\n\nCheck out what's new:\nafristall.com/yourname" },
];

const CaptionGenerator = () => {
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const fetchCaptions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-captions", {
        body: {},
      });
      if (error) throw error;
      if (data?.captions?.length) {
        setCaptions(data.captions);
      } else {
        setCaptions(FALLBACKS);
      }
    } catch {
      setCaptions(FALLBACKS);
    }
    setLoading(false);
  };

  useEffect(() => { fetchCaptions(); }, []);

  const handleCopy = async (text: string, idx: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    toast(
      <div className="flex items-center justify-between gap-3 w-full">
        <span className="text-sm font-medium">Now make your link real 👇</span>
        <Link to="/signup">
          <Button size="sm" className="rounded-full text-xs gap-1 shrink-0">
            Create Your Store
          </Button>
        </Link>
      </div>,
      { duration: 5000 }
    );
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      {/* Darker background to differentiate from hero */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/60 to-background" />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold">
            Your caption for today 🔥
          </h2>
          <p className="mt-2 text-muted-foreground text-sm md:text-base">
            AI-written. Just copy, post on status, get orders.
          </p>
        </div>

        {/* Caption cards */}
        <div className="grid gap-4 md:grid-cols-3">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur-xl p-5 space-y-3 animate-pulse min-h-[180px]"
                >
                  <div className="h-6 w-20 rounded-full bg-muted/60" />
                  <div className="space-y-2">
                    <div className="h-4 w-full rounded bg-muted/50" />
                    <div className="h-4 w-4/5 rounded bg-muted/50" />
                    <div className="h-4 w-3/5 rounded bg-muted/50" />
                  </div>
                  <div className="flex justify-center pt-2">
                    <span className="text-xs text-muted-foreground">Writing your captions… ✍🏾</span>
                  </div>
                </div>
              ))
            : captions.map((c, i) => (
                <div
                  key={i}
                  className="group relative rounded-2xl border border-border/50 bg-card/40 backdrop-blur-xl p-5 shadow-sm hover:shadow-md hover:border-primary/30 transition-all flex flex-col"
                >
                  {/* Vibe pill */}
                  <span className="inline-block self-start rounded-full bg-primary/10 border border-primary/20 px-3 py-0.5 text-xs font-medium mb-3">
                    {c.vibe}
                  </span>

                  {/* Caption text */}
                  <p className="text-sm md:text-base leading-relaxed whitespace-pre-line flex-1">
                    {c.text}
                  </p>

                  {/* Copy button */}
                  <div className="flex justify-end mt-4">
                    <button
                      onClick={() => handleCopy(c.text, i)}
                      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                        copiedIdx === i
                          ? "bg-green-500/20 text-green-600"
                          : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      {copiedIdx === i ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          Copied! ✓
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
        </div>

        {/* Regenerate button */}
        <div className="flex justify-center mt-8">
          <Button
            variant="outline"
            onClick={fetchCaptions}
            disabled={loading}
            className="rounded-full gap-2 border-border/50 bg-card/60 backdrop-blur-sm"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Writing…" : "Give me new ones 🔄"}
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CaptionGenerator;
