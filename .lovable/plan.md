

## Add Solid Color Picker + Fix Background Layer

### Key Discovery
The Bannerbear template's `background` layer only supports `color` (not `image_url`). The existing image background code sending `image_url` to the `background` layer **does not work**. We need to fix this and add a color picker.

### Plan

**1. `src/components/ad-studio/TextStep.tsx`**
- Add new props: `bgColor`, `setBgColor`, `bgType` ("color" | "image"), `setBgType`
- Replace the current "Ad Background" section with a tabbed UI:
  - **Color tab**: Grid of ~8 preset color swatches + a custom hex input. Selected swatch gets a checkmark ring
  - **Image tab**: Keep the existing Unsplash/Pexels search (but note it may not render on the Bannerbear `background` layer — it could still be useful if additional image layers are added later)
- Preset colors: `#000000`, `#FFFFFF`, `#1a1a2e`, `#FF6B6B`, `#A8D5BA`, `#0D1B2A`, `#F4C430`, `#FFB6C1`

**2. `src/pages/AdStudio.tsx`**
- Add state: `bgColor` (default `"#000000"`), `bgType` (default `"color"`)
- Pass `bgColor`, `setBgColor`, `bgType`, `setBgType` to `TextStep`
- Fix `handleGenerate` modifications:
  - If `bgType === "color"`: `{ name: "background", color: bgColor }`
  - If `bgType === "image"` and `bgImageUrl`: `{ name: "background", image_url: bgImageUrl }` (keep for future compatibility)
  - Remove old bare `bgImageUrl` push

### Bannerbear Limitation
The `background` layer in this template only accepts `color`. Image backgrounds would require either a different template with an image-capable background layer, or adding a new image layer in Bannerbear's template editor. The image search tab will remain available but with a note that results may vary.

