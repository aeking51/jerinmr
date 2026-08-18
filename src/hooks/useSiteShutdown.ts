import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SiteShutdownState {
  enabled: boolean;
  title: string;
  message: string;
}

const DEFAULTS: SiteShutdownState = {
  enabled: false,
  title: 'SYSTEM OFFLINE',
  message: 'This site is temporarily shut down for maintenance. Please check back soon.',
};

export function useSiteShutdown() {
  return useQuery({
    queryKey: ['site-shutdown'],
    staleTime: 30 * 1000,
    gcTime: 60 * 1000,
    queryFn: async (): Promise<SiteShutdownState> => {
      const { data, error } = await supabase
        .from('site_content')
        .select('key, value')
        .in('key', ['site_shutdown_enabled', 'site_shutdown_title', 'site_shutdown_message']);
      if (error) throw error;
      const map: Record<string, string> = {};
      (data ?? []).forEach((row) => {
        map[row.key] = row.value;
      });
      return {
        enabled: map.site_shutdown_enabled === 'true',
        title: map.site_shutdown_title?.trim() || DEFAULTS.title,
        message: map.site_shutdown_message?.trim() || DEFAULTS.message,
      };
    },
  });
}
