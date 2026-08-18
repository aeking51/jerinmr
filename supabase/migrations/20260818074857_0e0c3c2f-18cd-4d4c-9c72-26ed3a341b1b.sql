INSERT INTO public.site_content (key, value, label, category, display_order) VALUES
  ('site_shutdown_enabled', 'false', 'Shutdown enabled (true/false)', 'system', 1),
  ('site_shutdown_title', 'SYSTEM OFFLINE', 'Shutdown screen title', 'system', 2),
  ('site_shutdown_message', 'This site is temporarily shut down for maintenance. Please check back soon.', 'Shutdown screen message', 'system', 3)
ON CONFLICT (key) DO NOTHING;