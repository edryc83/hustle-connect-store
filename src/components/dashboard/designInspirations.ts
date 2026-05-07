export interface Inspiration {
  id: string;
  label: string;
  emoji: string;
  prompt: string;
}

export const INSPIRATIONS: Inspiration[] = [
  {
    id: "bold-neon",
    label: "Bold Neon",
    emoji: "⚡",
    prompt:
      "Bold neon editorial: oversized sans-serif headline, single neon accent color glow, dark cinematic background, hero subject sharply lit, asymmetric grid, magazine-grade negative space.",
  },
  {
    id: "lime-pop",
    label: "Lime Pop",
    emoji: "🟢",
    prompt:
      "Vibrant lime/green flat background, monochrome black-and-white hero subject, massive condensed black headline, small dark CTA pill, social-media editorial style.",
  },
  {
    id: "apple-premium",
    label: "Apple Premium",
    emoji: "🍎",
    prompt:
      "Apple-style premium minimal: clean light or soft gradient background, perfectly centered hero, refined thin-to-bold typography hierarchy, generous negative space, subtle shadows.",
  },
  {
    id: "orange-wellness",
    label: "Orange Lifestyle",
    emoji: "🧡",
    prompt:
      "Warm orange flat background with giant faded repeating word texture, lifestyle photo of a relaxed person, friendly rounded white sans-serif headline, pill CTA outline.",
  },
  {
    id: "dark-cinematic",
    label: "Dark Cinematic",
    emoji: "🌑",
    prompt:
      "Moody cinematic dark scene, single warm accent glow (orange or amber), dramatic product spotlight, elegant serif/sans mix, premium typographic hierarchy, tasteful film grain.",
  },
  {
    id: "tech-glow",
    label: "Tech Glow",
    emoji: "💚",
    prompt:
      "Futuristic tech aesthetic: deep black background, glowing neon green/cyan rim light on subject, two-tone headline (white + neon), pill CTA, floating 3D tech elements.",
  },
  {
    id: "new-month",
    label: "Big Word Hero",
    emoji: "🅰️",
    prompt:
      "Massive single hero WORD as the centerpiece (the title) with the subject overlapping it, floating chat-bubble micro-labels, soft modern background, contact bar at the bottom.",
  },
  {
    id: "credit-card",
    label: "Split Color Block",
    emoji: "🟧",
    prompt:
      "Bold split composition: solid accent-color block on one side with headline + CTA, photo of subject on the other side, floating circular icon badge, clean sans-serif.",
  },
  {
    id: "futuristic-purple",
    label: "Cosmic Purple",
    emoji: "🟣",
    prompt:
      "Cosmic purple-to-magenta gradient background with smoke/mist textures, soft glowing logo mark, elegant light typography, premium tech-fashion advertising vibe.",
  },
];

// Re-ordered & expanded to match real social-media flyer references.
INSPIRATIONS.push(
  {
    id: "purple-motion",
    label: "Purple Motion",
    emoji: "🛹",
    prompt:
      "Vivid purple gradient background with horizontal motion-blur light streaks, hero subject in mid-action perfectly lit, large bold white headline with selected words highlighted in yellow, small logo top-center, contact bar pinned to bottom with thin gold rule.",
  },
  {
    id: "navy-glow-product",
    label: "Navy Product Glow",
    emoji: "📱",
    prompt:
      "Deep navy/blue dotted background, hero product floating in mid-air encircled by a glowing neon ring of sparkles, headline split into yellow + white words, bold yellow pill CTA, white rounded contact bar at the bottom with WhatsApp + location lines.",
  },
  {
    id: "mono-editorial",
    label: "Mono Editorial",
    emoji: "⚫",
    prompt:
      "Sleek dark almost-black background with subtle vignette, product hero on the right razor-sharp, huge condensed white headline on the left, accent-colored thin underline, pill price chip, pill WhatsApp CTA, tiny 'Designed by Afristall' bottom-right.",
  },
  {
    id: "dark-lime-tech",
    label: "Dark + Lime Tech",
    emoji: "🟩",
    prompt:
      "Dark green-to-black gradient background, hero subject lit with lime green rim light, two-line headline where one half is lime and the other half is silver/white, small caps eyebrow line above, glassy rounded contact bar at the bottom.",
  },
  {
    id: "month-hero",
    label: "Big Month",
    emoji: "📅",
    prompt:
      "Massive single word (e.g. month name) as the hero — outlined or filled — subject photo overlapping the word, small yellow rounded-pill labels floating around, soft dark background, glassy contact bar at the bottom.",
  },
  {
    id: "teal-corporate",
    label: "Teal Corporate",
    emoji: "🟦",
    prompt:
      "Teal/cyan geometric chevron shapes overlaying a real lifestyle photo, bold white headline with one accent-colored highlighted word, small body paragraph, pill website CTA, small logo bottom-right.",
  },
  {
    id: "campaign-bold",
    label: "Campaign Bold",
    emoji: "📣",
    prompt:
      "Dark dramatic background with green radial glow behind a hyper-real 3D hero, big bold white headline with one phrase highlighted in lime, supportive subline, white rounded panel at the bottom holding a green pill CTA + social handles.",
  },
);

export const COLOR_THEMES = [
  { id: "brand", label: "Brand", color: "" }, // use user's accent_color
  { id: "lime", label: "Lime", color: "#C6F432" },
  { id: "orange", label: "Orange", color: "#F97316" },
  { id: "purple", label: "Purple", color: "#A855F7" },
  { id: "cyan", label: "Cyan", color: "#22D3EE" },
  { id: "red", label: "Red", color: "#EF4444" },
  { id: "mono", label: "Mono", color: "#FFFFFF" },
] as const;

export function pickRandomInspiration(): Inspiration {
  return INSPIRATIONS[Math.floor(Math.random() * INSPIRATIONS.length)];
}