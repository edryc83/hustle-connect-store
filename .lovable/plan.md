

## Plan: Revamped Share Card with 3 Template Styles

Replace the current `ShareCardModal` with a new version featuring 3 selectable canvas templates at 1080x1920px, auto-populated with seller data, product image picker for Template 3, copyable caption, and download/share functionality.

---

### ShareCardModal Rewrite (`src/components/dashboard/ShareCardModal.tsx`)

**Props update**: Add `category` and `products` (array of `{id, name, image_url}`) to the modal props. The parent (`DashboardOverview.tsx`) will pass these from the fetched profile and products data.

**State**: `selectedTemplate` (1|2|3), `selectedProductImage` (string URL for template 3), `cardMessage` (AI-generated), `cardGenerated` (boolean).

**Template Selector UI**: Show 3 small thumbnail buttons at top (styled mini previews or labeled cards) the seller taps to choose.

**Template 1 — Clean White**:
- 1080x1920 white background
- Circular profile pic centered at ~top 30%
- Store name bold black below
- Category in an orange pill
- Orange bar at bottom with `afristall.com/[slug]` in white
- Card message text between category and bottom bar

**Template 2 — Bold Orange**:
- Full #FF6B35 orange background
- White circle border around profile pic
- "SHOP NOW 🔥" large white bold text
- Store name white below
- Card message
- `afristall.com/[slug]` white at bottom + small "Powered by Afristall" text

**Template 3 — Product Focus**:
- Product image fills top 60% edge-to-edge
- Dark gradient overlay on bottom 40%
- Small circular seller profile pic bottom-left
- Store name + URL in white over gradient
- Card message (greeting + call to action about products/discounts)
- Shows a product image picker grid when this template is selected

**Card Message**: Auto-filled form field below the design. AI Generate button calls `generate-card-message` edge function. User can edit. Message is drawn on the canvas.

**Caption Section** (below canvas preview):
- Pre-written text: `🛍️ Visit my store for [category] → afristall.com/[slug]`
- "Copy Caption" button copies to clipboard

**Actions**:
- "Generate Card" renders selected template on canvas
- "Download Card" saves PNG
- On mobile: also "Share" via `navigator.share` with image file

---

### DashboardOverview.tsx Changes

- Fetch `category` from profile and `products` list (id, name, image_url) to pass to ShareCardModal
- Pass `category` and `products` as new props

---

### Files to Edit

| File | Action |
|------|--------|
| `src/components/dashboard/ShareCardModal.tsx` | Full rewrite with 3 templates |
| `src/pages/dashboard/DashboardOverview.tsx` | Pass category + products to modal |

