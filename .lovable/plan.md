

## Enable Camera Capture for Product Image Upload

### What Changes

Add a `capture="environment"` attribute to the product image file input in `DashboardProducts.tsx`. This tells mobile browsers to open the camera directly instead of showing a file picker. To give users both options (camera and gallery), we'll replace the single upload button with two buttons: one for camera and one for gallery.

### Plan

**1. Update `src/pages/dashboard/DashboardProducts.tsx`**

Replace the single file input with two options:
- **Camera button**: `<input type="file" accept="image/*" capture="environment">` — opens rear camera directly on mobile
- **Gallery button**: `<input type="file" accept="image/*" multiple>` — opens photo library (existing behavior)

Display as two side-by-side buttons with icons (`Camera` and `ImageIcon` from lucide-react) inside the dashed upload area when no images exist yet, or as compact icon buttons when images already exist.

Both inputs share the same `handleImageChange` handler. The camera input won't have `multiple` since camera capture is one photo at a time.

