import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { NotificationContainer } from './NotificationContainer';
import { NotificationState } from '@/types';

interface NotificationContextType {
  showNotification: (notification: Omit<NotificationState, 'id'>) => void;
  hideNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

function notificationReducer(
  state: NotificationState[],
  action: any
): NotificationState[] {
  switch (action.type) {
    case 'ADD_NOTIFICATION':
      return [...state, { ...action.notification, id: action.id }];
    case 'REMOVE_NOTIFICATION':
      return state.filter(notification => notification.id !== action.id);
    case 'CLEAR_ALL_NOTIFICATIONS':
      return [];
    default:
      return state;
  }
}

interface NotificationProviderProps {
  children: React.ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps): React.ReactElement {
  const [notifications, dispatch] = useReducer(notificationReducer, []);

  const showNotification = useCallback((notification: Omit<NotificationState, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    dispatch({
      type: 'ADD_NOTIFICATION',
      notification,
      id,
    });

    const duration = notification.duration || 5000;
    if (duration > 0) {
      setTimeout(() => {
        dispatch({ type: 'REMOVE_NOTIFICATION', id });
      }, duration);
    }
  }, []);

  const hideNotification = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', id });
  }, []);

  const clearAllNotifications = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL_NOTIFICATIONS' });
  }, []);

  const value = {
    showNotification,
    hideNotification,
    clearAllNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer
        notifications={notifications}
        onHide={hideNotification}
      />
    </NotificationContext.Provider>
  );
}

export function useNotifications(): NotificationContextType {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
