export interface Inspiration {
  id: string;
  label: string;
  emoji: string;
  /** Public path to a template image used as visual reference for gpt-image-2 */
  image: string;
  /** Short style brief sent to the model */
  prompt: string;
}

export const INSPIRATIONS: Inspiration[] = [
  {
    id: "purple-motion",
    label: "Purple Motion",
    emoji: "🛹",
    image: "/design-templates/purple-motion.jpeg",
    prompt:
      "Vivid purple gradient with horizontal motion-blur light streaks, hero subject mid-action, bold white headline with selected words highlighted in yellow, small logo top-center, contact bar pinned to bottom with thin gold rule.",
  },
  {
    id: "navy-glow",
    label: "Navy Product Glow",
    emoji: "📱",
    image: "/design-templates/navy-glow.jpeg",
    prompt:
      "Deep navy dotted background, hero product floating encircled by a glowing neon ring of sparkles, headline split into yellow + white words, bold yellow pill CTA, white rounded contact bar at the bottom.",
  },
  {
    id: "mono-editorial",
    label: "Mono Editorial",
    emoji: "⚫",
    image: "/design-templates/mono-editorial.png",
    prompt:
      "Sleek dark almost-black background with subtle vignette, product hero on the right razor-sharp, huge condensed white headline on the left, accent thin underline, pill price chip, pill WhatsApp CTA.",
  },
  {
    id: "navy-curve",
    label: "Navy Curve",
    emoji: "🌊",
    image: "/design-templates/navy-curve.jpeg",
    prompt:
      "Deep navy background with a soft cyan curved swoosh, hero product on the right, bold split yellow/white headline on the left, yellow pill CTA, white rounded contact bar at the bottom.",
  },
  {
    id: "campaign-bold",
    label: "Campaign Bold",
    emoji: "📣",
    image: "/design-templates/campaign-bold.jpeg",
    prompt:
      "Dark dramatic background with green radial glow behind a hyper-real 3D hero, big bold white headline with one phrase highlighted in lime, white rounded panel at the bottom holding a green pill CTA + social handles.",
  },
  {
    id: "dark-lime-tech",
    label: "Dark + Lime Tech",
    emoji: "🟩",
    image: "/design-templates/dark-lime-tech.jpeg",
    prompt:
      "Dark green-to-black gradient, hero subject lit with lime green rim light, two-line headline where one half is lime and the other half is silver, small caps eyebrow line above, glassy rounded contact bar at the bottom.",
  },
  {
    id: "big-month",
    label: "Big Month",
    emoji: "📅",
    image: "/design-templates/big-month.jpeg",
    prompt:
      "Massive single hero word as the centerpiece, subject photo overlapping the word, small yellow rounded-pill labels floating around, soft dark background, glassy contact bar at the bottom.",
  },
  {
    id: "exclusive-class",
    label: "Exclusive Class",
    emoji: "🎓",
    image: "/design-templates/exclusive-class.jpeg",
    prompt:
      "Dark background, small outlined 'EXCLUSIVE' eyebrow pill, gigantic stacked white headline with one word in lime green, soft body text, hero subject bottom-right with floating chat-bubble CTA card.",
  },
  {
    id: "teal-corporate",
    label: "Teal Corporate",
    emoji: "🟦",
    image: "/design-templates/teal-corporate.jpeg",
    prompt:
      "Teal/cyan geometric chevron shapes overlaying a real lifestyle photo, bold white headline with one accent-colored highlighted word, small body paragraph, pill website CTA, small logo bottom-right.",
  },
  {
    id: "green-editorial",
    label: "Green Editorial",
    emoji: "🟢",
    image: "/design-templates/green-editorial.jpeg",
    prompt:
      "Deep forest green background with a subtle dotted texture, oversized lime-green editorial headline at the top wrapping over multiple lines, hero product floating in a hand bottom-center, small wordmark bottom-right.",
  },
];

export const COLOR_THEMES = [
  { id: "brand", label: "Brand", color: "" }, // user's accent_color
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
