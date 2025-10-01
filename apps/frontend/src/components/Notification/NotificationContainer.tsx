import React from 'react';
import { NotificationState } from '@/types';
import { NotificationItem } from './NotificationItem';

interface NotificationContainerProps {
  notifications: NotificationState[];
  onHide: (id: string) => void;
}

export function NotificationContainer({
  notifications,
  onHide,
}: NotificationContainerProps): React.ReactElement {
  if (notifications.length === 0) {
    return <></>;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm w-full">
      {notifications.map((notification, index) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onHide={onHide}
          index={index}
        />
      ))}
    </div>
  );
}
