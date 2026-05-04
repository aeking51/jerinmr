
-- Drop overly broad public SELECT policies on article-images bucket and replace
-- with object-fetch-only access (no listing). Listing remains for admins.

DO $$
DECLARE pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND (qual ILIKE '%article-images%' OR with_check ILIKE '%article-images%')
      AND cmd = 'SELECT'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.policyname);
  END LOOP;
END $$;

-- Public can read individual objects (needed for <img src> URLs to work)
-- but cannot list. Supabase serves public buckets via signed-style URLs that
-- include the object name, so direct GET works without list permission.
CREATE POLICY "Public can read article images"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'article-images' AND name IS NOT NULL);

-- Admins can list/manage everything in the bucket
CREATE POLICY "Admins can list article images"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'article-images' AND has_role(auth.uid(), 'admin'));
