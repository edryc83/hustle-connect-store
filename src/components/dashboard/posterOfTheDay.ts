export interface PosterOccasion {
  id: string;
  label: string;
  emoji: string;
  /** Short headline hint the AI uses (the AI will refine wording) */
  headlineHint: string;
  /** Short vibe / tone description */
  vibe: string;
  /** Default theme color used when user picks no override */
  accent: string;
}

export const POSTER_OCCASIONS: PosterOccasion[] = [
  {
    id: "new-month",
    label: "Happy New Month",
    emoji: "🎉",
    headlineHint: "Happy New Month",
    vibe: "celebratory, fresh-start energy, confetti, bright optimistic palette, person beaming with joy holding the product up like a trophy",
    accent: "#F97316",
  },
  {
    id: "motivation-monday",
    label: "Motivation Monday",
    emoji: "💪",
    headlineHint: "Motivation Monday",
    vibe: "energetic, bold, sunrise tones, person looking confident and powerful, fist-pump or arms-crossed, product proudly in hand",
    accent: "#EF4444",
  },
  {
    id: "friday-vibes",
    label: "Friday Vibes",
    emoji: "🌴",
    headlineHint: "Friday Vibes",
    vibe: "relaxed, warm golden-hour lighting, easy smile, weekend-ready mood, person chilling and showing the product casually",
    accent: "#F59E0B",
  },
  {
    id: "weekend-special",
    label: "Weekend Special",
    emoji: "🛍️",
    headlineHint: "Weekend Special",
    vibe: "promo energy, bold sale feel, person excited mid-laugh holding the product, big discount-style typography",
    accent: "#10B981",
  },
];
