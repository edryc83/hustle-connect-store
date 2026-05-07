## Goal

Promote "Copy this design" to a first-class entry point on the Design Studio menu (4th button). User uploads their own reference image, then chooses how to use it: apply to a product, or use with a text prompt.

## New flow

```text
Design Studio menu
├─ Choose product       → product → template → theme → final
├─ Make poster          → template → theme → final
├─ Poster of the Day    → occasion → template → theme → final
└─ Copy this design (NEW)
   ├─ upload image                  ← step "source"
   ├─ choose how to use it          ← step "use"
   │   ├─ Apply to a product  → product → theme → final
   │   └─ Use with a prompt   → theme → final
```

The uploaded image becomes the selected `inspirationId` (reusing existing `userTemplates` machinery), so downstream steps work unchanged.

## Changes

### `src/components/dashboard/DesignStudioModal.tsx`

- Add a 4th menu card: **"Copy this design"** — icon `Copy` (or `ImagePlus`), blue/sky tint, desc: "Upload a design to recreate".
  - `onClick`: `setTrack("copy"); setStep("source");`
- Extend types:
  - `Track = "product" | "prompt" | "day" | "copy"`
  - `Step = "menu" | "product" | "occasion" | "template" | "theme" | "final" | "source" | "use"`
- New step **"source"** (copy track only):
  - Large dashed drop area with "Upload image" button (reuses `handleUploadTemplate`).
  - Spinner while `uploadingTemplate` is true.
  - Once uploaded, show preview thumbnail + label, primary "Use this" button → `setStep("use")`.
- New step **"use"** (copy track only):
  - Two cards (mirroring menu styling — gradient tint + icon):
    - **Apply to a product** → `setStep("product")` → product picker → theme → final → hands off to `AutoDesignModal` (already uses `insp` for the inspiration image).
    - **Use with a text prompt** → `setStep("theme")` then `"final"` where the prompt textarea appears (existing prompt-track UI).
  - Track stays `"copy"` so we know to skip the template step.
- Update `goBack` for new steps:
  - `source` → `menu` (clear track)
  - `use` → `source`
  - `theme` (copy) → `use`
  - `product` (copy) → `use`
  - `final` (copy+prompt) → `theme`
- Update `stepIndex` / `totalSteps`:
  - copy+product: source → use → product → theme → final = 5
  - copy+prompt: source → use → theme → final = 4

### Cleanup

- Remove the small "Copy from URL" link from the Template step header (keep "Upload" there for the other tracks). The URL/Pinterest import is no longer surfaced.
- The `import-design-template` edge function and existing upload code stay; only the URL UI is removed.

## No backend changes

Reuses `user_design_templates` table, `design-templates` bucket, `AutoDesignModal`, and `design-poster-prompt` edge function (uploaded image passed as `inspirationImage`).
