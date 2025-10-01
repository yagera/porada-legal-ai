import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  Home, 
  Upload, 
  FileText, 
  History, 
  Settings, 
  HelpCircle,
  Shield,
  X
} from 'lucide-react';
import { cn } from '@/utils';
import { Button } from '@/components/UI/Button';
import { Logo } from '@/components/UI/Logo';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps): React.ReactElement {
  const location = useLocation();

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      description: 'Overview and analytics'
    },
    {
      name: 'Upload Document',
      href: '/upload',
      icon: Upload,
      description: 'Analyze new contracts'
    },
    {
      name: 'Analysis Results',
      href: '/analysis',
      icon: FileText,
      description: 'View detailed results'
    },
    {
      name: 'History',
      href: '/history',
      icon: History,
      description: 'Previous analyses'
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      description: 'Account preferences'
    }
  ];

  const isActive = (href: string): boolean => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  return (
    <>
      {}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col lg:pt-16">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white border-r border-slate-200 px-6 pb-4">
          {}
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);

                    return (
                      <li key={item.name}>
                        <Link
                          to={item.href}
                          className={cn(
                            'group flex gap-x-3 rounded-lg p-3 text-sm font-medium transition-colors',
                            active
                              ? 'bg-gold-50 text-gold-700 border border-gold-200'
                              : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                          )}
                          aria-current={active ? 'page' : undefined}
                        >
                          <Icon 
                            className={cn(
                              'h-5 w-5 shrink-0',
                              active ? 'text-gold-600' : 'text-slate-400 group-hover:text-slate-500'
                            )}
                            aria-hidden="true"
                          />
                          <div className="flex-1">
                            <span className="block">{item.name}</span>
                            <span className={cn(
                              'text-xs mt-0.5 block',
                              active ? 'text-gold-600' : 'text-slate-500'
                            )}>
                              {item.description}
                            </span>
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </li>

              {}
              <li className="mt-auto">
                <div className="space-y-2">
                  {}
                  <Link
                    to="/help"
                    className="group flex gap-x-3 rounded-lg p-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                  >
                    <HelpCircle className="h-5 w-5 shrink-0 text-slate-400 group-hover:text-slate-500" />
                    <span>Help & Support</span>
                  </Link>

                  {}
                  <div className="group flex gap-x-3 rounded-lg p-3 text-sm font-medium text-slate-700">
                    <Shield className="h-5 w-5 shrink-0 text-green-500" />
                    <div className="flex-1">
                      <span className="block">Secure Analysis</span>
                      <span className="text-xs text-green-600 mt-0.5 block">
                        Enterprise-grade security
                      </span>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </nav>
        </div>
      </aside>

      {}
      <div className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:hidden',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex h-full flex-col">
          {}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <Logo size="md" showText={true} />
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              aria-label="Close navigation menu"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {}
          <nav className="flex-1 px-6 py-4">
            <ul role="list" className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      onClick={onClose}
                      className={cn(
                        'group flex gap-x-3 rounded-lg p-3 text-sm font-medium transition-colors',
                        active
                          ? 'bg-gold-50 text-gold-700 border border-gold-200'
                          : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                      )}
                      aria-current={active ? 'page' : undefined}
                    >
                      <Icon 
                        className={cn(
                          'h-5 w-5 shrink-0',
                          active ? 'text-gold-600' : 'text-slate-400 group-hover:text-slate-500'
                        )}
                        aria-hidden="true"
                      />
                      <div className="flex-1">
                        <span className="block">{item.name}</span>
                        <span className={cn(
                          'text-xs mt-0.5 block',
                          active ? 'text-gold-600' : 'text-slate-500'
                        )}>
                          {item.description}
                        </span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>

            {}
            <div className="mt-8 space-y-2">
              <Link
                to="/help"
                onClick={onClose}
                className="group flex gap-x-3 rounded-lg p-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900"
              >
                <HelpCircle className="h-5 w-5 shrink-0 text-slate-400 group-hover:text-slate-500" />
                <span>Help & Support</span>
              </Link>

              <div className="group flex gap-x-3 rounded-lg p-3 text-sm font-medium text-slate-700">
                <Shield className="h-5 w-5 shrink-0 text-green-500" />
                <div className="flex-1">
                  <span className="block">Secure Analysis</span>
                  <span className="text-xs text-green-600 mt-0.5 block">
                    Enterprise-grade security
                  </span>
                </div>
              </div>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}
