

## Bug Audit and Fixes

After thorough exploration, here are the bugs found and the plan to fix them:

### Bug 1: "All Products" section ignores filters when no featured products exist
**File:** `src/pages/Storefront.tsx` line 896
**Issue:** When `featured.length > 0`, it correctly shows `nonFeatured`. But when there are no featured products, it renders `products` (the raw, unfiltered list) instead of `filteredProducts`. This means search/filter inputs are silently ignored.
**Fix:** Change `products` to `filteredProducts` on line 896.

### Bug 2: StorefrontHeader shows `city` but system moved to districts-only
**File:** `src/components/storefront/StorefrontHeader.tsx` lines 97-103
**Issue:** The location fallback on line 100 checks `profile.city`, but since the settings page removed the city field and only saves `district`, newer stores will show no location. The address display (line 97) also only appends `city` but not `district`.
**Fix:** Update location display to prefer `district` over `city`, falling back to `city` for legacy data. Show district in address and standalone location lines.

### Bug 3: Explore page `getLocationLabel` uses city before district
**File:** `src/pages/Explore.tsx` line 41
**Issue:** `getLocationLabel` builds from `[city, district]` but since city is no longer collected, most stores will show empty location. District should come first.
**Fix:** Change to `[store.district, store.city].filter(Boolean)` so district is primary.

### Bug 4: OG meta description references `profile.city` instead of `profile.district`
**File:** `src/pages/Storefront.tsx` line 642
**Issue:** The dynamic OG description uses `profile.city` for the location snippet. Since city is no longer set for new stores, this will produce no location in share previews.
**Fix:** Change to `profile.district || profile.city`.

### Bug 5: Storefront delivery address placeholder is Uganda-specific
**File:** `src/pages/Storefront.tsx` line 429
**Issue:** Placeholder says "Plot 12, Kampala Road" which is only relevant for Ugandan stores. Minor UX issue.
**Fix:** Change to a more generic placeholder like "Enter your delivery address".

### Bug 6: `CardHeader` used without import
**File:** `src/pages/dashboard/DashboardSettings.tsx` lines 357-358
**Issue:** Uses `<CardHeader>` and `<CardTitle>` but imports only `Card` and `CardContent` from the card component (line 10 only imports `Card, CardContent, CardHeader, CardTitle` — need to verify).
**Fix:** Verify import includes `CardHeader` and `CardTitle`. (Checked: line 10 does import them, so this is fine.)

---

### Summary of Changes

| File | Change |
|---|---|
| `src/pages/Storefront.tsx:896` | `products` → `filteredProducts` |
| `src/pages/Storefront.tsx:642` | `profile.city` → `profile.district \|\| profile.city` |
| `src/pages/Storefront.tsx:429` | Generic delivery placeholder |
| `src/components/storefront/StorefrontHeader.tsx` | Prefer `district` over `city` in location display |
| `src/pages/Explore.tsx:41` | Reorder to `[district, city]` |

