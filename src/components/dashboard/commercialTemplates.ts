// Studio Commercial templates. Each template defines how the AI shoots the
// clip (camera prompts per shot), the on-screen caption sequence, the
// background music track, and the visual caption style.

export interface CommercialCaption {
  /** Slot the caption fills — filled at render time from product data. */
  slot: "hook" | "name" | "price" | "cta" | "custom";
  /** Fallback text (used when slot data is empty, or when slot === "custom"). */
  text?: string;
  /** Seconds from start. */
  from: number;
  to: number;
}

export interface CommercialTemplate {
  id: string;
  label: string;
  emoji: string;
  desc: string;
  tint: string;
  /** Cinematic prompts, one per shot. Reused as WAN 2.2 i2v-fast camera direction. */
  shots: string[];
  /** How long each shot occupies in the final commercial (seconds). Sum ≈ total. */
  shotDurations: number[];
  /** Music file under public/audio/commercials/. */
  music: string;
  /** Caption sequence (times in seconds). */
  captions: CommercialCaption[];
  /** Caption visual style. */
  captionStyle: {
    fontFamily: string;
    weight: number;
    size: number;             // px at 1080 tall canvas
    color: string;
    bg?: string;              // optional chip background
    uppercase?: boolean;
    letterSpacing?: number;
    align: "top" | "middle" | "bottom";
  };
}

const AUDIO = "/audio/commercials";

export const COMMERCIAL_TEMPLATES: CommercialTemplate[] = [
  {
    id: "luxury",
    label: "Luxury",
    emoji: "🥂",
    desc: "Slow orbit + push-in, mellow lounge, cream captions",
    tint: "from-amber-500/20 to-yellow-500/10 border-amber-500/30 text-amber-300",
    shots: [
      "Cinematic slow 180 degree orbit around the product, soft golden studio light, shallow depth of field, product perfectly still and unchanged.",
      "Slow dolly push-in toward the product with subtle rack focus, warm rim light, luxurious matte black backdrop, product stays sharp and unchanged.",
    ],
    shotDurations: [7.5, 7.5],
    music: `${AUDIO}/luxury.mp3`,
    captions: [
      { slot: "hook", text: "Handcrafted", from: 0.7, to: 3.5 },
      { slot: "name", from: 4.0, to: 9.0 },
      { slot: "price", from: 10.0, to: 14.5 },
    ],
    captionStyle: {
      fontFamily: "'Cormorant Garamond', 'Times New Roman', serif",
      weight: 500,
      size: 72,
      color: "#f5e6c8",
      align: "bottom",
      letterSpacing: 1,
    },
  },
  {
    id: "street",
    label: "Street",
    emoji: "🔥",
    desc: "Snap-in reveals, hip-hop beat, bold uppercase",
    tint: "from-red-500/20 to-orange-500/10 border-red-500/30 text-red-300",
    shots: [
      "Fast snap zoom-in on the product with hard contrasty street lighting, urban night backdrop, product stays sharp and centered.",
      "The camera whips sideways revealing the product against a neon-lit brick wall, dramatic backlight, product stays unchanged.",
      "Slow orbit finish, spotlight from above, moody street vibe, product stays perfectly rendered.",
    ],
    shotDurations: [4.5, 5, 5.5],
    music: `${AUDIO}/street.mp3`,
    captions: [
      { slot: "hook", text: "New drop", from: 0.4, to: 3.2 },
      { slot: "name", from: 5.2, to: 9.5 },
      { slot: "cta", text: "Cop yours →", from: 11.0, to: 14.8 },
    ],
    captionStyle: {
      fontFamily: "'Bebas Neue', 'Impact', sans-serif",
      weight: 700,
      size: 96,
      color: "#ffffff",
      bg: "rgba(220,38,38,0.9)",
      uppercase: true,
      align: "middle",
      letterSpacing: 3,
    },
  },
  {
    id: "minimal",
    label: "Minimal",
    emoji: "◻︎",
    desc: "Clean push-in + reveal, ambient, thin captions",
    tint: "from-slate-400/20 to-zinc-500/10 border-slate-400/30 text-slate-200",
    shots: [
      "Very slow dolly push-in on the product, seamless soft white studio backdrop, gentle diffused top light, product stays sharp and unchanged.",
      "Camera slowly descends from above onto the product, rim light glinting, minimal atmospheric particles, product stays unchanged.",
    ],
    shotDurations: [7.5, 7.5],
    music: `${AUDIO}/minimal.mp3`,
    captions: [
      { slot: "name", from: 1.0, to: 6.0 },
      { slot: "hook", text: "Designed simply.", from: 7.0, to: 10.5 },
      { slot: "price", from: 11.0, to: 14.5 },
    ],
    captionStyle: {
      fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
      weight: 300,
      size: 56,
      color: "#111111",
      bg: "rgba(255,255,255,0.85)",
      align: "bottom",
      letterSpacing: 2,
    },
  },
  {
    id: "festive",
    label: "Festive",
    emoji: "🎉",
    desc: "Turntable + splash, upbeat, joyful captions",
    tint: "from-fuchsia-500/20 to-pink-500/10 border-fuchsia-500/30 text-fuchsia-300",
    shots: [
      "The product rotates slowly on a polished plinth surrounded by drifting confetti, vibrant colored backdrop, upbeat commercial lighting, product stays sharp and unchanged.",
      "Slow-motion light-particle burst around the product, colorful backlight, celebratory studio vibe, product stays unchanged.",
      "Camera orbits playfully, cheerful pastel gradient background, product stays sharp and centered.",
    ],
    shotDurations: [5, 5, 5],
    music: `${AUDIO}/festive.mp3`,
    captions: [
      { slot: "hook", text: "Feel the vibe", from: 0.5, to: 3.8 },
      { slot: "name", from: 5.0, to: 9.5 },
      { slot: "cta", text: "Order today", from: 10.8, to: 14.8 },
    ],
    captionStyle: {
      fontFamily: "'Poppins', 'Helvetica Neue', sans-serif",
      weight: 800,
      size: 78,
      color: "#ffffff",
      bg: "rgba(217,70,239,0.85)",
      align: "middle",
      letterSpacing: 1,
    },
  },
  {
    id: "new-arrival",
    label: "New Arrival",
    emoji: "🚀",
    desc: "Reveal + orbit, energetic beat, NEW / SHOP NOW",
    tint: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-300",
    shots: [
      "Camera descends dramatically revealing the product, spotlight snap on, dark studio background with a single soft light, product stays sharp and unchanged.",
      "Smooth 180 degree orbit around the product, subtle floor reflection, modern e-commerce lighting, product stays unchanged.",
    ],
    shotDurations: [7, 8],
    music: `${AUDIO}/new-arrival.mp3`,
    captions: [
      { slot: "custom", text: "NEW", from: 0.3, to: 2.5 },
      { slot: "name", from: 3.2, to: 8.0 },
      { slot: "custom", text: "SHOP NOW", from: 9.5, to: 14.7 },
    ],
    captionStyle: {
      fontFamily: "'Poppins', 'Helvetica Neue', sans-serif",
      weight: 900,
      size: 108,
      color: "#0f172a",
      bg: "rgba(16,185,129,0.95)",
      uppercase: true,
      align: "middle",
      letterSpacing: 4,
    },
  },
];

export function fillCaption(
  c: CommercialCaption,
  ctx: { productName: string; price: string }
): string {
  if (c.slot === "name") return c.text || ctx.productName;
  if (c.slot === "price") return c.text || ctx.price;
  if (c.slot === "cta") return c.text || "Order now";
  if (c.slot === "hook") return c.text || "New";
  return c.text || "";
}