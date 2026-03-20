

## Problem
The AccentColorPicker component IS in the code and renders inside the cover photo area next to the Settings gear, but it has been invisible for 7+ attempts. The most likely cause is that the Popover-based trigger button, while technically rendered, is being obscured or clipped by the cover photo's `overflow-hidden` or the hover overlay `<label>` that sits at `absolute inset-0` (z-stacking issue — the label covers the entire cover photo area and may intercept clicks/visibility even at opacity-0).

## Root Cause
The `<label className="absolute inset-0 ...">` on line 203 creates a full-coverage overlay. Even though it's `opacity-0`, it sits in the same stacking context and may visually or interactively block the AccentColorPicker. The `z-10` on the button container should help, but the label also has no explicit z-index, so it depends on DOM order — and the label comes BEFORE the button div in the DOM (line 203 vs 214), so the button div should win. However, the `overflow-hidden` on the parent may interact with the Popover portal in unexpected ways.

## Plan: Move the color picker OUT of the cover photo

Instead of fighting the cover photo overlay, place the accent color picker as a clearly visible **"Store theme" row** below the "View as buyer" button. This guarantees visibility regardless of cover photo stacking.

### Step 1: Remove AccentColorPicker from the cover photo area
In `DashboardProfile.tsx`, remove lines 215-221 (the AccentColorPicker inside the cover photo div).

### Step 2: Add a "Store Theme" row after "View as buyer"
After the "View as buyer" button (around line 324), add a new row containing:
- A `Palette` icon + "Store theme" label on the left
- A row of 10 color circles (inline, no popover) on the right
- Clicking a circle saves to `accent_color` in profiles and shows a toast

This will be a simple inline component — no Popover, no Portal, no z-index issues. Just direct DOM elements that will always be visible.

### Step 3: Simplify AccentColorPicker component
Rewrite `AccentColorPicker.tsx` to render an inline horizontal row of color swatches instead of a Popover trigger. The component will accept the same props but render directly without any overlay/portal mechanics.

### Technical details
- Remove the Popover import and usage entirely from AccentColorPicker
- Render a flex row: `Palette` icon, "Store theme" text, then 10 small color circles
- Keep the same save logic (update `profiles.accent_color` via Supabase)
- Keep the same color list and check-mark indicator
- The storefront already reads `accent_color` and applies it as `--primary` CSS variable — no changes needed there

### Files changed
1. `src/components/dashboard/AccentColorPicker.tsx` — rewrite as inline row (no Popover)
2. `src/pages/dashboard/DashboardProfile.tsx` — move AccentColorPicker from cover photo to below "View as buyer"

