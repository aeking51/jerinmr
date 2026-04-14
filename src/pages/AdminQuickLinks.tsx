import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Link, Plus, Edit, Trash2, Eye, EyeOff, LogOut, ArrowUp, ArrowDown } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface QuickLink {
  id: string;
  title: string;
  url: string;
  icon: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const iconOptions = [
  { value: 'link', label: 'Link' },
  { value: 'github', label: 'GitHub' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'mail', label: 'Email' },
  { value: 'file', label: 'File/Resume' },
  { value: 'globe', label: 'Website' },
  { value: 'twitter', label: 'Twitter/X' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'folder', label: 'Folder' },
  { value: 'book', label: 'Book' },
  { value: 'code', label: 'Code' },
];

const AdminQuickLinks = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [links, setLinks] = useState<QuickLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [editingLink, setEditingLink] = useState<QuickLink | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    icon: 'link',
    is_active: true
  });

  useEffect(() => {
    checkAuthAndRole();
  }, []);

  const checkAuthAndRole = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/admin/login');
        return;
      }

      const { data: roleData, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (error || !roleData) {
        setIsAdmin(false);
        setCheckingAuth(false);
        return;
      }

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
        .from('quick_links')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setLinks(data || []);
    } catch (error) {
      console.error('Error fetching links:', error);
      toast({
        title: "Error",
        description: "Failed to load quick links",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingLink) {
        const { error } = await supabase
          .from('quick_links')
          .update(formData)
          .eq('id', editingLink.id);

        if (error) throw error;
        toast({ title: "Quick link updated successfully" });
      } else {
        const maxOrder = links.length > 0 ? Math.max(...links.map(l => l.display_order)) : -1;
        const { error } = await supabase
          .from('quick_links')
          .insert([{ ...formData, display_order: maxOrder + 1 }]);

        if (error) throw error;
        toast({ title: "Quick link created successfully" });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchLinks();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this quick link?')) return;

    try {
      const { error } = await supabase
        .from('quick_links')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: "Quick link deleted successfully" });
      fetchLinks();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleActive = async (link: QuickLink) => {
    try {
      const { error } = await supabase
        .from('quick_links')
        .update({ is_active: !link.is_active })
        .eq('id', link.id);

      if (error) throw error;
      toast({ title: `Quick link ${!link.is_active ? 'activated' : 'deactivated'}` });
      fetchLinks();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const moveLink = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= links.length) return;

    const currentLink = links[index];
    const swapLink = links[newIndex];

    try {
      await supabase
        .from('quick_links')
        .update({ display_order: swapLink.display_order })
        .eq('id', currentLink.id);

      await supabase
        .from('quick_links')
        .update({ display_order: currentLink.display_order })
        .eq('id', swapLink.id);

      fetchLinks();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (link: QuickLink) => {
    setEditingLink(link);
    setFormData({
      title: link.title,
      url: link.url,
      icon: link.icon,
      is_active: link.is_active
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingLink(null);
    setFormData({ title: '', url: '', icon: 'link', is_active: true });
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
          <CardHeader>
            <CardTitle className="text-center">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">Admin access required</p>
            <Button onClick={handleLogout} variant="outline" className="w-full">
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="text-center space-y-2 flex-1">
              <h1 className="text-4xl font-bold text-foreground">Quick Links Management</h1>
              <p className="text-muted-foreground">Manage homepage quick links</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => navigate('/admin/visitors')} variant="outline" size="sm">
              Visitors
            </Button>
            <Button onClick={() => navigate('/admin/articles')} variant="outline" size="sm">
              Articles
            </Button>
            <Button onClick={() => navigate('/admin/site-info')} variant="outline" size="sm">
              Site Info
            </Button>
            <Button onClick={() => navigate('/admin/profile')} variant="outline" size="sm">
              Profile
            </Button>
            <Button onClick={() => navigate('/admin/short-links')} variant="outline" size="sm">
              Short Links
            </Button>
            <Button onClick={handleLogout} variant="outline" size="sm" className="gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Link className="h-5 w-5" />
                Quick Links ({links.length})
              </CardTitle>
              <Dialog open={isDialogOpen} onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) resetForm();
              }}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    New Link
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>{editingLink ? 'Edit Quick Link' : 'Create Quick Link'}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="e.g., GitHub Profile"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="url">URL</Label>
                      <Input
                        id="url"
                        value={formData.url}
                        onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                        placeholder="https://github.com/username"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="icon">Icon</Label>
                      <Select value={formData.icon} onValueChange={(value) => setFormData({ ...formData, icon: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an icon" />
                        </SelectTrigger>
                        <SelectContent>
                          {iconOptions.map((icon) => (
                            <SelectItem key={icon.value} value={icon.value}>
                              {icon.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">
                        {editingLink ? 'Update Link' : 'Create Link'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {links.map((link, index) => (
                <div key={link.id} className="border rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => moveLink(index, 'up')}
                        disabled={index === 0}
                        className="h-6 w-6 p-0"
                      >
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => moveLink(index, 'down')}
                        disabled={index === links.length - 1}
                        className="h-6 w-6 p-0"
                      >
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{link.title}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded ${link.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {link.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{link.url}</p>
                      <p className="text-xs text-muted-foreground">Icon: {link.icon}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleActive(link)}
                    >
                      {link.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditDialog(link)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(link.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {links.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No quick links yet. Create your first one!
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminQuickLinks;
