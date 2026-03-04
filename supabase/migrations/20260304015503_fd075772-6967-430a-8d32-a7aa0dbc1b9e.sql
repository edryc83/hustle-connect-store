ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS first_name text DEFAULT null;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS condition text DEFAULT null;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS listing_type text DEFAULT 'product';