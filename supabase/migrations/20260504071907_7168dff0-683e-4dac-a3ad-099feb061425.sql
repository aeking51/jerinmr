
-- Revoke broad table SELECT from anon/authenticated, then grant only safe columns
REVOKE SELECT ON public.short_links FROM anon, authenticated;

GRANT SELECT (id, slug, target_url, is_active, click_count, created_at, updated_at)
  ON public.short_links TO anon, authenticated;

-- Helper to check if a slug requires a password without exposing the value
CREATE OR REPLACE FUNCTION public.short_link_requires_password(_slug text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.short_links
    WHERE slug = _slug AND is_active = true AND password IS NOT NULL
  );
$$;

REVOKE EXECUTE ON FUNCTION public.short_link_requires_password(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.short_link_requires_password(text) TO anon, authenticated;
