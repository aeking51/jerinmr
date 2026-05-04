
-- 1) short_links: hide password column from public/auth; only admins can read it
REVOKE SELECT (password) ON public.short_links FROM anon, authenticated;

-- 2) quick_links: admin policy should target authenticated, not public
DROP POLICY IF EXISTS "Admins can manage all quick links" ON public.quick_links;
CREATE POLICY "Admins can manage all quick links"
ON public.quick_links
AS PERMISSIVE
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 3) user_roles: defense-in-depth restrictive insert policy
DROP POLICY IF EXISTS "Restrict role inserts to admins" ON public.user_roles;
CREATE POLICY "Restrict role inserts to admins"
ON public.user_roles
AS RESTRICTIVE
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 4) Lock down internal SECURITY DEFINER functions from being callable via API
REVOKE EXECUTE ON FUNCTION public.cleanup_old_rate_limits() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.cleanup_old_visitors(integer) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_articles_updated_at() FROM anon, authenticated;
-- Keep these callable: has_role (used in policies), verify_short_link_password, increment_short_link_clicks
