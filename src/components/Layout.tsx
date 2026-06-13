import React, { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Dock, { DockItemData } from './Dock';
import { Home, User, TerminalSquare, Package, Sun, Moon } from 'lucide-react';
import { useIsMobile } from '../hooks/useIsMobile';
import { useTheme } from '../hooks/useTheme';

// Map a route to its page key so CSS can pick the per-page accent via
// <html data-page="...">. Documents share the terminal's amber.
const pageKeyForPath = (pathname: string): string => {
  if (pathname === '/') return 'home';
  if (pathname.startsWith('/about')) return 'about';
  if (pathname.startsWith('/gadgets')) return 'gadgets';
  if (pathname.startsWith('/terminal')) return 'terminal';
  if (pathname.startsWith('/game')) return 'game';
  if (pathname.startsWith('/documents')) return 'terminal';
  return 'home';
};

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const { theme, toggleTheme } = useTheme();

  // Tell CSS which page we're on so the accent token resolves correctly.
  useEffect(() => {
    document.documentElement.setAttribute('data-page', pageKeyForPath(location.pathname));
  }, [location.pathname]);

  // On mobile, the game shows its own on-screen Game Boy controls along the
  // bottom of the screen, so the nav dock would collide with them. Hide it there.
  const hideDock = isMobile && location.pathname === '/game';

  // Section icon colors are darkened in light mode so they read on off-white.
  const c = theme === 'light'
    ? { home: '#2f6d2e', about: '#9a4316', gadgets: '#5e3370', terminal: '#7a5a12', ink: '#1b1a17' }
    : { home: '#00FF41', about: '#FF6B35', gadgets: '#9B59B6', terminal: '#FFE66D', ink: '#FFFFFF' };

  const dockItems: DockItemData[] = [
    {
      icon: <Home size={20} color={c.home} />,
      label: 'Home',
      onClick: () => navigate('/')
    },
    {
      icon: <User size={20} color={c.about} />,
      label: 'About',
      onClick: () => navigate('/about')
    },
    {
      icon: <Package size={20} color={c.gadgets} />,
      label: 'Gadgets',
      onClick: () => navigate('/gadgets')
    },
    {
      icon: <TerminalSquare size={20} color={c.terminal} strokeWidth={2} />,
      label: 'Terminal',
      onClick: () => navigate('/terminal')
    },
    {
      icon: theme === 'dark'
        ? <Sun size={20} color={c.ink} />
        : <Moon size={20} color={c.ink} />,
      label: theme === 'dark' ? 'Light mode' : 'Dark mode',
      onClick: toggleTheme
    }
  ];

  return (
    <div className="relative w-full min-h-screen min-h-[100dvh] bg-[var(--paper)]">
      <main className="w-full min-h-screen min-h-[100dvh]">
        <Outlet />
      </main>

      {!hideDock && (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-2">
          <Dock
            items={dockItems}
            magnification={60}
            distance={150}
            baseItemSize={42}
            panelHeight={56}
          />
        </div>
      )}
    </div>
  );
};

export default Layout;
