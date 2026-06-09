
-- Helper: is_supplier
CREATE OR REPLACE FUNCTION public.is_supplier(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id=_user_id AND role='supplier')
$$;

-- Sequence for supplier codes
CREATE SEQUENCE IF NOT EXISTS public.supplier_code_seq START 1;

-- =========================================================
-- SUPPLIERS
-- =========================================================
CREATE TABLE public.suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  supplier_code text NOT NULL UNIQUE,
  business_name text NOT NULL,
  country text NOT NULL CHECK (country IN ('UK','UAE')),
  currency text NOT NULL DEFAULT 'USD',
  contact_name text,
  whatsapp text,
  email text,
  logo_url text,
  bio text,
  lead_time_days integer DEFAULT 14,
  bank_details jsonb,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended')),
  must_change_password boolean NOT NULL DEFAULT true,
  created_by_agent uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.suppliers TO authenticated;
GRANT ALL ON public.suppliers TO service_role;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

-- Supplier reads own row
CREATE POLICY "Supplier reads own row" ON public.suppliers
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Any logged-in user (buyer) can read non-sensitive supplier fields when active.
-- We rely on a view for hiding bank_details; here we allow SELECT but app must not select bank_details for buyers.
CREATE POLICY "Authenticated read active suppliers" ON public.suppliers
  FOR SELECT TO authenticated USING (status='active');

-- Supplier updates own non-sensitive fields
CREATE POLICY "Supplier updates own row" ON public.suppliers
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Admin full
CREATE POLICY "Admin manage suppliers" ON public.suppliers
  FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- Public-safe view (no bank_details)
CREATE OR REPLACE VIEW public.suppliers_public AS
  SELECT id, supplier_code, business_name, country, currency, whatsapp,
         logo_url, bio, lead_time_days, status, created_at
  FROM public.suppliers WHERE status='active';
GRANT SELECT ON public.suppliers_public TO authenticated, anon;

-- =========================================================
-- SUPPLIER PRODUCTS
-- =========================================================
CREATE TABLE public.supplier_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  images text[] NOT NULL DEFAULT '{}',
  category text,
  subcategory text,
  attributes jsonb DEFAULT '{}'::jsonb,
  moq integer NOT NULL DEFAULT 1,
  unit_price numeric(12,2) NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  lead_time_days integer,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.supplier_products TO authenticated;
GRANT ALL ON public.supplier_products TO service_role;
ALTER TABLE public.supplier_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read active supplier products" ON public.supplier_products
  FOR SELECT TO authenticated USING (
    active = true AND EXISTS (SELECT 1 FROM public.suppliers s WHERE s.id=supplier_id AND s.status='active')
  );

CREATE POLICY "Supplier manages own products" ON public.supplier_products
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.suppliers s WHERE s.id=supplier_id AND s.user_id=auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.suppliers s WHERE s.id=supplier_id AND s.user_id=auth.uid()));

CREATE POLICY "Admin manage supplier products" ON public.supplier_products
  FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- =========================================================
-- SUPPLIER PAYMENTS
-- =========================================================
CREATE TABLE public.supplier_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  supplier_id uuid NOT NULL REFERENCES public.suppliers(id) ON DELETE RESTRICT,
  supplier_product_id uuid REFERENCES public.supplier_products(id) ON DELETE SET NULL,
  amount_foreign numeric(14,2) NOT NULL,
  currency text NOT NULL,
  fee_pct numeric(5,2) NOT NULL DEFAULT 5.00,
  amount_foreign_total numeric(14,2) NOT NULL,
  fx_rate numeric(14,6) NOT NULL,
  fx_locked_at timestamptz NOT NULL,
  amount_ugx numeric(14,2) NOT NULL,
  method text NOT NULL CHECK (method IN ('momo','bank_transfer')),
  momo_phone text,
  yo_ref text,
  bank_proof_url text,
  note text,
  admin_note text,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','pending_review','funds_received','settled','failed','rejected')),
  settled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.supplier_payments TO authenticated;
GRANT ALL ON public.supplier_payments TO service_role;
ALTER TABLE public.supplier_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Buyer reads own payments" ON public.supplier_payments
  FOR SELECT TO authenticated USING (auth.uid() = buyer_id);

CREATE POLICY "Buyer creates own payments" ON public.supplier_payments
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Supplier reads payments to them" ON public.supplier_payments
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.suppliers s WHERE s.id=supplier_id AND s.user_id=auth.uid())
  );

CREATE POLICY "Admin manage payments" ON public.supplier_payments
  FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- =========================================================
-- SHIPPING AGENTS
-- =========================================================
CREATE TABLE public.shipping_agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  logo_url text,
  lane_from text NOT NULL CHECK (lane_from IN ('UK','UAE','CN')),
  lane_to text NOT NULL DEFAULT 'UG',
  mode text NOT NULL CHECK (mode IN ('Air','Sea')),
  rate_amount numeric(12,2) NOT NULL,
  rate_unit text NOT NULL CHECK (rate_unit IN ('per_kg','per_cbm')),
  rate_currency text NOT NULL DEFAULT 'USD',
  duration_days integer,
  whatsapp text NOT NULL,
  notes text,
  active boolean NOT NULL DEFAULT true,
  created_by_agent uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.shipping_agents TO authenticated, anon;
GRANT INSERT, UPDATE, DELETE ON public.shipping_agents TO authenticated;
GRANT ALL ON public.shipping_agents TO service_role;
ALTER TABLE public.shipping_agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone reads active shipping agents" ON public.shipping_agents
  FOR SELECT USING (active = true OR public.is_admin(auth.uid()));

CREATE POLICY "Admin manage shipping agents" ON public.shipping_agents
  FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- =========================================================
-- updated_at trigger function (reuse pattern)
-- =========================================================
CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS trigger
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

CREATE TRIGGER trg_suppliers_updated BEFORE UPDATE ON public.suppliers
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_supplier_products_updated BEFORE UPDATE ON public.supplier_products
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_supplier_payments_updated BEFORE UPDATE ON public.supplier_payments
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_shipping_agents_updated BEFORE UPDATE ON public.shipping_agents
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- =========================================================
-- Storage policies for payment-proofs (private bucket, created via tool)
-- =========================================================
-- Buyer uploads to a path like <user_id>/<payment_id>.<ext>
CREATE POLICY "Buyer uploads own payment proofs" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'payment-proofs' AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Buyer reads own payment proofs" ON storage.objects
  FOR SELECT TO authenticated USING (
    bucket_id = 'payment-proofs' AND (
      (storage.foldername(name))[1] = auth.uid()::text OR public.is_admin(auth.uid())
    )
  );

CREATE POLICY "Admin manages payment proofs" ON storage.objects
  FOR ALL TO authenticated USING (
    bucket_id = 'payment-proofs' AND public.is_admin(auth.uid())
  ) WITH CHECK (
    bucket_id = 'payment-proofs' AND public.is_admin(auth.uid())
  );
