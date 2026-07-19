
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS view_count INTEGER NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION public.increment_product_views(p_id UUID)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.products SET view_count = view_count + 1 WHERE id = p_id;
$$;

REVOKE ALL ON FUNCTION public.increment_product_views(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_product_views(UUID) TO anon, authenticated;
