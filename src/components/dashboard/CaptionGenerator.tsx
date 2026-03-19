import { useState, useEffect } from "react";
import { Copy, Check, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import whatsappIcon from "@/assets/whatsapp-icon.png";

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
      {/* WhatsApp-themed header */}
      <div className="rounded-2xl bg-[#075E54] dark:bg-[#1F2C34] p-4 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src={whatsappIcon} alt="" className="h-5 w-5" />
            <div>
              <span className="text-sm font-bold text-white">For your WhatsApp status</span>
              <p className="text-[11px] text-white/60 mt-0.5">Tap copy → paste on status → stays up for 24hrs</p>
            </div>
          </div>
          <button
            onClick={fetchCaptions}
            disabled={loading}
            className="flex items-center gap-1 text-[11px] text-white/60 hover:text-white transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            New
          </button>
        </div>

        {/* Caption cards inside the WhatsApp container */}
        <div className="space-y-2 mt-3">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-xl bg-[#DCF8C6] dark:bg-[#005C4B] p-3 animate-pulse">
                  <div className="h-3 w-16 rounded-full bg-[#25D366]/30 mb-2" />
                  <div className="h-3 w-full rounded bg-[#25D366]/20" />
                  <div className="h-3 w-3/4 rounded bg-[#25D366]/20 mt-1" />
                </div>
              ))
            : captions.map((c, i) => (
                <div key={i} className="rounded-xl bg-[#DCF8C6] dark:bg-[#005C4B] p-3 shadow-sm space-y-2.5">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <span className="inline-block rounded-full bg-[#25D366]/20 border border-[#25D366]/30 px-2 py-0.5 text-[10px] font-semibold text-[#075E54] dark:text-[#25D366] mb-1.5">
                        {c.vibe}
                      </span>
                      <p className="text-xs leading-relaxed whitespace-pre-line text-[#111B21] dark:text-[#E9EDEF]">{c.text}</p>
                    </div>
                    <button
                      onClick={() => handleCopy(c.text, i)}
                      className={`shrink-0 mt-1 p-1.5 rounded-lg transition-colors ${
                        copiedIdx === i
                          ? "text-[#25D366]"
                          : "text-[#075E54]/50 dark:text-[#E9EDEF]/50 hover:text-[#075E54] dark:hover:text-[#E9EDEF]"
                      }`}
                      title="Copy"
                    >
                      {copiedIdx === i ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      window.open(`https://wa.me/?text=${encodeURIComponent(c.text)}`, "_blank");
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] hover:bg-[#128C7E] text-white py-2 text-xs font-bold transition-colors shadow-sm"
                  >
                    <img src={whatsappIcon} alt="" className="h-4 w-4" />
                    Post to Status
                  </button>
                </div>
              ))}
        </div>
      </div>
    </div>
  );
};

export default CaptionGenerator;
