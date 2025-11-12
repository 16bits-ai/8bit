import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Dock, { DockItemData } from './Dock';
import { Home, User, Briefcase, Mail, Gamepad2 } from 'lucide-react';

const Layout: React.FC = () => {
  const navigate = useNavigate();

  const dockItems: DockItemData[] = [
    {
      icon: <Home size={24} color="#00FF41" />,
      label: 'Home',
      onClick: () => navigate('/')
    },
    {
      icon: <User size={24} color="#FF6B35" />,
      label: 'About',
      onClick: () => navigate('/about')
    },
    {
      icon: <Briefcase size={24} color="#4ECDC4" />,
      label: 'Projects',
      onClick: () => navigate('/projects')
    },
    {
      icon: <Mail size={24} color="#FFE66D" />,
      label: 'Contact',
      onClick: () => navigate('/contact')
    },
    {
      icon: <Gamepad2 size={24} color="#FF1744" />,
      label: 'Game',
      onClick: () => navigate('/game')
    }
  ];

  return (
    <div className="relative w-full min-h-screen">
      <main className="w-full min-h-screen">
        <Outlet />
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-2">
        <Dock
          items={dockItems}
          magnification={70}
          distance={150}
          baseItemSize={50}
          panelHeight={64}
        />
      </div>
    </div>
  );
};

export default Layout;
