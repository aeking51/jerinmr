import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const ShortLinkRedirect = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState(false);

  useEffect(() => {
    const redirect = async () => {
      if (!slug) { setError(true); return; }

      const { data, error: fetchError } = await supabase
        .from('short_links')
        .select('id, target_url')
        .eq('slug', slug)
        .eq('is_active', true)
        .maybeSingle();

      if (fetchError || !data) {
        setError(true);
        return;
      }

      // Increment click count via RPC
      supabase.rpc('increment_short_link_clicks', { _slug: slug });

      window.location.href = data.target_url;
    };

    redirect();
  }, [slug]);

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-foreground">Link Not Found</h1>
          <p className="text-muted-foreground">This short link doesn't exist or has been deactivated.</p>
          <button onClick={() => navigate('/')} className="text-primary underline">Go to homepage</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
};

export default ShortLinkRedirect;
