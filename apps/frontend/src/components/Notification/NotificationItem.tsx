import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { NotificationState } from '@/types';
import { cn } from '@/utils';
import { Button } from '@/components/UI/Button';
import { motion, AnimatePresence } from 'framer-motion';

interface NotificationItemProps {
  notification: NotificationState;
  onHide: (id: string) => void;
  index: number;
}

export function NotificationItem({
  notification,
  onHide,
}: NotificationItemProps): React.ReactElement {
  const [progress, setProgress] = useState(100);
  const [isVisible, setIsVisible] = useState(false);

  const getNotificationConfig = () => {
    switch (notification.type) {
      case 'success':
        return {
          icon: CheckCircle,
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-800',
          iconColor: 'text-green-600',
        };
      case 'error':
        return {
          icon: AlertCircle,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
          iconColor: 'text-red-600',
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
          textColor: 'text-amber-800',
          iconColor: 'text-amber-600',
        };
      case 'info':
      default:
        return {
          icon: Info,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-800',
          iconColor: 'text-blue-600',
        };
    }
  };

  const config = getNotificationConfig();
  const Icon = config.icon;

  useEffect(() => {
    if (notification.duration && notification.duration > 0) {
      const interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev - (100 / (notification.duration! / 100));
          if (newProgress <= 0) {
            clearInterval(interval);
            onHide(notification.id);
            return 0;
          }
          return newProgress;
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [notification.duration, notification.id, onHide]);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleHide = () => {
    setIsVisible(false);
    setTimeout(() => onHide(notification.id), 300);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 300, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 300, scale: 0.95 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className={cn(
            'relative p-4 rounded-lg border shadow-medium',
            config.bgColor,
            config.borderColor
          )}
          role="alert"
          aria-live="polite"
        >
          {}
          <button
            onClick={handleHide}
            className="absolute top-2 right-2 p-1 rounded-md hover:bg-black hover:bg-opacity-10 transition-colors"
            aria-label="Close notification"
          >
            <X className="h-4 w-4" />
          </button>

          {}
          <div className="flex items-start space-x-3 pr-6">
            <Icon className={cn('h-5 w-5 flex-shrink-0 mt-0.5', config.iconColor)} />

            <div className="flex-1 min-w-0">
              <h4 className={cn('text-sm font-medium', config.textColor)}>
                {notification.title}
              </h4>
              <p className={cn('text-sm mt-1', config.textColor)}>
                {notification.message}
              </p>

              {}
              {notification.action && (
                <div className="mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={notification.action.onClick}
                    className="text-xs"
                  >
                    {notification.action.label}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {}
          {notification.duration && notification.duration > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black bg-opacity-10 rounded-b-lg overflow-hidden">
              <motion.div
                className="h-full bg-current opacity-30"
                initial={{ width: '100%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
