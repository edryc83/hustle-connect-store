CREATE TABLE public.agent_withdrawals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL,
  amount numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  momo_number text,
  momo_name text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  completed_at timestamp with time zone
);

ALTER TABLE public.agent_withdrawals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agents can view own withdrawals"
  ON public.agent_withdrawals FOR SELECT
  TO authenticated
  USING (auth.uid() = agent_id);

CREATE POLICY "Agents can request withdrawals"
  ON public.agent_withdrawals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = agent_id);

CREATE POLICY "Service role manages withdrawals"
  ON public.agent_withdrawals FOR ALL
  TO public
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');