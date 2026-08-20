DROP POLICY IF EXISTS "Anyone can read active short links without password" ON public.short_links;

CREATE POLICY "Anyone can read active unprotected short links"
ON public.short_links
FOR SELECT
USING (is_active = true AND password IS NULL);

REVOKE SELECT ON public.short_links FROM anon, authenticated;

GRANT SELECT (id, slug, target_url, click_count, is_active, created_at, updated_at)
  ON public.short_links TO anon, authenticated;
