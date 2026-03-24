import { useState, useMemo } from "react";
import { Copy, Check, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import whatsappIcon from "@/assets/whatsapp-icon.png";

type Caption = { vibe: string; text: string };

/**
 * Large pool of pre-written captions. Each seller sees 3 per day,
 * rotating daily based on a hash of their store slug + day-of-year.
 * No API calls needed.
 */
const CAPTION_POOL: ((name: string, link: string) => Caption)[] = [
  (n, l) => ({ vibe: "🆕 Fresh", text: `Just loaded up with fresh electronics and appliances\nCome through before others finish them\n${l}` }),
  (n, l) => ({ vibe: "🔥 Hustle", text: `Your tech problems, my solutions\nLet's get you sorted tonight\n${l}` }),
  (n, l) => ({ vibe: "💛 Real", text: `Another day grinding to keep your gadgets running smooth\nYou know where to find me when you need me\n${l}` }),
  (n, l) => ({ vibe: "💰 Deals", text: `Prices that make sense, quality you can trust\nShop ${n} today\n${l}` }),
  (n, l) => ({ vibe: "🛒 Shop", text: `${n} is open for business 🔓\nBrowse & order anytime\n${l}` }),
  (n, l) => ({ vibe: "⚡ Quick", text: `Need it fast? I've got you covered\nDM or tap the link below\n${l}` }),
  (n, l) => ({ vibe: "🎯 Focus", text: `Stop scrolling, start shopping\nEverything you need is right here 👇\n${l}` }),
  (n, l) => ({ vibe: "🌟 Vibes", text: `Good products. Good prices. Good vibes.\nThat's ${n} for you\n${l}` }),
  (n, l) => ({ vibe: "📦 Restock", text: `Fresh restock just landed 📦\nFirst come, first served\n${l}` }),
  (n, l) => ({ vibe: "🤝 Trust", text: `Been serving happy customers daily\nJoin the family — shop ${n}\n${l}` }),
  (n, l) => ({ vibe: "🔥 Hot", text: `This one's moving fast 🔥\nDon't sleep on it\n${l}` }),
  (n, l) => ({ vibe: "💬 Real Talk", text: `No cap — these prices won't last forever\nCheck ${n} now\n${l}` }),
  (n, l) => ({ vibe: "🏆 Quality", text: `Quality over everything\nThat's the ${n} promise\n${l}` }),
  (n, l) => ({ vibe: "📲 Tap In", text: `One tap away from what you need\nShop ${n} 👇\n${l}` }),
  (n, l) => ({ vibe: "🎉 New Drop", text: `New arrivals just hit the store 🎉\nBe the first to grab yours\n${l}` }),
  (n, l) => ({ vibe: "💪 Grind", text: `We stay grinding so you stay winning\nShop with ${n}\n${l}` }),
  (n, l) => ({ vibe: "🚀 Level Up", text: `Upgrade your setup today\n${n} has what you're looking for\n${l}` }),
  (n, l) => ({ vibe: "🙌 Blessed", text: `Grateful for every customer 🙏\nKeep supporting ${n}\n${l}` }),
  (n, l) => ({ vibe: "💯 Legit", text: `100% legit, 100% quality\nShop with confidence at ${n}\n${l}` }),
  (n, l) => ({ vibe: "🔔 Alert", text: `Just dropped something special 👀\nCheck it before it sells out\n${l}` }),
  (n, l) => ({ vibe: "🌍 Local", text: `Support local, shop smart\n${n} — your neighbourhood plug\n${l}` }),
];

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function pickCaptions(slug: string, storeName: string, offset = 0): Caption[] {
  const link = slug ? `afristall.com/${slug}` : "afristall.com/yourname";
  const name = storeName || "My store";
  const day = Math.floor(Date.now() / 86_400_000); // day index
  const seed = hashCode(slug || "default") + day + offset;
  const pool = [...CAPTION_POOL];

  // Fisher-Yates seeded shuffle
  let s = seed;
  for (let i = pool.length - 1; i > 0; i--) {
    s = ((s * 1103515245 + 12345) & 0x7fffffff);
    const j = s % (i + 1);
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  return pool.slice(0, 3).map((fn) => fn(name, link));
}

interface Props {
  storeName: string;
  storeSlug: string;
  category: string;
  productCount: number;
}

const CaptionGenerator = ({ storeName, storeSlug }: Props) => {
  const [shuffleOffset, setShuffleOffset] = useState(0);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const captions = useMemo(
    () => pickCaptions(storeSlug, storeName, shuffleOffset),
    [storeSlug, storeName, shuffleOffset]
  );

  const handleCopy = async (text: string, idx: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    toast.success("Copied! Paste on your WhatsApp status 🚀");
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="space-y-3 pt-2">
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
            onClick={() => setShuffleOffset((o) => o + 1)}
            className="flex items-center gap-1 text-[11px] text-white/60 hover:text-white transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            New
          </button>
        </div>

        <div className="space-y-2 mt-3">
          {captions.map((c, i) => (
            <div key={`${shuffleOffset}-${i}`} className="rounded-xl bg-[#DCF8C6] dark:bg-[#005C4B] p-3 shadow-sm space-y-2.5">
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
