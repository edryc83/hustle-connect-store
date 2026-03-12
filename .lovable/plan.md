

## Problem

WhatsApp's `wa.me` links only support **plain text** — you cannot attach images. The current approach prepends a proxied image URL (`afristall.com/img/...`) as text, but WhatsApp just shows it as a clickable link, not an inline image.

## Solution: Use Product Page Links for Rich Previews

Instead of putting the raw image URL in the message, include the **product page URL** (e.g. `afristall.com/storeslug/productId`). WhatsApp's crawler will fetch that URL, find your existing OG meta tags (`og:image`, `og:title`, etc.), and automatically render a **rich link preview card** with the product image, title, and description — exactly like when someone shares a YouTube or Instagram link.

You already have the full OG infrastructure in place:
- **Cloudflare Worker** detects WhatsApp's crawler (user-agent) and serves the `og-store` edge function
- **`og-store` function** returns proper `og:image`, `og:title`, `og:description` for each product
- Product images are already set as `og:image`

### Changes

**1. `src/components/storefront/OrderModal.tsx`**
- Replace `proxyImageUrl(product.image_url)` (the raw image link) with the product page URL: `https://afristall.com/${storeSlug}/${product.id}`
- Accept `storeSlug` prop (already passed in)
- The message will look like:
  ```
  https://afristall.com/myshop/abc123

  Hello, I would like to order:

  *Product Name*
  *Quantity:* 2
  *Total:* UGX 50,000
  ```
- WhatsApp will auto-generate a rich preview card with the product image from the OG tags

**2. `src/components/storefront/CartDrawer.tsx`**
- Same change: replace `proxyImageUrl(items[0]?.imageUrl)` with the store page URL `https://afristall.com/${storeSlug}`
- For multi-item carts, link to the store page so the preview shows the store branding

**3. `src/pages/Storefront.tsx`** (product detail WhatsApp button)
- Same pattern: use `https://afristall.com/${storeSlug}/${product.id}` instead of the raw image URL in the pre-filled message

### Why this works
- WhatsApp fetches OG tags from any URL in a message and renders a visual preview card
- Your Cloudflare Worker already intercepts crawler requests and serves the `og-store` edge function with proper `og:image`
- No API keys needed, no share sheet — just a `wa.me` link with a product URL in the text

