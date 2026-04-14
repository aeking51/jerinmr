
CREATE OR REPLACE FUNCTION public.increment_short_link_clicks(_slug text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.short_links
  SET click_count = click_count + 1
  WHERE slug = _slug AND is_active = true;
END;
$$;
