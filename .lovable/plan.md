

## Use App URL Instead of Supabase Edge Function URL for Product Links

The product links in WhatsApp messages currently point to the Supabase edge function URL (`…/functions/v1/og-store?slug=…&productId=…`), which looks ugly and technical. The user wants clean app URLs like `hustle-connect-store.lovable.app/store-slug/product-id`.

### The Challenge

WhatsApp's crawler needs OG meta tags to generate rich link previews (with product images). The SPA (`index.html`) serves static, generic OG tags — it can't dynamically set per-product images. That's why we switched to the edge function URL.

### Solution

1. **Switch back to clean app URLs** in all three files:
   - `src/pages/Storefront.tsx` — change to `${window.location.origin}/${storeSlug}/${product.id}`
   - `src/components/storefront/OrderModal.tsx` — same pattern
   - `src/components/storefront/CartDrawer.tsx` — same pattern

2. **Update `index.html`** to set the OG image to the app logo as a generic fallback, so WhatsApp at least shows *something*.

### Trade-off

With clean app URLs, WhatsApp previews will show the generic site logo/title instead of per-product images, because the SPA can't serve dynamic OG tags. To get both clean URLs *and* product-specific previews, a server-side rendering or proxy layer would be needed — but for now the user prefers clean URLs.

### Files to Edit
- `src/pages/Storefront.tsx` (line 279)
- `src/components/storefront/OrderModal.tsx` (line 63)
- `src/components/storefront/CartDrawer.tsx` (line 40)
- `index.html` — add generic OG meta tags

