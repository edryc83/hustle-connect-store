

## Explore Page: Multi-Level Category Navigation

### What Changes

Replace the current two-tab ("All Stores" / "Services") toggle with a **three-level drill-down navigation**: Top Level → Categories → Subcategories. Also add "Experiences" as a new business type.

### New Navigation Flow

```text
Level 1 (Top tabs):  Products  |  Services  |  Experiences
                         ↓
Level 2 (Categories):  e.g. "Fashion & Clothing", "Trips", "Birthday Experience"...
                         ↓
Level 3 (Subcategories): e.g. "Men's Wear", "Women's Wear"...
```

### Plan

**1. Add Experience category data to `CategoryPicker.tsx`**
- Create a new `EXPERIENCE_CATEGORY_DATA` dictionary with categories like: Trips, Birthday Experiences, Dining Experiences, Adventure & Outdoor, Wellness & Spa, Cultural Experiences, Workshops & Classes, Nightlife & Entertainment, etc., each with relevant subcategories.
- Include it in `ALL_CATEGORY_DATA`.

**2. Refactor Explore navigation in `Explore.tsx`**
- Change `TabType` from `"stores" | "services"` to `"products" | "services" | "experiences"`.
- Replace the current two-button toggle with three top-level pill buttons: **Products**, **Services**, **Experiences**.
- When a top-level tab is selected, show its categories as horizontally scrollable chips (from `PRODUCT_CATEGORY_DATA`, `SERVICE_CATEGORY_DATA`, or `EXPERIENCE_CATEGORY_DATA`).
- When a category is selected, show its subcategories as a second row of smaller chips below.
- Filter stores by matching `business_type` to the active tab, and `category` JSON to the selected category/subcategory.
- The existing filter panel (district, search) stays unchanged.

**3. Update store filtering logic**
- For "experiences" tab, filter where `business_type === "experience"`.
- For "products" tab, keep current behavior (non-service, non-experience).
- Category/subcategory filtering matches against the store's serialized `category` JSON field as it does today.

**4. Update `useBusinessTerms.tsx`**
- Add an "experience" case returning `{ singular: "Experience", plural: "Experiences", emoji: "✨" }`.

**5. Update `CategoryPicker.tsx` filter prop**
- Extend the `filter` prop to accept `"experiences"` and return `EXPERIENCE_CATEGORY_DATA` when selected.

### UI Behavior
- Selecting a top-level tab (Products/Services/Experiences) resets category and subcategory selections.
- Selecting a category shows subcategories inline and filters results.
- Selecting a subcategory further narrows results.
- An "All" option at each level shows everything within that scope.

