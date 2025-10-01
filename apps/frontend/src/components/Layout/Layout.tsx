import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useSidebar } from '@/hooks/useSidebar';
import { cn } from '@/utils';

export function Layout(): React.ReactElement {
  const { isOpen: sidebarOpen, toggle: toggleSidebar } = useSidebar();

  return (
    <div className="min-h-screen bg-background-primary">
      <Header onMenuClick={toggleSidebar} />

      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => toggleSidebar(false)} />
        <main 
          className={cn(
            'flex-1 transition-all duration-300 ease-in-out',
            'lg:ml-64',
            sidebarOpen && 'ml-64',
          )}
        >
          <div className="min-h-screen">
            <div className="container-wide py-6">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => toggleSidebar(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
