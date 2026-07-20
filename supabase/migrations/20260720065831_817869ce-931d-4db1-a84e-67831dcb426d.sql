ALTER TABLE public.meta_connections DROP CONSTRAINT IF EXISTS meta_connections_platform_check;
ALTER TABLE public.meta_connections ADD CONSTRAINT meta_connections_platform_check CHECK (platform IN ('messenger','instagram','instagram_and_messenger'));
ALTER TABLE public.meta_connections DROP CONSTRAINT IF EXISTS meta_connections_user_id_platform_key;
CREATE UNIQUE INDEX IF NOT EXISTS meta_connections_page_id_key ON public.meta_connections(page_id);