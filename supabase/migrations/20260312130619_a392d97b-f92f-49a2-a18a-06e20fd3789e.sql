
-- Add subcategory column to products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS subcategory text;

-- Update sync_seller_category to include subcategories in profile JSON
CREATE OR REPLACE FUNCTION public.sync_seller_category()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _user_id uuid;
  _all_categories text;
BEGIN
  _user_id := COALESCE(NEW.user_id, OLD.user_id);
  
  SELECT string_agg(DISTINCT category, ', ' ORDER BY category)
  INTO _all_categories
  FROM public.products
  WHERE user_id = _user_id AND category IS NOT NULL AND category != '';
  
  IF _all_categories IS NOT NULL THEN
    UPDATE public.profiles
    SET category = (
      SELECT jsonb_object_agg(cat, COALESCE(subs, '[]'::jsonb))::text
      FROM (
        SELECT 
          p.category AS cat,
          jsonb_agg(DISTINCT p.subcategory) FILTER (WHERE p.subcategory IS NOT NULL AND p.subcategory != '') AS subs
        FROM public.products p
        WHERE p.user_id = _user_id AND p.category IS NOT NULL AND p.category != ''
        GROUP BY p.category
        ORDER BY cat
      ) sub
    )
    WHERE id = _user_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;
