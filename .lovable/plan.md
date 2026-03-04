

## Plan: Add "Seller Login / Dashboard" link to storefront

### Problem
Sellers visiting their own store as buyers have no visible way to navigate back to their dashboard or log in.

### Solution
Add a small, unobtrusive link in the storefront footer (next to the "Powered by Afristall" text) that says **"Seller? Go to Dashboard"** which links to `/dashboard`. If the user is already logged in, it takes them straight to the dashboard. If not, the dashboard layout will redirect them to `/login`.

Additionally, add the same link in the floating top-left corner of the storefront for easy access.

### Changes

**`src/pages/Storefront.tsx`**
1. Import `useAuth` hook
2. In the floating top-left area (mirroring the top-right theme/share buttons), add a small "Dashboard" or "Sign In" button:
   - If user is logged in and is the store owner: show "Dashboard" link
   - If user is logged in but not the owner: show nothing extra
   - If not logged in: show a subtle "Sign In" link
3. Update both footer sections (product detail view + shop view) to include a "Seller Login" link alongside the "Powered by Afristall" line

### UI Details
- Floating top-left: a small ghost/outline button with `LogIn` or `LayoutDashboard` icon, rounded-full, matching the style of the top-right buttons
- Footer: a subtle text link "Are you the seller? Sign in" below the powered-by line
- Non-intrusive to the buyer experience

