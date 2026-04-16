import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Link2, Plus, Edit, Trash2, Eye, EyeOff, LogOut, Copy, ExternalLink, MousePointerClick, Lock } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface ShortLink {
  id: string;
  slug: string;
  target_url: string;
  click_count: number;
  is_active: boolean;
  password: string | null;
  created_at: string;
  updated_at: string;
}

const AdminShortLinks = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [links, setLinks] = useState<ShortLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [editingLink, setEditingLink] = useState<ShortLink | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    slug: '',
    target_url: '',
    is_active: true,
    password: ''
  });

  useEffect(() => {
    checkAuthAndRole();
  }, []);

  const checkAuthAndRole = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate('/admin/login'); return; }

      const { data: roleData, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (error || !roleData) { setIsAdmin(false); setCheckingAuth(false); return; }

      setIsAdmin(true);
      fetchLinks();
    } catch (error) {
      console.error('Auth check error:', error);
      navigate('/admin/login');
    } finally {
      setCheckingAuth(false);
    }
  };

  const fetchLinks = async () => {
    try {
      const { data, error } = await supabase
        .from('short_links')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLinks(data || []);
    } catch (error) {
      console.error('Error fetching short links:', error);
      toast({ title: "Error", description: "Failed to load short links", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!/^[a-zA-Z0-9_-]+$/.test(formData.slug)) {
      toast({ title: "Invalid slug", description: "Slug can only contain letters, numbers, hyphens, and underscores", variant: "destructive" });
      return;
    }

    try {
      if (editingLink) {
        const { error } = await supabase
          .from('short_links')
          .update({ slug: formData.slug, target_url: formData.target_url, is_active: formData.is_active })
          .eq('id', editingLink.id);
        if (error) throw error;
        toast({ title: "Short link updated successfully" });
      } else {
        const { error } = await supabase
          .from('short_links')
          .insert([{ slug: formData.slug, target_url: formData.target_url, is_active: formData.is_active }]);
        if (error) throw error;
        toast({ title: "Short link created successfully" });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchLinks();
    } catch (error: any) {
      const msg = error.message?.includes('duplicate') ? 'This slug is already taken' : error.message;
      toast({ title: "Error", description: msg, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this short link?')) return;
    try {
      const { error } = await supabase.from('short_links').delete().eq('id', id);
      if (error) throw error;
      toast({ title: "Short link deleted successfully" });
      fetchLinks();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const toggleActive = async (link: ShortLink) => {
    try {
      const { error } = await supabase.from('short_links').update({ is_active: !link.is_active }).eq('id', link.id);
      if (error) throw error;
      toast({ title: `Short link ${!link.is_active ? 'activated' : 'deactivated'}` });
      fetchLinks();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const copyShortUrl = (slug: string) => {
    const url = `${window.location.origin}/sl/${slug}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Copied!", description: url });
  };

  const openEditDialog = (link: ShortLink) => {
    setEditingLink(link);
    setFormData({ slug: link.slug, target_url: link.target_url, is_active: link.is_active });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingLink(null);
    setFormData({ slug: '', target_url: '', is_active: true });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  if (checkingAuth || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader><CardTitle className="text-center">Access Denied</CardTitle></CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">Admin access required</p>
            <Button onClick={handleLogout} variant="outline" className="w-full">Back to Login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Short Links</h1>
            <p className="text-muted-foreground">Create and manage short URLs</p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => navigate('/admin/visitors')} variant="outline" size="sm">Visitors</Button>
            <Button onClick={() => navigate('/admin/articles')} variant="outline" size="sm">Articles</Button>
            <Button onClick={() => navigate('/admin/site-info')} variant="outline" size="sm">Site Info</Button>
            <Button onClick={() => navigate('/admin/quick-links')} variant="outline" size="sm">Quick Links</Button>
            <Button onClick={() => navigate('/admin/profile')} variant="outline" size="sm">Profile</Button>
            <Button onClick={handleLogout} variant="outline" size="sm" className="gap-2">
              <LogOut className="h-4 w-4" />Logout
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Link2 className="h-5 w-5" />
                Short Links ({links.length})
              </CardTitle>
              <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2"><Plus className="h-4 w-4" />New Short Link</Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>{editingLink ? 'Edit Short Link' : 'Create Short Link'}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="slug">Slug</Label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground whitespace-nowrap">{window.location.origin}/sl/</span>
                        <Input
                          id="slug"
                          value={formData.slug}
                          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                          placeholder="my-link"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="target_url">Destination URL</Label>
                      <Input
                        id="target_url"
                        value={formData.target_url}
                        onChange={(e) => setFormData({ ...formData, target_url: e.target.value })}
                        placeholder="https://example.com/very-long-url"
                        required
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="is_active"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                        className="h-4 w-4"
                      />
                      <Label htmlFor="is_active" className="cursor-pointer">Active</Label>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                      <Button type="submit">{editingLink ? 'Update' : 'Create'}</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {links.map((link) => (
                <div key={link.id} className="border rounded-lg p-4 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-semibold text-primary">/sl/{link.slug}</code>
                      <span className={`text-xs px-2 py-0.5 rounded ${link.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {link.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <MousePointerClick className="h-3 w-3" />{link.click_count} clicks
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate max-w-md">{link.target_url}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => copyShortUrl(link.slug)} title="Copy short URL">
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => window.open(link.target_url, '_blank')} title="Open target">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => toggleActive(link)}>
                      {link.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => openEditDialog(link)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDelete(link.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {links.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No short links yet. Create your first one!
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminShortLinks;
