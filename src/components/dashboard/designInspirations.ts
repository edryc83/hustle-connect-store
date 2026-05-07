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
  {
    id: "green-key-ai",
    label: "Green Key Spotlight",
    emoji: "🗝️",
    image: "/design-templates/green-key-ai.jpeg",
    prompt:
      "Black background with a vivid lime-green radial glow on the right, hero subject centered with diagonal lime brand-tape strips behind, small outlined eyebrow pill top-left, two pill chips top-center (logo + website), bold white headline with one word in huge lime caps, slim outlined arrow CTA pill, price block bottom-right with a small strikethrough old price next to a giant lime price number.",
  },
  {
    id: "lime-portrait",
    label: "Lime Portrait",
    emoji: "🟢",
    image: "/design-templates/lime-portrait.jpeg",
    prompt:
      "Full lime-green background, large black-and-white portrait bleeding off the left edge, bold black condensed headline on the right with one line in heavier weight, tiny social-icon eyebrow line, small body paragraph beneath, dark rounded card containing an arrow CTA row and a white WhatsApp pill with phone number, small wordmark with green dot at the bottom.",
  },
  {
    id: "orange-credit",
    label: "Orange Split Card",
    emoji: "🟧",
    image: "/design-templates/orange-credit.jpeg",
    prompt:
      "Solid orange background with a large white rounded panel on the left holding the headline (one accent word in orange) plus a short paragraph and a thin outlined CTA pill with chevron, hero subject bleeding in from the right, big outlined orange currency-style icon floating right, small white pill at the bottom with logo + social handles.",
  },
  {
    id: "orange-relax",
    label: "Orange Repeat Type",
    emoji: "🛋️",
    image: "/design-templates/orange-relax.jpeg",
    prompt:
      "Vivid orange background tiled with faint repeated wordmark watermark, tiny social icon row top-left, huge stacked white rounded headline with mixed weights, short two-line subline, slim outlined white pill CTA with arrow, hero subject lounging on the right side, small LOGO + handle row at the bottom.",
  },
  {
    id: "iphone-orange-pop",
    label: "Tech Orange Pop",
    emoji: "📱",
    image: "/design-templates/iphone-orange-pop.jpeg",
    prompt:
      "Light gray background with a giant orange rounded-square shape behind the hero subject, product/subject cut out and overlapping the shape, small @handle eyebrow top-left, vertical icon stack on the right, huge bold white centered headline at the bottom of the image, small caps subline, bottom row with a small badge chip on the left, glassy dark icon dock in the middle, and orange contact pill on the right.",
  },
  {
    id: "landing-page-glow",
    label: "Dark Orange Glow",
    emoji: "🚀",
    image: "/design-templates/landing-page-glow.jpeg",
    prompt:
      "Deep dark maroon background with subtle repeated wordmark texture, small white script eyebrow line, massive orange editorial headline with one word in white serif italic beneath, hero product centered with floating orange glowing 3D icon cubes around it, tiny wordmark at the bottom.",
  },
  {
    id: "new-month-april",
    label: "New Month Burst",
    emoji: "📅",
    image: "/design-templates/new-month-april.jpeg",
    prompt:
      "Top half vivid green with a torn white paint-stroke top-left holding a circular logo, small white caps eyebrow line, GIANT hand-painted brush-script white month/word as the centerpiece, hero subject arms-up below it, white circular brush-stroke on the right holding a small list of services, bottom half white with a green script 'happy new month' on the left, short thank-you paragraph, and a rounded outlined contact card on the right with phone icons.",
  },
  {
    id: "smartport-tech",
    label: "Neon Tech Green",
    emoji: "🎮",
    image: "/design-templates/smartport-tech.jpeg",
    prompt:
      "Black background with floating glassy green 3D crystal shards, small logo + wordmark top-left, two-line bold headline where line 1 is white and line 2 is lime green (same words/structure), hero subject centered, lime green pill CTA on the left mid, bottom strip with social icon row and @handle in lime.",
  },
  {
    id: "trevix-vr",
    label: "Purple Aurora",
    emoji: "🟣",
    image: "/design-templates/trevix-vr.jpeg",
    prompt:
      "Deep purple-to-magenta aurora gradient background with soft wispy light streaks, small logo + wordmark top-left, small dotted 'Media' eyebrow top-right, large soft serif headline on the left with one word as accent, two-line subline, small translucent purple chip pill, all-caps services line beneath, hero subject on the right with brand watermark overlaid, three small dark contact cards across the bottom (Follow / WhatsApp / Email) each with icon row.",
  },
  {
    id: "gadgloft-purple",
    label: "Premium Purple",
    emoji: "💜",
    image: "/design-templates/gadgloft-purple.jpeg",
    prompt:
      "Smooth deep purple gradient background, small logo + wordmark top-left, small caps tagline top-right, centered headline where line 1 is white and line 2 is light-purple italic serif, short two-line subline beneath a thin divider, hero subject centered-lower, three stacked small light-purple rounded chips on the right each with one bold word, large rounded purple contact bar at the bottom with a 'CONNECT WITH US' label and three icon+text columns (phone / handle / address).",
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
