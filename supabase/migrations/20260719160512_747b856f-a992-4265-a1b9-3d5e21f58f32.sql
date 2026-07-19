
CREATE TABLE public.commercial_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  product_id uuid,
  template_id text NOT NULL,
  vibe_prompt text,
  status text NOT NULL DEFAULT 'queued',
  shot_count int NOT NULL,
  tokens_charged int NOT NULL DEFAULT 0,
  source_image_url text,
  result_url text,
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.commercial_jobs TO authenticated;
GRANT ALL ON public.commercial_jobs TO service_role;

ALTER TABLE public.commercial_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own commercial jobs select" ON public.commercial_jobs
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own commercial jobs insert" ON public.commercial_jobs
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own commercial jobs update" ON public.commercial_jobs
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own commercial jobs delete" ON public.commercial_jobs
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_commercial_jobs_user ON public.commercial_jobs(user_id, created_at DESC);

CREATE TABLE public.commercial_shots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.commercial_jobs(id) ON DELETE CASCADE,
  shot_index int NOT NULL,
  provider_job_id text,
  status text NOT NULL DEFAULT 'queued',
  video_url text,
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.commercial_shots TO authenticated;
GRANT ALL ON public.commercial_shots TO service_role;

ALTER TABLE public.commercial_shots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own commercial shots select" ON public.commercial_shots
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.commercial_jobs j WHERE j.id = job_id AND j.user_id = auth.uid())
  );

CREATE INDEX idx_commercial_shots_job ON public.commercial_shots(job_id, shot_index);

ALTER PUBLICATION supabase_realtime ADD TABLE public.commercial_jobs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.commercial_shots;
