import { useState, useEffect } from 'react';

type NotificationPermission = 'default' | 'granted' | 'denied';

interface PushNotificationHook {
  permissionStatus: NotificationPermission;
  requestNotificationPermission: () => Promise<boolean>;
  isSupported: boolean;
}

export const usePushNotifications = (): PushNotificationHook => {
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if the browser supports basic notifications (without service worker)
    const checkSupport = () => {
      return 'Notification' in window;
    };

    setIsSupported(checkSupport());

    // Initialize permission status
    if (checkSupport()) {
      setPermissionStatus(Notification.permission);
    }
  }, []);

  const requestNotificationPermission = async (): Promise<boolean> => {
    if (!isSupported) {
      return false;
    }

    if (permissionStatus === 'granted') {
      return true;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);
      
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  return {
    permissionStatus,
    requestNotificationPermission,
    isSupported,
  };
};