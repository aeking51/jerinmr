import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Power, Save, Loader2, RotateCcw } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useSiteShutdown } from '@/hooks/useSiteShutdown';

export function ShutdownControl() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useSiteShutdown();
  const [enabled, setEnabled] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) {
      setEnabled(data.enabled);
      setTitle(data.title);
      setMessage(data.message);
    }
  }, [data]);

  const persist = async (next: { enabled: boolean; title: string; message: string }) => {
    setSaving(true);
    try {
      const updates: Array<[string, string]> = [
        ['site_shutdown_enabled', next.enabled ? 'true' : 'false'],
        ['site_shutdown_title', next.title],
        ['site_shutdown_message', next.message],
      ];
      for (const [key, value] of updates) {
        const { error } = await supabase.from('site_content').update({ value }).eq('key', key);
        if (error) throw error;
      }
      await queryClient.invalidateQueries({ queryKey: ['site-shutdown'] });
      await queryClient.invalidateQueries({ queryKey: ['site-content'] });
      toast.success(next.enabled ? 'Website is now SHUT DOWN for visitors' : 'Website is back online');
    } catch (e) {
      toast.error('Failed to update shutdown settings');
      if (data) setEnabled(data.enabled);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = (checked: boolean) => {
    if (checked && !window.confirm('Shut down the public website for all visitors?')) return;
    setEnabled(checked);
    persist({ enabled: checked, title, message });
  };

  const handleTurnOnline = () => {
    if (!window.confirm('Turn the website back on for all visitors?')) return;
    setEnabled(false);
    persist({ enabled: false, title, message });
  };

  return (
    <Card className={enabled ? 'border-destructive/60' : 'border-terminal-green/30'}>
      <CardHeader>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Power className={`h-5 w-5 ${enabled ? 'text-destructive' : 'text-terminal-green'}`} />
              Website Shutdown
              <Badge variant={enabled ? 'destructive' : 'outline'}>
                {isLoading ? '...' : enabled ? 'OFFLINE' : 'ONLINE'}
              </Badge>
            </CardTitle>
            <CardDescription>
              Instantly take the public site offline. Admin pages and login stay reachable, and
              signed-in admins keep seeing the normal site.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="shutdown-toggle" className="text-sm">Shut down site</Label>
            <Switch
              id="shutdown-toggle"
              checked={enabled}
              disabled={isLoading || saving}
              onCheckedChange={handleToggle}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {enabled && (
          <Button
            onClick={handleTurnOnline}
            disabled={saving}
            variant="default"
            className="w-full gap-2 bg-terminal-green text-terminal-bg hover:bg-terminal-green/90"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
            Turn website back ONLINE
          </Button>
        )}
        <div className="space-y-1.5">
          <Label htmlFor="shutdown-title">Shutdown screen title</Label>
          <Input
            id="shutdown-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="SYSTEM OFFLINE"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="shutdown-message">Message shown to visitors</Label>
          <Textarea
            id="shutdown-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            placeholder="This site is temporarily shut down for maintenance."
          />
        </div>
        <Button
          onClick={() => persist({ enabled, title, message })}
          disabled={saving}
          size="sm"
          className="gap-2"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save message
        </Button>
      </CardContent>
    </Card>
  );
}
