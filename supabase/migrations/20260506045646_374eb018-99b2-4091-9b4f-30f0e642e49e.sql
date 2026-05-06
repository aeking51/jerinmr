-- Restore table-level privileges that were inadvertently revoked,
-- preventing admins from reading short_links.

-- Admins (authenticated) need full access; RLS still gates rows.
GRANT SELECT, INSERT, UPDATE, DELETE ON public.short_links TO authenticated;

-- Anonymous redirect page needs to read non-sensitive columns only.
-- Grant column-level SELECT excluding the password column.
GRANT SELECT (id, slug, target_url, click_count, is_active, created_at, updated_at)
  ON public.short_links TO anon;

-- Authenticated users should also be able to select all columns (for admins).
-- has_role() RLS policy already restricts which rows non-admins can see.
GRANT SELECT ON public.short_links TO authenticated;