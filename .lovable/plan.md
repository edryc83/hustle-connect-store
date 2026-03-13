

## Problem

The screenshot shows the app opened in Chrome's Custom Tab (or in-app browser) on Android — there's an orange toolbar with the URL bar and close button at the top. This happens when someone opens the link from WhatsApp or another app instead of installing the PWA.

## What's Possible

1. **When installed as a PWA** (Add to Home Screen): The browser chrome disappears entirely — the app runs in `standalone` mode with no URL bar. This is already configured (`display: "standalone"` in the manifest). The user just needs to install it.

2. **When opened from a link** (e.g. WhatsApp, social media): Chrome always shows the Custom Tab toolbar. This cannot be removed — it's a browser security requirement. However, we can improve it:
   - **Fix the theme color**: Change `theme-color` from green (`#16a34a`) to match the dark background (`#09090b`), so the status bar and toolbar blend seamlessly with the app instead of showing orange (which Chrome may be picking up from the primary accent).
   - **Add `display_override: ["standalone", "window-controls-overlay"]`** to the manifest for maximum native feel when installed.

## Plan

### 1. Update `theme-color` meta tag in `index.html`
- Change `#16a34a` → `#09090b` (matches the dark background)
- This makes the status bar and any browser chrome blend with the app's dark theme

### 2. Update `theme_color` in `vite.config.ts` manifest
- Change `theme_color: "#16a34a"` → `"#09090b"`
- Add `display_override: ["standalone"]` to the manifest for stronger standalone signal

### 3. Add PWA install prompt on login page
- When the app detects it's running in a browser (not standalone), show a subtle banner or button encouraging "Install Afristall" for the full native experience
- This uses the existing `useInstallPrompt` hook

This won't remove the toolbar when opened via a link (that's impossible), but it will make the toolbar dark/invisible-looking, and guide users to install the PWA for a truly native experience.

