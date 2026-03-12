/**
 * Transforms a Supabase storage URL into a clean proxied URL via afristall.com.
 * Requires a Cloudflare Worker on afristall.com to handle /img/* routes.
 *
 * Example:
 *   Input:  https://rmhpdalhkcbsbrphhjre.supabase.co/storage/v1/object/public/product-images/abc/photo.webp
 *   Output: https://afristall.com/img/product-images/abc/photo.webp
 */

const SUPABASE_STORAGE_PREFIX =
  "https://rmhpdalhkcbsbrphhjre.supabase.co/storage/v1/object/public/";

const PROXY_ORIGIN = "https://afristall.com";

export function proxyImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith(SUPABASE_STORAGE_PREFIX)) {
    const path = url.slice(SUPABASE_STORAGE_PREFIX.length);
    return `${PROXY_ORIGIN}/img/${path}`;
  }
  // Already a clean URL or external URL — return as-is
  return url;
}
