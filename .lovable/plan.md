

## Problem

When a buyer clicks the WhatsApp order button, the code uses `navigator.share()` which opens the device's **share sheet** (letting them pick any app). The user wants it to go **directly to the seller's WhatsApp inbox** via `wa.me` link instead.

This happens in three places:
1. **Storefront.tsx** (product detail WhatsApp button) — lines 510-526
2. **OrderModal.tsx** — lines 87-98
3. **CartDrawer.tsx** — lines 83-94

## Plan

Remove the `navigator.share` block from all three ordering flows. Keep only the direct `wa.me` URL redirect, which opens the seller's WhatsApp chat with the pre-filled order message.

**Files to edit:**
- `src/pages/Storefront.tsx` — Remove lines 510-526 (the `navigator.share` attempt and `shared` variable), keep only the `wa.me` redirect
- `src/components/storefront/OrderModal.tsx` — Remove lines 85-99 (same pattern), keep only the `wa.me` redirect
- `src/components/storefront/CartDrawer.tsx` — Remove lines 82-95 (same pattern), keep only the `wa.me` redirect

Each file follows the same fix: delete the `navigator.share` block and the `shared` flag, and always execute the `wa.me` link directly.

