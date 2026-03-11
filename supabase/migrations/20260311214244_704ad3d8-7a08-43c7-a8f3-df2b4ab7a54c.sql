CREATE OR REPLACE TRIGGER sync_seller_category_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_seller_category();