
-- Add category column to products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category text;

-- Create function to auto-sync seller store category from their products
CREATE OR REPLACE FUNCTION public.sync_seller_category()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _user_id uuid;
  _top_category text;
  _all_categories text;
BEGIN
  -- Determine which user_id to update
  _user_id := COALESCE(NEW.user_id, OLD.user_id);
  
  -- Find all distinct categories from this seller's products
  SELECT string_agg(DISTINCT category, ', ' ORDER BY category)
  INTO _all_categories
  FROM public.products
  WHERE user_id = _user_id AND category IS NOT NULL AND category != '';
  
  -- Build a JSON object with each category as a key (matching the CategoryPicker format)
  IF _all_categories IS NOT NULL THEN
    UPDATE public.profiles
    SET category = (
      SELECT jsonb_object_agg(cat, '[]'::jsonb)::text
      FROM (
        SELECT DISTINCT category AS cat
        FROM public.products
        WHERE user_id = _user_id AND category IS NOT NULL AND category != ''
        ORDER BY cat
      ) sub
    )
    WHERE id = _user_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Trigger on product insert/update/delete
DROP TRIGGER IF EXISTS trg_sync_seller_category ON public.products;
CREATE TRIGGER trg_sync_seller_category
AFTER INSERT OR UPDATE OF category OR DELETE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.sync_seller_category();
