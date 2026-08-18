import { useEffect, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useSiteShutdown } from '@/hooks/useSiteShutdown';
import { Power } from 'lucide-react';

// Routes that stay reachable while the site is shut down
const EXEMPT_PREFIXES = ['/admin', '/forgot-password', '/reset-password'];

export function ShutdownGate({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { data, isLoading } = useSiteShutdown();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        if (!cancelled) setIsAdmin(false);
        return;
      }
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .eq('role', 'admin')
        .maybeSingle();
      if (!cancelled) setIsAdmin(!!roleData);
    };
    check();
    return () => { cancelled = true; };
  }, []);

  const exempt = EXEMPT_PREFIXES.some((p) => location.pathname.startsWith(p));
  const blocked = !isLoading && data?.enabled && !exempt && !isAdmin;

  useEffect(() => {
    if (blocked) {
      document.title = `${data?.title ?? 'Offline'} — jerinmr.com`;
      const meta = document.querySelector('meta[name="robots"]');
      if (meta) meta.setAttribute('content', 'noindex, nofollow');
    }
  }, [blocked, data?.title]);

  if (!blocked) return <>{children}</>;

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <div className="max-w-lg w-full border border-border bg-card shadow-2xl p-6 sm:p-10 font-mono">
        <div className="flex items-center gap-3 mb-6 text-destructive">
          <Power className="h-6 w-6" aria-hidden="true" />
          <span className="text-xs uppercase tracking-widest text-muted-foreground">
            system status: offline
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-4">{data?.title}</h1>
        <p className="text-sm sm:text-base text-muted-foreground whitespace-pre-wrap leading-relaxed">
          {data?.message}
        </p>
        <div className="mt-8 pt-4 border-t border-border text-xs text-muted-foreground">
          <span className="inline-block w-2 h-2 rounded-full bg-destructive animate-pulse mr-2" />
          shutdown initiated by administrator
        </div>
      </div>
    </div>
  );
}
