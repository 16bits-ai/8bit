import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Dock, { DockItemData } from './Dock';
import { Home, User, Briefcase, Mail, Package } from 'lucide-react';

const Layout: React.FC = () => {
  const navigate = useNavigate();

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
      icon: <Briefcase size={20} color="#4ECDC4" />,
      label: 'Projects',
      onClick: () => navigate('/projects')
    },
    {
      icon: <Package size={20} color="#9B59B6" />,
      label: 'Gadgets',
      onClick: () => navigate('/gadgets')
    },
    {
      icon: <Mail size={20} color="#FFE66D" />,
      label: 'Contact',
      onClick: () => navigate('/contact')
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
          magnification={60}
          distance={150}
          baseItemSize={42}
          panelHeight={56}
        />
      </div>
    </div>
  );
};

export default Layout;
