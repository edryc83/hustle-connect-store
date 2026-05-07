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
