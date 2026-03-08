

## Add Background Picker to Ad Studio (Text Step)

Reuse the existing `search-wallpapers` edge function and adapt the `WallpaperPicker` pattern to let sellers search and select a background image for their ad.

### Files Changed

**1. `src/components/ad-studio/TextStep.tsx`**
- Add new props: `bgImageUrl`, `setBgImageUrl`
- Add a "Background" section below the Remove Background toggle
- Include a search input + grid that calls the existing `search-wallpapers` edge function (Unsplash + Pexels)
- Show a thumbnail preview of the selected background with a "Change" button
- Inline the search UI directly in the step (no dialog needed -- keeps flow simple)

**2. `src/pages/AdStudio.tsx`**
- Add state: `bgImageUrl` (default `null`)
- Pass `bgImageUrl` and `setBgImageUrl` to `TextStep`
- In `handleGenerate`, add a `background` modification to the Bannerbear payload:
  - `{ name: "background", image_url: bgImageUrl }` when a background is selected
  - Omit when no background is selected (keeps template default)

### How It Works
- Seller types a search query (e.g. "abstract", "fashion", "gradient")
- Results from Unsplash + Pexels appear in a 2-column grid
- Tapping a result sets it as the background URL
- The selected background thumbnail shows below with option to change/remove
- On generate, the URL is sent directly to Bannerbear as the `background` layer -- no upload needed since these are public URLs

### No New Dependencies or Secrets Needed
- `search-wallpapers` edge function already exists
- `UNSPLASH_ACCESS_KEY` and `PEXELS_API_KEY` secrets already configured

