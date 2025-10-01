import React, { useState, useRef, useEffect } from 'react';
import { User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { Button } from '@/components/UI/Button';
import { cn } from '@/utils';

export function UserDropdown(): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const user = {
    name: 'German Khakov',
    email: 'gera@gmail.com',
    avatar: null,
    initials: 'GK',
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {

    console.log('Logout clicked');
    setIsOpen(false);
  };

  const handleSettings = () => {

    console.log('Settings clicked');
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3"
        aria-label="User menu"
      >
        {}
        <div className="flex items-center justify-center w-8 h-8 bg-navy-900 text-white rounded-full text-sm font-medium">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            user.initials
          )}
        </div>

        {}
        <span className="hidden md:block text-sm font-medium text-slate-700">
          {user.name}
        </span>

        <ChevronDown className={cn(
          'h-4 w-4 text-slate-500 transition-transform duration-200',
          isOpen && 'transform rotate-180'
        )} />
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-medium border border-slate-200 z-50">
          {}
          <div className="p-4 border-b border-slate-200">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-navy-900 text-white rounded-full text-sm font-medium">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  user.initials
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {user.name}
                </p>
                <p className="text-sm text-slate-500 truncate">
                  {user.email}
                </p>
              </div>
            </div>
          </div>

          {}
          <div className="py-2">
            <button
              onClick={handleSettings}
              className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Settings className="h-4 w-4 mr-3 text-slate-400" />
              Settings
            </button>

            <button
              onClick={() => {

                console.log('Profile clicked');
                setIsOpen(false);
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <User className="h-4 w-4 mr-3 text-slate-400" />
              Profile
            </button>
          </div>

          {}
          <div className="border-t border-slate-200 py-2">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-4 w-4 mr-3 text-red-500" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
