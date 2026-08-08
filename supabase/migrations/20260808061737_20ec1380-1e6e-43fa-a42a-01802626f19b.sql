-- Remove blanket PUBLIC execute rights
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.increment_short_link_clicks(text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.verify_short_link_password(text, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.short_link_requires_password(text) FROM PUBLIC;

-- has_role is only needed by signed-in users' RLS checks
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;

-- Short-link helpers must stay callable by visitors (public redirect page)
GRANT EXECUTE ON FUNCTION public.increment_short_link_clicks(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.verify_short_link_password(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.short_link_requires_password(text) TO anon, authenticated;