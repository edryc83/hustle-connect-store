# Afristall — Product Description

**Tagline:** *Your hustle deserves a proper shop.*

**Version:** 1.0 | **Last Updated:** March 2026

---

## 1. Overview

Afristall is a mobile-first e-commerce platform purpose-built for African small businesses and entrepreneurs. It enables sellers to create a professional online storefront in under 2 minutes — no technical skills, no upfront costs — and receive orders directly via WhatsApp.

Built as a Progressive Web App (PWA) with Capacitor for native mobile distribution, Afristall runs on **React**, **TypeScript**, **Tailwind CSS**, and **Supabase** (via Lovable Cloud).

---

## 2. Core Features

### 2.1 Instant Storefront Creation
- **3-step onboarding:** Sign up → Name your store → Start selling.
- Each seller gets a unique shareable URL: `afristall.com/{store-slug}`.
- Customisable store profile: cover photo, logo, bio, social links (Instagram, TikTok, Facebook), welcome message.
- Auto-generated AI store bios (max 120 chars) based on category and location.

### 2.2 Product & Service Listings
- Support for **products**, **services**, and **experiences** with dynamic terminology (Product/Package/Experience).
- Multi-image uploads with drag-to-reorder carousel.
- Listing fields: name, description, price, discount price, condition, category, subcategory, variants.
- **AI-Powered Description Generator:** One-tap generation of catchy, sales-ready descriptions using AI (max 2 sentences, under 120 characters).

### 2.3 Intelligent Product Attributes (AI Vision)
- **Multimodal AI analysis** of product images, titles, and descriptions via a dedicated backend function.
- Automatically detects and suggests:
  - **Category & subcategory** from 65+ subcategories across 11 top-level categories.
  - **Attributes** from a master library of 80+ types (size, colour, material, brand, flavour, etc.).
- Confidence-based UX:
  - **High confidence** → Pre-filled with Accept/Dismiss controls.
  - **Medium confidence** → Suggestion chips for one-tap selection.
- Sellers can override, add custom attributes, or opt for "Chat to order" mode.
- Stored as flexible JSONB in the database for maximum extensibility.

### 2.4 WhatsApp-First Ordering
- Buyers tap "Order on WhatsApp" to send a pre-formatted message directly to the seller.
- Message includes: product name, price, selected attributes (size, colour, etc.), quantity, and optional notes.
- **WhatsApp tap tracking** for seller analytics.
- No payment gateway required — transactions happen on the seller's terms.

### 2.5 Shopping Cart & Multi-Item Orders
- Full cart functionality: add/remove items, adjust quantities.
- Cart drawer with real-time totals.
- Bulk WhatsApp order messages for multi-item checkouts.

### 2.6 Buyer Wishlist
- Visitors can save favourite products across sessions.
- Heart icon toggle on product cards and detail views.

### 2.7 Storefront Discovery & Exploration
- `/explore` page for browsing all live stores.
- Category-based filtering and search.
- Featured product highlights per store.
- Store view counter for seller insights.

---

## 3. AI-Powered Tools

### 3.1 AI Product Description Generator
- **Engine:** Lovable AI Gateway (Google Gemini)
- Generates warm, sales-focused copy tailored for African small businesses.
- Adapts tone for products vs. services.

### 3.2 AI Caption Generator
- Creates social media captions for product marketing.
- Optimised for WhatsApp, Instagram, and TikTok sharing.

### 3.3 AI Tagline Generator
- Produces punchy taglines and subtitles for Ad Studio marketing materials.
- Rules: never repeats product name, never references the image.

### 3.4 AI Store Bio Generator
- Auto-generates 2-line bios (max 120 chars) based on store category and location.
- Visually marked with ✨ AI filled label.

### 3.5 AI Product Image Analyser
- Multimodal vision model analyses uploaded product photos.
- Returns: suggested name, description, category, subcategory, and 5–15 attribute recommendations with confidence scores.
- Powers the intelligent attribute pre-fill system.

### 3.6 AI Store Assistant
- Per-store conversational assistant for buyer enquiries.
- Contextually aware of the store's products, categories, and pricing.

---

## 4. Ad Studio (Marketing Toolkit)

### 4.1 Overview
An authenticated 3-step marketing wizard accessible at `/ad-studio`:

1. **Template Picker:** 12 professionally designed ad templates with live previews.
2. **Image Source:** Select from existing products or upload custom images. Includes AI background removal.
3. **Canvas Editor:** Interactive fabric.js-based design canvas with:
   - Drag, resize, and reposition product images.
   - Editable text overlays (subtitle, tagline, price).
   - **AI Smart Copy:** Generates 3 marketing copy variations per product.
   - Auto-scaling text with word-break rules.

### 4.2 Output
- High-fidelity ad images rendered via a deterministic template engine.
- Includes seller profile, store name, and adaptive Afristall watermark.
- Ready for sharing on WhatsApp, Instagram Stories, and social media.

---

## 5. Seller Dashboard

### 5.1 Dashboard Overview
- At-a-glance metrics: total products, WhatsApp taps, store views.
- Daily selling tips.
- Quick actions: add product, share store link.

### 5.2 Product Management
- Full CRUD: create, edit, delete, feature/unfeature products.
- Bulk image management with drag-to-reorder.
- AI-assisted fields throughout (description, attributes, category).
- Duplicate product for quick listing variations.

### 5.3 Order Management
- View and track orders with status updates.
- Customer details, delivery addresses, and notes.

### 5.4 Analytics
- WhatsApp tap counts per product.
- Store view tracking.
- Product performance insights.

### 5.5 Store Settings
- Profile customisation: name, bio, cover photo, social links.
- Currency selection (multi-currency support).
- Location settings: country, city, district, street address.
- Delivery area configuration.
- Online-only toggle for digital-first businesses.
- Wallpaper picker for storefront personalisation.

---

## 6. Buyer Experience

### 6.1 Storefront
- Clean, mobile-first product grid with lazy-loaded images.
- Category and subcategory filters with search.
- Product detail modals with image carousel and attribute picker.
- Optional "Customise your order" section — buyers can skip to WhatsApp without selecting options.
- Visitor name capture for personalised experiences.

### 6.2 Dark/Light Mode
- System-aware theme toggle available on storefronts.
- Consistent design tokens across both modes.

---

## 7. Platform Administration

### 7.1 Super Admin Panel
- Secure admin login with role-based access.
- Seller management: view, audit, and delete seller accounts.
- Order overview across the platform.
- Platform-wide analytics.

---

## 8. Technical Architecture

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui |
| **State** | React hooks, React Query |
| **Backend** | Lovable Cloud (Supabase) — PostgreSQL, Edge Functions, Storage, Auth |
| **AI** | Lovable AI Gateway → Google Gemini (Flash/Pro), structured output via tool calling |
| **Mobile** | Capacitor (iOS/Android WebView wrapper) |
| **PWA** | Service worker, web manifest, push notifications |
| **Image Processing** | @imgly/background-removal (client-side), Supabase Storage |
| **Ad Rendering** | fabric.js canvas + deterministic server-side renderer |
| **Auth** | Email/password with email verification, Row-Level Security (RLS) |

### 8.1 Database Design
- **profiles** — Seller store data, social links, location, currency.
- **products** — Listings with JSONB attributes, multi-image support.
- **product_images** — Ordered image gallery per product.
- **orders** — Customer orders with status tracking.
- **platform_admins** — Super admin access control.
- **push_subscriptions** — Web push notification endpoints.
- Row-Level Security enforced on all user-facing tables.

### 8.2 Edge Functions (Backend Functions)
| Function | Purpose |
|----------|---------|
| `analyze-product-image` | AI vision analysis for category/attribute detection |
| `generate-description` | AI product description generation |
| `generate-captions` | Social media caption generator |
| `generate-tagline` | Ad tagline/subtitle generator |
| `generate-bio` | Store bio auto-generation |
| `generate-share-caption` | Shareable product caption creator |
| `ad-suggest-text` | Ad Studio smart copy (3 variations) |
| `ad-render` / `ad-templates` | Ad image rendering pipeline |
| `store-assistant` | Per-store AI shopping assistant |
| `backfill-categories` | Batch category/subcategory detection |
| `og-store` | Open Graph meta generation for SEO |
| `push-notifications` | Web push notification delivery |
| `auth-email-hook` | Custom branded auth emails |
| `send-welcome-email` | Onboarding welcome email |
| `search-wallpapers` | Storefront wallpaper search |

---

## 9. Key Differentiators

| Feature | Afristall | Typical E-commerce |
|---------|-----------|-------------------|
| Setup time | < 2 minutes | Hours to days |
| Cost | Free to start | Monthly fees |
| Orders via | WhatsApp (familiar) | Complex checkout |
| AI assistance | Built-in (descriptions, attributes, marketing) | Usually add-on |
| Target market | African SMEs & hustlers | Generic/global |
| Mobile-first | PWA + native app | Often desktop-first |
| Payment | Flexible (seller-managed) | Gateway-dependent |

---

## 10. Supported Categories

Fashion & Clothing · Electronics & Gadgets · Home Appliances · Food & Beverages · Beauty & Cosmetics · Home & Living · Health & Wellness · Jewellery & Accessories · Baby & Kids · Art & Crafts · Sports & Fitness · Cakes · Flowers · Wigs · Pets · Plants · Furniture · Delivery · Repair · Grooming · Cleaning · Photography · Catering · Education · Design · Tech · Tailoring · Trips · Adventure · Dining · Wellness · Cultural

---

## 11. Deployment & Distribution

- **Web:** Published at [afristall.com](https://afristall.com) via Lovable Cloud.
- **PWA:** Installable on any device via browser "Add to Home Screen."
- **Mobile App:** Capacitor-wrapped for App Store and Google Play distribution.
- **SEO:** Open Graph tags, JSON-LD structured data, server-rendered meta via `og-store` function.

---

*Built with ❤️ for African entrepreneurs by Afristall.*
