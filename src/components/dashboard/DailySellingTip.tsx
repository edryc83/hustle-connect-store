import { Lightbulb, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";

const SELLING_TIPS = [
  {
    emoji: "📱",
    tip: "Add your store link to your WhatsApp bio",
    detail: "Every contact who checks your profile can discover your shop instantly.",
  },
  {
    emoji: "🎵",
    tip: "Pin your store link in your TikTok bio",
    detail: "Drive traffic from your videos — add 'Link in bio 🛒' to every caption.",
  },
  {
    emoji: "📸",
    tip: "Post your products on Instagram Stories daily",
    detail: "Use the link sticker to send followers straight to your Afristall store.",
  },
  {
    emoji: "💬",
    tip: "Share your store on WhatsApp Status every morning",
    detail: "Your contacts see it first thing — perfect for daily deals and new arrivals.",
  },
  {
    emoji: "🔁",
    tip: "Repost customer reviews on your status",
    detail: "Social proof builds trust. Screenshot happy messages and share them.",
  },
  {
    emoji: "🏷️",
    tip: "Use clear prices on every listing",
    detail: "Buyers skip posts that say 'DM for price'. Be upfront and get more orders.",
  },
  {
    emoji: "📦",
    tip: "Add at least 5 products to your store",
    detail: "Stores with 5+ items get 3x more views than stores with just 1-2 items.",
  },
  {
    emoji: "🖼️",
    tip: "Use bright, clear photos with good lighting",
    detail: "Natural light + clean background = more trust = more sales.",
  },
  {
    emoji: "✍️",
    tip: "Write short, punchy product descriptions",
    detail: "Focus on what the buyer gets: size, color, material, and why they need it.",
  },
  {
    emoji: "🌟",
    tip: "Feature your best-selling product",
    detail: "Mark your top item as featured so it appears first in your store.",
  },
  {
    emoji: "📲",
    tip: "Add your store link to your Instagram bio",
    detail: "Use a clear call-to-action like 'Shop now 👇' above the link.",
  },
  {
    emoji: "🎯",
    tip: "Post at peak hours: 8-9 AM and 7-9 PM",
    detail: "That's when most people are scrolling. Time your posts for maximum reach.",
  },
  {
    emoji: "🤝",
    tip: "Reply to every WhatsApp message within 5 minutes",
    detail: "Fast replies = more closed sales. Buyers move on quickly.",
  },
  {
    emoji: "📢",
    tip: "Create a WhatsApp broadcast list for your customers",
    detail: "Send new arrivals to your top buyers — it's free marketing.",
  },
  {
    emoji: "🔥",
    tip: "Run a 'This week only' deal to create urgency",
    detail: "Limited-time offers push people to buy now instead of 'later' (never).",
  },
];

function getDailyTipIndex(): number {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
  );
  return dayOfYear % SELLING_TIPS.length;
}

export default function DailySellingTip() {
  const [tipIndex, setTipIndex] = useState(getDailyTipIndex);
  const [isSpinning, setIsSpinning] = useState(false);

  const tip = SELLING_TIPS[tipIndex];

  const shuffleTip = () => {
    setIsSpinning(true);
    let next = tipIndex;
    while (next === tipIndex) {
      next = Math.floor(Math.random() * SELLING_TIPS.length);
    }
    setTipIndex(next);
    setTimeout(() => setIsSpinning(false), 500);
  };

  return (
    <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
            <Lightbulb className="h-4 w-4 text-primary" />
          </div>
          <span className="text-sm font-semibold text-foreground">Daily Selling Tip</span>
        </div>
        <button
          onClick={shuffleTip}
          className="text-muted-foreground hover:text-foreground transition-colors"
          title="Get another tip"
        >
          <RefreshCw className={`h-4 w-4 transition-transform ${isSpinning ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="flex items-start gap-3">
        <span className="text-2xl shrink-0">{tip.emoji}</span>
        <div>
          <p className="text-sm font-semibold text-foreground leading-snug">{tip.tip}</p>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{tip.detail}</p>
        </div>
      </div>
    </div>
  );
}
