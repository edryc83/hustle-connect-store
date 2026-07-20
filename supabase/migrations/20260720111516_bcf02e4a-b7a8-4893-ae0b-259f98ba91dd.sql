
-- ===== 1. app_config: restrict public reads to non-secret keys =====
DROP POLICY IF EXISTS "Public read app_config" ON public.app_config;
CREATE POLICY "Public read non-secret app_config"
  ON public.app_config FOR SELECT
  USING (key NOT IN ('vapid_private_jwk', 'fx_rates_usd'));

-- ===== 2. profiles: restrict anon column visibility =====
-- Keep permissive RLS (storefront must load), but revoke anon column access
-- to sensitive PII. Storefront reads use only public columns.
REVOKE SELECT ON public.profiles FROM anon;
GRANT SELECT (
  id, store_name, store_slug, profile_picture_url, category, city,
  store_bio, delivery_areas, currency, first_name, business_type,
  view_count, welcome_message, cover_photo_url, country, district,
  shop_number, building, street, is_online_only, instagram_url,
  tiktok_url, ai_assistant_enabled, facebook_url, accent_color,
  created_at
) ON public.profiles TO anon;

-- ===== 3. Storage: product-images ownership checks =====
DROP POLICY IF EXISTS "Authenticated upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete product images" ON storage.objects;
DROP POLICY IF EXISTS "Public read product images" ON storage.objects;

CREATE POLICY "Own folder upload product images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'product-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
CREATE POLICY "Own folder update product images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'product-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'product-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
CREATE POLICY "Own folder delete product images"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'product-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ===== 4. Storage: store-images ownership checks =====
DROP POLICY IF EXISTS "Authenticated upload store images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update store images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete store images" ON storage.objects;
DROP POLICY IF EXISTS "Public read store images" ON storage.objects;

CREATE POLICY "Own folder upload store images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'store-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
CREATE POLICY "Own folder update store images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'store-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'store-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
CREATE POLICY "Own folder delete store images"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'store-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Remove the broad public read on ad-images bucket listing.
-- (Direct URL access via /object/public/... continues to work.)
DROP POLICY IF EXISTS "Public can view ad-images" ON storage.objects;

-- ===== 5. Function search_path fixes for email queue helpers =====
CREATE OR REPLACE FUNCTION public.enqueue_email(queue_name text, payload jsonb)
 RETURNS bigint
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ SELECT pgmq.send(queue_name, payload); $function$;

CREATE OR REPLACE FUNCTION public.read_email_batch(queue_name text, batch_size integer, vt integer)
 RETURNS TABLE(msg_id bigint, read_ct integer, message jsonb)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ SELECT msg_id, read_ct, message FROM pgmq.read(queue_name, vt, batch_size); $function$;

CREATE OR REPLACE FUNCTION public.delete_email(queue_name text, message_id bigint)
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ SELECT pgmq.delete(queue_name, message_id); $function$;

CREATE OR REPLACE FUNCTION public.move_to_dlq(source_queue text, dlq_name text, message_id bigint, payload jsonb)
 RETURNS bigint
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE new_id BIGINT;
BEGIN
  SELECT pgmq.send(dlq_name, payload) INTO new_id;
  PERFORM pgmq.delete(source_queue, message_id);
  RETURN new_id;
END;
$function$;

-- ===== 6. Revoke EXECUTE on admin/internal SECURITY DEFINER functions =====
-- Keep public/authenticated access only for functions safely callable from
-- client code (is_admin/is_agent/is_supplier/increment_*/deduct/credit tokens
-- go through server code). Admin/internal helpers get service_role only.

REVOKE EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.delete_email(text, bigint) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.email_queue_wake() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.email_queue_dispatch() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.admin_delete_seller(uuid, uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.deduct_tokens(uuid, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.credit_tokens(uuid, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_last_active() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.sync_seller_category() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.touch_updated_at() FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.delete_email(text, bigint) TO service_role;
GRANT EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.admin_delete_seller(uuid, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.deduct_tokens(uuid, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.credit_tokens(uuid, integer) TO service_role;
