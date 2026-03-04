
-- Admin table
CREATE TABLE public.platform_admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.platform_admins ENABLE ROW LEVEL SECURITY;

-- Only admins can read the admin table
CREATE POLICY "Admins can read admin list"
  ON public.platform_admins FOR SELECT
  USING (
    auth.jwt() ->> 'email' IN (SELECT email FROM public.platform_admins)
  );

-- Security definer function to check admin status
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.platform_admins pa
    JOIN auth.users u ON u.email = pa.email
    WHERE u.id = _user_id
  )
$$;

-- Seed admin email
INSERT INTO public.platform_admins (email) VALUES ('mayengoedrick83@gmail.com');
