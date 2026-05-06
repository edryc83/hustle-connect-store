Plan to fix shop sharing previews

1. Update the shop preview metadata
- Change the store-level share title from platform-focused text like `Shop on Afristall` to the shop name itself.
- Use the seller’s store bio as the main description when available.
- If there is no bio, generate a shop-focused fallback using the store name, category, and location, without making Afristall the headline.

Example target preview:
```text
Ogora Coffee
Fresh coffee in Kampala. Order directly on WhatsApp.
https://afristall.com/ogoracoffee
```

Instead of:
```text
Afristall — Your Shop, Your WhatsApp, Your Hustle
Create your online storefront...
```

2. Update the backend share-preview function
- Edit `supabase/functions/og-store/index.ts` so WhatsApp, Facebook, X, and other link previews receive store-specific Open Graph tags.
- Keep Afristall only as the technical site name, not as the main title/description.
- Prefer the shop profile image for the preview image, with the existing fallback image only if the shop has no image.

3. Update in-app shop sharing text
- Update shop share messages in:
  - Storefront share button
  - Dashboard overview share button
  - WhatsApp test card
- Remove wording like `Check out [shop] on Afristall` and replace it with seller-first wording such as `Check out [shop] — order directly on WhatsApp`.

4. Keep product shares product-specific
- Product links should still preview the product name, price/image, and seller shop name.
- Store links should preview the shop overall.

5. Fix the build errors included in your message
- Patch the Deno type issues in `push-notifications` by passing clean `ArrayBuffer` values into Web Crypto APIs.
- Fix `send-welcome-email` unknown error typing.
- Add explicit types in `process-email-queue` for queue messages.
- Replace `replaceAll` in `FlyerCanvas.tsx` with a compatible split/join approach.

6. Deploy the updated share-preview function
- Redeploy the `og-store` backend function after the metadata changes so the live WhatsApp preview updates.
- Note: WhatsApp may cache previews, so already-shared links can take time to refresh. New links or links with a harmless query string usually show the updated preview sooner.

Technical details
- Files likely to change:
  - `supabase/functions/og-store/index.ts`
  - `src/pages/Storefront.tsx`
  - `src/pages/dashboard/DashboardOverview.tsx`
  - `src/components/dashboard/WhatsAppTestCard.tsx`
  - `supabase/functions/push-notifications/index.ts`
  - `supabase/functions/send-welcome-email/index.ts`
  - `supabase/functions/process-email-queue/index.ts`
  - `src/screens/FlyerStudio/FlyerCanvas.tsx`
- No database schema changes are needed.