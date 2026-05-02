import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  LogOut, ShieldAlert, User, Save, Loader2, RefreshCw
} from 'lucide-react';
import { useSiteContent, useUpdateSiteContent, type SiteContentItem } from '@/hooks/useSiteContent';

const AdminProfile = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [dirtyKeys, setDirtyKeys] = useState<Set<string>>(new Set());

  const { data: allContent, isLoading, refetch } = useSiteContent();
  const updateMutation = useUpdateSiteContent();

  useEffect(() => {
    checkAuthAndRole();
  }, [navigate]);

  useEffect(() => {
    if (allContent) {
      const values: Record<string, string> = {};
      allContent.forEach((item) => {
        values[item.key] = item.value;
      });
      setEditValues(values);
      setDirtyKeys(new Set());
    }
  }, [allContent]);

  const checkAuthAndRole = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate('/admin/login'); return; }
      const { data: roleData, error } = await supabase
        .from('user_roles').select('role')
        .eq('user_id', session.user.id).eq('role', 'admin').maybeSingle();
      if (error || !roleData) { setIsAdmin(false); setCheckingAuth(false); return; }
      setIsAdmin(true);
    } catch { navigate('/admin/login'); }
    finally { setCheckingAuth(false); }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  const handleChange = (key: string, value: string) => {
    setEditValues((prev) => ({ ...prev, [key]: value }));
    setDirtyKeys((prev) => new Set(prev).add(key));
  };

  const handleSaveAll = async () => {
    const keysToSave = Array.from(dirtyKeys);
    if (keysToSave.length === 0) { toast.info('No changes to save'); return; }

    try {
      for (const key of keysToSave) {
        await updateMutation.mutateAsync({ key, value: editValues[key] });
      }
      toast.success(`Saved ${keysToSave.length} field(s) successfully`);
      setDirtyKeys(new Set());
    } catch {
      toast.error('Failed to save changes');
    }
  };

  const groupedContent = allContent?.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, SiteContentItem[]>) ?? {};

  const categoryLabels: Record<string, string> = {
    profile: '🏠 Home (cd ~) — Profile header & contact',
    about: '📂 Profile (cat profile/*) — About, philosophy, hobbies',
    general: '⚙️ General',
  };

  const categoryDescriptions: Record<string, string> = {
    profile: 'Drives the Home tab (cd ~): name, role, focus, location, contact details and bio shown in the profile card.',
    about: 'Drives the Profile tab (cat profile/*): philosophy, hobbies and interests rendered inside about.txt.',
  };

  const isTextarea = (key: string) => 
    ['profile_bio', 'profile_philosophy', 'profile_hobbies', 'profile_interests'].includes(key);

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <ShieldAlert className="h-6 w-6 text-destructive" />
              </div>
            </div>
            <CardTitle className="text-center">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">You don't have admin privileges.</p>
            <Button onClick={handleLogout} variant="outline" className="w-full">Back to Login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground flex items-center gap-3">
              <User className="h-8 w-8 text-primary" />
              Profile Editor
            </h1>
            <p className="text-muted-foreground">
              Edit content for <code className="bg-muted px-1 rounded">cd ~</code> (Home) and <code className="bg-muted px-1 rounded">cat profile/*</code> (Profile) terminal sections
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button onClick={() => navigate('/admin/visitors')} variant="outline" size="sm">Visitors</Button>
            <Button onClick={() => navigate('/admin/articles')} variant="outline" size="sm">Articles</Button>
            <Button onClick={() => navigate('/admin/quick-links')} variant="outline" size="sm">Quick Links</Button>
            <Button onClick={() => navigate('/admin/site-info')} variant="outline" size="sm">Site Info</Button>
            <Button onClick={() => navigate('/admin/short-links')} variant="outline" size="sm">Short Links</Button>
            <Button onClick={handleLogout} variant="outline" size="sm" className="gap-2">
              <LogOut className="h-4 w-4" /> Logout
            </Button>
          </div>
        </div>

        {/* Actions bar */}
        <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
          <div className="flex items-center gap-2">
            {dirtyKeys.size > 0 && (
              <Badge variant="secondary">{dirtyKeys.size} unsaved change(s)</Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => refetch()} variant="ghost" size="sm" className="gap-2">
              <RefreshCw className="h-4 w-4" /> Refresh
            </Button>
            <Button 
              onClick={handleSaveAll} 
              disabled={dirtyKeys.size === 0 || updateMutation.isPending}
              size="sm" 
              className="gap-2"
            >
              {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save All Changes
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          Object.entries(groupedContent).map(([category, items]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="text-lg">
                  {categoryLabels[category] || category}
                </CardTitle>
                <CardDescription>
                  {categoryDescriptions[category]}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item) => (
                  <div key={item.key} className="space-y-1.5">
                    <Label htmlFor={item.key} className="flex items-center gap-2">
                      {item.label}
                      {dirtyKeys.has(item.key) && (
                        <Badge variant="outline" className="text-xs text-primary">modified</Badge>
                      )}
                    </Label>
                    {isTextarea(item.key) ? (
                      <Textarea
                        id={item.key}
                        value={editValues[item.key] ?? ''}
                        onChange={(e) => handleChange(item.key, e.target.value)}
                        rows={3}
                        className="font-mono text-sm"
                        placeholder={item.label}
                      />
                    ) : (
                      <Input
                        id={item.key}
                        value={editValues[item.key] ?? ''}
                        onChange={(e) => handleChange(item.key, e.target.value)}
                        className="font-mono text-sm"
                        placeholder={item.label}
                      />
                    )}
                    <p className="text-xs text-muted-foreground">Key: <code className="bg-muted px-1 rounded">{item.key}</code></p>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminProfile;
