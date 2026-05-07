ALTER TABLE public.site_content ADD COLUMN IF NOT EXISTS display_order INTEGER NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_site_content_category_order ON public.site_content(category, display_order);
-- Seed initial order for existing profile_sections rows
UPDATE public.site_content SET display_order = 1 WHERE key = 'section_about_experience' AND display_order = 0;
UPDATE public.site_content SET display_order = 2 WHERE key = 'section_skills' AND display_order = 0;
UPDATE public.site_content SET display_order = 3 WHERE key = 'section_whois' AND display_order = 0;