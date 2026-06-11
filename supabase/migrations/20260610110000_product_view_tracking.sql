ALTER TABLE public.products ADD COLUMN IF NOT EXISTS view_count integer NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS public.product_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  seller_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_views_seller_created
  ON public.product_views (seller_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_product_views_product_created
  ON public.product_views (product_id, created_at DESC);

ALTER TABLE public.product_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sellers can view own product views"
  ON public.product_views
  FOR SELECT
  TO authenticated
  USING (seller_id = auth.uid());

CREATE OR REPLACE FUNCTION public.increment_product_views(p_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  owner_id uuid;
BEGIN
  SELECT user_id INTO owner_id FROM public.products WHERE id = p_id;
  IF owner_id IS NULL THEN
    RETURN;
  END IF;

  UPDATE public.products
  SET view_count = view_count + 1
  WHERE id = p_id;

  INSERT INTO public.product_views (product_id, seller_id)
  VALUES (p_id, owner_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_product_views(uuid) TO anon, authenticated;
