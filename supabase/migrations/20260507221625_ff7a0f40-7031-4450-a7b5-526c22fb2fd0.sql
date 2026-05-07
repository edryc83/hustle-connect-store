
-- Storage bucket for user-uploaded reference templates
INSERT INTO storage.buckets (id, name, public)
VALUES ('design-templates', 'design-templates', true)
ON CONFLICT (id) DO NOTHING;

-- Public read
CREATE POLICY "Design templates are publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'design-templates');

-- Authenticated users can upload to their own folder
CREATE POLICY "Users can upload their own design templates"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'design-templates'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own design templates"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'design-templates'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own design templates"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'design-templates'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Table for template metadata
CREATE TABLE public.user_design_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  label TEXT NOT NULL,
  image_url TEXT NOT NULL,
  prompt TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_design_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own design templates"
ON public.user_design_templates FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own design templates"
ON public.user_design_templates FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own design templates"
ON public.user_design_templates FOR DELETE
USING (auth.uid() = user_id);

CREATE INDEX idx_user_design_templates_user ON public.user_design_templates(user_id, created_at DESC);
