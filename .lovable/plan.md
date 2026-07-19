
# Studio Commercial ✨

Turn a product photo into a real ~15s commercial (2–3 cinematic shots stitched together with captions and background music), picked from a small library of ad-style templates. Not just one Motion Reel — a finished ad the seller can post.

## User flow

1. Open Creative Studio → tap **Studio Commercial 🎬✨** (new 7th button).
2. Pick a product from their store list (reuse the picker we built for Motion Reel).
3. Pick an **Ad Template**:
   - **Luxury** — slow orbit + push-in, cream/gold captions, mellow lounge track
   - **Street** — hard cut, snap zoom, bold uppercase captions, hip-hop track
   - **Minimal** — clean push-in + reveal, thin sans captions, ambient track
   - **Festive** — turntable + splash, bright captions, upbeat afrobeat track
   - **New Arrival** — reveal + orbit, "NEW / SHOP NOW" captions, energetic track
4. Optional short vibe prompt ("night city, neon", etc.).
5. Tap **Generate Commercial**. Progress card shows:
   - "Directing shot 1 of 3…" → "Shot 2 of 3…" → "Editing and adding music…"
6. Result screen: preview, download MP4, share to WhatsApp/status, "Make another".

## What each template controls

- 2–3 preset camera prompts (from the existing `videoTemplates.ts` primitives)
- Caption sequence with timing (e.g. `[{ text: "Handcrafted", from: 0.5, to: 3 }, { text: productName, from: 3.5, to: 7 }, { text: price + " · Order now", from: 8, to: 14 }]`)
- Background music track (bundled royalty-free MP3s in `public/audio/commercials/`)
- Caption style (font, weight, color, position, background chip)
- Total duration (~15s)

## Technical design

### Generation pipeline

Reuse the existing WAN 2.2 i2v-fast flow. For each shot in the template, fire a Replicate prediction; wait for all to finish; then stitch + overlay + mix client-side.

1. **New edge function `commercial-generate-start`**
   - Input: `productId`, `templateId`, optional `vibePrompt`
   - Fetches product photo, uploads to storage, signs URL
   - Creates a `commercial_jobs` row (new table) with `shot_count`, `template_id`, `status='queued'`
   - Fires N Replicate predictions in parallel (one per shot), each with its own camera prompt + vibe. Uses same webhook pattern as `video-generate-start`.
   - Tokens: gated by `tokens_enabled` (currently off). When re-enabled, charge e.g. 60 tokens for the whole commercial (refund all on any shot failure).

2. **Reuse `video-generate-webhook`** with a `commercial_shot_id` query param variant, or add `commercial-shot-webhook`. Each shot's completion updates a `commercial_shots` child row with the shot's video URL. When all shots are `ready`, mark parent job `shots_ready`.

3. **Client-side finishing (browser, no ffmpeg in edge functions)**
   - When job is `shots_ready`, download all shot MP4s.
   - Use `@ffmpeg/ffmpeg` (ffmpeg.wasm) in the browser to:
     - Trim each shot to its slot duration
     - Concatenate the shots
     - Overlay captions (drawtext filter, per-template style)
     - Mix in the template's background music (loop/trim to 15s, duck to ~30%)
     - Export final MP4
   - Upload final MP4 to `product-videos` bucket at `<user>/commercials/<jobId>.mp4`, signed URL back to job row, status `ready`.

### Schema (single migration)

```sql
CREATE TABLE public.commercial_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  product_id uuid,
  template_id text NOT NULL,
  vibe_prompt text,
  status text NOT NULL DEFAULT 'queued',  -- queued|generating|shots_ready|editing|ready|failed
  shot_count int NOT NULL,
  tokens_charged int NOT NULL DEFAULT 0,
  result_url text,
  error text,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

CREATE TABLE public.commercial_shots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES public.commercial_jobs(id) ON DELETE CASCADE,
  shot_index int NOT NULL,
  provider_job_id text,
  status text NOT NULL DEFAULT 'queued',
  video_url text,
  error text
);
```
(Full GRANT + RLS block: owner-only SELECT, service_role ALL.)

### Frontend

- New `StudioCommercialModal.tsx` (based on `StudioReelModal.tsx`), with stages: `pick-product` → `pick-template` → `vibe` → `processing` (progress log driven by realtime subscription on `commercial_jobs` + `commercial_shots`) → `editing` (ffmpeg.wasm progress) → `result`.
- New `src/components/dashboard/commercialTemplates.ts` — the 5 ad templates (camera prompts array, captions, music path, style).
- Bundle 5 short royalty-free instrumentals in `public/audio/commercials/` (~15s each; I'll use free CC0 loops).
- Add the 7th "Studio Commercial ✨" button to `DesignStudioModal.tsx` menu.

### Notes / trade-offs

- Client-side ffmpeg keeps this shippable without a video-render backend, and works fine on modern phones/desktops for ~15s at 720p. If mobile turns out too slow later, we swap the client stitcher for a serverless renderer.
- Motion Reel stays as-is (single-shot free-standing tool). Commercial is a separate, higher-craft output.
- Tokens are currently free per your last request; wiring is in place to flip on later.

## Deliverables

1. Migration for `commercial_jobs` + `commercial_shots` (+ GRANTs, RLS).
2. Edge functions: `commercial-generate-start`, `commercial-shot-webhook`, `commercial-finalize` (called by client after ffmpeg finishes to persist final URL + status).
3. `commercialTemplates.ts` + 5 bundled music tracks.
4. `StudioCommercialModal.tsx` + integration into `DesignStudioModal`.
5. Result screen with download + share.
