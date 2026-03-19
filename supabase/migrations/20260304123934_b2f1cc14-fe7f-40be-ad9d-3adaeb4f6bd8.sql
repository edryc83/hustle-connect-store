
CREATE OR REPLACE FUNCTION public.admin_delete_seller(_admin_id uuid, _seller_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Verify caller is admin
  IF NOT public.is_admin(_admin_id) THEN
    RAISE EXCEPTION 'Unauthorized: not an admin';
  END IF;

  -- Delete product images for seller's products
  DELETE FROM public.product_images WHERE product_id IN (SELECT id FROM public.products WHERE user_id = _seller_id);

  -- Delete products
  DELETE FROM public.products WHERE user_id = _seller_id;

  -- Delete orders
  DELETE FROM public.orders WHERE seller_id = _seller_id;

  -- Delete profile
  DELETE FROM public.profiles WHERE id = _seller_id;
END;
$$;
