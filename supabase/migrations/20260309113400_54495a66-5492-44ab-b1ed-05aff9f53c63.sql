
INSERT INTO storage.buckets (id, name, public) VALUES ('ad-images', 'ad-images', true);

CREATE POLICY "Users can upload to ad-images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'ad-images');

CREATE POLICY "Public can view ad-images" ON storage.objects FOR SELECT TO public USING (bucket_id = 'ad-images');

CREATE POLICY "Users can delete own ad-images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'ad-images' AND (storage.foldername(name))[1] = auth.uid()::text);
