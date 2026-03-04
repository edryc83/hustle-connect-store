
-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  phone TEXT,
  store_name TEXT,
  store_slug TEXT UNIQUE,
  profile_picture_url TEXT,
  category TEXT,
  city TEXT,
  whatsapp_number TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_active_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  description TEXT,
  variants_text TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Public read on profiles
CREATE POLICY "Public can view profiles" ON public.profiles
  FOR SELECT USING (true);

-- Authenticated users can insert their own profile
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Authenticated users can update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Public read on products
CREATE POLICY "Public can view products" ON public.products
  FOR SELECT USING (true);

-- Authenticated users can insert own products
CREATE POLICY "Users can insert own products" ON public.products
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Authenticated users can update own products
CREATE POLICY "Users can update own products" ON public.products
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Authenticated users can delete own products
CREATE POLICY "Users can delete own products" ON public.products
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Trigger: auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, phone)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.phone
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Trigger: update last_active_at on product changes
CREATE OR REPLACE FUNCTION public.update_last_active()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles SET last_active_at = now() WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_product_change
  AFTER INSERT OR UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_last_active();

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('store-images', 'store-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);

-- Storage policies: public read
CREATE POLICY "Public read store images" ON storage.objects
  FOR SELECT USING (bucket_id = 'store-images');

CREATE POLICY "Public read product images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

-- Storage policies: authenticated upload
CREATE POLICY "Authenticated upload store images" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'store-images');

CREATE POLICY "Authenticated upload product images" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'product-images');

-- Storage policies: authenticated update own files
CREATE POLICY "Authenticated update store images" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'store-images');

CREATE POLICY "Authenticated update product images" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'product-images');

-- Storage policies: authenticated delete own files
CREATE POLICY "Authenticated delete store images" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'store-images');

CREATE POLICY "Authenticated delete product images" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'product-images');
