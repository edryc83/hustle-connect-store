ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cover_photo_url text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS country text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS district text;