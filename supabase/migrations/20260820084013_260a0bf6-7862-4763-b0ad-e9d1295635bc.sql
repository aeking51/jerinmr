ALTER TABLE public.short_links
  ADD COLUMN IF NOT EXISTS has_password boolean GENERATED ALWAYS AS (password IS NOT NULL) STORED;

GRANT SELECT (has_password) ON public.short_links TO anon, authenticated;
