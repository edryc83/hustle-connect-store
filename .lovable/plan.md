

## Client-Side Background Removal with @imgly/background-removal

### What Changes

**Install**: `@imgly/background-removal` npm package (runs entirely in-browser using WASM/WebGL, no API key needed).

**Flow**:
1. User toggles "Remove Background" ON in TextStep
2. Library processes the image client-side → outputs transparent PNG blob
3. Show "Removing background..." spinner overlay on the image preview
4. Replace preview with the processed image
5. Store both original and processed URLs so toggling OFF restores original
6. On generate: upload the processed PNG to Supabase storage, send that URL to Bannerbear (without the `remove_background: true` flag since we already did it)

### Files Changed

**1. `src/components/ad-studio/TextStep.tsx`**
- Import `removeBackground` from `@imgly/background-removal`
- Add states: `bgRemovalLoading`, `originalImagePreview`, `processedImageUrl`
- When `removeBg` toggled ON + image exists: run `removeBackground(imagePreview)`, show spinner overlay on image, replace preview with blob URL result
- When toggled OFF: restore original image
- Pass processed image URL up via new `onProcessedImage` callback prop

**2. `src/pages/AdStudio.tsx`**
- Add `processedImageUrl` state
- Pass `onProcessedImage` callback to TextStep
- In `handleGenerate`: if `removeBg && processedImageUrl`, upload the processed blob to storage and use that URL; remove `remove_background: true` from Bannerbear modifications
- Keep the upload logic to convert blob URL → File → upload to `product-images` bucket

### Technical Notes
- `@imgly/background-removal` downloads ~30MB of model files on first use (cached after). The spinner communicates this delay.
- Output is a PNG blob with transparent background — ideal for ad compositing.
- No edge function or API key needed.

