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
  {
    id: "college-sensei",
    label: "Soft Service List",
    emoji: "📚",
    image: "/design-templates/college-sensei.jpeg",
    prompt:
      "Soft warm beige/cream background with a centered logo card at the very top, large dark serif headline with one accent-color word, hero subject centered-left with hand-drawn lightning-bolt sketch accents, small two-line subline pinned mid-right, glassy translucent rounded card on the right listing 5-7 short bullet items, dark rounded contact bar at the bottom with social icons + handle.",
  },
  {
    id: "collaborate-create",
    label: "Editorial Dark",
    emoji: "🤝",
    image: "/design-templates/collaborate-create.jpeg",
    prompt:
      "Dark almost-black background with a soft glowing orb behind the subjects, small orange caps eyebrow top-left, huge bold white serif/sans headline stacked over two lines, short two-line subline beneath, hero subject(s) bleeding off the right edge, rounded orange logo card bottom-left, small translucent 'Follow us' chip with social icons + handle bottom-right.",
  },
  {
    id: "opportunities-scholarship",
    label: "Bold Lifestyle",
    emoji: "🎯",
    image: "/design-templates/opportunities-scholarship.jpeg",
    prompt:
      "Real lifestyle photograph as the full background, bold white sans headline stacked over four lines on the lower-left with the final line highlighted in yellow, small outlined-pill secondary line beneath, vivid red rounded logo card pinned bottom-left, white pill at the bottom-right with social icons + handles.",
  },
  {
    id: "red-creative",
    label: "Red Spotlight",
    emoji: "🔴",
    image: "/design-templates/red-creative.jpeg",
    prompt:
      "Deep red radial spotlight background fading to black with subtle light streaks at the edges, small avatar + wordmark + handle row top-left with a thin horizontal rule, large bold serif headline centered where the last word sits inside an orange rounded highlight box, hero subject centered-bottom, small circular icon button bottom-right.",
  },
  {
    id: "trusted-traders",
    label: "Warm Glow",
    emoji: "💱",
    image: "/design-templates/trusted-traders.jpeg",
    prompt:
      "Dark background with a warm amber radial glow behind the subjects and softly bokeh'd floating coins/orbs on the sides, small wordmark top-right, big bold white headline stacked over two lines, short single-line subline beneath, hero subject(s) centered-lower, dark contact strip at the bottom with social icons + handles on the left and a small QR code on the right.",
  },
  {
    id: "stay-connected-data",
    label: "Cinematic Bokeh",
    emoji: "📶",
    image: "/design-templates/stay-connected-data.jpeg",
    prompt:
      "Cinematic dark background with a soft warm bokeh blur, thin horizontal rule with a small logo + wordmark on the left and a small URL on the right, big bold white headline stacked over three lines with the final word highlighted in orange, hero subject(s) centered-lower, glassy rounded chip on the lower-left with a short 2-line sentence, small app-store + play-store badge row pinned at the very bottom-left with a one-line caption beneath.",
  },
  {
    id: "happy-new-week",
    label: "Warm Overlay",
    emoji: "☀️",
    image: "/design-templates/happy-new-week.jpeg",
    prompt:
      "Real lifestyle photograph with a warm orange gradient overlay on the lower half, small logo card top-left, small hashtag eyebrow top-right, huge bold white sans headline stacked over three lines with a tiny yellow sparkle accent, short two-line subline beneath, thin yellow underline rule, glassy translucent contact pill pinned at the very bottom with phone number + social icon + handle.",
  },
  {
    id: "its-a-new-week",
    label: "Script + Block",
    emoji: "📅",
    image: "/design-templates/its-a-new-week.jpeg",
    prompt:
      "Real lifestyle photograph as the full background, small handwritten yellow script eyebrow line, huge bold white sans headline stacked over three lines, short single-line subline beneath, small chevron arrow accent on the right, small white rounded sticky-note card on the right listing 4-5 short value words with a tiny eyebrow label, big white rounded contact bar at the bottom with three icon+text columns (web / handle / email) and a thin separator with address.",
  },
  {
    id: "dia-juventude",
    label: "Stacked Block Type",
    emoji: "🟧",
    image: "/design-templates/dia-juventude.jpeg",
    prompt:
      "Real lifestyle photograph as the full background, small orange-bordered date pill eyebrow, huge bold white headline broken into stacked syllable blocks on the left (each syllable on its own line, dark navy background card behind), small heart accent, dark rounded translucent card on the right with a short 3-line sentence, bottom strip with WhatsApp icon + phone, social icon row + handle, and a short paragraph on the right.",
  },
  {
    id: "june-yellow",
    label: "Mega Display Type",
    emoji: "🟡",
    image: "/design-templates/june-yellow.jpeg",
    prompt:
      "Vivid yellow background with faint repeated outline wordmark watermark, small dark logo + wordmark centered at the top, ENORMOUS hand-drawn rounded white display word as the centerpiece dominating the canvas, small white tagline stacked over three lines on the lower-left with a thin underline rule, hero subject on the right with hand-to-mouth gesture.",
  },
  {
    id: "myth-vs-fact-teal",
    label: "Myth vs Fact Teal",
    emoji: "🟢",
    image: "/design-templates/myth-vs-fact-teal.jpeg",
    prompt:
      "Dark teal-to-black room background with soft circular green glow center, small logo top-left, huge two-word headline split into teal + white words at top center, two stacked glassy translucent dark pill cards centered with rounded corners, each card tagged with a small bright label chip (red on the first, green on the second) sitting on its top edge — first card label reads MYTH, second reads FACT, each card holds a two-line short statement in white. Bottom-left WhatsApp label with phone number and tiny social icons row. Clean, premium, minimal.",
  },
  {
    id: "lime-chat-cards",
    label: "Lime Chat Cards",
    emoji: "💬",
    image: "/design-templates/lime-chat-cards.jpeg",
    prompt:
      "Vivid lime-yellow flat background, small dark logo centered top, two short white headline lines under it, two stacked dark glassy rounded pill cards angled like chat bubbles — each card has a small white rounded square icon on the left and a bold white label + 2-line message on the right, tiny black sparkle accents around the cards, small dark mail icon centered below cards, white pill contact bar at the bottom with email/phone. Clean, modern, premium.",
  },
  {
    id: "myth-fact-green-glow",
    label: "Myth Fact Green Glow",
    emoji: "⚡",
    image: "/design-templates/myth-fact-green-glow.jpeg",
    prompt:
      "Pitch black background with subtle hex-grid texture and a vivid radial green glow on the right edge, small logo + wordmark top-left, small Follow-us bookmark tag top-right, two stacked glassy translucent dark pill cards centered — each tagged with a small bright label chip on its top edge (red MYTH on the first, lime FACT on the second), each card holds a two-line short statement in white with key words bolded. Bottom bar with tiny social icons row left and a small white rounded CTA pill on the right. Premium, techy, minimal.",
  },
  {
    id: "lime-single-card",
    label: "Lime Single Card",
    emoji: "🟡",
    image: "/design-templates/lime-single-card.jpeg",
    prompt:
      "Pure black background, small dark logo centered top, single white headline line under it, ONE large lime-yellow rounded pill card centered with a small dark rounded square icon on the left and a 3-line short message in dark text on the right, soft drop shadow under the card, tiny black sparkle accents around it, small dark mail icon centered below, white pill contact bar at the bottom with email. Clean, bold, premium.",
  },
  {
    id: "identity-why-us",
    label: "Identity Why Us",
    emoji: "✅",
    image: "/design-templates/identity-why-us.jpeg",
    prompt:
      "Dark almost-black background with subtle wavy line texture and a faint giant rotated wordmark watermark on the right edge, small logo + wordmark centered top, large white display headline lower-left with a single accent-color word + accent question mark, one large rounded dark glassy card centered holding 4 stacked rows — each row is a thin dark rounded pill with a small accent-color rounded square icon (arrow-up-right) on the left and a short white label on the right. Small email line centered at the bottom. Clean, premium, branded.",
  },
  {
    id: "identity-welcome",
    label: "Identity Welcome",
    emoji: "👋",
    image: "/design-templates/identity-welcome.jpeg",
    prompt:
      "Dark almost-black background with subtle wavy line texture and a faint giant rotated wordmark watermark on the right edge, small logo + wordmark centered top, ENORMOUS 4-line display headline left-aligned filling most of the canvas with one accent-color word in the middle, small dashed rounded outline pill under the headline holding a short 2-word CTA with one accent-color word, small email line centered at the bottom. Editorial, premium, minimal.",
  },
  {
    id: "raffin-penguin",
    label: "Editorial Hero Quote",
    emoji: "🐧",
    image: "/design-templates/raffin-penguin.jpeg",
    prompt:
      "Deep navy-to-purple radial gradient background, small logo top-right, large multi-line display headline upper-left in quotes with a soft purple-to-white gradient on the words, short 3-line italic-feeling subtitle underneath in white, hero subject photo on the right occupying half the canvas, two small rounded pill chips at the bottom corners (one mint-green left, one mint-outlined right) each with a tiny label. Cinematic, editorial, premium.",
  },
  {
    id: "arvaya-night-bold",
    label: "Spotlight Bottle",
    emoji: "🌌",
    image: "/design-templates/arvaya-night-bold.png",
    prompt:
      "1:1 deep teal-to-black radial spotlight background. Small wordmark/logo centered at the top. Large bold sans headline upper-center in 2 lines, mixing solid white words with a softer silver-gradient accent word. Hero product centered on a subtle reflective floor with a glowing halo behind it. Two-line small light-grey tagline pinned at the bottom center. Premium, cinematic, lots of negative space.",
  },
  {
    id: "arvaya-bottle-holds-more",
    label: "Glass Story Cards",
    emoji: "🪟",
    image: "/design-templates/arvaya-bottle-holds-more.png",
    prompt:
      "1:1 deep black background with soft side spotlights. Small logo top-right. Two-line bold display headline centered upper, second line with a soft silver-gradient sheen. Tiny 2-line italic subtitle directly below. Hero product centered. Two translucent frosted-glass rectangular cards float symmetrically left and right behind the product, each containing a short 3-word stacked phrase in light grey. Single-line elegant tagline pinned bottom-center. Editorial, moody, premium.",
  },
  {
    id: "estilocus-intense",
    label: "Giant Word Behind Hero",
    emoji: "🟫",
    image: "/design-templates/estilocus-intense.png",
    prompt:
      "1:1 dark amber/gold radial background with smoky haze at the base. Small caps tracked tagline pinned at the top center. Massive bold display word stretched edge-to-edge in mid-canvas, sitting BEHIND the hero product (product overlaps the middle letters). Hero product centered on a dark stone podium. Left side: small caps 'PRICE' label with a big price figure beneath. Right side: small caps 'NOW UP TO' label with a big discount figure beneath. Tiny centered footer line at the very bottom. Cinematic, premium, moody.",
  },
  {
    id: "rsm-collection",
    label: "Lineup Collection",
    emoji: "🧴",
    image: "/design-templates/rsm-collection.png",
    prompt:
      "1:1 deep black wood-textured background with subtle vertical grain. Centered wordmark logo at the top with a tiny caps label beneath. Centered 3-line list of short brand/keyword names separated by middots, in light grey sans. Hero: a tightly-grouped lineup of multiple product bottles photographed together as one cluster, lit from above. Bottom row: small dark 'SHOP NOW' pill on the left, a thin vertical divider, then a short script tagline. Bottom strip: phone-icon prefix followed by 2-3 contact numbers spaced evenly. Editorial, premium, retail.",
  },
  {
    id: "special-scents-mono",
    label: "Mono Editorial Card",
    emoji: "🤍",
    image: "/design-templates/special-scents-mono.png",
    prompt:
      "Tall 4:5 black background with subtle diagonal light streaks. Logo + wordmark top-left. Top-right: small dark rounded square 'Buy NOW' card with a tiny cart icon and arrow chip. Left column: huge bold 3-line stacked headline in soft silver gradient, then a small script word + supporting phrase below. Then a dark rounded panel titled 'We Deal On' containing a 6-7 item bulleted list with small chevron bullets. Bottom-left: small 'Contact Us' rounded pill. Right side: hero cluster of product bottles arranged diagonally with a small QR code chip near the base. Bottom strip: phone/whatsapp + social handle row. Monochrome, premium.",
  },
  {
    id: "special-scents-gold-purple",
    label: "Gold Headline + Purple Pop",
    emoji: "💜",
    image: "/design-templates/special-scents-gold-purple.png",
    prompt:
      "Tall 4:5 deep brown-to-black background with subtle diagonal light streaks. Logo + wordmark in warm gold top-left. Top-right: dark rounded square 'Buy NOW' card with a vivid magenta chip + cart icon. Left column: huge 3-line stacked headline alternating gold and white words, then a script accent word + supporting phrase. Below: dark rounded outlined panel with a magenta 'We Deal On' tab header and a 6-7 item bulleted list with small magenta chevrons. Bottom-left: magenta rounded 'Contact Us' pill. Right side: hero cluster of product bottles with a few floating purple butterfly graphics, small QR chip near base. Bottom strip: phone/whatsapp + social handle row. Premium retail.",
  },
  {
    id: "billion-fragrance",
    label: "Big Number Hero",
    emoji: "1️⃣",
    image: "/design-templates/billion-fragrance.png",
    prompt:
      "Wide square deep navy-to-black background with soft blue side glows. Centered top: a HUGE numeric '1' in metallic gold paired with a bold word beside it and a script accent word beneath. Left mid: small gold 'We Sell' chip followed by a 3-line stacked benefits list in white sans. Centered: an elegant gold script accent word floating above the lineup. Hero: a tightly-grouped lineup of multiple product bottles arranged in a row across the lower half. Bottom: a thin centered contact line with two phone numbers separated by a slash and tiny social icons on the right.",
  },
  {
    id: "velora-standout",
    label: "Lifestyle Hand + Glow",
    emoji: "✋",
    image: "/design-templates/velora-standout.png",
    prompt:
      "Tall 4:5 deep purple background with soft floating cloud puffs. Top-left: white wordmark logo. Top-right: magenta rounded pill chip with a short tagline. Upper area: bold 2-line headline mixing cream and magenta words with a sans-serif rounded display face, plus a 2-line supporting subtitle in white. Middle hero: a real human hand reaching down toward a centered glowing hero product, with a hand-drawn yellow lasso/halo loop encircling it. Lower mid: a row of secondary product bottles arranged on a reflective surface flanking the hero. Bottom: white rounded 'SHOP NOW' pill on the left, then a 2x2 contact grid on the right with whatsapp/phone/instagram/location icons each paired with small text.",
  },
  {
    id: "valoux-notes",
    label: "Annotated Hand Hero",
    emoji: "✍️",
    image: "/design-templates/valoux-notes.png",
    prompt:
      "Tall 4:5 pure black background. Tiny tracked caps category label centered at the top. Hero: a real hand holding a single product bottle dead-center, lit softly. Three short annotation labels float around the hero (top-right, mid-left, bottom-left), each with a small bold title and 2-3 line description in white sans, connected to the product by thin hand-drawn curved arrows. Centered at the very bottom: a small social handle in light grey. Editorial, minimal, magazine-grade.",
  },
  {
    id: "celestial-musk-notes",
    label: "Bold Question + Notes",
    emoji: "🌿",
    image: "/design-templates/celestial-musk-notes.png",
    prompt:
      "Tall 4:5 warm light-grey background with a faint olive palm-leaf shadow on the right. Massive bold black sans question headline upper-left in 2-3 stacked lines. Hero product centered-lower, tilted slightly. Three short annotation labels float around the hero, each with a small bold title and a 2-line description in dark grey, connected to the product by thin hand-drawn brown curved arrows. Editorial, magazine-grade, lots of negative space.",
  },
  {
    id: "lomas-not-for-everyone",
    label: "Echo Headline",
    emoji: "🔁",
    image: "/design-templates/lomas-not-for-everyone.png",
    prompt:
      "1:1 soft white-to-light-grey vignette background. Centered massive bold sans headline in 2 lines, mixing a heavy uppercase word with a flowing italic script accent word. Behind/below the headline, the second word repeats 4-5 times stacked vertically as faint ghost echoes fading into the background. Hero product centered, slightly tilted, casting a soft shadow over the echo type. Minimal, editorial, premium.",
  },
  {
    id: "scent-dynasty-romance",
    label: "Word Behind Bottle",
    emoji: "💎",
    image: "/design-templates/scent-dynasty-romance.png",
    prompt:
      "1:1 soft cream-grey background. Centered top: small icon + wordmark logo. Mid-canvas: a single huge bold uppercase word stretched edge-to-edge sitting BEHIND the hero product (product overlaps the middle letters). Hero product centered, tilted slightly, casting a soft shadow. Lower-center: small caps eyebrow line followed by a 2-line bold dark title. Tiny centered URL pinned at the very bottom inside a thin rule. Minimal, editorial, premium.",
  },
  {
    id: "mb-parfums-luxe",
    label: "Teal Card Layout",
    emoji: "🟢",
    image: "/design-templates/mb-parfums-luxe.jpeg",
    prompt:
      "Tall 4:5 deep teal background. Top-right: small rounded teal card with a logo icon and brand name. Centered upper-mid: a large rounded translucent panel containing a 2-line bold white serif headline, a 3-line short paragraph beneath, and a small cream rounded pill 'availability' chip with a tiny gold seal icon. Hero: two product bottles overlapping diagonally on the right, one with a soft pink ribbon bow. Bottom: two long pill chips side by side, one with a phone icon + number, one with a location icon + address. Premium, brand-flyer style.",
  },
  {
    id: "royal-luxury-spray",
    label: "Service List Hero",
    emoji: "💧",
    image: "/design-templates/royal-luxury-spray.jpeg",
    prompt:
      "Tall 4:5 deep blue background with subtle prism light leaks. Top-left: logo + wordmark. Top-right: small white outlined 'SHOP NOW' pill. Left column: bold 2-line outlined-display headline with a thin yellow underline swoosh, then a 2-line supporting paragraph in white sans. Below: a translucent dark rounded panel with a blue 'We Sell:' tab header and a 7-9 item bulleted list with small blue check-circle bullets. Right side: a tightly-grouped lineup of multiple product bottles with dynamic blue fabric flowing around them. Bottom: a white curved bottom bar with 'Reach Us Via:' label and a stacked contact list (phone, whatsapp, tiktok, email) with small icons.",
  },
  {
    id: "dalpha-perfume-house",
    label: "Model + Lineup Hero",
    emoji: "💚",
    image: "/design-templates/dalpha-perfume-house.jpeg",
    prompt:
      "Tall 4:5 deep green background with subtle smoky textures. Top-left: logo + wordmark. Top-right: small dashed-outlined caps tagline pill. Left column: huge bold 3-line stacked white display headline with a subtle outline glow and a thin green underline swoosh, then a 2-line supporting paragraph. Below: a translucent dark rounded glass panel with a green 'OUR SERVICES' tab header and a 6-item bulleted list with small green check-badge bullets. Right side: a smiling person photo holding a product near their face, a small 'Tested And Trusted!' green badge floating top-right, plus a tightly-grouped lineup of multiple product bottles arranged at the lower-right. Bottom: white curved bottom bar with a green 'Home Delivery' circular badge on the left and a 3-column contact row (whatsapp, instagram, tiktok) each with small icons.",
  },
  {
    id: "data-reloaded-cream",
    label: "Cream Hashtag Hero",
    emoji: "📱",
    image: "/design-templates/data-reloaded-cream.png",
    prompt:
      "Tall 4:5 soft cream-to-blush gradient background with vibrant red ribbon-like swooshes flowing across the lower half. Top-left: small circular logo + 2-line wordmark. Top-right: tiny 'Please Visit:' URL line. Centered upper area: huge bold black hashtag headline word stacked on top of a giant bold red second word, then a 2-line dark serif/sans subline beneath. Centerpiece: a large hero phone/product mockup centered-bottom with a smiling person on each side (left + right) reacting to it, both holding their own phones. Bottom-left: small Google Play + App Store badge row with a tiny 'Download to get started' caption.",
  },
  {
    id: "aladun-fitfam-yellow",
    label: "Pidgin Yellow Duo",
    emoji: "🍲",
    image: "/design-templates/aladun-fitfam-yellow.png",
    prompt:
      "Tall 4:5 soft pale-yellow background with faint repeated food-icon watermark and a green leaf accent. Top-left: small square logo card. Top-right: tiny '#tagline' caps line. Upper area: bold 2-line dark headline with the final 2 words in a vivid orange-to-red gradient and a question mark, then a short 3-line subline beneath in dark text. Centerpiece: two smiling people (one in a branded cap, one beside them) bleeding off the bottom edge. Mid-overlay: one orange-to-red gradient rounded pill button on the left and one white rounded pill button on the right (CTA + secondary). Bottom: dark rounded glass contact bar with an Instagram icon + handle, a thin divider, and a phone icon + number.",
  },
  {
    id: "bites-shano-crush",
    label: "Crunch Snack Cream",
    emoji: "🍔",
    image: "/design-templates/bites-shano-crush.png",
    prompt:
      "Tall 4:5 warm cream paper-textured background with floating chili peppers and snack pieces around the edges. Top-left: small playful brand logo badge. Centered upper: 2-line headline where line 1 is a vivid orange-to-yellow gradient bold word and line 2 is a huge bold dark display word, then a centered 2-line short subline beneath. Mid-left: tiny 2-row checkbox-style value list (one short label per row). Centerpiece: a wide-eyed person holding a hero food item (burger/snack) up to their face, bleeding off the bottom. Sides: small platters of food peeking from bottom-left and bottom-right corners. Bottom: dark rounded contact bar with thin orange accent line, holding 3 icon+text columns (phone, instagram, email).",
  },
  {
    id: "lacremeux-taste-grabs",
    label: "Red Pattern Wrap",
    emoji: "🌯",
    image: "/design-templates/lacremeux-taste-grabs.png",
    prompt:
      "Tall 4:5 vivid red background with a faint repeating geometric tribal pattern watermark. Top-right: small circular dark logo badge. Upper-center: huge bold white display headline word with a thin italic 3-word subline beneath, plus a small yellow lightning-bolt accent stroke. Centerpiece: a person taking a bite of a hero food item on the left while a giant second hero item rises diagonally on the right with fresh garnish flying around it. Lower: a short italic 2-line white subline centered, with a small red lightning underline accent. Bottom: thin pale-cream contact strip with 3 small icon+text items (email, whatsapp+phone, instagram handle).",
  },
  {
    id: "quickie-bites-wrap",
    label: "Split Cream Orange",
    emoji: "🥙",
    image: "/design-templates/quickie-bites-wrap.png",
    prompt:
      "Tall 4:5 canvas split diagonally — left two-thirds soft cream, right third vivid orange with a faint repeated wordmark watermark. Top-left: small rounded yellow brand logo card. Top-right: tiny dark '#hashtag' caps line. Left column: huge bold 3-line dark display headline with small sparkle accents, a short 2-line dark subline beneath, then a small 'Download app on' caption with stacked Google Play + App Store badges. Centerpiece: a giant hero food item (wrap/sandwich) bleeding diagonally from the right side with sauce drips and floating ingredients. Bottom: a long pill divided into a yellow left half with a globe icon + website URL and a dark right half with social icons + handle.",
  },
  {
    id: "peps-bite-happiness",
    label: "Pink Swirl Portrait",
    emoji: "💕",
    image: "/design-templates/peps-bite-happiness.png",
    prompt:
      "Tall 4:5 soft cream background with a large flowing pink ribbon swirl looping across the canvas. Top-center: small brand logo card. Upper area: 2-line headline where line 1 is bold dark display text and line 2 is a bold pink/red display word, then a short italic single-line subline beneath. Centerpiece: a smiling person taking a bite of a hero food item, framed inside the pink swirl loop, with two extra hero food items floating bottom-left and bottom-right against a soft sky/grass scene. Bottom: dark rounded contact bar with melting drip edges, holding a left column of social icons + handle + phone and a right column with a location pin + 2-line address.",
  },
  {
    id: "peps-every-wrap-masterpiece",
    label: "Spotlight Masterpiece",
    emoji: "🔦",
    image: "/design-templates/peps-every-wrap-masterpiece.png",
    prompt:
      "Tall 4:5 dark moody background with a single bright spotlight beam from the top center casting smoke and glowing dust around a hero food item. Top-left: brand logo card. Top-right: tiny italic tagline line. Centerpiece: a giant hero food item floating centered-upper with fresh garnish, sauce drops and ingredients orbiting it in a swirling motion-blur ring. Lower-center: a large orange-to-red gradient rounded card holding a 2-line bold white headline and a 2-line shorter subline, with a small 3D bell icon poking out the top-left corner. Bottom: dual contact bars side-by-side — left dark with melting drip edge holding social icons + handle + phone, right yellow with melting drip edge holding location pin + 2-line address.",
  },
  {
    id: "peps-hunger-wrap-it",
    label: "Menu Cards Dark",
    emoji: "📋",
    image: "/design-templates/peps-hunger-wrap-it.png",
    prompt:
      "Tall 4:5 dark interior scene background with warm red ambient lighting on the left. Top-left: brand logo card. Top-right: tiny italic tagline line. Left side: a smiling person holding a hero food item up to their face, lit by warm light. Upper-right: bold 2-line orange-to-yellow gradient display headline with a question mark and exclamation mark, then a 2-line dark-text subline beneath. Mid-right: 3 stacked rounded menu cards (alternating dark / orange / orange) each holding a small thumbnail photo on the left and a bold caps title + 2-line description on the right. Bottom: dual contact bars side-by-side with melting drip edges — left dark with social icons + handle + phone, right yellow with location pin + 2-line address.",
  },
  {
    id: "jollof-republic-iykyk",
    label: "Orange Wave Plate",
    emoji: "🍛",
    image: "/design-templates/jollof-republic-iykyk.png",
    prompt:
      "Tall 4:5 vivid orange background with faint repeating wave-line watermark texture. Top-left: small brand logo + wordmark. Top-right: tiny outlined-pill caps tagline. Upper area: huge bold 2-line cream display headline with ellipsis, then a thin outlined rounded pill beneath holding a single short white sentence. Centerpiece: a hand reaching up from the bottom holding a hero plated dish with steam rising, plus small floating chili pepper accents on the sides. Bottom: dark rounded contact bar with a small wordmark on the left, an App Store + Google Play badge row in the middle, and small social icons + handle on the right.",
  },
  {
    id: "aladun-bold-spicy-grilled",
    label: "Bold Spicy Plate",
    emoji: "🍗",
    image: "/design-templates/aladun-bold-spicy-grilled.png",
    prompt:
      "Tall 4:5 vivid orange background with faint repeated food-icon watermark and small floating chili pepper accents. Top-left: small square logo card. Top-right: tiny '#tagline' caps line. Upper area: bold 2-line headline where line 1 mixes white + dark words and line 2 ends with a dark accent word, then a centered 3-line short paragraph subline beneath in white. Centerpiece: a hero plated dish (grilled meat with veggies) tilted slightly, with a small floating white 'Order Now' rounded label pill on the left edge and a small floating dark-green 'Hot N Spicy' rounded label pill on the right edge. Lower-right: tiny 2-line value list with small check-badge icons. Bottom: dark rounded contact bar with thin yellow accent line, holding 3 icon+text columns (instagram, phone, location).",
  },
  {
    id: "asabell-online-baking-class",
    label: "Baking Class Poster",
    emoji: "🎂",
    image: "/design-templates/asabell-online-baking-class.png",
    prompt:
      "Tall 4:5 soft peach paper-textured background with faint botanical line art doodles at the edges. Top-left: elegant bakery logo + tiny 'presents' label. Center-left: ENORMOUS stacked condensed baking-course headline filling most of the height in deep burnt-orange with soft inner glow and shadow. Top-right: hand-drawn black marker circle around a bold registration-fee price callout with a smaller crossed old price. Right upper-mid: a torn-paper bank/payment note card. Lower-left: an off-white ripped-paper note listing 5-7 class items in short bullet lines with a tiny bonus section. Bottom-right: a huge glossy chocolate cake hero with berries, cropped dramatically off the edge.",
  },
  {
    id: "nikkys-bake-house",
    label: "Warm Bakehouse Glow",
    emoji: "🧁",
    image: "/design-templates/nikkys-bake-house.png",
    prompt:
      "Tall 4:5 cozy golden-brown bakery interior with heavy warm bokeh lights and shallow depth of field. Top-left: layered bakery logo lockup with a red ribbon tab. Center-left: distressed bold white headline stacked over 3-4 lines with a smaller accent line beneath. Upper-mid: torn-paper badge with a short freshness phrase and one floating pastry image above. Centerpiece: smiling baker/person holding a tray of pastries with one large blurred pastry in the foreground for depth. Lower-left: short white paragraph copy. Bottom-center: outlined rounded CTA pill with arrow icon and exact button feel. Bottom-right: two compact phone-number rows with small icons.",
  },
  {
    id: "uje-cakes-more",
    label: "Bakery Services Grid",
    emoji: "🍩",
    image: "/design-templates/uje-cakes-more.png",
    prompt:
      "Tall 4:5 rich dark brown-to-orange glowing background with soft circular light streaks. Top-left: round bakery logo. Left upper area: elegant serif bakery headline split across 2 lines in cream and warm orange. Left middle: translucent rounded services card with a bright orange section tab and a 5-7 item bullet list using tiny rosette/star bullets. Right: smiling baker/person holding a large decorated cake, cropped from waist-up. Lower middle: a row of 4 rounded-square product thumbnails with orange borders. Bottom: wide cream rounded contact bar with big phone number on the left, a tiny vertical rolling-pin divider, and instagram handle/contact line on the right. Top-right: slim vertical tag card for home delivery.",
  },
  {
    id: "jennys-cake-more",
    label: "Minimal Cake Listing",
    emoji: "🍰",
    image: "/design-templates/jennys-cake-more.png",
    prompt:
      "Tall 4:5 clean cream background with soft warm vignettes in the corners. Top-center: simple cupcake logo with bakery wordmark. Middle: huge geometric display headline across 2 lines using brown and black for contrast. Lower-left: brown product list card with a bright orange header tab and 6-8 short bullet items. Lower-right: neat hero cluster of a frosted cake with cupcake and cookies on a soft floor shadow. Bottom: thick horizontal brown-to-orange footer band containing a centered outlined contact pill with a phone icon and bold number.",
  },
  {
    id: "delicious-cupcake-dark",
    label: "Dark Cupcake Hero",
    emoji: "🧁",
    image: "/design-templates/delicious-cupcake-dark.png",
    prompt:
      "Tall 4:5 deep chocolate-black background with a subtle red glow center and giant low-opacity repeated word watermark on the right. Top-left: tiny bold eyebrow phrase. Upper-left: small outlined glass label above an oversized 2-line condensed white headline. Between text and hero: a dotted path doodle leading toward the product. Right: giant hyper-real chocolate cupcake with glossy frosting and sliced strawberry on top. Lower-left: short white paragraph copy and a bold cream rounded CTA pill. Bottom-left: simple social icon row plus handle.",
  },
  {
    id: "baked-fresh-cupcakes",
    label: "Bakery Discount Splash",
    emoji: "🍫",
    image: "/design-templates/baked-fresh-cupcakes.png",
    prompt:
      "Tall 4:5 glossy brown radial background with faceted rays and dramatic food-ad lighting. Top-left: red ribbon brand badge. Top-right: tiny website row with globe icon. Upper-left: large yellow-and-white condensed headline stacked over 3 lines with a short white description beneath. Center-right: giant flying muffin/cupcake hero angled diagonally with chocolate chips scattering. Bottom: glossy liquid-chocolate wave crossing the canvas. Lower-left on top of the wave: bright red starburst discount badge.",
  },
  {
    id: "dia-do-panificador-bread",
    label: "Bread Day Homage",
    emoji: "🥖",
    image: "/design-templates/dia-do-panificador-bread.jpeg",
    prompt:
      "Tall 4:5 warm orange bakery scene with atmospheric smoke and soft vignette edges. Top-center: elegant script headline celebrating a bread day/event with a tiny date arc above. Center: woven basket overflowing with artisan bread rolls, lit dramatically, with a few floating blurred bread pieces around the scene. Left-middle: stacked short copy blocks in dark translucent rectangles with selected words bolded. Lower-middle: handwritten script accent stroke. Bottom: slim social row, tiny website text, and a minimal logo tag. Rich, nostalgic, premium bakery mood.",
  },
  {
    id: "padaria-history-bread",
    label: "Soft Bread Story",
    emoji: "🥐",
    image: "/design-templates/padaria-history-bread.jpeg",
    prompt:
      "Square or tall-leaning soft beige bakery poster with a calm monochrome palette. Left: clean sans headline in white and brown over 3-4 lines, followed by a short paragraph and a small rounded CTA. Right: large wicker basket full of bread rolls and artisan loaves viewed from above, cropped generously. Around the bread: small circular social/heart badges. Bottom-left: oversized abstract script stroke partially bleeding off the canvas. Minimal, warm, editorial bakery feel.",
  },
  {
    id: "baking-days-cafe",
    label: "Search Bar Cake",
    emoji: "🔎",
    image: "/design-templates/baking-days-cafe.jpeg",
    prompt:
      "Tall 4:5 moody café interior with shallow blur and warm wooden tones. Top-left: playful bakery logo. Top-right: tiny social icon row. Upper-middle: oversized floating search-bar UI card with typed query suggestions underneath, styled like a modern search popup. Bottom-center: hero slice of chocolate cake on a plate with strawberries and sauce in sharp focus. Bottom strip: two location/address blocks with phone numbers separated by a slim divider. Premium café ad meets digital discovery theme.",
  },
  {
    id: "bakery-hub-desserts",
    label: "Dessert Glass Panel",
    emoji: "🍓",
    image: "/design-templates/bakery-hub-desserts.jpeg",
    prompt:
      "Tall 4:5 cinematic dessert poster with warm chocolate-brown background and tabletop lighting. Top-right: round bakery seal logo. Upper-left: clean mixed-weight headline where key words are highlighted in warm peach/orange. Center: elegant plated cake slice hero with strawberry, mint, and glossy chocolate drip. Left-middle overlapping the hero: translucent frosted-glass UI panel with faint menu items inside, used purely as a design element. Bottom-left: bold phone-order line with WhatsApp icon. Bottom-right: location pin and address block. Refined, premium dessert advertising.",
  },
  {
    id: "potd-afeko-delivery",
    label: "Doorstep Delivery",
    emoji: "📦",
    image: "/design-templates/potd-afeko-delivery.jpeg",
    prompt:
      "Tall 4:5 lifestyle poster. Right two-thirds is a vivid royal-purple flat panel with subtle vertical stripe texture; left third is a real interior doorway photograph showing a smiling delivery courier in a purple polo and helmet handing a purple cardboard box to a customer in a cream shirt. Top-right: tiny white reg-no eyebrow line. Mid-right: bold white sans headline stacked over four lines with one accent word highlighted in a yellow rounded box. Below the headline: short 5-line white body paragraph. Bottom strip: full-width white bar with a small circular logo, social handle row with bird/camera icons, WhatsApp icon + phone number on the right, then a thin yellow accent rule at the very bottom edge. Clean, premium, doorstep-delivery energy.",
  },
  {
    id: "potd-binna-research",
    label: "Cinematic Window Light",
    emoji: "💡",
    image: "/design-templates/potd-binna-research.jpeg",
    prompt:
      "Tall 4:5 cinematic poster on a deep teal-navy background with soft window-blind light streaks raking across the right side. Top-left: small white wordmark logo. Top-right: tiny '-YourCreator' caps eyebrow. Upper-left: huge bold white sans headline stacked over three lines where the final word is filled in light cyan and underlined with a thin cyan curve. Lower-center: hero subject seated at a wooden desk under a vintage desk lamp, writing in a notebook, wearing a printed bandana and a white tee with the brand logo. Bottom-left: short 4-line white body paragraph in small caps-y sans. Bottom-right: rounded translucent cyan-outlined pill button with 'See Caption' label and a small down-arrow icon. Premium editorial advertising mood.",
  },
  {
    id: "potd-creating-significance",
    label: "Teal Workspace",
    emoji: "🪑",
    image: "/design-templates/potd-creating-significance.jpeg",
    prompt:
      "Tall 4:5 corporate event poster on a saturated teal-green flat background with a soft radial highlight upper-right. Top-left: stacked logo lockup with mark + multi-line caps wordmark. Top-right: small white caps eyebrow stacked over two lines. Upper-left: huge bold white serif headline split over two lines, with a thin one-line subtitle directly beneath. Mid-left: small bold name + 4-5 line tiny credentials block in light cream type. Center-right: small calendar icon next to a 3-line cream/orange date block, beside a small hourglass icon next to a 3-line time-zones block (each timezone abbreviation in a different accent color). Lower half: real photograph of a modern workspace — black executive chair at a wooden desk with an open laptop and a yellow vase, flanked by two yellow planters with green palms — bleeding edge-to-edge across the bottom. Refined, corporate, premium.",
  },
  {
    id: "potd-earn-school",
    label: "Neon Student Glow",
    emoji: "💸",
    image: "/design-templates/potd-earn-school.jpeg",
    prompt:
      "Tall 4:5 dark glossy poster on a black-to-deep-navy background with a vivid lime-green radial glow on the right side and faint floating dollar bills around the subject. Top-left: small stacked sponsor logo + caps wordmark. Top-right: small partner logo with green leaf mark. Upper-left: massive bold sans headline stacked over three lines in a soft chrome/silver gradient with subtle inner shadow. Mid-left: short 5-line white body paragraph with two key words highlighted in lime green. Right two-thirds: hero subject — a smiling young man in a sharp navy suit and tie with backpack — half-turned toward camera, lit with a cool blue rim glow, dollar bills tucked in his suit. Bottom-left: lime-green rounded pill CTA button with dark text. Bottom-right: lime-green rounded pill with WhatsApp icon and phone number. Premium youth-finance advertising.",
  },
  {
    id: "potd-hitchpay-purple",
    label: "Purple Living Room",
    emoji: "💳",
    image: "/design-templates/potd-hitchpay-purple.jpeg",
    prompt:
      "Tall 4:5 lifestyle poster. Top two-thirds: real photograph of a smiling subject in a dark sweater seated on a grey sofa in a warm wood-toned living room with a tall bookshelf behind, holding a phone in one hand and a purple bank card in the other, soft window light. Top-left: small white stacked wordmark logo. Bottom third: vivid royal-purple flat panel that bleeds upward into the photo with a soft gradient transition. On the purple panel, mid-left: bold sans headline stacked over three lines where roughly half the words are filled in lighter lavender and half in white, plus a thin one-line subtitle beneath with two key words bolded. Bottom strip: full-width dark rounded bar containing a small white @handle on the left, a centered light-grey 'Coming Soon' label, and two app-store badges on the right (Google Play + App Store). Premium fintech lifestyle.",
  },
  {
    id: "potd-mahir-express",
    label: "Motion Purple",
    emoji: "🚴",
    image: "/design-templates/potd-mahir-express.jpeg",
    prompt:
      "Tall 4:5 dynamic delivery poster on a vivid royal-purple flat background with subtle radiating sunburst lines and a giant white arrow chevron sweeping in from the lower-left edge. Top-left: bold white logo lockup with italic mark + caps wordmark beneath. Top-right: small white social-icon row + @handle. Mid-upper-left: huge bold white sans headline split over two lines with a horizontal motion-blur ghosting trail behind the words to imply speed. Mid-right: short 3-line white body paragraph with key words bolded. Center: hero subject — courier in a brown jacket and helmet, yellow delivery backpack, mid-ride on a black-and-green electric bicycle — angled diagonally into the frame. Bottom-center: white rounded pill bar with the WhatsApp/Call label and phone number. Premium dispatch advertising.",
  },
  {
    id: "potd-mahir-yellow",
    label: "Sunshine Smile",
    emoji: "🛵",
    image: "/design-templates/potd-mahir-yellow.jpeg",
    prompt:
      "Tall 4:5 joyful courier poster on a vivid royal-purple flat background with subtle radiating sunburst lines and a giant white arrow chevron sweeping in from the lower-left edge. Top-left: bold white logo lockup with italic mark + caps wordmark beneath. Top-right: small white social-icon row + @handle. Upper-left: huge bold white sans headline stacked over three lines. Mid-left: short 4-line white body paragraph. Lower-right: hero subject — laughing courier in a yellow tee, yellow cap and round glasses, riding a yellow scooter with side mirrors — bleeding off the right edge. Bottom-center: white rounded pill bar with WhatsApp/Call label and phone number. Bright, happy, premium dispatch advertising.",
  },
  {
    id: "potd-pandar-rewards",
    label: "Sunny Yellow Cards",
    emoji: "🪙",
    image: "/design-templates/potd-pandar-rewards.jpeg",
    prompt:
      "Tall 4:5 cheerful product poster on a soft pastel-yellow flat background with faint floating cash-bill graphics in the corners. Top-center: small dark logo with two-people mark + caps wordmark. Upper-center: huge bold black sans headline stacked over two lines where one accent word is filled in a green gradient with subtle inner shadow. Beneath headline: tight 2-line dark subline with a key phrase bolded. Center-left: stack of three glassy translucent rounded pill cards each containing a small colorful icon on the left (drop, chart, money-bag) and a short bold dark label on the right. Right two-thirds: hero subject — smiling young man in a bright green tee, fist raised in celebration, holding a white smartphone — bleeding off the right edge. Bottom-left: small black vertical rule with a 2-line dark caption beside it, plus Google Play + App Store badges directly beneath. Premium rewards-app advertising.",
  },
  {
    id: "potd-shosial-yellow",
    label: "Schedule Yellow",
    emoji: "⏰",
    image: "/design-templates/potd-shosial-yellow.jpeg",
    prompt:
      "Tall 4:5 bold lifestyle poster split into a soft cream upper half (with faint repeating outline-pattern texture) and a saturated yellow lower third. Top-left: small round yellow logo badge. Top-right: small dark social-icon row + two @handles. Upper-center: massive bold black sans headline stacked over two lines where smaller words sit on the left and the larger emphasis word dominates the right, slightly script-mixed. Center: hero subject — smiling man in a bright yellow sweater and jeans — looking down at a smartphone in his hands, flanked by two floating 3D alarm-clock illustrations and small bright-yellow lightning-bolt accents. Bottom strip on the yellow panel: two dark rounded pill buttons — left pill with a small globe icon and a website URL, right pill with a short 'swipe' label. Premium scheduler-app advertising.",
  },
  {
    id: "potd-swiftcoins-dark",
    label: "Deep Purple Hero",
    emoji: "🪙",
    image: "/design-templates/potd-swiftcoins-dark.jpeg",
    prompt:
      "Tall 4:5 premium fintech poster on a deep eggplant-purple flat background with subtle gradient shading. Top-left: small white stacked logo lockup with circular mark + caps wordmark. Top-right: tiny white caps eyebrow tagline of three short words separated by dots. Mid-left: huge bold white sans headline stacked over four lines with a long em-dash break, sharp and editorial. Below headline: short 5-line white body paragraph in small grey-tinted sans with two key words highlighted in a soft pink-lavender gradient. Right two-thirds: hero subject — a surprised young man in a striped shirt holding a smartphone with both hands — half-turned toward the screen, lit dramatically against the dark background, with a small floating gold Bitcoin icon and a translucent dark rounded notification card overlaid near the phone showing a fake transaction confirmation. Bottom-left: outlined white rounded pill CTA button, then beneath it a small Instagram icon + handle row and a Telegram icon + phone number row. Premium crypto-app advertising.",
  },
  {
    id: "tpl-001",
    label: "Dynamic Tech Showcase",
    emoji: "🎧",
    image: "https://afristall.com/__l5e/assets-v1/a4508d7e-0677-4ac4-a351-7c6a5e4b564b/tpl-001.webp",
    prompt:
      "The layout features a diagonal split, with the upper left quadrant dominated by a curved, vibrant lime green shape and the lower-right mostly dark gray. A hero product, glossy white and 3D rendered, occupies the right and bottom-center, partially overlapping the lime green shape. The color palette is high-contrast, pairing dark grays with bright, energetic lime green accents that appear as background shapes and small informational icons. Headings and primary text blocks are situated on the left, within the lime green area, using a clean sans-serif font, with the main title larger and bold. Smaller descriptive text and feature icons are aligned below the main text. A call-to-action with contact information is placed at the bottom, also within a lime green accent shape, using white text for readability against the bright background. The overall style is modern and energetic, using bold shapes and clear typography.",
  },
  {
    id: "tpl-002",
    label: "Tech Product Showcase",
    emoji: "📱",
    image: "https://afristall.com/__l5e/assets-v1/060742c6-49d2-4423-a2e2-9953b35fd893/tpl-002.webp",
    prompt:
      "This design features a clean, high-tech aesthetic with a dominant white and gray color palette, accented by vibrant green and purple elements. The hero product, a sleek modern device, is centrally placed and tilted, surrounded by several smaller, related accessories floating around it. A bold, sans-serif headline sits at the top right, with a smaller descriptive subtitle underneath, both in shades of gray. A bright, rounded call-to-action button is positioned at the bottom left, using the accent green. Contact information and social media icons are aligned at the very bottom on a dark band.",
  },
  {
    id: "tpl-003",
    label: "Modern Accent Grid",
    emoji: "✨",
    image: "https://afristall.com/__l5e/assets-v1/bbb86375-3096-45fb-bb27-524b3f5aa494/tpl-003.webp",
    prompt:
      "The design features a light-colored background with a subtle grid pattern, accented by bright yellow and dark blue shapes. A large hero subject is positioned off-center to the right, carrying multiple items, with an oversized yellowish circle behind them in the upper right quadrant. The main headline is large and centered in the upper third, with a key word highlighted in bold color, and a smaller sub-headline below it. A list of items is stacked vertically in the middle left, using bullet points or icons. A prominent call-to-action button, circular in shape and in a contrasting bright color, is placed in the bottom right corner, partially overlapping a dark wavy shape that diagonally fills the bottom left corner. Contact information is positioned within this dark bottom-left section.",
  },
  {
    id: "tpl-004",
    label: "Playful Elegance",
    emoji: "✨",
    image: "https://afristall.com/__l5e/assets-v1/af640c60-1001-4cbe-8b85-01fed6388df9/tpl-004.webp",
    prompt:
      "The layout features a white and purple color scheme with a prominent hero subject filling the right half, smiling while holding an item. A large, bold headline in a sans-serif font, with an accent script word, is placed on the top-left, followed by a lighter-weight bulleted list in a rounded-corner text box below it. Accent rectangular blocks are positioned at the top-right and bottom with contact information and social media icons in a clean, sans-serif font. The overall design uses a mix of serif and sans-serif fonts, creating a balanced and visually engaging flyer.",
  },
  {
    id: "tpl-005",
    label: "Overlapping Product Showcase",
    emoji: "📱",
    image: "https://afristall.com/__l5e/assets-v1/d5228a16-9e16-4ce7-bc3a-0301c68595bc/tpl-005.webp",
    prompt:
      "The layout features a warm, sepia-toned background with subtle, light, abstract brush strokes. A large, dark brown over-ear headphone takes up the left half of the design, angled diagonally upwards. Smaller products like a smartwatch, smartphone, and laptop are strategically placed around the edges and bottom, partially overlapping the main product and each other. The brand logo is in the top right, and the main headline, 'YOUR NUMBER ONE Gadget Vendor!', is centrally aligned to the right of the headphones, using a bold, sans-serif font with a gradient orange-to-brown color. Contact information is presented in a dark strip at the very bottom, with a QR code in the bottom left corner.",
  },
  {
    id: "tpl-006",
    label: "Luxury Dark",
    emoji: "✨",
    image: "https://afristall.com/__l5e/assets-v1/8c7c201b-5cd5-47b7-b275-ec2956e2593a/tpl-006.webp",
    prompt:
      "This design features a dark, moody background with subtle light rays from the top right. A hero product stands prominently on a golden cylindrical pedestal, surrounded by dark purple flowers, positioned slightly below the vertical center and to the right. The main title is large and bold in white, near the top left, with accent words in a flowing serif gold. A call-to-action button, along with a '30% OFF' text, is centrally aligned to the right of the hero product. Contact icons and a tagline 'where luxury meets desire' are placed on the left, below the main title. The overall color palette is dark blue, gold, and deep purple.",
  },
  {
    id: "tpl-007",
    label: "Dynamic Tech Green",
    emoji: "🔋",
    image: "https://afristall.com/__l5e/assets-v1/6e31731e-7f79-4b6f-b30e-da22fdd24e43/tpl-007.webp",
    prompt:
      "The layout features a hero image of charging tech products and a hand holding a smartphone placed on the right, dynamically angled mid-canvas. The color palette is dominated by a deep green background with vibrant lime green accents for key text and product highlights. Typography is a bold sans-serif for the main headline, with a lighter script font for the brand name at the top. The top-left features small brand text, while a large, bold headline sits prominently in the upper-middle section, stretching across the canvas. A call to action is placed in a light green rounded rectangle at the bottom right.",
  },
  {
    id: "tpl-008",
    label: "Split Contrast Product",
    emoji: "⚫",
    image: "https://afristall.com/__l5e/assets-v1/001b5a21-1003-4149-9343-84dce05e1ba6/tpl-008.webp",
    prompt:
      "The layout features a split background with a striking contrast, half white and half black, dividing the vertical plane. A single hero product, presented in a clean white or light gray color, dominates the left side and slightly overlaps into the right. Bold, sans-serif typography is used for the main headline, positioned in the upper right quadrant against the dark background. Smaller product details or attributes are presented in rectangular text blocks below the main headline, also against the dark background. A clear call to action (CTA) with price and a 'was' price is located at the bottom right, using a standout rectangular shape, with a website link at the bottom left against the white background. The color palette is minimal, focusing on white, black, and the gray tones of the product, with clean lines for an overall modern and sleek aesthetic.",
  },
  {
    id: "tpl-009",
    label: "Product Showcase Collage",
    emoji: "👕",
    image: "https://afristall.com/__l5e/assets-v1/89d6964b-c3af-43cc-af31-45381e78583c/tpl-009.webp",
    prompt:
      "The layout features a dynamic collage of products, with larger items positioned prominently in the right and center, while smaller, detail-oriented product shots are placed in square frames on the left. The color palette primarily uses warm tones like yellows, oranges, and browns, against a softer, diffused green background at the top. Headings are sans-serif and dark-colored, located at the top left, with a bulleted list of product categories in a dark brown rounded rectangle in the bottom left, and a call-to-action phone number in an orange rounded rectangle at the bottom right.",
  },
  {
    id: "tpl-010",
    label: "Elegant Product Display",
    emoji: "🌸",
    image: "https://afristall.com/__l5e/assets-v1/2bb39aaf-5693-459b-8865-aec9c8cc3320/tpl-010.webp",
    prompt:
      "This design features a product hero shot prominently placed on the right, resting on a textured, light-colored block, surrounded by complementary natural elements and soft floral blurs in the background. The color palette is dominated by rich purples and maroons, accented with gold for the brand name and key CTAs. Typography is a mix of elegant serifs for headlines and clean sans-serifs for body text and descriptive points, all aligned to the left. Key information and feature bullet points are stacked vertically on the left side, above a gold CTA button. Additional small, gold-toned informational icons are placed along the bottom edge against a solid color band.",
  },
  {
    id: "tpl-011",
    label: "Gleaming Business Opening",
    emoji: "✨",
    image: "https://afristall.com/__l5e/assets-v1/96233d12-ddc6-4374-958e-a3cb36f26da6/tpl-011.webp",
    prompt:
      "This design features a vibrant purple background with glowing abstract shapes. A smiling person, placed slightly off-center to the right, gestures towards the left, holding shopping bags. Large, bold white sans-serif text, 'Open for Business', is centrally located in the upper half of the design, with a smaller 'We are' above it. The bottom section of the flyer is a lighter, solid color, featuring a QR code on the left, contact details in the center, and an address on the right, separated by thin vertical lines.",
  },
  {
    id: "tpl-012",
    label: "Relaxed Brand Promo",
    emoji: "🧘‍♀️",
    image: "https://afristall.com/__l5e/assets-v1/17ad8193-030a-4271-821b-7fb20642f685/tpl-012.webp",
    prompt:
      "This design features a prominent central hero subject, a person relaxing on a large orange armchair, partially obscured by a tilted smartphone displaying a product webpage. The background is a light textured gray, with large, soft-edged orange and dark gray abstract shapes as accent elements. Typography is clean and modern, with a bold, attention-grabbing orange headline 'Chill!!' positioned in the upper right, accompanied by a smaller, black-lettered sub-headline. The brand logo is placed at the very top center.",
  },
  {
    id: "tpl-013",
    label: "Gaming Console Promo",
    emoji: "🎮",
    image: "https://afristall.com/__l5e/assets-v1/a9196fac-85bb-4dc7-a36c-5dc8f29b77cc/tpl-013.webp",
    prompt:
      "The layout features a dark, gradient background transitioning from deeper green to black, with subtle, blurred geometric shapes (like X's and circles) as accent elements. A large white hero object with black accents is positioned on the right side, extending from mid-height to the bottom, accompanied by a smaller white accessory. On the left, a prominent block of white bold text, with one line in a vibrant green accent color, is stacked above smaller, thinner white text. Below this, a price callout in white, framed by a neon green outline, is placed above a small logo in white and neon green at the bottom center.",
  },
  {
    id: "tpl-014",
    label: "Dynamic Tech Showcase",
    emoji: "🎮",
    image: "https://afristall.com/__l5e/assets-v1/865d7e60-6098-43a4-89c9-ce0ea12ebb01/tpl-014.webp",
    prompt:
      "This design features a prominent product hero shot angled dynamically across the mid-bottom of the frame, with a large, bold, sans-serif brand name partially obscured behind it. The color palette is a striking gradient from dark red to bright red. Key features are listed in small, understated sans-serif text at the top and bottom of the layout, with a main slogan block in the bottom-left using a mix of serif and sans-serif fonts. A small logo and product name are centered at the top.",
  },
  {
    id: "tpl-015",
    label: "Product Showcase Frame",
    emoji: "👕",
    image: "https://afristall.com/__l5e/assets-v1/391c4137-b998-48e0-a6bb-de9265a974e8/tpl-015.webp",
    prompt:
      "An e-commerce flyer design featuring a prominent, rectangular, dark green content frame with slightly rounded corners set against a warm, gradient background of yellow and orange. The header text is bold, sans-serif, with the first line in white and the second in yellow. A clear, rectangular yellow call-to-action button is placed in the upper right quadrant of the green frame. Multiple product mockups are artfully arranged in the lower two-thirds of the green frame, slightly overlapping each other, with white and black text serving as placeholders for custom designs. Contact information is neatly displayed in green and white text blocks at the bottom, overlapping the green frame and yellow background, with a white, hexagonal accent containing a website URL in the lower right.",
  },
  {
    id: "tpl-016",
    label: "Modern Luxe Fashion",
    emoji: "✨",
    image: "https://afristall.com/__l5e/assets-v1/0315dc51-41ba-4da5-ac58-cfbe1e2d05a4/tpl-016.webp",
    prompt:
      "A sophisticated social media flyer with a dark textured background on the left and a warm, inviting orange-yellow background on the right. A central hero mannequin dressed in dark attire stands prominently on the warmer side. Text blocks appear in a clean, modern sans-serif font, primarily in white and orange, with key phrases highlighted in orange. Accent colors are shades of orange and gold. The call to action is a striking orange starburst shape positioned in the upper right quadrant of the warm background.",
  },
  {
    id: "tpl-017",
    label: "Dynamic Shopping Cart",
    emoji: "🛒",
    image: "https://afristall.com/__l5e/assets-v1/858f602d-3806-4272-a784-50d2a1b75eca/tpl-017.webp",
    prompt:
      "The layout features a hero subject looking up and gesturing peace signs, positioned in the upper right. A shopping cart, filled with items, is angled dynamically from the mid-left towards the center, overlapping slightly with the hero. A bold, large header in black and accent orange text is placed in the lower-left quadrant, followed by a smaller descriptive text. A bulleted list of features is vertically aligned to the right of the main text block using a clean, sans-serif font. The color palette is bright with a clean white and soft orange background, and dark and orange accents for text and graphic elements. A prominent orange, flower-shaped 'ORDER NOW' call to action is situated in the mid-right area, with contact details and social media handles in distinct black rectangular boxes along the bottom, accented with orange icons.",
  },
  {
    id: "tpl-018",
    label: "Playful eCommerce Collage",
    emoji: "🛍️",
    image: "https://afristall.com/__l5e/assets-v1/42eada86-fc29-4c2e-b561-815c09fd2dc4/tpl-018.webp",
    prompt:
      "The layout features a dynamic, vibrant pink and red color palette. The hero product imagery, consisting of various fashion items, is arranged in a collage style on the right and bottom right, allowing elements to slightly overlap. A large, rounded rectangular text block in solid red is positioned on the left, listing categories with bullet points. Above this, the main title is split into two lines, with one word in a script-like font and the other in a sans-serif, accompanied by an accent heart shape in red. Below the main red block, a smaller, lighter pink rounded rectangle contains descriptive text, next to a smaller, darker red CTA button. Contact information and additional CTAs are placed at the bottom left and bottom center, using simple text and small icons, against a backdrop of subtle, solid-colored geometric shapes.",
  },
  {
    id: "tpl-019",
    label: "Retail Product Grid",
    emoji: "🛍️",
    image: "https://afristall.com/__l5e/assets-v1/6fec13a5-f8ee-4aa6-b3c6-089c4a811b0d/tpl-019.webp",
    prompt:
      "This design features a dark background that gradually lightens towards the top. A horizontal rail at the top holds several clothing items, with a hand prominently featured near the center, adjusting one of the items. A large, bold percentage discount in a bright accent color (e.g., yellow) dominates the bottom left, accompanied by smaller, white sans-serif text below it. On the right, a vertical text block on a dark background contains a call to action and social media handles in white, with a subtle accent line or shape outlining it.",
  },
  {
    id: "tpl-020",
    label: "Elegant Product Display",
    emoji: "🌸",
    image: "https://afristall.com/__l5e/assets-v1/9bcfa81b-3375-4829-b942-cff0354f96ac/tpl-020.webp",
    prompt:
      "The layout features a product elevated on a circular pedestal in the bottom center, set against a blurred background of delicate reddish-brown branches and soft, diffuse lighting. The color palette primarily consists of soft pinks, deep maroons, and muted browns, creating an elegant and warm atmosphere. Typography is a mix of a flowing, elegant script for the main headline, 'Fragrance,' and a clean, sans-serif font for supporting text blocks, 'Let Your Speak First,' positioned above and to the right of the headline. An accent detail of '20% OFF' is placed on the lower-left, and a smaller descriptive text block, 'Soft, radiant scents made for her,' is on the lower-right. A CTA, appearing as a website address, is centered at the bottom.",
  },
  {
    id: "tpl-021",
    label: "Playful Elegance",
    emoji: "🌸",
    image: "https://afristall.com/__l5e/assets-v1/0eb3f0d7-4ede-42d7-86be-5c2c914ce6ba/tpl-021.webp",
    prompt:
      "A vibrant pink background with a darker pink gradient effect creates depth. Two product items are dynamically angled, slightly above and to the right of the canvas center, positioned on a minimalist, light pink geometric platform. A large, elegant script font for the main title 'Linger' dominates the upper half, with a smaller sans-serif subtitle 'Let Elegance' placed above it. A block of descriptive text in a clean serif font is situated in the lower left quadrant, while the brand logo and website URL are in the top left and top right corners respectively. The composition feels energetic and inviting, with a playful yet sophisticated vibe.",
  },
  {
    id: "tpl-022",
    label: "Mystical Violet Haze",
    emoji: "🔮",
    image: "https://afristall.com/__l5e/assets-v1/540b0f2a-0453-40cb-9aa6-97267a7f111e/tpl-022.webp",
    prompt:
      "The layout features a central hero product, a ornate purple bottle, subtly elevated on a circular pedestal, surrounded by a misty, ethereal purple botanical background. Large, elegant sans-serif typography for the main title is placed in the top left quadrant, with a supporting descriptive text block below it. A circular accent graphic with a discount offer is positioned in the top right, and a rectangular call-to-action button is in the middle left. Contact information with small icons is aligned to the bottom right.",
  },
  {
    id: "tpl-023",
    label: "Modern Gadget Showcase",
    emoji: "📱",
    image: "https://afristall.com/__l5e/assets-v1/89b70da1-caa8-4406-b82e-6743b9cb0982/tpl-023.webp",
    prompt:
      "The design features a light gray background with a subtle grid pattern. The main hero section of varying electronic gadgets is centrally located, layered on a large, red, rounded rectangular shape. The title text, 'Quality Gadgets, Best Prices,' is prominent at the top-center in black and red bold sans-serif font, with a smaller descriptive tagline below it. Random red and pink brush strokes accent the top-left and bottom-right corners, along with a red wave pattern at the bottom. Contact information and social media handles are arranged horizontally at the very bottom in a red banner, accompanied by a QR code on the right side of the main hero section.",
  },
  {
    id: "tpl-024",
    label: "Elegant Promotional Offer",
    emoji: "✨",
    image: "https://afristall.com/__l5e/assets-v1/5a24b2ec-1b98-4323-9059-1207971ea0c1/tpl-024.webp",
    prompt:
      "Design a promotional poster with a dark purple-red background gradient that lightens towards the bottom. The main headline, a sans-serif font in bold white, is centered at the top-middle, followed by a secondary explanatory text block. A 'Coupon Code' call-to-action button, a white rectangle with dark text, is centered below the text blocks. The hero subjects are three distinguished, well-lit items, arranged across the bottom third of the frame, grounded by a subtle reflective surface. A small brand logo and name in gold are positioned at the very top center.",
  },
  {
    id: "tpl-025",
    label: "Retail Product Showcase",
    emoji: "🛍️",
    image: "https://afristall.com/__l5e/assets-v1/2dea67b5-6641-4c0a-be8c-285a7e1b440b/tpl-025.webp",
    prompt:
      "This design features a dark, gradient background with a prominent clothing rack on the right side, showcasing several garments as the main hero subject, extending from the mid-top to the mid-bottom. On the left, a large, rounded rectangular yellow text block, with bold sans-serif typography, outlines services. Below this, contact information and social media handles are centered in a smaller, darker rounded rectangle. In the bottom left, two QR codes are featured. A large, square, yellow-bordered grid on the right bottom quadrant displays four smaller product images, with a 'SHOP NOW!' burst graphic overlaying its center. The primary brand name is at the top left in large, bold, yellow text, with a slogan below it. A website URL is positioned at the bottom right as a CTA.",
  },
  {
    id: "tpl-026",
    label: "Playful Bold Red Flyer",
    emoji: "🤩",
    image: "https://afristall.com/__l5e/assets-v1/e2e9ca9d-7169-43ae-8e6a-8f7f948e1a54/tpl-026.webp",
    prompt:
      "This design features a vibrant gradient red background with subtle diagonal striped patterns. A joyful person is positioned on the right, looking into a shopping bag filled with products, creating a sense of excitement and discovery. A large, bold white headline is prominently placed on the left, followed by a smaller descriptive text block below it. A glowing, rounded call-to-action button is centered beneath the secondary text, while the brand logo and social media handle are at the top, and contact information is neatly arranged at the bottom with small icons.",
  },
  {
    id: "tpl-027",
    label: "Tech Product Launch",
    emoji: "🚀",
    image: "https://afristall.com/__l5e/assets-v1/0f878419-af0f-4e9e-a6c7-344864f65c27/tpl-027.webp",
    prompt:
      "The design features a dark background with a bright yellow spotlight effect emanating from the centered main graphical element. A smiling male model in a bright yellow jacket is positioned on the right side of the poster, hands up in a welcoming gesture, with a large, stylized apple-shaped vault, glowing yellow inside, to his left. The main headline, a bold sans-serif, is top-left in a mix of light gray and bright yellow, with a smaller descriptive text below. A prominent yellow call-to-action button, 'Shop With Us Now', is centered under the text. Social media contacts are aligned at the bottom in white text on a white strip.",
  },
  {
    id: "tpl-028",
    label: "Neon Tech Glow",
    emoji: "🤩",
    image: "https://afristall.com/__l5e/assets-v1/63cf5e85-2eb4-4682-a49f-e0ed9a17a71c/tpl-028.webp",
    prompt:
      "The design features a dark, gradient background transitioning from deep violet to black, accented with bright, flowing neon blue lines that add a futuristic glow. The hero subject, an array of digital devices, is clustered in the lower-middle portion of the design, with a strong emphasis on sleek, modern items. Large, bold white and yellow typography for the main headline is centrally placed in the upper half, with sub-text in white below it, enclosed in a subtle rectangle. A call-to-action bar with minimalist icons and contact details is horizontally placed at the very bottom, in a dark contrasting color with light blue accents. A small logo and tagline are discreetly placed in the top-left and top-right corners respectively.",
  },
  {
    id: "tpl-029",
    label: "Joyful Tech Promotion",
    emoji: "😁",
    image: "https://afristall.com/__l5e/assets-v1/341fcaff-23f6-40f2-b352-a451d68be4ea/tpl-029.webp",
    prompt:
      "The layout features a bright orange background with subtle city skyline silhouettes. A smiling, energetic male subject, dressed in a casual jacket, is positioned in the lower-middle half, looking towards the top left, holding a large quantity of small white and black boxes. Bold, sans-serif typography in white and black is centrally located in the upper half. Accent hashtags appear in the mid-right. A dark gray footer bar with rounded corners runs across the bottom, containing white contact information on the left and a prominent, orange 'shop now' CTA button with rounded corners on the right.",
  },
  {
    id: "tpl-030",
    label: "Playful Tech Portal",
    emoji: "🔑",
    image: "https://afristall.com/__l5e/assets-v1/29715257-abf1-4aa2-b9cb-49b4597592e5/tpl-030.webp",
    prompt:
      "This design features a dark purple to vibrant magenta gradient background with subtle abstract patterns toward the bottom. The main headline, 'Enter our shop today,' is large and white, center-aligned, with one or two words highlighted in yellow. A hero image of a giant keyboard 'Enter' key with a miniature shop inside sits prominently in the lower-middle, with a person walking out. A spiky badge with a discount offer is placed on the left side, slightly overlapping the hero. Contact information and a 'Shop Now!' CTA button are displayed at the bottom in a rounded white block.",
  },
  {
    id: "tpl-031",
    label: "Modern Bold Orange",
    emoji: "🧡",
    image: "https://afristall.com/__l5e/assets-v1/1f320800-9c0c-4690-ab53-9d3f14453134/tpl-031.webp",
    prompt:
      "The layout features a central hero subject, a vibrant orange smartphone with a textured background, set against a dark, almost black backdrop. Large, bold white sans-serif typography is placed prominently in the top-middle, with a smaller, handwritten orange script accentuating parts of it. A call-to-action text block with white sans-serif text is positioned over the lower part of the hero subject on a smoky, semi-transparent orange rectangle, making it pop. The overall color palette is dominated by dark tones, bright orange accents, and contrasting white text, creating a sleek and modern look. The bottom of the flyer has a white curved section, with a black rectangle containing contact information and social media handles in white text, incorporating a small green icon.",
  },
  {
    id: "tpl-032",
    label: "Dynamic Tech Showcase",
    emoji: "📱",
    image: "https://afristall.com/__l5e/assets-v1/f95b3b82-1a2a-4026-8d02-e0319a1f3b32/tpl-032.webp",
    prompt:
      "This design features a vibrant, rich purple background with subtle dimensional elements at the bottom right. A dynamic human subject is positioned in the lower-middle, holding a hero product that extends into the upper-middle, angled slightly towards the left. The main headline text, in a bold, sans-serif font, is stacked vertically on the upper-right, while smaller, angled text labels with dashed lines point to areas around the hero product. A primary brand logo is located at the top left, and a call-to-action bar is centrally placed near the bottom, containing social media handles and contact information.",
  },
  {
    id: "tpl-033",
    label: "Tech Product Showcase",
    emoji: "💻",
    image: "https://afristall.com/__l5e/assets-v1/d6613e70-932f-44b6-83a3-d71de83ff893/tpl-033.webp",
    prompt:
      "The design features a dark, warm gradient background, transitioning from deep orange to black, with subtle glowing accents. A large collection of hero products is centrally arranged, creating a dynamic diagonal line across the lower half of the design, illuminated from below. The primary textual element, a bold, sans-serif headline, is placed in the upper middle, accompanied by a smaller sub-headline. A prominent, rounded orange call-to-action button is centered below the product display, followed by contact details and a website URL arranged symmetrically at the bottom on a white banner.",
  },
  {
    id: "tpl-034",
    label: "Gamer Showcase Layout",
    emoji: "🎮",
    image: "https://afristall.com/__l5e/assets-v1/115a9cdb-a273-42cf-9814-a3070f1ea8d8/tpl-034.webp",
    prompt:
      "The layout features a bright, solid yellow background with a hero subject (a person) centered in the bottom half, holding items in both hands. Behind the subject, multiple product items are symmetrically arranged on shelves, receding into the background. A large, bold headline text is placed in the upper-middle, aligned left, with a smaller descriptive text block directly below it. Logos are placed in the top left, and a QR code with a 'SCAN ME' button is in the top right. Contact information, including phone numbers and a social media handle with corresponding icons, is horizontally laid out in a dark footer at the very bottom.",
  },
  {
    id: "tpl-035",
    label: "Playful Tech Showcase",
    emoji: "🤩",
    image: "https://afristall.com/__l5e/assets-v1/6d8732a3-8f26-41f7-96c6-cd4a9fd48549/tpl-035.webp",
    prompt:
      "A vibrant blue gradient background with a smiling male subject in the center, hands outstretched, surrounded by various tech gadgets floating around him. The main headline is in bold white and bright blue, positioned above the subject, with a supporting tagline directly below it. Contact information and social media handles are displayed in a split-color rectangular bar at the bottom, with white on the left and a gradient blue on the right, all text in white. A small circular logo is in the top-left, and a pin-drop icon with an address in the top-right, both with white text.",
  },
  {
    id: "tpl-036",
    label: "Nature Product Showcase",
    emoji: "🍃",
    image: "https://afristall.com/__l5e/assets-v1/989b5615-7194-4213-b9d7-8e08a17eb66b/tpl-036.webp",
    prompt:
      "This design features a product bottle angled prominently in the mid-right, with a blurred secondary bottle in the background for depth. The color palette is earthy with rich brown and green tones in the background, contrasting with the vibrant purple of the product and glowing effect circles. Key benefits are presented in three glowing purple circular callouts arranged vertically on the left side, each with white sans-serif text. The main product title is stacked in large, clean white sans-serif typography in the upper-left, while the brand logo and website are discreetly placed in the bottom corners.",
  },
  {
    id: "tpl-037",
    label: "Magenta Spotlight Glam",
    emoji: "💅",
    image: "https://afristall.com/__l5e/assets-v1/5ac86198-e74c-44cc-a609-fe406ac19e5e/tpl-037.webp",
    prompt:
      "The design features a dark, glamorous background with magenta accent lighting. A hero subject is centrally positioned in the lower half, holding several branded shopping bags, with more bags floating above. Bold, sans-serif typography is stacked, with a main headline in white and a sub-headline in a vibrant yellow, placed in the upper-middle section. A rectangular CTA button in bright magenta with white text is located directly below the main text block, highlighted by a radiant spotlight effect emanating from behind it. Social media handles appear in the bottom right corner with small, matching magenta icons.",
  },
  {
    id: "tpl-038",
    label: "Festive Elegance",
    emoji: "✨",
    image: "https://afristall.com/__l5e/assets-v1/3670c951-5a43-4378-9f6d-906bf3db3326/tpl-038.webp",
    prompt:
      "The design features a dark, gradient background, subtly fading from black to dark gray, with golden accents. Large, bold white and golden serif typography for the main title is centrally placed on the top half. Beneath it, a smaller, sans-serif text block provides a descriptive phrase. The hero subjects are two individuals, positioned smiling slightly below the center, framed by dark foreground elements with golden outline patterns. Essential contact information and location details are neatly arranged at the bottom of the layout using small, clean sans-serif font and white icons on a light gray strip.",
  },
  {
    id: "tpl-039",
    label: "Playful Gradients",
    emoji: "✨",
    image: "https://afristall.com/__l5e/assets-v1/e8d1aa97-212c-409f-a485-58563a15a6e0/tpl-039.webp",
    prompt:
      "The layout features a smiling young man at the bottom center, holding up a smartphone in an engaging way. The color palette is dominated by various shades of deep purple with bright white text and accents. The typography is a clean, san-serif font, with the main headline prominent on the right side of the image. The hero subject (the man and phone) is centrally placed across the middle, while a large text block of the main message is to the right. Contact information is neatly arranged in a light-purple rectangular block at the bottom, and a 'Shop Now!' CTA is integrated into a rounded rectangle above it on the left.",
  },
  {
    id: "tpl-040",
    label: "Elegant Product Display",
    emoji: "✨",
    image: "https://afristall.com/__l5e/assets-v1/5edfca20-b3c8-42da-ad73-3643fd7360d5/tpl-040.webp",
    prompt:
      "This design features a dark, gradient background, from deep grey to charcoal. A shimmering metallic ribbon gracefully winds around a hero product, a sleek, clear glass bottle, placed slightly off-center to the right, creating a dynamic visual. Bold, sans-serif white typography for the main headline occupies the top-left, while a smaller, descriptive text block is positioned directly beneath it. A delicate, script-like accent text appears in the bottom right, balancing the composition. A smaller, ornate script logo is subtly placed at the very top center.",
  },
  {
    id: "tpl-041",
    label: "Dynamic Geometric Overlay",
    emoji: "🎧",
    image: "https://afristall.com/__l5e/assets-v1/274fe1b1-7592-43c9-8fa8-97de73e2cdb1/tpl-041.webp",
    prompt:
      "This design features a product hero on the left, slightly cropped, against a light gray background with dynamic lime green and dark gray geometric shapes (circles and an 'X') and a subtle black wireframe pattern in the top-left quadrant. Text blocks are aligned to the right-center, using a mix of bold sans-serif fonts in lime green and dark gray. A smaller accent text box with a discount call to action is placed below the price, subtly highlighted with a green icon. A small brand logo is at the top right, while a website URL is at the bottom right.",
  },
  {
    id: "tpl-042",
    label: "Mystical Gradient Elegance",
    emoji: "✨",
    image: "https://afristall.com/__l5e/assets-v1/b745466b-6e8d-45b8-a393-554523932499/tpl-042.webp",
    prompt:
      "An elegant, ethereal design featuring a gradient background transitioning from deep purple at the top to a softer lavender and light pink at the bottom. Three hero bottles are arranged dynamically, with one centered higher and two flanking it lower, partially submerged in a reflective, dark purple liquid with floating pink floral accents. The brand logo and primary headline in a classic serif font appear at the top, while a secondary headline in a flowing gold script is centered beneath it. The overall aesthetic is luxurious and enchanting.",
  },
  {
    id: "tpl-043",
    label: "Festive Sales Collage",
    emoji: "🛍️",
    image: "https://afristall.com/__l5e/assets-v1/0c081169-ae62-43c0-a4f6-ce1e539fdd40/tpl-043.webp",
    prompt:
      "This design features a split layout, with the upper left section dedicated to a large, bold 'End of the Year Sales' title in a dark sans-serif font, accompanied by a smaller discount message and a brand name at the top. The upper right and a portion of the center are dominated by a smiling hero image of a person holding shopping bags, set against a light background with subtle yellow confetti accents. The lower half of the design transitions to a darker, deep teal or dark green background, containing a collage of product images, social icons, and a 'SHOP NOW' CTA button in an elongated oval shape. The bottom right features additional white text blocks for dealer information, sales dates, and a location, also against the dark background.",
  },
  {
    id: "tpl-044",
    label: "Modern Edge Graphic",
    emoji: "👕",
    image: "https://afristall.com/__l5e/assets-v1/de728e98-b091-439c-a6f6-2ab665e9432b/tpl-044.webp",
    prompt:
      "The design features a dark-colored hoodie as the central hero, angled slightly to the right, occupying most of the central and right space. The background is split diagonally, with white on the left and a vibrant purple on the right, creating a dynamic contrast. Key text elements are positioned on the upper left in various fonts, with the main title in a bold sans-serif. A red price tag accentuates the top right of the hoodie, and smaller text blocks along with a call to action are arranged at the bottom of the design, grounded by the purple background.",
  },
  {
    id: "tpl-045",
    label: "Pink Pop Minimal",
    emoji: "🌸",
    image: "https://afristall.com/__l5e/assets-v1/a990f015-34d1-4c7c-88e5-f0ad79bad7c0/tpl-045.webp",
    prompt:
      "This design features a vibrant pink background, with the main subject floating centrally, casting a subtle shadow. Large, bold, white sans-serif text partially overlaps the upper portion of the subject, with smaller, elegant serif text above it. Soft, wispy white cloud elements are subtly placed around the subject. At the bottom, a prominent 'New Arrival' header is in serif text, followed by two blocks of thin sans-serif descriptive text, with a clear call to action on the last line, all in soft white.",
  },
  {
    id: "tpl-046",
    label: "Modern Apparel Showcase",
    emoji: "👚",
    image: "https://afristall.com/__l5e/assets-v1/2a751811-1cdd-42fe-b889-d70889121bd4/tpl-046.webp",
    prompt:
      "This design features a hero product, a clothing item, centered on a neutral background with subtle textured overlays. A large, bold headline in a sans-serif font is positioned at the top, partly obscured by a delicate script font. A descriptive body text block sits below the main headline. To the bottom left, a contact information block is present, while a 'Follow Us' section is at the bottom right. A prominent 'Order Now' call-to-action button is centrally located at the bottom, all against a dark accent ribbon. The color palette primarily uses shades of pink, maroon, and white with subtle grey textures.",
  },
  {
    id: "tpl-047",
    label: "Dynamic Tech Showcase",
    emoji: "📱",
    image: "https://afristall.com/__l5e/assets-v1/c4212c99-b3f3-4bc6-a49d-60d2d9a504d6/tpl-047.webp",
    prompt:
      "This design features a split layout with the top two-thirds in a clean white, and the bottom third transitioning with an orange wave into a solid orange. Large, bold, multi-line typography, 'Unbox Something new this new month!' in an orange-brown gradient, dominates the upper left, with supporting text below it in a smaller sans-serif font. The hero products are stacked on the right side of the white space, creating visual height, with smaller accessories placed on top. Contact information is neatly arranged along the bottom edge of the solid orange section in white text.",
  },
  {
    id: "tpl-048",
    label: "Modern Angled Product",
    emoji: "🎧",
    image: "https://afristall.com/__l5e/assets-v1/58b2daf5-e7ea-4b31-9802-d003ff6a1dd1/tpl-048.webp",
    prompt:
      "This design features a hero product positioned dynamically off-center to the right, slightly angled to give depth. The background consists of a solid, muted green tone with an overlay of large, rounded, darker green abstract shapes that frame the product and text areas. The typography is clean and sans-serif, with a prominent header on the top left and a sub-header below it, both in white. A white horizontal call-to-action bar with a QR code is placed in the bottom left, and a row of three small circular icons is located directly beneath the product, enhancing the clean and modern aesthetic. The layout is balanced, with a focus on clear product presentation and key information placement.",
  },
  {
    id: "tpl-049",
    label: "Music Product Showcase",
    emoji: "🎧",
    image: "https://afristall.com/__l5e/assets-v1/f3c531cc-4059-43b9-876e-d4eaf8d22173/tpl-049.webp",
    prompt:
      "The layout features a central hero product, depicted as a pair of headphones, slightly angled and positioned to the left of the vertical midline against a subtle gradient background in muted teal and grey. An overlay element resembling a music player interface in a light grey rectangular shape is placed horizontally over the left ear cup. To the right of the headphones, a prominent, multi-line headline in a bold, sans-serif font is stacked vertically, using varying shades of teal and grey for impact. Below the headphones, three small, minimalist icon-based feature highlights are horizontally aligned with corresponding text descriptions beneath them, using a lighter font. Brand logos are discreetly placed in the top-left and top-right corners.",
  },
  {
    id: "tpl-050",
    label: "Romantic Valentine Deal",
    emoji: "💖",
    image: "https://afristall.com/__l5e/assets-v1/cb3e774b-b1a5-4747-a3a7-b3456d1e052b/tpl-050.webp",
    prompt:
      "A warm, light pink background with soft, out-of-focus floral elements in the lower corners frames the design. Two hero product subjects are centered, slightly offset, with light pink (left) and golden (right) hues. A large, elegant script font for the main title 'Valentines' dominates the top half in a deep red. Supporting text is a mix of smaller, clean sans-serif and slightly stylized serif fonts, placed above and near the subjects, highlighting product categories and prices. A call to action (CTA) and contact details are neatly stacked at the bottom center.",
  },
  {
    id: "tpl-051",
    label: "Elegant Floral Product",
    emoji: "🌸",
    image: "https://afristall.com/__l5e/assets-v1/7e72da57-bef0-49ab-954c-c584bfacdf67/tpl-051.webp",
    prompt:
      "The design features a soft, gradient background in shades of purple, with subtle light and shadow play. A central product bottle sits prominently on a round pedestal in the lower-middle section, flanked by delicate orchid flowers as accent elements. The main title text is large and bold, with a secondary, elegant script font below it, both positioned in the upper half of the design. A promotional offer and 'BUY NOW' button are placed in the upper-right quadrant, while a short descriptive quote is located in the mid-left area. Social media icons and a year are subtly placed at the bottom.",
  },
  {
    id: "tpl-052",
    label: "Elegant Product Display",
    emoji: "🌸",
    image: "https://afristall.com/__l5e/assets-v1/d5159bbb-3d37-43a3-b747-074e137d91e0/tpl-052.webp",
    prompt:
      "The design features a vibrant pink background with subtle flowing wave patterns and faint butterfly outlines in the upper left. A central hero object, a luxury pink bottle, rests atop a cylindrical pink pedestal in the lower center, elevating it as the focal point. Text blocks are positioned in the top-middle, using a mix of bold, italicized, and sans-serif fonts in white, creating a clear hierarchy. The color palette is dominated by various shades of pink, with white text as an accent; there is no explicit CTA.",
  },
  {
    id: "tpl-053",
    label: "Playful Orange Modern",
    emoji: "🍊",
    image: "https://afristall.com/__l5e/assets-v1/f961c87e-4653-4ad1-8695-f57ef07f0f57/tpl-053.webp",
    prompt:
      "The layout features a bright, monochrome orange background with a subtle gradient, establishing a vibrant base. A large, stylized hero subject, resembling a smartphone-like device, is positioned on the right, partially off-frame, in the same orange hue but with a glossy finish. A person is casually seated on a beanbag in front of this element, in the lower right quadrant. The main text, in a bold, sans-serif white font, is aligned to the left in the upper-middle section, with a key word highlighted in yellow. A smaller descriptive text block sits below it, also left-aligned, in white and yellow. The bottom of the design features a white bar with minimal accent icons in orange, providing contact details and social media handles. A QR code is placed in the bottom right corner.",
  },
  {
    id: "tpl-054",
    label: "Playful Tech Promo",
    emoji: "🤩",
    image: "https://afristall.com/__l5e/assets-v1/b83583d4-09b1-4488-9693-8714761e4946/tpl-054.webp",
    prompt:
      "This design features a hero subject, a person, comfortably seated in an armchair on the left side, slightly overlapping with a large, stylized golden mobile device that frames their upper body. The background is a soft, gradient beige. To the right, a multi-line headline in bold sans-serif typography uses both dark blue and bright yellow for emphasis, followed by smaller text blocks with key dates and a call to action. A rounded rectangular dark blue logo is placed at the top center. A thin, yellow horizontal bar at the bottom provides contact information and social media handles.",
  },
  {
    id: "tpl-055",
    label: "Joyful Tech Ad",
    emoji: "😁",
    image: "https://afristall.com/__l5e/assets-v1/e934b8f5-4c9d-4e8e-8a2b-e8e5e816c9c6/tpl-055.webp",
    prompt:
      "This design features a vibrant, happy individual as the central hero, taking up the lower two-thirds of the frame, surrounded by floating product visuals. The color palette is warm and inviting, with a light gradient background from cream to off-white. The main headline is large and bold, split into two lines in the upper left, using a deep blue and black sans-serif font. A small, playful CTA button, like a chat bubble, is positioned near the hero's hands. The brand logo is discreetly placed in the top left corner, while a dark blue rectangular text block containing contact information is situated at the bottom, centered horizontally.",
  },
  {
    id: "tpl-056",
    label: "Joyful Tech Promotion",
    emoji: "🤩",
    image: "https://afristall.com/__l5e/assets-v1/c05fcc98-4f4f-4d5f-a817-a8f1d95a9e10/tpl-056.webp",
    prompt:
      "A vibrant promotional flyer with a gradient background transitioning from soft pink to white. A smiling person holds a tech device covering their eyes, positioned centrally in the lower half of the design, with vibrant purple abstract shapes framing them around the bottom and sides. The main headline text is bold, Sans Serif, and split into two lines, with one line in magenta and the other in black, located in the upper-middle section. A smaller, descriptive text block in a neutral color sits below the headline, followed by a rectangular, bright magenta call-to-action button with white text. An influencer handle with the platform logo is located in the top right, while a brand logo with text is in the top left, both in a complimentary dark color. Small, playful text accents are placed in the bottom left and mid-right, tilted for added dynamism.",
  },
  {
    id: "tpl-057",
    label: "Gaming Controller Reveal",
    emoji: "🎮",
    image: "https://afristall.com/__l5e/assets-v1/84dbafa2-3e71-4144-9000-3fafa9ab2bfb/tpl-057.webp",
    prompt:
      "This design features a dark, gradient background with a glowing orange light emanating from the center, creating a dramatic, high-contrast effect. A sleek, black gaming controller is centrally placed, slightly above the horizontal midline, casting a subtle reflection on the surface below. The main title and subtitle are positioned prominently in the upper middle section, using a clean sans-serif font for the main text and a bolder, larger sans-serif for the product name. Below the controller, four feature icons with short descriptions are aligned horizontally. A hashtag call to action is centered at the very bottom, while a subtle brand logo sits at the top.",
  },
  {
    id: "tpl-058",
    label: "Playful Modern Grid",
    emoji: "✨",
    image: "https://afristall.com/__l5e/assets-v1/462f01a1-cec3-4f21-a028-c1bea63f03a9/tpl-058.webp",
    prompt:
      "The layout features a hero subject positioned centrally, partially obscured by a rectangular frame that holds additional elements, creating a dynamic foreground. The background is a light neutral with subtle tonal geometric patterns. A primary headline uses a bold, sans-serif font, with one word highlighted in a vibrant orange. A secondary text block describes the offering in a clean, readable sans-serif below the headline. Accent colors are primarily in shades of orange and dark brown/black, used for a CTA button strip at the bottom and other minor details, which also includes social media handles. The overall aesthetic is clean, modern, and engaging.",
  },
  {
    id: "tpl-059",
    label: "Pink Vibrant Splash",
    emoji: "🌸",
    image: "https://afristall.com/__l5e/assets-v1/9c1c2655-8968-4e06-8355-008f9e00d6e8/tpl-059.webp",
    prompt:
      "The design features a vibrant pink background with subtle water splash effects. The main text is in a bold sans-serif font, positioned in the top half of the design. The hero product, a black and pink container, is angled slightly off-center in the mid-ground, surrounded by floating fruit elements and liquid splashes. Several callout bubbles/shapes with icons and brief descriptive text are strategically placed around the product, using an accent color of darker pink/magenta. A circular CTA with an icon is located in the bottom right, using a similar color palette.",
  },
  {
    id: "tpl-060",
    label: "Gaming Console Showcase",
    emoji: "🎮",
    image: "https://afristall.com/__l5e/assets-v1/59798577-433b-4629-96d3-ccd44357741f/tpl-060.webp",
    prompt:
      "A modern, sleek product showcase flyer set against a dark blue gradient background, transitioning from deep indigo to a lighter blue at the bottom. The hero subject, a tall, white electronic device with blue lighting, is positioned prominently on the right, with a smaller, white accessory in the foreground on the left. The top left features a bold white logotype, with a two-line headline in capital white and blue-scripted fonts below it. A single line of white tagline text appears further down, accompanied by a small blue heart illustration. Along the bottom, four small icons with single-line descriptions are horizontally arranged, with a central tagline in a white, italicized script font below them, and small, outlined geometric shapes serving as a final accent.",
  },
  {
    id: "tpl-061",
    label: "Dark Dynamic Display",
    emoji: "🌃",
    image: "https://afristall.com/__l5e/assets-v1/bc583ae1-8ea6-4c99-94de-2269d66424df/tpl-061.webp",
    prompt:
      "The layout features a central hero subject, a light-colored apparel item, against a dark, moody background with hints of purple and subtle cloud-like textures. A large, stylized white script headline with a yellow accent word dominates the top half, while a hierarchical text block sits on the left, listing product attributes in a clean, sans-serif font. A menu-like list of categories and a CTA for a sale are positioned on the far right, also in a simple sans-serif, with the bottom displaying a bold, spaced-out tagline in white.",
  },
  {
    id: "tpl-062",
    label: "Golden Elegance Reveal",
    emoji: "✨",
    image: "https://afristall.com/__l5e/assets-v1/9d7cc796-f372-4b34-8b67-6b529855f3c1/tpl-062.webp",
    prompt:
      "This design features a clean white background with gold wavy accents in the top-right and covering the bottom third, creating a luxurious feel. The hero subject, a cheerful woman, is centrally placed, holding shopping bags, surrounded by clothing racks on either side. A bold, gold-gradient 'Open' in a sans-serif font dominates the central text, with 'We're' in a darker, smaller font above it. A prominent black semi-transparent rectangular text block with white sans-serif text is centered below the hero, with contact details and a QR code in a gold-colored box at the bottom.",
  },
  {
    id: "tpl-063",
    label: "Soft Lavender Elegance",
    emoji: "💜",
    image: "https://afristall.com/__l5e/assets-v1/3f8c23d5-4a95-4686-ab40-2608be7b72e8/tpl-063.webp",
    prompt:
      "The layout features a central hero subject, a perfume bottle, standing prominently on a two-tiered circular platform at the bottom-center. The color palette is dominated by various shades of soft lavender and purple, with accents of dark purple on the subject and hints of silver. Typography for the main titles is a mix of a bold, glowing sans-serif font at the top-center and an elegant script font next to it, while smaller text blocks use a simple sans-serif, positioned to the top-left and mid-right. Lavender sprigs frame the scene on both sides, with a subtle butterfly graphic on the right, and the Call To Action is a rectangular, dark purple button with white text, placed directly on the hero subject.",
  },
  {
    id: "tpl-064",
    label: "Angled Product Feature",
    emoji: "🧴",
    image: "https://afristall.com/__l5e/assets-v1/c1884531-49fc-4f53-aa34-fb6eee29fb9b/tpl-064.webp",
    prompt:
      "This design features a hero product bottle angled upwards from the bottom left, set against a two-tone gradient background from dark red to light greyish-white. Key features are presented in bold white text on elongated, rounded dark red boxes horizontally aligned on the right. A large white percentage and related text are prominently displayed within a similar dark red rounded box in the bottom left, with a delicate floral accent originating from the bottom left corner. The main product title is in large, bold, sans-serif font in the top right, with a smaller, more subtle sans-serif accompanying it. A website URL, QR code, and small block of descriptive text are placed along the bottom right.",
  },
  {
    id: "tpl-065",
    label: "Mystical Gradient Sale",
    emoji: "✨",
    image: "https://afristall.com/__l5e/assets-v1/85690c6b-2451-4d90-a920-b1a56b3e8e1e/tpl-065.webp",
    prompt:
      "The design features a dark purple to magenta radial gradient background, with the hero subject (products) placed on a luxurious, wavy purple fabric in the lower half of the frame, accompanied by small accent flowers. The primary text, 'Black Friday Cyber Monday' and a large '40% OFF', is centrally aligned in a clean sans-serif font, using white for high contrast. A date banner sits horizontally above the main discount text, while a small 'available at' logo is placed at the very top center. A subtle disclaimer rests at the bottom left.",
  },
  {
    id: "tpl-066",
    label: "Modern Regal Gradient",
    emoji: "👑",
    image: "https://afristall.com/__l5e/assets-v1/97d969c5-b808-4ec5-b237-b680b5cd6c10/tpl-066.webp",
    prompt:
      "A modern, high-contrast digital flyer with a rich purple to deep violet gradient background. The hero subject, dressed in monochromatic light lavender, is seated comfortably slightly to the right of center and occupies the lower half of the design. A large, abstract, transparent object leans behind them, extending upwards. Main headline text in white, sans-serif font is stacked on the left, with an accent keyword highlighted in a yellow-orange text box. A smaller body of text follows below in white. Social icons, contact information, and a brand logo are horizontally arranged at the bottom, with a QR code in the bottom right corner.",
  },
  {
    id: "tpl-067",
    label: "Modern Bold Appeal",
    emoji: "💜",
    image: "https://afristall.com/__l5e/assets-v1/330bf9f1-30d9-4941-b6d1-c0c500b8d1a2/tpl-067.webp",
    prompt:
      "This design features a vibrant purple background with an accent circle in yellow on the right side. The hero subject, a person, sits on a large, partially visible smartphone graphic, occupying the left half of the layout. Bold, impactful white and yellow typography for the main title is placed in the upper right quadrant, while a supporting text block in white sits beneath it. A yellow call-to-action bar is centrally located towards the bottom right, and contact information, social media handles, and a QR code are neatly arranged at the very bottom on a white banner with a yellow accent strip.",
  },
  {
    id: "tpl-068",
    label: "Modern Bold Flyer",
    emoji: "👚",
    image: "https://afristall.com/__l5e/assets-v1/b00fc112-f62a-4fe0-a478-beaa33a92660/tpl-068.webp",
    prompt:
      "Full-frame product display centered on a light gray background with subtle abstract shapes. The main text uses a bold, sans-serif font in a gradient of pink to dark red, positioned slightly above the center. Accent elements like a small 'We Give' banner and an 'ORDER NOW' call-to-action are in bright pink, glossy bubbles. A dark strip at the bottom contains contact information and a QR code, both enclosed in pink-bordered shapes.",
  },
  {
    id: "tpl-069",
    label: "Gaming Tech Product",
    emoji: "🎮",
    image: "https://afristall.com/__l5e/assets-v1/84f21433-d5a2-474f-a70a-a7df4629b18b/tpl-069.webp",
    prompt:
      "This design features a dark, vibrant aesthetic with a strong glow accent. The color palette is dark gray and black with electric green accents. The hero subject, a dark product, is prominently placed on the right side of the layout, filling roughly two-thirds of the vertical space. Text blocks are aligned to the left, with a main title in bold white, a sub-headline in electric green, and a list of features below in a smaller white font. A price call-to-action (CTA) is highlighted in an electric green bracket, positioned below the features. Subtle, blurred geometric shapes in electric green are used as a background accent on the top left. The brand logo is situated at the bottom left, also in electric green.",
  },
  {
    id: "tpl-070",
    label: "Festive Glam Promotion",
    emoji: "✨",
    image: "https://afristall.com/__l5e/assets-v1/890974f6-66c9-49eb-9fe7-5221e900d85a/tpl-070.webp",
    prompt:
      "The layout features a central hero subject sitting directly on the floor looking at the camera, surrounded by several smaller, identical objects on stands, all against a dark, dramatic background. There is a large text block at the top left in white and orange, an accent slogan in small white text at the top right, and a smaller descriptive text block below the main headline followed by an orange call-to-action button, all positioned above the hero. An undulating orange patterned shape with white design elements forms the bottom section, where contact information and a location are displayed in white on dark grey and orange footer blocks.",
  },
  {
    id: "tpl-071",
    label: "Playful Tech Showcase",
    emoji: "🤩",
    image: "https://afristall.com/__l5e/assets-v1/5c46e53d-28b3-48a9-9836-426b7532f3e1/tpl-071.webp",
    prompt:
      "The design features a vibrant, enthusiastic person centered in the lower middle, surrounded by floating product images that are angled and scattered playfully. The color palette is dominated by bright white, deep purple, and blue accents, creating a dynamic contrast. Large, bold sans-serif typography is used for the main headline, positioned in the upper left, with a secondary smaller text block detailing the offering below it. A circular purple-to-blue gradient shape with a call to action 'We Buy, Sell & Swap' is placed on the right side, overlapping the hero. Contact information at the bottom is presented in purple ovals with white icons.",
  },
  {
    id: "tpl-072",
    label: "Tech Product Spotlight",
    emoji: "📱",
    image: "https://afristall.com/__l5e/assets-v1/9a17e834-5a17-47ff-ad67-9ef52ecf8ac9/tpl-072.webp",
    prompt:
      "The design features a dark, vibrant green background with subtle geometric network lines. A variety of tech products are centrally placed, varying in size, with larger items in the background and smaller ones foregrounded, slightly overlapping. The main heading 'new week' is in large, bold white sans-serif font positioned on the left side, with a smaller, green banner 'HAPPY' placed diagonally above it. A descriptive text block in white, sans-serif font is situated below the main heading. Contact information and social media handles are neatly arranged at the bottom of the layout, with a prominent light-green 'CONTACT US' button positioned to the far left.",
  },
  {
    id: "tpl-073",
    label: "Modern Tech Product",
    emoji: "📱",
    image: "https://afristall.com/__l5e/assets-v1/7690b0eb-68ea-4316-a2ae-c3ffdebe4fa5/tpl-073.webp",
    prompt:
      "The layout features a hero product held by hands, positioned centrally and slightly angled. A large, bold headline with a mix of purple and white typography is placed at the top, while a price block in a gradient purple rectangle is at the top right. The background is a vibrant purple gradient with soft, swirling abstract shapes. A call-to-action button, styled as a semi-transparent purple capsule, is located at the bottom right, with supporting details on the left, all against the product and background.",
  },
  {
    id: "tpl-074",
    label: "Playful Product Showcase",
    emoji: "✨",
    image: "https://afristall.com/__l5e/assets-v1/2c89655a-fcbf-4b65-9afa-039061dc446f/tpl-074.webp",
    prompt:
      "The design features a vibrant lime green background with subtle concentric circle patterns and a slight textured overlay. The hero subject, a person, holds a product horizontally, covering their upper face, and is positioned centrally in the lower half of the frame. The main headline, 'The phone everyone's talking about', is in a bold sans-serif font, dark green, and located in the upper center, with a secondary, smaller sub-headline below it. A brand logo is placed at the very top center. Transparent, luminous green cube-like accents are scattered around the main subject. A brown, rounded rectangular call-to-action button with white text is centered at the bottom of the layout.",
  },
  {
    id: "tpl-075",
    label: "Dynamic Tech Forward",
    emoji: "🤩",
    image: "https://afristall.com/__l5e/assets-v1/b08e5fad-2b31-4dc7-b01d-94d735d84aa9/tpl-075.webp",
    prompt:
      "The layout features a vibrant, textured lime green background. A large, smiling hero subject or person is positioned in the lower right, partially occluded by an oversized representation of a technology product held prominently in the foreground, angled towards the left. Bold white sans-serif typography is stacked in the upper left to center, with a key accent word highlighted in a small, horizontal lime-green pill shape within the text block. A bright red call-to-action button is placed on the product in the bottom-left quadrant.",
  },
  {
    id: "tpl-076",
    label: "Dynamic Tech Promotion",
    emoji: "🚀",
    image: "https://afristall.com/__l5e/assets-v1/f823b6d1-d0df-45a1-81ca-f1e4e48fdd9a/tpl-076.webp",
    prompt:
      "The design features a bold, sans-serif headline in the upper left quadrant, with a secondary line of text below it. A promotional hero subject occupies the right half of the design, bringing energy and focus. The color palette is primarily white and black with strong red accents used for emphasis in text, background elements, and a call-to-action button. Contact information is neatly arranged at the bottom, split into two blocks with icons, using a high-contrast black and white scheme, framed by a curved red and black shape.",
  },
  {
    id: "tpl-077",
    label: "Tech Product Showcase",
    emoji: "📱",
    image: "https://afristall.com/__l5e/assets-v1/a8438c4a-5bc1-49e9-8ff3-95a8da2e7a8f/tpl-077.webp",
    prompt:
      "This design features a clean, light grey background with a subtle, abstract wave pattern. The hero products are centrally placed, with a large, vertical smartphone in a vibrant light purple acting as the anchor, flanked by a smartwatch on the left and wireless earbuds on the right, all arranged in a slightly diagonal line. The headline text is large and bold, primarily in dark blue, with a key phrase highlighted in bright red. Smaller descriptive text with arrows is positioned adjacent to each product. A black rectangular bar at the bottom provides contact and location details in white, with a QR code and social media handle.",
  },
  {
    id: "tpl-078",
    label: "Dynamic Product Showcase",
    emoji: "👕",
    image: "https://afristall.com/__l5e/assets-v1/2fbaf807-83d4-46a3-ad7d-d8910a2e1355/tpl-078.webp",
    prompt:
      "The design features a vibrant yellow background on the right and a white background on the left, bisected by a diagonal line from the top left corner to the bottom right. A large hero product is positioned centrally, slightly overlapping both background colors, with a smaller secondary product placed in front and to the left of it. The main title text is stacked in the upper left on the white part, with a call to action (CTA) banner beneath it. Bulleted feature points are aligned to the right on the yellow background, while contact information and social media icons are at the bottom right and top right respectively, also on the yellow background. Accent colors are primarily maroon and black for text with some gold highlights.",
  },
  {
    id: "tpl-079",
    label: "Elegant Product Display",
    emoji: "✨",
    image: "https://afristall.com/__l5e/assets-v1/8f037a14-3c1d-42a1-8841-9562cbf8a6bd/tpl-079.webp",
    prompt:
      "The design features a soft, warm peach and brown gradient background. The main product is centered on a light brown wooden circular platform near the bottom, with a companion product box positioned slightly to its left. Headline text in a prominent, elegant serif font, in dark brown, is stacked centrally in the upper half of the image. A '20% OFF' callout in a rough-edged starburst shape is placed on the lower left side of the headline block. At the very bottom, a CTA button in a thin white rectangle with a brown border and brown text is centered, with social media handles and website details in smaller text beneath it. A small, dark blue logo with white text is located in the top right corner.",
  },
  {
    id: "tpl-080",
    label: "Modern Apparel Showcase",
    emoji: "🛍️",
    image: "https://afristall.com/__l5e/assets-v1/182b7b7d-d5f1-4d67-86f1-b60c6fc12137/tpl-080.webp",
    prompt:
      "The design features a dark, solid background with a gradient gold main title in a large, bold sans-serif font positioned prominently on the left side, slightly above the vertical center. A contrasting light-colored text block for a subtitle is placed directly below the main title. In the bottom left quadrant, a white rectangular text box with contact information serves as the CTA, styled with a dashed border. To the right, a large, vertical price tag graphic overlays the background, showcasing product images within its frame, effectively dividing the composition. Subtle secondary product imagery in neutral tones occupies the bottom to mid-left and right sides, partially obscured by other elements.",
  },
  {
    id: "tpl-081",
    label: "Tilted Product Benefits",
    emoji: "🍊",
    image: "https://afristall.com/__l5e/assets-v1/cd85d86c-6f7c-4a7b-9253-a1077781b3d5/tpl-081.webp",
    prompt:
      "Full-frame image containing a large, tilted product shot positioned centrally, angled to the right. The background is a solid, vibrant orange. There are two lists of benefits, stacked vertically: one on the left of the product and one on the right. Each benefit is accompanied by a small icon and is encased in an elongated, rounded rectangular bubble with a thin outline. Decorative orange slice elements are placed in the corners of the background. The text blocks are clean and sans-serif, and the overall aesthetic is bright and clean.",
  },
  {
    id: "tpl-082",
    label: "Modern Tech Pop",
    emoji: "📱",
    image: "https://afristall.com/__l5e/assets-v1/919634a0-ecc2-44b2-97d1-e116e0c132f4/tpl-082.webp",
    prompt:
      "A modern and clean design on a gradient green background, fading from dark to light green. The hero subject, a smartphone with a textured case and wireless earbuds, is positioned in the lower right, angled slightly upwards. The word 'Open' is prominently displayed in a large, transparent, light green font across the center, with 'We are' in smaller white text above it. A short descriptive text block 'Tested | Trusted Top-Tier' is in white, located to the right of the phone's camera lenses. A call-to-action button, 'ORDER NOW!', is a vibrant light green rectangle with dark green text, situated in the bottom right corner. Contact information and an address are displayed in a long, pill-shaped white box at the very bottom, with green text and icons.",
  },
  {
    id: "tpl-083",
    label: "Luxury Product Display",
    emoji: "✨",
    image: "https://afristall.com/__l5e/assets-v1/2cba70cb-5fb5-4f09-8542-9e78084d4f94/tpl-083.webp",
    prompt:
      "This design features a dark, luxurious background with warm golden light accents. The hero subjects, three elegant products, are subtly lit and positioned on a dark, reflective surface in the middle right of the frame. The main title is large and golden in the top-left, with a smaller sub-title and logo in white in the top-right. A list of offerings in yellow text with golden bullet points is aligned to the left in the lower-middle, with a subtle 'Place your orders' CTA button in a light color at the bottom right. Contact information in white and social media handles in a smaller font are centrally aligned on a dark-gold band at the very bottom.",
  },
  {
    id: "tpl-084",
    label: "Product Showcase Orange",
    emoji: "📱",
    image: "https://afristall.com/__l5e/assets-v1/00f96736-b6e0-4240-82e2-77afd802564e/tpl-084.webp",
    prompt:
      "An advertisement with a solid dark brown background, featuring a hero product display in the center-right. A tall, vibrant orange smartphone is positioned prominently, standing upright. On its left, an elegant black and gold headphone is draped, with another visible in the background. To the right of the smartphone, a black power bank with gold accents is present, along with white wireless earbuds in their case and a grey braided charging cable, creating a cohesive family of products. In the top left corner, the main title text is in white sans-serif font, center-aligned. Towards the bottom left, social media icons and phone numbers are displayed above a prominent orange call-to-action button, with location details on the bottom right.",
  },
  {
    id: "tpl-085",
    label: "Dynamic Gaming Showcase",
    emoji: "🎮",
    image: "https://afristall.com/__l5e/assets-v1/6db1d323-38ed-4144-b010-51f5c816805e/tpl-085.webp",
    prompt:
      "This design features a clean, bright white background with a cool blue accent. The primary hero product is prominently displayed on the left, slightly angled, with a secondary product element positioned to its right. Main headings are stacked on the top right, with accompanying details and a call-to-action button beneath them, featuring a dark blue background and white text. Contact information is neatly arranged at the bottom within a rounded white box, using small icons and simple typography.",
  },
  {
    id: "tpl-086",
    label: "Modern Gradient Promotion",
    emoji: "📱",
    image: "https://afristall.com/__l5e/assets-v1/c3aec5bc-0451-4b04-93eb-ccebb7dad058/tpl-086.webp",
    prompt:
      "The layout features a central hero image of a person holding a product, positioned slightly below the vertical center. The background is a vibrant purple-to-darker-purple gradient. Key textual information is stacked towards the top, with a large, bold 'Hot Deals' headline in a bright pinkish-purple, accompanied by a smaller sub-headline and a flowing arrow graphic. Additional product images are subtly ghosted in the background around the hero. Contact information and a physical address are neatly placed in a rounded-corner bar at the very bottom, creating a clean call to action area.",
  },
  {
    id: "tpl-087",
    label: "Modern Commerce Black",
    emoji: "🛍️",
    image: "https://afristall.com/__l5e/assets-v1/18dd27b3-232c-4171-a962-1f7158b878e4/tpl-087.webp",
    prompt:
      "This design features a dark, minimalist background with a central hero subject holding shopping bags. The typography is modern and sans-serif, with the main headline in a large, bold, light color (e.g., white or silver) with yellow accent stars, and a smaller descriptive text below it. The main text block is placed in the upper-middle of the design, with the brand logo subtly in the top left corner. A call-to-action bar is prominently displayed at the bottom center with social media handles, using a light background on a dark plaid patterned strip.",
  },
  {
    id: "tpl-088",
    label: "Retail Opening Chic",
    emoji: "💅",
    image: "https://afristall.com/__l5e/assets-v1/12708b11-1703-4d16-a5d5-4fc8a80b0975/tpl-088.webp",
    prompt:
      "Design a modern, clean flyer with a full-frame background image of a stylish, well-lit retail interior. The main headline, a dynamic, multi-line typography with a mix of black and dark red text, is placed prominently in the top left, accented by a flowing purple ribbon. Two rounded rectangular blocks in vibrant magenta and deep red are positioned in the top right for key dates/times. Below the main headline, two more stacked, rounded magenta blocks with white text display promotional offers. Contact details and an address, marked by small icons, are discreetly placed in the bottom left and right corners respectively. The color palette focuses on whites, soft purples, and magenta accents.",
  },
  {
    id: "tpl-089",
    label: "Earthy Elegant Layout",
    emoji: "✨",
    image: "https://afristall.com/__l5e/assets-v1/f648c5f3-bdca-42a7-a447-4e98a21fcd0e/tpl-089.webp",
    prompt:
      "This design features a warm, earthy color palette with a light brown/beige background accented by darker brown shapes and text blocks. A hero subject, product held by hands, is centrally located in the bottom right, emerging from a dark brown curved shape. The main title and subtitle are stacked in the top left in a bold, serif font and a lighter, sans-serif font respectively, aligned left. A 'What We Sell' section with a dark brown background is positioned mid-left, followed by a bulleted list of items. A call-to-action button, organically shaped in dark brown, is placed in the bottom left, and contact information with icons is aligned to the bottom right.",
  },
  {
    id: "tpl-090",
    label: "Modern Gradient Overlay",
    emoji: "💜",
    image: "https://afristall.com/__l5e/assets-v1/c424f5cf-92c6-46c4-99ed-6941863bd4a7/tpl-090.webp",
    prompt:
      "A modern flyer design featuring a gradient overlay from purple to pink. The header text is prominent, utilizing a bold sans-serif font, with a lighter sub-header below it. Several small icon-based text blocks are arranged horizontally across the top section. The main product, a container, is positioned slightly right-of-center in the lower half, partially obscured by floating accent elements like berries. A large numerical callout for a percentage is on the right, and a 'When to Eat' section with a question mark is on the bottom left, all against a clean white and purple background.",
  },
  {
    id: "tpl-091",
    label: "Red Luxury Product",
    emoji: "🌹",
    image: "https://afristall.com/__l5e/assets-v1/59bf85aa-ab58-4db5-972f-4b7c4e4b28dc/tpl-091.webp",
    prompt:
      "The design features a hero product, a red transparent bottle with a gold cap, centrally placed on a reflective red surface. The background is a rich, dark red gradient, with blurred red petals subtly falling. Three dark red roses are artfully arranged around the product, serving as elegant accents. Text blocks for branding and contact information are in white, san-serif font, positioned in the top left and top right corners. A main headline, 'RED', is prominently displayed in bold white on the product itself, while a descriptive call to action is placed in the bottom center, also in white.",
  },
  {
    id: "tpl-092",
    label: "Product Showcase",
    emoji: "👕",
    image: "https://afristall.com/__l5e/assets-v1/b1b87cc5-41f9-4855-8310-db09dea61ced/tpl-092.webp",
    prompt:
      "The design features a dark red to black gradient background, creating depth. A collection of diverse clothing items are centrally arranged, with some items slightly overlapping, creating a dynamic visual. Bold, white serif typography for headlines is positioned at the top and bottom of the layout, with secondary text in a smaller, clean sans-serif font beneath the top headline. An accent color, bright yellow, is used for highlights on some text elements. A small, stylized logo is placed at the very top. There is no explicit CTA button, the text at the bottom serves as the call to action.",
  },
  {
    id: "tpl-093",
    label: "Playful Gradient Tech",
    emoji: "🛍️",
    image: "https://afristall.com/__l5e/assets-v1/efb77046-e388-4935-ae34-bea85a0aa557/tpl-093.webp",
    prompt:
      "This design features a vibrant red and white color scheme with a gradient title. The hero subject, a smiling person, is prominently placed in the lower center, holding a stack of product boxes. Text blocks gradient from red to white, with the main title large and bold at the top, and secondary text below it. Accent iconography related to online transactions floats around the hero, with a QR code in the top right corner. Two distinct Call-To-Action buttons are vertically stacked on the left, using a deep red and maroon palette, while social media and website information sits on a bottom banner.",
  },
  {
    id: "tpl-094",
    label: "Nature Product Showcase",
    emoji: "🌿",
    image: "https://afristall.com/__l5e/assets-v1/00eb188a-9984-472b-85f0-1f13a3c22d13/tpl-094.webp",
    prompt:
      "This design features a clean, light beige background with shades of brown and white. Three product bottles are arranged in the center-mid on a pedestal of natural wood pieces and stones, with grass accents around the base of the bottles. A splash of water forms an arc behind them, creating a dynamic backdrop. The brand logo is in the top-left corner, and the main product name is centered at the top in a modern, slightly playful font in dark brown and a warm orange accent. A website CTA is positioned at the bottom center. The overall palette is natural and earthy, highlighted by vibrant product colors.",
  },
  {
    id: "tpl-095",
    label: "Golden Trio Offer",
    emoji: "✨",
    image: "https://afristall.com/__l5e/assets-v1/56599e00-4a67-4939-9000-6fbe3fc2d40d/tpl-095.webp",
    prompt:
      "This design features a hero subject of three stylized product bottles elegantly arranged at the bottom center of the frame, with the central bottle slightly forward. A large, bold promotional text block with an accent color (yellow) is centrally placed in the upper half. The background provides a soft, warm-toned, out-of-focus setting, maintaining focus on the foreground subjects. The color palette is rich and warm, with gold and red accents for product details and promotional text, complemented by an overall dark and luxurious feel in the background. Social media icons are discreetly placed in the top-left corner, and a brand logo is positioned in the top-right, balancing the top section. Additional text blocks detailing product information and a call to action are aligned at the bottom portion of the design.",
  },
  {
    id: "tpl-096",
    label: "Purple Perfume Showcase",
    emoji: "💜",
    image: "https://afristall.com/__l5e/assets-v1/d5b31e4b-7010-49ae-b173-1a553c65a0b8/tpl-096.webp",
    prompt:
      "The layout features a split-level design with a dominant purple color palette. The top section, which is lighter purple, features the brand logo and a large, bold headline text 'UNLEASH THE POWER OF SCENTS' in a sans-serif font on the left. A hero subject, a smiling woman, occupies the right side, partially silhouetted against a darker purple curved background, holding a small decorative bottle. Below the headline, a supporting text block in white provides a description. A bulleted list of offerings is contained within a lighter purple, soft-edged rectangle on the left, topped with a banner reading 'We sell.' The bottom section of the flyer is a dark purple strip, featuring contact information (phone numbers and email) in a white sans-serif font on the left, with product images (various bottles) clustered on the right, acting as an accent and CTA.",
  },
  {
    id: "tpl-097",
    label: "Tech Stack Promo",
    emoji: "🧑🏾‍💻",
    image: "https://afristall.com/__l5e/assets-v1/8af69eb0-ae9d-4875-b024-2dda0dd28a8f/tpl-097.webp",
    prompt:
      "A modern and vibrant tech promotion flyer with a dark gradient background transitioning from deep purple to black. A smiling young man with dark skin, wearing a plaid shirt, is positioned on the right side of the frame, holding a tall stack of product boxes. On the left, large, bold white sans-serif typography announces the main event, with a key phrase highlighted in a bright magenta. A brief supporting text in a smaller font sits below, followed by a magenta call-to-action button with a white arrow icon, encouraging immediate engagement. A QR code is placed in the top right corner, and a footer strip across the bottom features contact information and social media handles with corresponding icons.",
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
