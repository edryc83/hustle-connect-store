

## Fix "APPLE STYLE" Bug + Redesign Step 3 Layout

### Issues Identified

1. **"APPLE STYLE" default text**: When subtitle is empty, the code skips sending the subtitle modification (line 153-155 in AdStudio.tsx: `if (subtitle.trim())`). This means Bannerbear renders its default template text "APPLE STYLE". Fix: always send the subtitle modification — use a space `" "` if empty to clear the default text.

2. **Text fields not visible alongside the design preview**: Currently the image preview is at the top and text fields are below, requiring scrolling. User wants to see the design while editing text.

3. **Product image too small**: The preview image has `max-h-48` which is restrictive.

### Plan

**1. Fix "APPLE STYLE" bug (`src/pages/AdStudio.tsx`)**
- Change the subtitle modification from conditional to always-sent:
  ```tsx
  // Before: if (subtitle.trim()) { ... }
  // After: always push, use space if empty
  modifications.push({ name: "subtitle", text: subtitle.trim() || " " });
  ```

**2. Redesign TextStep layout (`src/components/ad-studio/TextStep.tsx`)**
- Make the image preview sticky at the top so it stays visible while scrolling through text fields and background options
- Increase image preview height from `max-h-48` to `max-h-64`
- Reorder: sticky preview at top → text fields → background picker (so the design context is always visible)
- The preview acts as a "what you're editing" reference

**3. Increase image size in preview**
- Change `max-h-48` → `max-h-64` on the product image in TextStep
- This gives a larger preview while still leaving room for fields below

