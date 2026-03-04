

# AfroDuka — Phase 1: Supabase Cloud, Database, Auth & Landing Page

## Step 0: Enable Supabase Cloud

This project doesn't have Supabase connected yet. The first thing to do is **enable Lovable Cloud** (the built-in Supabase integration). You'll need to click "Enable Cloud" in your project settings or when prompted. This gives us auth, database, storage, and edge functions without needing an external Supabase account.

## Step 1: Database Schema

Create two tables via migrations:

**`profiles` table:**
- `id` (uuid, PK, FK → auth.users.id, ON DELETE CASCADE)
- `email` (text, nullable)
- `phone` (text, nullable)
- `store_name` (text)
- `store_slug` (text, unique)
- `profile_picture_url` (text, nullable)
- `category` (text) — one of: Food & Drinks, Fashion & Clothes, Beauty & Skincare, Phones & Electronics, Home & Decor, Plants & Garden, Other
- `city` (text)
- `whatsapp_number` (text)
- `created_at` (timestamptz, default now())
- `last_active_at` (timestamptz, default now())

**`products` table:**
- `id` (uuid, PK, default gen_random_uuid())
- `user_id` (uuid, FK → profiles.id, ON DELETE CASCADE)
- `name` (text, not null)
- `price` (numeric, not null)
- `description` (text, nullable)
- `variants_text` (text, nullable)
- `image_url` (text)
- `created_at` (timestamptz, default now())
- `updated_at` (timestamptz, default now())

**RLS policies:**
- Public SELECT on both tables (storefronts are public)
- Authenticated INSERT/UPDATE/DELETE on own rows only

**Trigger:** Auto-create profile row on auth signup. Update `last_active_at` on product insert/update.

**Storage buckets:** `store-images` and `product-images` (public read, authenticated upload).

## Step 2: Auth Setup

- Supabase Auth with email+password and phone+password
- No OAuth providers needed
- Profile creation handled by DB trigger

## Step 3: Landing Page

Build the public homepage at `/` with:

- **Navbar:** AfroDuka logo (text), "Explore Stores" link, "Sign In" and "Create Your Store" buttons
- **Hero:** Headline "Your shop. Your WhatsApp. Your hustle.", subtext, two CTA buttons
- **How It Works:** 3-step visual (Create store → Add products → Share your link) with icons
- **Example Stores:** Row of placeholder store cards (dummy data)
- **Footer:** Logo + "© AfroDuka"

**Design tokens** (added to `index.css`):
- Primary/accent: `#FF6B35` (warm orange)
- Font: Inter (via Google Fonts)
- Clean white background, card-based UI
- `max-w-6xl` centered container on desktop, full-width on mobile

## Step 4: File Structure

```text
src/
  components/
    layout/
      Navbar.tsx
      Footer.tsx
    landing/
      HeroSection.tsx
      HowItWorks.tsx
      ExampleStores.tsx
  lib/
    supabase.ts          # Supabase client
  integrations/
    supabase/
      types.ts           # Generated types
  pages/
    Index.tsx            # Landing page (updated)
    Login.tsx            # (placeholder for next phase)
    Signup.tsx           # (placeholder for next phase)
```

## Summary

This phase delivers: Lovable Cloud enabled, database schema with RLS, storage buckets, and a polished responsive landing page with AfroDuka branding. The next phase will build the 3-step signup flow and login page.

