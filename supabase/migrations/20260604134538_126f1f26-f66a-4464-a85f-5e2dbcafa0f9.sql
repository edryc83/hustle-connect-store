REVOKE EXECUTE ON FUNCTION public.deduct_tokens(UUID, INTEGER) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.credit_tokens(UUID, INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.deduct_tokens(UUID, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION public.credit_tokens(UUID, INTEGER) TO service_role;