

## Problem

"Stock" (e.g., "In Stock", "Last Few Left") is an inventory/availability indicator — not something a buyer should select when ordering. Currently it appears as a selectable attribute in the storefront product detail view under "Customize your order."

## Fix

Filter out the `stock` key from the selectable attributes shown to buyers. The simplest and safest fix is in `getSelectableKeys()` in `src/lib/attributeLibrary.ts` — exclude `"stock"` from the returned keys.

**File:** `src/lib/attributeLibrary.ts`
- In `getSelectableKeys()`, add a filter to exclude `"stock"` from the list of keys returned.

Optionally, also display the stock value as an informational badge (e.g., "Last Few Left") on the product detail view rather than hiding it entirely — but the core fix is simply removing it from the buyer picker.

