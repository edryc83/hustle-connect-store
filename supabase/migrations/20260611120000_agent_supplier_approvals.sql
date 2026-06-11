-- Require explicit approval before agents can use the portal and before
-- suppliers appear in buyer-facing import flows.

ALTER TABLE public.user_roles
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'approved';

ALTER TABLE public.user_roles
  DROP CONSTRAINT IF EXISTS user_roles_status_check;

ALTER TABLE public.user_roles
  ADD CONSTRAINT user_roles_status_check
  CHECK (status IN ('pending', 'approved', 'suspended', 'rejected'));

UPDATE public.user_roles
SET status = 'approved'
WHERE status IS NULL;

DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;

CREATE POLICY "Admins can update roles" ON public.user_roles
  FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users can insert own agent role" ON public.user_roles;

CREATE POLICY "Users can insert own agent role" ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND role = 'agent' AND status = 'pending');

ALTER TABLE public.suppliers
  DROP CONSTRAINT IF EXISTS suppliers_status_check;

ALTER TABLE public.suppliers
  ADD CONSTRAINT suppliers_status_check
  CHECK (status IN ('pending', 'approved', 'suspended', 'rejected', 'active'));

UPDATE public.suppliers
SET status = 'approved'
WHERE status = 'active';

ALTER TABLE public.suppliers
  DROP CONSTRAINT IF EXISTS suppliers_status_check;

ALTER TABLE public.suppliers
  ADD CONSTRAINT suppliers_status_check
  CHECK (status IN ('pending', 'approved', 'suspended', 'rejected'));

ALTER TABLE public.suppliers
  ALTER COLUMN status SET DEFAULT 'pending';

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
      AND status = 'approved'
  )
$$;

CREATE OR REPLACE FUNCTION public.is_agent(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'agent')
$$;

DROP POLICY IF EXISTS "Authenticated read active suppliers" ON public.suppliers;

CREATE POLICY "Authenticated read approved suppliers" ON public.suppliers
  FOR SELECT TO authenticated USING (status = 'approved');

CREATE OR REPLACE VIEW public.suppliers_public AS
SELECT id, supplier_code, business_name, country, currency, whatsapp, logo_url, bio, lead_time_days, status, created_at
FROM public.suppliers
WHERE status = 'approved';

GRANT SELECT ON public.suppliers_public TO authenticated, anon;

DROP POLICY IF EXISTS "Active supplier products are readable" ON public.supplier_products;
DROP POLICY IF EXISTS "Authenticated read active supplier products" ON public.supplier_products;

CREATE POLICY "Approved supplier products are readable" ON public.supplier_products
  FOR SELECT TO authenticated
  USING (
    (
      active = true
      AND EXISTS (SELECT 1 FROM public.suppliers s WHERE s.id = supplier_id AND s.status = 'approved')
    )
    OR EXISTS (SELECT 1 FROM public.suppliers s WHERE s.id = supplier_id AND s.user_id = auth.uid())
    OR public.is_admin(auth.uid())
    OR public.is_agent(auth.uid())
  );
