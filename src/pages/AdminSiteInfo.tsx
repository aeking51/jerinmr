import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  LogOut, 
  ShieldAlert, 
  Code2, 
  Database, 
  Globe, 
  Palette, 
  Zap, 
  Shield, 
  Settings, 
  Cloud,
  Smartphone,
  Server,
  Lock,
  Layers,
  FileCode,
  Package,
  Cpu,
  HardDrive,
  Monitor,
  ExternalLink
} from 'lucide-react';

const AdminSiteInfo = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    checkAuthAndRole();
  }, [navigate]);

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
    } catch (error) {
      console.error('Auth check error:', error);
      navigate('/admin/login');
    } finally {
      setCheckingAuth(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  const frontendTech = [
    { 
      name: 'React 18', 
      icon: Code2, 
      description: 'A JavaScript library for building user interfaces with component-based architecture',
      color: 'text-blue-500',
      version: '18.3.1'
    },
    { 
      name: 'TypeScript', 
      icon: FileCode, 
      description: 'Strongly typed programming language that builds on JavaScript for better tooling',
      color: 'text-blue-600',
      version: '5.x'
    },
    { 
      name: 'Vite', 
      icon: Zap, 
      description: 'Next generation frontend tooling with lightning fast HMR and build times',
      color: 'text-yellow-500',
      version: '5.x'
    },
    { 
      name: 'Tailwind CSS', 
      icon: Palette, 
      description: 'Utility-first CSS framework for rapidly building custom user interfaces',
      color: 'text-cyan-500',
      version: '3.x'
    },
    { 
      name: 'React Router', 
      icon: Globe, 
      description: 'Declarative routing for React applications with dynamic route matching',
      color: 'text-red-500',
      version: '6.26.2'
    },
    { 
      name: 'TanStack Query', 
      icon: Cloud, 
      description: 'Powerful asynchronous state management for server state in React',
      color: 'text-orange-500',
      version: '5.56.2'
    }
  ];

  const uiComponents = [
    { 
      name: 'Radix UI', 
      icon: Settings, 
      description: 'Unstyled, accessible UI primitives for building high-quality design systems',
      color: 'text-purple-500'
    },
    { 
      name: 'Shadcn/ui', 
      icon: Layers, 
      description: 'Re-usable components built with Radix UI and Tailwind CSS',
      color: 'text-slate-500'
    },
    { 
      name: 'Lucide Icons', 
      icon: Shield, 
      description: 'Beautiful and consistent SVG icon library with 1000+ icons',
      color: 'text-green-500'
    },
    { 
      name: 'Sonner', 
      icon: Monitor, 
      description: 'An opinionated toast component for React applications',
      color: 'text-pink-500'
    },
    { 
      name: 'TipTap Editor', 
      icon: FileCode, 
      description: 'Headless, framework-agnostic rich text editor for articles',
      color: 'text-indigo-500'
    },
    { 
      name: 'Recharts', 
      icon: Cpu, 
      description: 'Composable charting library built on React components',
      color: 'text-emerald-500'
    }
  ];

  const backendTech = [
    { 
      name: 'Supabase', 
      icon: Database, 
      description: 'Open source Firebase alternative with PostgreSQL database, authentication, and real-time subscriptions',
      color: 'text-green-500'
    },
    { 
      name: 'PostgreSQL', 
      icon: HardDrive, 
      description: 'Powerful, open source object-relational database with strong reliability',
      color: 'text-blue-700'
    },
    { 
      name: 'Edge Functions', 
      icon: Server, 
      description: 'Serverless functions deployed globally for low-latency API endpoints',
      color: 'text-orange-600'
    },
    { 
      name: 'Row Level Security', 
      icon: Lock, 
      description: 'Fine-grained access control at the database level for secure data access',
      color: 'text-red-600'
    }
  ];

  const features = [
    {
      title: 'Terminal-Style Portfolio',
      description: 'Unique terminal/CLI inspired design with custom animations and theming'
    },
    {
      title: 'Article Management',
      description: 'Rich text editor for creating and publishing articles with image support'
    },
    {
      title: 'Visitor Analytics',
      description: 'Track visitor data including device info, location, and browsing behavior'
    },
    {
      title: 'Network Tools',
      description: 'Built-in DNS lookup, SSL checker, and HTTP headers inspection tools'
    },
    {
      title: 'Offline Support',
      description: 'Articles are cached locally for offline viewing with automatic sync'
    },
    {
      title: 'Responsive Design',
      description: 'Mobile-first approach ensuring great experience on all devices'
    },
    {
      title: 'Theme Support',
      description: 'Dark, light, and eye-comfort themes with smooth transitions'
    },
    {
      title: 'Admin Authentication',
      description: 'Secure admin panel with role-based access control and rate limiting'
    }
  ];

  const securityFeatures = [
    'Row Level Security (RLS) on all database tables',
    'XSS prevention with DOMPurify sanitization',
    'IP address anonymization for privacy',
    'Secure password hashing with bcrypt',
    'HTTPS enforced on all endpoints',
    'Admin login rate limiting (5 attempts)',
    'Session-based authentication with JWT',
    'Hardened database functions with search_path'
  ];

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
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
            <p className="text-muted-foreground">
              You don't have admin privileges to access this page.
            </p>
            <Button onClick={handleLogout} variant="outline" className="w-full">
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Site Information</h1>
            <p className="text-muted-foreground">Technical details and technologies powering this website</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button onClick={() => navigate('/admin/visitors')} variant="outline" size="sm">
              Visitors
            </Button>
            <Button onClick={() => navigate('/admin/articles')} variant="outline" size="sm">
              Articles
            </Button>
            <Button onClick={() => navigate('/admin/quick-links')} variant="outline" size="sm">
              Quick Links
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

        {/* Overview Card */}
        <Card className="border-terminal-green/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-terminal-green">
              <Code2 className="h-5 w-5" />
              Project Overview
            </CardTitle>
            <CardDescription>
              A modern, terminal-inspired portfolio website built with cutting-edge web technologies
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-terminal-green">React 18</div>
                <div className="text-sm text-muted-foreground">Framework</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-terminal-green">TypeScript</div>
                <div className="text-sm text-muted-foreground">Language</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-terminal-green">Supabase</div>
                <div className="text-sm text-muted-foreground">Backend</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-terminal-green">Vercel</div>
                <div className="text-sm text-muted-foreground">Hosting</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Frontend Technologies */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5 text-blue-500" />
              Frontend Technologies
            </CardTitle>
            <CardDescription>Core technologies powering the user interface</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {frontendTech.map((tech) => (
                <div key={tech.name} className="p-4 border rounded-lg hover:border-terminal-green/50 transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <tech.icon className={`h-5 w-5 ${tech.color}`} />
                    <span className="font-semibold">{tech.name}</span>
                    {tech.version && (
                      <Badge variant="secondary" className="text-xs">{tech.version}</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{tech.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* UI Components */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-purple-500" />
              UI Components & Libraries
            </CardTitle>
            <CardDescription>Component libraries and UI utilities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {uiComponents.map((tech) => (
                <div key={tech.name} className="p-4 border rounded-lg hover:border-terminal-green/50 transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <tech.icon className={`h-5 w-5 ${tech.color}`} />
                    <span className="font-semibold">{tech.name}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{tech.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Backend Technologies */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5 text-green-500" />
              Backend & Database
            </CardTitle>
            <CardDescription>Server-side technologies and data management</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {backendTech.map((tech) => (
                <div key={tech.name} className="p-4 border rounded-lg hover:border-terminal-green/50 transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <tech.icon className={`h-5 w-5 ${tech.color}`} />
                    <span className="font-semibold">{tech.name}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{tech.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-orange-500" />
              Key Features
            </CardTitle>
            <CardDescription>What makes this portfolio unique</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="w-2 h-2 mt-2 rounded-full bg-terminal-green flex-shrink-0" />
                  <div>
                    <div className="font-medium">{feature.title}</div>
                    <div className="text-sm text-muted-foreground">{feature.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Security Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-500" />
              Security Measures
            </CardTitle>
            <CardDescription>Implemented security features and best practices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {securityFeatures.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <Lock className="h-4 w-4 text-terminal-green flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Database Schema */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-500" />
              Database Tables
            </CardTitle>
            <CardDescription>PostgreSQL database structure</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="font-semibold mb-2 text-terminal-green">articles</div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• id (UUID, PK)</li>
                  <li>• title (TEXT)</li>
                  <li>• slug (TEXT, unique)</li>
                  <li>• content (TEXT)</li>
                  <li>• published (BOOLEAN)</li>
                  <li>• created_at, updated_at</li>
                </ul>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="font-semibold mb-2 text-terminal-green">visitors</div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• id (UUID, PK)</li>
                  <li>• ip_address, user_agent</li>
                  <li>• device_type, browser, OS</li>
                  <li>• country, city</li>
                  <li>• session_id, referrer</li>
                  <li>• visited_at (TIMESTAMP)</li>
                </ul>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="font-semibold mb-2 text-terminal-green">user_roles</div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• id (UUID, PK)</li>
                  <li>• user_id (UUID, FK)</li>
                  <li>• role (app_role enum)</li>
                  <li>• created_at</li>
                  <li className="mt-2 text-xs">Roles: admin, moderator, user</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edge Functions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Edge Functions
            </CardTitle>
            <CardDescription>Serverless API endpoints</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="font-semibold mb-1">dns-lookup</div>
                <p className="text-sm text-muted-foreground">Performs DNS queries and returns A, AAAA, and NS records</p>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="font-semibold mb-1">check-ssl</div>
                <p className="text-sm text-muted-foreground">Validates SSL certificates and returns expiry information</p>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="font-semibold mb-1">fetch-headers</div>
                <p className="text-sm text-muted-foreground">Retrieves HTTP headers from any URL for security analysis</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground py-4 border-t">
          <p>Built with ❤️ using modern web technologies</p>
          <p className="mt-1">© {new Date().getFullYear()} Jerin M R. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminSiteInfo;
