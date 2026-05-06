## Goal

One-tap AI auto-design for product posters using **OpenAI's GPT Image (gpt-image-1 / "ChatGPT Images 2.0")**. Seller taps a product image → app auto-generates a single premium, minimal poster featuring the product, title, price, seller's WhatsApp number, and a small "Designed by Afristall" mark. No prompts, no template picking — one tap, one premium result.

## Required setup (you must do this)

GPT Image is an OpenAI model, not part of Lovable AI. It needs an OpenAI API key with **gpt-image-1** access enabled (your OpenAI org must be verified for image generation).

After you approve this plan, I will request you to add the secret `OPENAI_API_KEY`. Get it at https://platform.openai.com/api-keys.

Cost note: gpt-image-1 is billed per image by OpenAI directly (roughly $0.04–$0.19 per image depending on size/quality). This is separate from your Lovable AI credits.

## User flow

1. Dashboard → Products: each product card image gets a small sparkle overlay button.
2. Tap image (or sparkle) → opens `AutoDesignModal`.
3. Modal immediately calls the backend (no inputs). Skeleton shimmer while it generates (~10–25s for gpt-image-1).
4. Result fills the modal. Buttons:
   - Regenerate (new variation)
   - Download
   - Share to WhatsApp
   - Save to product images
5. Saved image goes into existing `product-images` bucket and (on Save) appended to the product's gallery.

## Design rules sent to GPT Image

The prompt enforces:

- Premium editorial / gallery-grade poster, minimal, lots of negative space
- Product is the hero, color-graded with soft realistic shadow
- Square 1:1, suitable for WhatsApp status
- At most 4 text elements: product title, optional 1-line subtitle, price, WhatsApp number
- "Designed by Afristall" tiny mark, bottom corner
- No emojis, no stickers, no fake badges, no clutter, no busy backgrounds
- Use seller's brand accent color when set
- Typography: clean modern sans-serif

We pass the product image as `image[]` input so GPT Image edits/composes around the real product (using the OpenAI `images/edits` endpoint with `model=gpt-image-1`).

## Backend

New edge function: `supabase/functions/auto-design-product/index.ts`

- Validates JWT
- Loads product (`name`, `price`, `currency`, `subtitle`, `image_url`) and seller profile (`store_name`, `whatsapp_number`, `accent_color`)
- Downloads the product image
- Calls OpenAI `POST https://api.openai.com/v1/images/edits` with:
  - `model: gpt-image-1`
  - `image[]`: product image
  - `size: 1024x1024`
  - `quality: high`
  - `prompt`: composed from the design rules + product/seller details
- Receives base64 PNG, uploads to `product-images/<userId>/auto-<productId>-<ts>.png`
- Returns `{ url }`
- Surfaces 401 (bad key), 429 (busy), and 400 ("organization not verified for gpt-image-1") clearly to the client

Secrets used: `OPENAI_API_KEY` (new). `verify_jwt` left at default.

## Frontend

New file: `src/components/dashboard/AutoDesignModal.tsx`
- Props: `productId`, `open`, `onClose`
- Calls `supabase.functions.invoke('auto-design-product', { body: { productId } })` on open and on Regenerate
- Skeleton while loading; then preview + 4 action buttons
- Save inserts row in `product_images` table

Edit: `src/pages/dashboard/DashboardProducts.tsx`
- Add a small sparkle overlay button on each product card thumbnail; tap opens the modal
- Existing edit/delete actions untouched

## Edge cases

- Seller has no `whatsapp_number` → omit phone from the design and show a small nudge in the modal to add one
- Product `image_url` missing → modal shows "Add a product photo first"
- OpenAI org not verified → toast: "OpenAI image generation needs your OpenAI org to be verified. Visit platform.openai.com/settings/organization/general to verify."

## Files

- New: `supabase/functions/auto-design-product/index.ts`
- New: `src/components/dashboard/AutoDesignModal.tsx`
- Edit: `src/pages/dashboard/DashboardProducts.tsx`
- Secret to add after approval: `OPENAI_API_KEY`

No DB schema changes.