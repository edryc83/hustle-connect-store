
-- Product images table for multiple images per product
CREATE TABLE public.product_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

-- Anyone can view product images (products are public)
CREATE POLICY "Public can view product images"
  ON public.product_images FOR SELECT
  USING (true);

-- Only product owner can insert
CREATE POLICY "Users can insert own product images"
  ON public.product_images FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.products WHERE products.id = product_id AND products.user_id = auth.uid())
  );

-- Only product owner can update
CREATE POLICY "Users can update own product images"
  ON public.product_images FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.products WHERE products.id = product_id AND products.user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.products WHERE products.id = product_id AND products.user_id = auth.uid())
  );

-- Only product owner can delete
CREATE POLICY "Users can delete own product images"
  ON public.product_images FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM public.products WHERE products.id = product_id AND products.user_id = auth.uid())
  );
