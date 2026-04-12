import type { FlyerState } from './flyerTypes';

export const resolveToken = (value: string | number | undefined, flyer: FlyerState): string => {
  if (typeof value !== 'string') return String(value ?? '');

  return value
    .replace(/PLACEHOLDER_TITLE/g, flyer.title)
    .replace(/PLACEHOLDER_TAGLINE/g, flyer.tagline)
    .replace(/PLACEHOLDER_BADGE/g, flyer.badge)
    .replace(/PLACEHOLDER_CTA/g, flyer.cta)
    .replace(/PLACEHOLDER_PHONE/g, flyer.phone)
    .replace(/PLACEHOLDER_ADDRESS/g, flyer.address)
    .replace(/PLACEHOLDER_STORE/g, flyer.storeName)
    .replace(/PLACEHOLDER_PRODUCT_NAME/g, flyer.productName)
    .replace(/PLACEHOLDER_PRICE/g, flyer.productPrice)
    .replace(/PLACEHOLDER_IMAGE/g, flyer.productImage ?? '')
    .replace(/PLACEHOLDER_BG_COLOR/g, flyer.bgColor)
    .replace(/PLACEHOLDER_ACCENT_COLOR/g, flyer.accentColor)
    .replace(/PLACEHOLDER_FONT/g, flyer.font);
};
