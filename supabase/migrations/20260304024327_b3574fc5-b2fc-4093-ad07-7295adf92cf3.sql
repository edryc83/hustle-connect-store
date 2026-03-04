
-- Add view_count to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS view_count integer NOT NULL DEFAULT 0;

-- Add whatsapp_taps to products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS whatsapp_taps integer NOT NULL DEFAULT 0;

-- RPC to increment store views
CREATE OR REPLACE FUNCTION public.increment_store_views(slug text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE profiles SET view_count = view_count + 1 WHERE store_slug = slug;
$$;

-- RPC to increment whatsapp taps
CREATE OR REPLACE FUNCTION public.increment_whatsapp_taps(p_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE products SET whatsapp_taps = whatsapp_taps + 1 WHERE id = p_id;
$$;
