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

/**
 * Day-of-week tuned occasions. Each day has its own dedicated headline so the
 * picker reflects TODAY rather than always showing Monday + Friday options.
 */
const DAY_OCCASIONS: Record<number, PosterOccasion> = {
  0: {
    id: "sunday-funday",
    label: "Sunday Funday",
    emoji: "☀️",
    headlineHint: "Sunday Funday",
    vibe: "warm, leisurely, family-and-friends mood, soft golden light, person relaxed and laughing, product shown casually",
    accent: "#F59E0B",
  },
  1: {
    id: "motivation-monday",
    label: "Motivation Monday",
    emoji: "💪",
    headlineHint: "Motivation Monday",
    vibe: "energetic, bold, sunrise tones, person looking confident and powerful, fist-pump or arms-crossed, product proudly in hand",
    accent: "#EF4444",
  },
  2: {
    id: "transformation-tuesday",
    label: "Transformation Tuesday",
    emoji: "✨",
    headlineHint: "Transformation Tuesday",
    vibe: "before/after glow-up energy, confident smile, polished premium look, person showcasing the product as a glow-up moment",
    accent: "#8B5CF6",
  },
  3: {
    id: "wins-wednesday",
    label: "Wins Wednesday",
    emoji: "🏆",
    headlineHint: "Wins Wednesday",
    vibe: "midweek victory energy, big genuine smile, celebratory but classy, person holding product like a trophy",
    accent: "#10B981",
  },
  4: {
    id: "throwback-thursday",
    label: "Throwback Thursday",
    emoji: "📸",
    headlineHint: "Throwback Thursday",
    vibe: "warm nostalgic film tones, slight retro grain, joyful person reminiscing while showing the product",
    accent: "#D97706",
  },
  5: {
    id: "friday-vibes",
    label: "Friday Vibes",
    emoji: "🌴",
    headlineHint: "Friday Vibes",
    vibe: "relaxed, warm golden-hour lighting, easy smile, weekend-ready mood, person chilling and showing the product casually",
    accent: "#F59E0B",
  },
  6: {
    id: "saturday-special",
    label: "Saturday Special",
    emoji: "🛍️",
    headlineHint: "Saturday Special",
    vibe: "promo energy, bold sale feel, person excited mid-laugh holding the product, big discount-style typography",
    accent: "#10B981",
  },
};

/** Build the list of occasions relevant to TODAY's date. */
export function getTodaysOccasions(now: Date = new Date()): PosterOccasion[] {
  const day = now.getDay();
  const date = now.getDate();
  const list: PosterOccasion[] = [];

  // Always include today's day-of-week occasion first.
  list.push(DAY_OCCASIONS[day]);

  // Happy New Month within first 5 days of the month.
  if (date <= 5) {
    list.push({
      id: "new-month",
      label: "Happy New Month",
      emoji: "🎉",
      headlineHint: "Happy New Month",
      vibe: "celebratory, fresh-start energy, confetti, bright optimistic palette, person beaming with joy holding the product up like a trophy",
      accent: "#F97316",
    });
  }

  // Weekend special on Sat/Sun (in addition to the day card).
  if (day === 6 || day === 0) {
    list.push({
      id: "weekend-special",
      label: "Weekend Special",
      emoji: "🛍️",
      headlineHint: "Weekend Special",
      vibe: "promo energy, bold sale feel, person excited mid-laugh holding the product, big discount-style typography",
      accent: "#10B981",
    });
  }

  // Always offer a generic "Today's Special" fallback.
  const dayName = now.toLocaleDateString("en-US", { weekday: "long" });
  list.push({
    id: "today-special",
    label: `${dayName} Special`,
    emoji: "⭐",
    headlineHint: `${dayName} Special`,
    vibe: "fresh promo energy for today, person beaming, premium and inviting",
    accent: "#F97316",
  });

  // De-duplicate by id while preserving order.
  const seen = new Set<string>();
  return list.filter((o) => (seen.has(o.id) ? false : (seen.add(o.id), true)));
}

export interface PosterTemplate {
  id: string;
  label: string;
  image: string;
  prompt: string;
}

/** Templates tuned for "Poster of the Day" — all feature a happy, jolly person. */
export const POSTER_OF_THE_DAY_TEMPLATES: PosterTemplate[] = [
  {
    id: "potd-hitchpay-purple",
    label: "Purple Joy",
    image: "/design-templates/potd-hitchpay-purple.jpeg",
    prompt:
      "Tall 4:5 poster. Warm interior background (bookshelf / cozy room) with cinematic lighting. A jolly young person beaming a wide genuine smile, sitting relaxed, holding a phone in one hand and the product card/item in the other. Bold sans headline bottom-left where one accent word is in vivid violet, white supporting words. Small wordmark top-left. Bottom dark contact bar with @handle on left, status text center, two app-store style pill chips on right.",
  },
  {
    id: "potd-swiftcoins-dark",
    label: "Deep Purple Hero",
    image: "/design-templates/potd-swiftcoins-dark.jpeg",
    prompt:
      "1:1 deep purple-to-black gradient. Big white sans headline upper-left in 3-4 short lines, small accent eyebrow above. Short paragraph below. Right side: jolly person mid-laugh holding phone with a small floating glassy notification card popping out. Bottom-left: rounded dark pill CTA + small social handle row.",
  },
  {
    id: "potd-afeko-delivery",
    label: "Doorstep Delivery",
    image: "/design-templates/potd-afeko-delivery.jpeg",
    prompt:
      "Tall 4:5 poster. Cinematic doorway scene with rich purple wall on the right. A jolly delivery person handing a branded box to a smiling customer. Right-side bold white sans headline, one key word highlighted with a yellow block. Short supporting paragraph below. Tiny reg-number top-right. White bottom strip with circular logo, social handles row and small QR code.",
  },
  {
    id: "potd-mahir-express",
    label: "Motion Purple",
    image: "/design-templates/potd-mahir-express.jpeg",
    prompt:
      "Tall 4:5 vivid purple background with subtle radial sunburst rays. Massive italicized white display headline with a horizontal motion-blur trail behind it. A jolly person on a bicycle/scooter mid-action carrying the product, slight motion blur. Small wordmark + social handles top row. White rounded contact pill at bottom center.",
  },
  {
    id: "potd-mahir-yellow",
    label: "Sunshine Smile",
    image: "/design-templates/potd-mahir-yellow.jpeg",
    prompt:
      "Tall 4:5 vivid purple background. Massive bold white serif/display headline upper-left in 3 short lines. Short supporting paragraph below. Right side: jolly person in bright yellow outfit laughing with mouth open, full of joy, holding the product. Subtle yellow lightning-bolt graphic bottom-left. White rounded contact pill bottom center.",
  },
  {
    id: "potd-shosial-yellow",
    label: "Sunny Yellow",
    image: "/design-templates/potd-shosial-yellow.jpeg",
    prompt:
      "Tall 4:5 yellow-to-cream background with subtle pattern. Small circular logo top-left, social handle row top-right. Centered huge bold black sans headline (mixed weights, one word lowercase script). Below: jolly person in yellow looking down at phone laughing, with two floating 3D alarm-clock props and small lightning sparks beside them. Bottom strip in solid yellow with two black rounded pill chips for URL + CTA.",
  },
  {
    id: "potd-pandar-rewards",
    label: "Green Reward",
    image: "/design-templates/potd-pandar-rewards.jpeg",
    prompt:
      "Tall 4:5 soft yellow background with floating money/leaf doodles. Wordmark top-center. Big bold black sans headline center-top with one word in green outlined letters. Short subtitle below. Three stacked translucent glassy pill chips on the left, each with small icon + short label. Right: jolly person in green tee fist-pumping, mid-laugh, looking at phone. Bottom-left: small caps tagline and two app-store badges.",
  },
  {
    id: "potd-binna-research",
    label: "Cinematic Blue",
    image: "/design-templates/potd-binna-research.jpeg",
    prompt:
      "Tall 4:5 cinematic deep blue room with window light streaks casting venetian shadows. Small wordmark top-left, tiny credit top-right. Bold white sans headline upper-left in 3 lines, one word highlighted in lighter blue with a soft underline swoosh. Hero: focused person at a desk with warm lamp, branded tee, writing in a notebook. Tiny paragraph caption bottom-left. Bottom-right: rounded glassy pill button with small icon.",
  },
  {
    id: "potd-earn-school",
    label: "Neon Night",
    image: "/design-templates/potd-earn-school.jpeg",
    prompt:
      "1:1 dark background with subtle neon-green glow halo behind the subject. Two small logos top corners. Big bold light-grey/silver sans headline upper-left in 3 short lines. Short supporting paragraph below with a couple of words in green accent. Right side: jolly young person in suit smiling brightly with backpack, money/notes flying around. Bottom: green rounded CTA pill on left, dark contact pill with WhatsApp icon on right.",
  },
  {
    id: "potd-creating-significance",
    label: "Teal Workspace",
    image: "/design-templates/potd-creating-significance.jpeg",
    prompt:
      "Tall 4:5 calm teal-green wall background. Small logo top-left, small 'event/meeting' label top-right. Massive bold white display headline upper-left in 2 lines, short white subtitle below. Lower section: warm photographic foreground of an inviting workspace (chair, desk, plants in yellow pots). Mid-section meta row: small profile block on left, small calendar+date chip center, small clock+timezones on right.",
  },
];

