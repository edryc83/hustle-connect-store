

## Two Changes

### 1. Explore Page — WhatsApp pill: icon + "Message" only (no number)

In `src/pages/Explore.tsx` (lines 570-579), replace the WhatsApp pill that shows the phone number with a simpler one showing just the WhatsApp icon + "Message" text. Remove the `displayNumber` variable usage.

### 2. Profile Page — "Share to WhatsApp Status" button on product modal

In `src/pages/dashboard/DashboardProfile.tsx`, add a "Share to Status" button in the product detail modal (lines 415-451). This button will:

- Use the Web Share API (`navigator.share`) with the product image and a caption like: `Check out {productName} — {price}\n{storeLink}`
- The share payload includes `files: [imageFile]` (fetched from the product image URL and converted to a File blob) plus `text` with the caption and shop link (`afristall.com/{slug}/{productId}`)
- Fallback for browsers without file sharing: open `wa.me/?text=...` with the caption text
- Styled as a green WhatsApp button with the WhatsApp icon, placed below the "Edit" button

This uses the native Web Share API Level 2 which supports sharing images directly to WhatsApp Status on mobile. The flow: fetch image → create blob → `navigator.share({ files, text })` → user picks "WhatsApp Status" from the share sheet.

