import { memo, useCallback } from 'react';

interface NavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const commands = [
  { id: 'home', command: 'cd ~', mobileCommand: '~', label: 'Home' },
  { id: 'profile', command: 'cat profile/*', mobileCommand: 'profile', label: 'Profile' },
  { id: 'articles', command: 'ls articles/', mobileCommand: 'articles', label: 'Articles' },
  { id: 'network', command: 'netstat -a', mobileCommand: 'netstat', label: 'Network Tools' },
  { id: 'utilities', command: 'man utils', mobileCommand: 'utils', label: 'Utilities' },
] as const;

export const TerminalNavigation = memo(function TerminalNavigation({ activeSection, onSectionChange }: NavigationProps) {
  const handleClick = useCallback((id: string) => {
    onSectionChange(id);
  }, [onSectionChange]);

  return (
    <nav className="flex flex-wrap gap-1 sm:gap-2 p-2 sm:p-4 bg-muted border-b border-border overflow-x-auto" role="navigation" aria-label="Main navigation">
      {commands.map((cmd) => (
        <button
          key={cmd.id}
          onClick={() => handleClick(cmd.id)}
          aria-current={activeSection === cmd.id ? 'page' : undefined}
          className={`px-2 sm:px-3 py-1 rounded font-mono text-xs sm:text-sm transition-colors whitespace-nowrap ${
            activeSection === cmd.id
              ? 'bg-terminal-green text-background'
              : 'text-terminal-gray hover:text-terminal-green hover:bg-secondary'
          }`}
        >
          <span className="hidden sm:inline">{cmd.command}</span>
          <span className="sm:hidden">{cmd.mobileCommand}</span>
        </button>
      ))}
    </nav>
  );
});
