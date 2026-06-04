-- New users start with 20 tokens instead of 0
ALTER TABLE public.profiles
  ALTER COLUMN token_balance SET DEFAULT 20;

-- Give 20 tokens to all existing users who currently have 0
WITH updated AS (
  UPDATE public.profiles
  SET token_balance = 20
  WHERE token_balance = 0
  RETURNING id
)
INSERT INTO public.token_transactions (user_id, type, amount, description)
SELECT id, 'bonus', 20, 'Welcome bonus — 20 free tokens'
FROM updated;