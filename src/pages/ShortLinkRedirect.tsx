import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';

const ShortLinkRedirect = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState(false);
  const [needsPassword, setNeedsPassword] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = 'Redirecting… | Short Link';

    const fetchLink = async () => {
      if (!slug) { setError(true); return; }

      // Only fetch non-sensitive fields; password is never sent to client
      const { data, error: fetchError } = await supabase
        .from('short_links')
        .select('target_url, password')
        .eq('slug', slug)
        .eq('is_active', true)
        .maybeSingle();

      if (fetchError || !data) {
        setError(true);
        return;
      }

      // Check if link has a password (value won't be null if set)
      if (data.password) {
        setNeedsPassword(true);
      } else {
        supabase.rpc('increment_short_link_clicks', { _slug: slug });
        window.location.href = data.target_url;
      }
    };

    fetchLink();
  }, [slug]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug) return;
    setLoading(true);
    setPasswordError('');

    // Verify password server-side via RPC
    const { data: targetUrl, error: rpcError } = await supabase.rpc(
      'verify_short_link_password',
      { _slug: slug, _password: passwordInput }
    );

    if (rpcError || !targetUrl) {
      setPasswordError('Incorrect password. Please try again.');
      setPasswordInput('');
      setLoading(false);
      return;
    }

    supabase.rpc('increment_short_link_clicks', { _slug: slug });
    window.location.href = targetUrl;
  };

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

  if (needsPassword) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-sm border rounded-lg p-6 space-y-4 bg-card shadow-lg">
          <div className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Protected Link</h1>
            <p className="text-sm text-muted-foreground">This link is password protected. Enter the password to continue.</p>
          </div>
          <form onSubmit={handlePasswordSubmit} className="space-y-3">
            <Input
              type="password"
              value={passwordInput}
              onChange={(e) => { setPasswordInput(e.target.value); setPasswordError(''); }}
              placeholder="Enter password"
              autoFocus
              required
              disabled={loading}
            />
            {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Verifying...' : 'Unlock & Redirect'}
            </Button>
          </form>
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
