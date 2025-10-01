import React, { useState, useRef, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { Button } from '@/components/UI/Button';
import { cn } from '@/utils';

export function NotificationDropdown(): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications] = useState([
    {
      id: '1',
      title: 'Analysis Complete',
      message: 'Contract analysis for "Service Agreement.pdf" has been completed.',
      time: '2 minutes ago',
      read: false,
    },
    {
      id: '2',
      title: 'High Risk Detected',
      message: 'Critical issues found in "Employment Contract.pdf"',
      time: '1 hour ago',
      read: false,
    },
    {
      id: '3',
      title: 'Document Uploaded',
      message: 'New document "NDA Template.pdf" has been uploaded.',
      time: '3 hours ago',
      read: true,
    },
  ]);

  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-medium border border-slate-200 z-50">
          <div className="p-4 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-heading font-semibold text-slate-900">
                Notifications
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                aria-label="Close notifications"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  'p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors',
                  !notification.read && 'bg-blue-50'
                )}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-1 min-w-0">
                    <h4 className={cn(
                      'text-sm font-medium',
                      !notification.read ? 'text-slate-900' : 'text-slate-600'
                    )}>
                      {notification.title}
                    </h4>
                    <p className="text-sm text-slate-600 mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-slate-500 mt-2">
                      {notification.time}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-slate-200">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setIsOpen(false)}
            >
              Mark all as read
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
