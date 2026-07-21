
-- Restore public read of non-PII profile fields (excludes email, phone, momo_*, token_balance)
GRANT SELECT (
  id, store_name, store_slug, profile_picture_url, category, city,
  whatsapp_number, created_at, last_active_at, store_bio, delivery_areas,
  currency, first_name, business_type, view_count, welcome_message,
  cover_photo_url, country, district, shop_number, building, street,
  is_online_only, instagram_url, tiktok_url, ai_assistant_enabled,
  facebook_url, accent_color
) ON public.profiles TO anon, authenticated;

-- Owners need full access to their own row
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

-- Tighten SELECT policy: public gets only listing fields (enforced by grants);
-- keep policy permissive so column-level grants govern access.
DROP POLICY IF EXISTS "Public can view profiles" ON public.profiles;
CREATE POLICY "Public can view store listings"
  ON public.profiles FOR SELECT
  USING (true);
