import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SiteContentItem {
  id: string;
  key: string;
  value: string;
  label: string;
  category: string;
  display_order: number;
}

export function useSiteContent(category?: string) {
  return useQuery({
    queryKey: ['site-content', category],
    queryFn: async () => {
      let query = supabase.from('site_content').select('*');
      if (category) {
        query = query.eq('category', category);
      }
      const { data, error } = await query.order('display_order').order('key');
      if (error) throw error;
      return data as SiteContentItem[];
    },
  });
}

export function useSiteContentMap(category?: string) {
  const query = useSiteContent(category);
  const contentMap: Record<string, string> = {};
  if (query.data) {
    query.data.forEach((item) => {
      contentMap[item.key] = item.value;
    });
  }
  return { ...query, contentMap };
}

export function useUpdateSiteContent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const { error } = await supabase
        .from('site_content')
        .update({ value })
        .eq('key', key);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-content'] });
    },
  });
}
