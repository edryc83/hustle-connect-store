

## Design Studio Overhaul

### What's Changing

**1. Template Categories as Tabs with Design Variations**
- Convert Editorial, Spotlight, Brand Card, Collage into pill/tab selectors at the top
- Each category contains 2-3 design variations shown as visual thumbnails below
- User picks a category pill, then selects a specific design from the grid beneath it

**2. Click-to-Change Image on Canvas**
- Make the canvas preview clickable — tapping it opens the image picker (file upload or product selection)
- Show a subtle overlay hint ("Tap to change image") on hover/tap

**3. Background Color & Tint Controls**
- Add a color picker row (preset swatches: black, white, warm beige, navy, forest green, custom)
- Add an image tint/filter slider: Normal, Warm, Cool, B&W, Sepia
- These apply as canvas overlay fills before text is drawn

**4. Branding: Afristall Logo + Store Name + Profile Pic**
- Remove all category references from the canvas
- Every template shows: Afristall logo (from `/logo.jpeg`) at top, store name, seller's profile pic + username
- Load the Afristall logo as an image asset drawn on the canvas

**5. Larger Text & High-Resolution Download**
- Increase headline font sizes by ~30% across all templates (e.g., 82px → 108px)
- Increase subtitle sizes proportionally
- Download uses full 1080x1920 canvas resolution with `canvas.toBlob(cb, "image/png", 1.0)` quality parameter
- Canvas display stays small via CSS but renders at full resolution

**6. Text Form Tied to Design**
- Form fields (headline, subtitle) remain below the preview
- When switching designs, default text presets change to match the design style
- AI Generate button still available for subtitle

### Technical Approach

**State additions:**
- `designVariant` (number) — which sub-design within a template category
- `bgColor` (string) — background color hex
- `tintFilter` (string) — "normal" | "warm" | "cool" | "bw" | "sepia"

**Template structure:**
```text
TEMPLATE_CATEGORIES = {
  editorial: [variant1, variant2, variant3],
  spotlight: [variant1, variant2],
  brandcard: [variant1, variant2],
  collage:   [variant1, variant2]
}
```

Each variant stores: `{ name, defaultHeadline, defaultSubtitle, render(ctx, ...) }`

**Canvas rendering changes:**
- After drawing background image, apply tint as a semi-transparent color overlay
- Apply `bgColor` as the base fill before any image
- Draw Afristall logo via `loadImage("/logo.jpeg")` at top of every design
- Draw profile pic circle + store name as branding bar
- Remove all `category` references from canvas drawing

**Click-to-change-image:**
- Wrap canvas in a `relative` div with an overlay button
- On click, trigger the existing `fileInputRef` or show a popover with image options

**Files to modify:**
- `src/pages/dashboard/DashboardShareCard.tsx` — full rewrite of the component

