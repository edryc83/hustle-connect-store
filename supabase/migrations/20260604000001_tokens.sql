-- Token balance on profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS token_balance INTEGER NOT NULL DEFAULT 0;

-- Token purchase records
CREATE TABLE IF NOT EXISTS public.token_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  package_id TEXT NOT NULL,
  tokens INTEGER NOT NULL,
  amount_ugx INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'UGX',
  amount_local NUMERIC,
  eversend_payment_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);
ALTER TABLE public.token_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own payments" ON public.token_payments
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own payments" ON public.token_payments
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Token usage / transaction log
CREATE TABLE IF NOT EXISTS public.token_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('purchase', 'usage', 'refund', 'bonus')),
  amount INTEGER NOT NULL,
  description TEXT,
  reference_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.token_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own transactions" ON public.token_transactions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Allow frontend to read app_config (needed for tokens_enabled flag)
CREATE POLICY IF NOT EXISTS "Public read app_config" ON public.app_config
  FOR SELECT USING (true);

-- Seed the feature flag (off by default — enable after App Store approval)
INSERT INTO public.app_config (key, value)
  VALUES ('tokens_enabled', 'false')
  ON CONFLICT (key) DO NOTHING;

-- Atomic token deduction (prevents double-spend race condition)
CREATE OR REPLACE FUNCTION public.deduct_tokens(p_user_id UUID, p_amount INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_balance INTEGER;
BEGIN
  UPDATE public.profiles
    SET token_balance = token_balance - p_amount
    WHERE id = p_user_id AND token_balance >= p_amount
    RETURNING token_balance INTO new_balance;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient tokens';
  END IF;
  RETURN new_balance;
END;
$$;

-- Atomic token credit (called by webhook after payment confirmed)
CREATE OR REPLACE FUNCTION public.credit_tokens(p_user_id UUID, p_amount INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_balance INTEGER;
BEGIN
  UPDATE public.profiles
    SET token_balance = token_balance + p_amount
    WHERE id = p_user_id
    RETURNING token_balance INTO new_balance;
  RETURN new_balance;
END;
$$;
