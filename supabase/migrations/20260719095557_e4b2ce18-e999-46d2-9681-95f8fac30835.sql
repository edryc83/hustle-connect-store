
CREATE POLICY "Users read own product videos" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'product-videos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Service role writes product videos" ON storage.objects
  FOR INSERT TO service_role WITH CHECK (bucket_id = 'product-videos');
