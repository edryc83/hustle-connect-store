/**
 * Builds a shareable URL that routes through the og-store edge function.
 * Bots (WhatsApp, Facebook, Twitter) get proper OG meta tags with product/store images.
 * Humans are auto-redirected to the actual storefront page.
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export function buildShareUrl(storeSlug: string, productId?: string): string {
  const params = new URLSearchParams({ slug: storeSlug });
  if (productId) params.set("productId", productId);
  return `${SUPABASE_URL}/functions/v1/og-store?${params.toString()}`;
}
