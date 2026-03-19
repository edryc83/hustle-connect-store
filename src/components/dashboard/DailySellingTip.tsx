import { Lightbulb } from "lucide-react";
import { useState, useMemo } from "react";

const SELLING_TIPS = [
  { emoji: "📱", tip: "Add your store link to your WhatsApp bio", detail: "Every contact who checks your profile can discover your shop instantly." },
  { emoji: "🎵", tip: "Pin your store link in your TikTok bio", detail: "Drive traffic from your videos — add 'Link in bio 🛒' to every caption." },
  { emoji: "📸", tip: "Post your products on Instagram Stories daily", detail: "Use the link sticker to send followers straight to your Afristall store." },
  { emoji: "💬", tip: "Share your store on WhatsApp Status every morning", detail: "Your contacts see it first thing — perfect for daily deals and new arrivals." },
  { emoji: "🔁", tip: "Repost customer reviews on your status", detail: "Social proof builds trust. Screenshot happy messages and share them." },
  { emoji: "🏷️", tip: "Use clear prices on every listing", detail: "Buyers skip posts that say 'DM for price'. Be upfront and get more orders." },
  { emoji: "📦", tip: "Add at least 5 products to your store", detail: "Stores with 5+ items get 3x more views than stores with just 1-2 items." },
  { emoji: "🖼️", tip: "Use bright, clear photos with good lighting", detail: "Natural light + clean background = more trust = more sales." },
  { emoji: "✍️", tip: "Write short, punchy product descriptions", detail: "Focus on what the buyer gets: size, color, material, and why they need it." },
  { emoji: "🌟", tip: "Feature your best-selling product", detail: "Mark your top item as featured so it appears first in your store." },
  { emoji: "📲", tip: "Add your store link to your Instagram bio", detail: "Use a clear call-to-action like 'Shop now 👇' above the link." },
  { emoji: "🎯", tip: "Post at peak hours: 8-9 AM and 7-9 PM", detail: "That's when most people are scrolling. Time your posts for maximum reach." },
  { emoji: "🤝", tip: "Reply to every WhatsApp message within 5 minutes", detail: "Fast replies = more closed sales. Buyers move on quickly." },
  { emoji: "📢", tip: "Create a WhatsApp broadcast list for your customers", detail: "Send new arrivals to your top buyers — it's free marketing." },
  { emoji: "🔥", tip: "Run a 'This week only' deal to create urgency", detail: "Limited-time offers push people to buy now instead of 'later' (never)." },
];

function getDailyTips(): typeof SELLING_TIPS {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
  );
  // Pick 3 tips deterministically per day
  const tips: typeof SELLING_TIPS = [];
  for (let i = 0; i < 3; i++) {
    tips.push(SELLING_TIPS[(dayOfYear * 3 + i) % SELLING_TIPS.length]);
  }
  return tips;
}

export default function DailySellingTip() {
  const tips = useMemo(() => getDailyTips(), []);
  const [selected, setSelected] = useState(0);
  const tip = tips[selected];

  return (
    <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl p-5 shadow-sm space-y-3">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
          <Lightbulb className="h-4 w-4 text-primary" />
        </div>
        <span className="text-sm font-semibold text-foreground">Daily Selling Tip</span>
      </div>

      {/* 3 tip selector */}
      <div className="flex gap-1.5">
        {tips.map((t, i) => (
          <button
            key={i}
            onClick={() => setSelected(i)}
            className={`flex-1 rounded-lg px-2 py-1.5 text-center text-lg transition-colors ${
              selected === i
                ? "bg-primary/10 ring-1 ring-primary/30"
                : "bg-muted/50 hover:bg-muted"
            }`}
          >
            {t.emoji}
          </button>
        ))}
      </div>

      <div>
        <p className="text-sm font-semibold text-foreground leading-snug">{tip.tip}</p>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{tip.detail}</p>
      </div>
    </div>
  );
}
