
-- Autopilot settings: one row per seller
CREATE TABLE public.autopilot_settings (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  enabled boolean NOT NULL DEFAULT false,
  post_times text[] NOT NULL DEFAULT ARRAY['09:00','13:00','18:00'],
  tone text NOT NULL DEFAULT 'friendly',
  timezone text NOT NULL DEFAULT 'Africa/Kampala',
  last_run_at timestamptz,
  last_slot text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.autopilot_settings TO authenticated;
GRANT ALL ON public.autopilot_settings TO service_role;
ALTER TABLE public.autopilot_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own autopilot" ON public.autopilot_settings FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Scheduled/published posts log
CREATE TABLE public.scheduled_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  slot text,
  scheduled_for timestamptz NOT NULL DEFAULT now(),
  posted_at timestamptz,
  status text NOT NULL DEFAULT 'pending', -- pending | posted | failed | skipped
  caption text,
  image_url text,
  fb_post_id text,
  ig_post_id text,
  error text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.scheduled_posts (user_id, created_at DESC);
CREATE INDEX ON public.scheduled_posts (user_id, product_id, posted_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.scheduled_posts TO authenticated;
GRANT ALL ON public.scheduled_posts TO service_role;
ALTER TABLE public.scheduled_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own scheduled posts" ON public.scheduled_posts FOR SELECT USING (auth.uid() = user_id);

-- Cron: every 15 min invoke autopilot-run
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'autopilot-run') THEN
    PERFORM cron.schedule(
      'autopilot-run',
      '*/15 * * * *',
      $cron$
        SELECT net.http_post(
          url:='https://rmhpdalhkcbsbrphhjre.supabase.co/functions/v1/autopilot-run',
          headers:='{"Content-Type":"application/json"}'::jsonb,
          body:='{}'::jsonb
        );
      $cron$
    );
  END IF;
END $$;
