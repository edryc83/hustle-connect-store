INSERT INTO public.app_config (key, value)
VALUES ('force_update_at', now()::text)
ON CONFLICT (key) DO NOTHING;