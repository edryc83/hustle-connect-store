

## Ad Studio Redesign — Step-by-Step Wizard with Bottom Nav

### What We're Building
Redesign the Ad Studio page from a single long form into a multi-step wizard with a bottom navigation bar showing progress. The flow:

1. **Step 1 — Choose Product**: Pick an existing product from their store OR upload a new image. Background removal toggle here.
2. **Step 2 — Choose Template**: Show template cards (1 for now, expandable later). Template preview with the selected product image.
3. **Step 3 — Edit Text**: Form below the template preview to customize text fields (product name, price, tagline). Include an "AI Write" button that auto-generates tagline. Pre-fill fields from selected product if they chose one.
4. **Generate**: Sticky bottom button triggers generation. Result screen with download.

### Bottom Nav Design
A step indicator bar at the bottom (not the dashboard bottom nav — this is internal to Ad Studio):

```text
┌─────────────────────────────────────┐
│  [📷 Product]  [🎨 Template]  [✏️ Text]  │
│   ●──────────────●──────────────○     │
└─────────────────────────────────────┘
```

Active step is highlighted. Users can tap back to previous steps. Forward navigation requires completing the current step.

### Technical Plan

**1. Rewrite `src/pages/AdStudio.tsx`**
- Add `step` state (1 | 2 | 3)
- **Step 1 — ProductStep**: 
  - Fetch user's products from `products` table (with images from `product_images`)
  - Show product grid to pick from, OR an upload button for a new image
  - Remove Background toggle
- **Step 2 — TemplateStep**: 
  - Show template card(s) with a static preview thumbnail (use the Bannerbear template screenshot reference image style)
  - Single template for now, selected by default
- **Step 3 — TextStep**: 
  - Pre-fill product name and price from selected product (if picked in step 1)
  - Tagline input with "✨ AI Write" button (calls existing caption generation edge function or Lovable AI to suggest a tagline)
  - Live preview of template with text overlaid
- **Bottom bar**: 3-tab step indicator + "Generate Ad" button on step 3

**2. AI Tagline Generation**
- Use Lovable AI (via a new edge function or the existing `generate-captions` function) to suggest a short tagline based on the product name
- Quick one-tap fill

**3. Existing Product Selection**
- Query `products` + `product_images` for the logged-in user
- Show grid of product thumbnails with names
- On select, auto-fill product name, price, and use the first product image

**4. Keep existing Bannerbear integration unchanged**
- Same edge function, same template ID, same polling logic
- Just reorganize where/when the data is collected

### Files Changed
- `src/pages/AdStudio.tsx` — Full rewrite with step wizard
- Possibly extract step components into `src/components/ad-studio/` for cleanliness

