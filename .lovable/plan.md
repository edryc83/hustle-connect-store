# Afristall — Meta AI Responder + Product Video Studio

Two new features, shipped as independent modules so we can release them separately.

---

## Feature 1 — Meta AI Responder (Facebook Page + Instagram)

**Goal:** When a customer DMs a seller's Facebook Page or Instagram business account outside working hours (or always, if the seller opts in), Afristall replies as the seller — grounded on their live product catalog — until a human takes over.

### User flow
1. Seller opens **Dashboard → AI Responder**.
2. Taps **Connect Facebook** → Meta OAuth (Facebook Login for Business). Grants: `pages_messaging`, `pages_manage_metadata`, `pages_show_list`, `instagram_basic`, `instagram_manage_messages`.
3. Picks which Page (and linked IG account) to connect.
4. Configures:
   - Mode: **Always on** / **After hours only** (with hours + timezone) / **Paused**.
   - Tone: Friendly / Professional / Playful.
   - Fallback WhatsApp number (defaults to store WhatsApp).
   - Auto-handover keywords ("agent", "human", "call me").
5. Sees a live **Inbox** with all incoming DMs, the AI reply, and a **Take over** button that mutes the AI for that thread for 6h.

### Backend
- Table `meta_connections` (seller_id, page_id, page_name, ig_user_id, page_access_token, status, mode, hours, tone, fallback_whatsapp, handover_keywords, created_at).
- Table `meta_threads` (id, connection_id, platform, psid, customer_name, last_message_at, ai_muted_until, unread_count).
- Table `meta_messages` (id, thread_id, direction in/out, sender ai/human/customer, text, attachments jsonb, meta_message_id, created_at).
- Edge functions:
  - `meta-oauth-callback` — exchanges code, fetches Pages, stores long-lived Page tokens.
  - `meta-webhook` — receives Meta webhook events (messages, postbacks), routes to responder.
  - `meta-responder` — the AI brain: loads seller catalog + recent thread history, calls Gemini 3 Flash with tools (`search_products`, `get_product_link`, `handover_to_human`), sends reply via Graph API.
  - `meta-send-message` — used by seller when they type in the inbox.
- Realtime on `meta_messages` so the Inbox updates live.
- Cost control: responder runs on `google/gemini-3-flash-preview` (cheap + fast). No token charge to seller in v1 — flat included; add metering later if abuse.

### Grounding
- On every reply, fetch top-N matching products via pg full-text on `products` table (name + description + tags).
- Include product URL (`afristall.com/{username}/{product-slug}`) so Meta renders rich previews.
- If no match, offer to notify seller and hand over.

### Secrets
- `META_APP_ID`, `META_APP_SECRET`, `META_WEBHOOK_VERIFY_TOKEN` — request from user.

### Out of scope for v1
- WhatsApp Cloud API (defer; needs Meta Business verification).
- Comment auto-reply on posts.
- Voice notes / image understanding in DMs.

---

## Feature 2 — Product Video Studio (cinematic clips from a photo)

**Goal:** Seller uploads a product photo, picks a camera-move template, gets a 5–8s vertical 9:16 cinematic video they can post to Reels/Status/TikTok.

### User flow
1. From Creative Studio, tap new **Motion Reel 🎬** entry (6th button).
2. Upload product photo (reuse compressor).
3. Pick a **template** (visual grid of 6):
   - Orbit — slow 180° camera arc.
   - Push-in — dolly toward product, subtle rack focus.
   - Reveal — top-down descend with rim lighting.
   - Float — product levitates, camera drifts.
   - Turntable — product rotates on plinth.
   - Splash — liquid/particle burst around product (for drinks / cosmetics).
4. Optional: 1-line vibe prompt ("warm sunset light", "matte black studio").
5. Confirm cost (e.g. **40 tokens**), tap **Generate**. Async job — modal shows "We'll notify you in ~2 min".
6. When ready: preview, hold-to-compare with source photo, **Download** and **Share to WhatsApp Status**.

### Backend
- Table `video_jobs` (id, user_id, source_image_url, template, prompt, provider, provider_job_id, status queued/processing/ready/failed, result_url, tokens_charged, error, created_at, completed_at).
- Edge functions:
  - `video-generate-start` — validates tokens, deducts via `deduct_tokens` RPC, uploads source to Storage, calls provider (Kling 2.1 via Replicate), inserts job row, returns job id.
  - `video-generate-webhook` — Replicate webhook → marks ready + stores URL, or refunds tokens on failure.
  - `video-job-status` — polling fallback.
- Realtime on `video_jobs` for live status.
- Storage bucket `product-videos` (public read).
- Provider: **Replicate + Kling 2.1 image-to-video** (best product fidelity). Fallback provider slot in code for Runway/Veo later.

### Templates
- Static array `videoTemplates.ts` with `id`, `label`, `emoji`, `previewUrl`, `cameraPrompt` (the deterministic motion instruction appended to user vibe).

### Secrets
- `REPLICATE_API_TOKEN` — request from user.

### Cost / tokens
- 40 tokens/clip (Kling ~$0.35/clip; margin protects free-tier abuse).
- Refund on provider failure automatic.

---

## Shipping order
1. Video Studio first — self-contained, no OAuth, immediate wow, drives token revenue.
2. Meta Responder second — bigger scope, needs Meta app review + secrets.

## What I need from you before I build
- Confirm shipping order above (Video first, then Meta) or flip it.
- Confirm **40 tokens/clip** for videos.
- For Meta: confirm you have (or will create) a Meta developer app so I can request `META_APP_ID` / `META_APP_SECRET` / `META_WEBHOOK_VERIFY_TOKEN`.
- For Video: confirm you'll create a Replicate account so I can request `REPLICATE_API_TOKEN`.
