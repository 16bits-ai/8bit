import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Dock, { DockItemData } from './Dock';
import { Home, User, TerminalSquare, Package } from 'lucide-react';
import { useIsMobile } from '../hooks/useIsMobile';

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  // On mobile, the game shows its own on-screen Game Boy controls along the
  // bottom of the screen, so the nav dock would collide with them. Hide it there.
  const hideDock = isMobile && location.pathname === '/game';

  const dockItems: DockItemData[] = [
    {
      icon: <Home size={20} color="#00FF41" />,
      label: 'Home',
      onClick: () => navigate('/')
    },
    {
      icon: <User size={20} color="#FF6B35" />,
      label: 'About',
      onClick: () => navigate('/about')
    },
    {
      icon: <Package size={20} color="#9B59B6" />,
      label: 'Gadgets',
      onClick: () => navigate('/gadgets')
    },
    {
      icon: <TerminalSquare size={20} color="#FFE66D" strokeWidth={2} />,
      label: 'Terminal',
      onClick: () => navigate('/terminal')
    }
  ];

  return (
    <div className="relative w-full min-h-screen min-h-[100dvh] bg-black">
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
