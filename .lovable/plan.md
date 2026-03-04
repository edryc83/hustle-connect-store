

## Plan: Dashboard Overhaul — Stats, Sharing, Onboarding, Manual Orders, Completeness, WhatsApp Card

This is a large feature set touching the database, the storefront tracking, and the dashboard overview and orders pages.

---

### Database Changes (1 migration)

1. Add `view_count` (integer, default 0) to `profiles` table
2. Add `whatsapp_taps` (integer, default 0) to `products` table
3. Both columns are publicly updatable via RPC or direct increment — we'll create two small RPC functions:
   - `increment_store_views(store_slug text)` — increments `view_count` on the matching profile
   - `increment_whatsapp_taps(product_id uuid)` — increments `whatsapp_taps` on the matching product

This avoids needing to change RLS since these are security definer functions.

---

### Storefront Tracking (Storefront.tsx)

- On storefront load, call `increment_store_views` RPC with the store slug
- On WhatsApp button click (product detail page), call `increment_whatsapp_taps` RPC with the product ID

---

### Dashboard Overview (DashboardOverview.tsx) — Full Rewrite

**4 Stat Cards (2x2 grid):**
1. Listings — product count (Package icon)
2. Store Views — sum of `view_count` from profile (Eye icon)
3. WhatsApp Taps — sum of `whatsapp_taps` across seller's products (MessageCircle icon)
4. Orders — order count (ClipboardList icon)

**Onboarding Banner (0 products):**
- Glassmorphism card with orange left border, dismissible via X (localStorage key `afristall_banner_dismissed`)
- Rocket emoji, heading, descriptive text, "Add Your First Product" button linking to `/dashboard/products?add=true`

**Store Completeness Progress Bar:**
- Calculate from profile data: has profile pic (20%), store name (20%), whatsapp (20%), 1+ products (20%), 3+ products (20%)
- Orange progress bar with percentage and contextual message

**Share Section (replaces plain store link):**
- Store URL in a pill/chip with copy icon (using store slug as username)
- Two buttons side by side: "Copy Link" and "Share Store" (navigator.share)
- Both styled with primary/orange accent, full width on mobile

**"Share to WhatsApp Status" button:**
- Opens a modal with a canvas-generated shareable image card
- Canvas draws: gradient background (#FF6B35 to #1a1a2e), profile pic circle, store name, "Shop now" text, store URL, Afristall logo
- Preview shown in modal
- "Generate Card" button renders canvas, "Share / Download" button triggers navigator.share with file on mobile or downloads PNG on desktop
- Store link uses the username/slug

---

### Orders Page (DashboardOrders.tsx)

**Floating "+" button:**
- Fixed bottom-right FAB button
- Opens a dialog/modal with form fields: customer name (required), customer phone (required), product name (text), amount (number, optional), notes (textarea, optional), status selector (Pending/Delivered/Cancelled)
- Saves to existing `orders` table (already exists with seller_id, customer_name, customer_phone, product_name, total, notes, status columns) — maps `amount` to `total`, sets `quantity: 1`

---

### Files to Create/Edit

| File | Action |
|------|--------|
| `supabase/migrations/...` | Add `view_count`, `whatsapp_taps` columns + 2 RPC functions |
| `src/pages/dashboard/DashboardOverview.tsx` | Full rewrite with all new sections |
| `src/pages/dashboard/DashboardOrders.tsx` | Add FAB + manual order modal |
| `src/pages/Storefront.tsx` | Add view tracking on load + WhatsApp tap tracking on click |
| `src/components/dashboard/ShareCardModal.tsx` | New component for WhatsApp status card generator |

