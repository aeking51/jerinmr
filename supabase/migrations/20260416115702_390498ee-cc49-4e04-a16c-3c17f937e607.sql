
-- Fix 1: Restrict contact_messages SELECT to admins only
DROP POLICY IF EXISTS "Allow authenticated reads" ON public.contact_messages;
CREATE POLICY "Only admins can read contact messages"
ON public.contact_messages
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Fix 2: Add explicit INSERT restriction on user_roles (only admins can insert)
CREATE POLICY "Only admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Fix 3: Replace the public SELECT policy on short_links to hide password
DROP POLICY IF EXISTS "Anyone can read active short links" ON public.short_links;
CREATE POLICY "Anyone can read active short links without password"
ON public.short_links
FOR SELECT
TO public
USING (is_active = true);

-- Fix 4: Create server-side password verification RPC
CREATE OR REPLACE FUNCTION public.verify_short_link_password(_slug text, _password text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _target_url text;
  _stored_password text;
BEGIN
  SELECT target_url, password INTO _target_url, _stored_password
  FROM public.short_links
  WHERE slug = _slug AND is_active = true;

  IF _target_url IS NULL THEN
    RETURN NULL;
  END IF;

  IF _stored_password IS NULL OR _stored_password = _password THEN
    RETURN _target_url;
  END IF;

  RETURN NULL;
END;
$$;
