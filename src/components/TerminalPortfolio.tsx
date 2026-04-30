import { useState, useEffect, useCallback, lazy, Suspense, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { TerminalHeader } from './TerminalHeader';
import { TerminalNavigation } from './TerminalNavigation';
import { WelcomeAnimation } from './WelcomeAnimation';
import { ProfileSection } from './ProfileSection';
import { NetworkWarning } from './NetworkWarning';
import { EasterEggEffects } from './EasterEggEffects';
import { useEasterEggs } from '@/hooks/useEasterEggs';

// Lazy load heavy sections
const ProfileInfoSection = lazy(() => import('./sections/ProfileInfoSection').then(m => ({ default: m.ProfileInfoSection })));

const NetworkToolsSection = lazy(() => import('./sections/NetworkToolsSection').then(m => ({ default: m.NetworkToolsSection })));
const UtilityToolsSection = lazy(() => import('./sections/UtilityToolsSection').then(m => ({ default: m.UtilityToolsSection })));
const ArticlesSection = lazy(() => import('./sections/ArticlesSection').then(m => ({ default: m.ArticlesSection })));

const SectionLoader = memo(() => (
  <div className="flex items-center justify-center py-12">
    <span className="font-mono text-sm text-muted-foreground animate-pulse">Loading section...</span>
  </div>
));
SectionLoader.displayName = 'SectionLoader';

export function TerminalPortfolio() {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(() => {
    return sessionStorage.getItem('welcomeAnimationPlayed') === 'true';
  });
  const [activeSection, setActiveSection] = useState('home');
  const [theme, setTheme] = useState<'dark' | 'light' | 'eye-comfort'>('dark');
  const [visitorIP, setVisitorIP] = useState<string>('');
  const [visitorLocation, setVisitorLocation] = useState<string>('');
  const [adminClicks, setAdminClicks] = useState(0);
  const { activeEffect, handleHeaderClick, clearEffect } = useEasterEggs();

  useEffect(() => {
    const controller = new AbortController();
    fetch('https://ipapi.co/json/', { signal: controller.signal })
      .then(response => response.json())
      .then(data => {
        setVisitorIP(data.ip || '127.0.0.1');
        setVisitorLocation(data.city && data.country ? `${data.city}, ${data.country}` : '');
      })
      .catch(() => {
        setVisitorIP('127.0.0.1');
        setVisitorLocation('');
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  const handleThemeToggle = useCallback(() => {
    setTheme(current => 
      current === 'dark' ? 'light' : 
      current === 'light' ? 'eye-comfort' : 
      'dark'
    );
  }, []);

  const handleAdminAccess = useCallback(() => {
    setAdminClicks(prev => {
      const newCount = prev + 1;
      if (newCount >= 5) {
        navigate('/admin/visitors');
        return 0;
      }
      return newCount;
    });
  }, [navigate]);

  const handleAnimationComplete = useCallback(() => {
    sessionStorage.setItem('welcomeAnimationPlayed', 'true');
    setIsLoaded(true);
  }, []);

  const renderSection = () => {
    if (!isLoaded) {
      return <WelcomeAnimation onComplete={handleAnimationComplete} />;
    }

    switch (activeSection) {
      case 'home':
        return <ProfileSection />;
      case 'profile':
      case 'articles':
      case 'network':
      case 'utilities':
        return (
          <Suspense fallback={<SectionLoader />}>
            {activeSection === 'profile' && <ProfileInfoSection />}
            {activeSection === 'articles' && <ArticlesSection />}
            {activeSection === 'network' && <NetworkToolsSection />}
            {activeSection === 'utilities' && <UtilityToolsSection />}
          </Suspense>
        );
      default:
        return <ProfileSection />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground px-2 sm:px-4">
      <NetworkWarning />
      <EasterEggEffects effect={activeEffect} onClear={clearEffect} />
      <div className="max-w-6xl mx-auto border border-border bg-card shadow-2xl min-h-screen sm:min-h-0">
        <TerminalHeader 
          onThemeToggle={handleThemeToggle} 
          theme={theme}
          onHeaderClick={handleHeaderClick}
        />
        
        {isLoaded && (
          <TerminalNavigation 
            activeSection={activeSection} 
            onSectionChange={setActiveSection} 
          />
        )}
        
        <main className="p-3 sm:p-6 min-h-[400px] sm:min-h-[600px] overflow-auto" role="main">
          {renderSection()}
        </main>
        
        <footer className="px-3 sm:px-6 py-2 bg-muted border-t border-border" role="contentinfo">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs font-mono text-terminal-gray gap-2 sm:gap-0">
            <span className="flex items-center gap-2">
              <span 
                className="w-2 h-2 bg-terminal-green rounded-full animate-pulse cursor-pointer" 
                onClick={handleAdminAccess}
                title={adminClicks > 0 ? `${5 - adminClicks} more clicks` : ''}
                role="button"
                aria-label="Status indicator"
              ></span>
              Connected {visitorIP && `- IP: ${visitorIP}`} {visitorLocation && `- ${visitorLocation}`}
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
