
-- Replace overly-permissive WITH CHECK (true) on visitors insert
DROP POLICY IF EXISTS "Allow anonymous visitor inserts" ON public.visitors;
CREATE POLICY "Allow anonymous visitor inserts"
ON public.visitors
FOR INSERT
TO public
WITH CHECK (visited_at IS NOT NULL AND visited_at <= now() + interval '1 minute');

-- Replace overly-permissive WITH CHECK (true) on contact_messages insert
DROP POLICY IF EXISTS "Allow public inserts" ON public.contact_messages;
CREATE POLICY "Allow public inserts"
ON public.contact_messages
FOR INSERT
TO anon
WITH CHECK (
  name IS NOT NULL AND length(btrim(name)) BETWEEN 1 AND 200
  AND email IS NOT NULL AND length(email) BETWEEN 3 AND 320 AND email LIKE '%_@_%.__%'
  AND message IS NOT NULL AND length(btrim(message)) BETWEEN 1 AND 5000
);

-- rls_auto_enable is an internal event trigger function; should not be callable by clients
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;
