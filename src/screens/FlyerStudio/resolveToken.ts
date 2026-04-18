import type { FlyerState, GradientFill, GradientStop } from './flyerTypes';

export const resolveToken = (value: string | number | undefined, flyer: FlyerState): string => {
  if (typeof value !== 'string') return String(value ?? '');

  return value
    // Text content placeholders
    .replace(/PLACEHOLDER_TITLE/g, flyer.title)
    .replace(/PLACEHOLDER_TITLE_LINE1/g, flyer.title)
    .replace(/PLACEHOLDER_TITLE_LINE2/g, flyer.tagline)
    .replace(/PLACEHOLDER_TAGLINE/g, flyer.tagline)
    .replace(/PLACEHOLDER_TAGLINE_TEXT/g, flyer.tagline)
    .replace(/PLACEHOLDER_BADGE/g, flyer.badge)
    .replace(/PLACEHOLDER_BADGE_TEXT/g, flyer.badge)
    .replace(/PLACEHOLDER_CTA/g, flyer.cta)
    .replace(/PLACEHOLDER_CTA_TEXT/g, flyer.cta)
    .replace(/PLACEHOLDER_PHONE/g, flyer.phone)
    .replace(/PLACEHOLDER_ADDRESS/g, flyer.address)
    .replace(/PLACEHOLDER_STORE/g, flyer.storeName)
    .replace(/PLACEHOLDER_STORE_NAME/g, flyer.storeName)
    .replace(/PLACEHOLDER_BRAND_INITIAL/g, flyer.storeName?.charAt(0)?.toUpperCase() ?? 'S')
    .replace(/PLACEHOLDER_PRODUCT_NAME/g, flyer.productName)
    .replace(/PLACEHOLDER_PRICE/g, flyer.productPrice)
    .replace(/PLACEHOLDER_PRICE_VALUE/g, flyer.productPrice)
    .replace(/PLACEHOLDER_PRICE_LABEL/g, 'STARTING AT')
    .replace(/PLACEHOLDER_FOOTER_TEXT/g, flyer.address || 'Shop now · Free delivery')
    // Spec placeholders (default to empty if not set)
    .replace(/PLACEHOLDER_SPEC\d+_LABEL/g, '')
    .replace(/PLACEHOLDER_SPEC\d+_VALUE/g, '')
    // Image placeholders
    .replace(/PLACEHOLDER_IMAGE/g, flyer.productImage ?? '')
    .replace(/PLACEHOLDER_PRODUCT_IMAGE/g, flyer.productImage ?? '')
    // Color placeholders - support both formats
    .replace(/PLACEHOLDER_BG_COLOR/g, flyer.bgColor)
    .replace(/PLACEHOLDER_COLOR_BG/g, flyer.bgColor)
    .replace(/PLACEHOLDER_ACCENT_COLOR/g, flyer.accentColor)
    .replace(/PLACEHOLDER_COLOR_ACCENT/g, flyer.accentColor)
    .replace(/PLACEHOLDER_COLOR_ACCENT_ALT/g, flyer.accentColor)
    .replace(/PLACEHOLDER_COLOR_TITLE/g, flyer.textColor || '#FFFFFF')
    .replace(/PLACEHOLDER_COLOR_ON_ACCENT/g, '#0A0A0A')
    // Font placeholders - support both formats
    .replace(/PLACEHOLDER_FONT/g, flyer.font)
    .replace(/PLACEHOLDER_FONT_DISPLAY/g, flyer.font)
    .replace(/PLACEHOLDER_FONT_BODY/g, flyer.font);
};

// Resolve tokens within gradient stops
export const resolveGradient = (gradient: GradientFill, flyer: FlyerState): GradientFill => {
  const resolvedStops: GradientStop[] = gradient.stops.map(stop => ({
    ...stop,
    color: resolveToken(stop.color, flyer),
  }));

  return {
    ...gradient,
    stops: resolvedStops,
  };
};
