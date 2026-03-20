

## Plan: Move AccentColorPicker to Settings & Remove Install Section

### What's changing

1. **Move the "Shop Branding" (AccentColorPicker) from Profile to Settings page**
   - Remove the AccentColorPicker block from `DashboardProfile.tsx` (lines 319-328)
   - Add a "Shop Branding" card in `DashboardSettings.tsx` after the WhatsApp Test card, containing the AccentColorPicker component
   - Need to fetch `accent_color` from the profile data in Settings and add state for it

2. **Remove the "Install Afristall as an App" section from Settings**
   - Delete the entire install-app Card (lines 670-760) and the hash-scroll logic (lines 78-85)

### Files changed
1. `src/pages/dashboard/DashboardProfile.tsx` — remove AccentColorPicker import and usage
2. `src/pages/dashboard/DashboardSettings.tsx` — add AccentColorPicker import + "Shop Branding" card; remove install-app section and scroll-to-hash code

