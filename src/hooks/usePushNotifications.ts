
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
    // Check if the browser supports push notifications
    const checkSupport = () => {
      return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
    };

    setIsSupported(checkSupport());

    // Initialize permission status
    if (checkSupport()) {
      setPermissionStatus(Notification.permission);
    }
  }, []);

  const requestNotificationPermission = async (): Promise<boolean> => {
    console.log('Requesting notification permission...');
    
    if (!isSupported) {
      console.log('Push notifications not supported');
      return false;
    }

    try {
      // Check if permission is already granted
      if (Notification.permission === 'granted') {
        console.log('Permission already granted');
        await handlePermissionGranted();
        return true;
      }

      // Request permission from the user
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);
      
      console.log('Permission result:', permission);

      if (permission === 'granted') {
        await handlePermissionGranted();
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  const handlePermissionGranted = async () => {
    try {
      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;
      console.log('Service worker ready:', registration);

      // Get existing subscription or create new one
      let subscription = await registration.pushManager.getSubscription();
      
      if (!subscription) {
        console.log('Creating new push subscription...');
        // Create new subscription with VAPID key (we'll need to configure this later)
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          // Note: applicationServerKey will need to be configured with actual VAPID key
          // applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
        });
      }

      console.log('Push subscription:', subscription);
      
      // Here we would typically send the subscription to our backend
      // For now, we'll just log it
      if (subscription) {
        console.log('Push subscription endpoint:', subscription.endpoint);
      }

    } catch (error) {
      console.error('Error handling granted permission:', error);
    }
  };

  return {
    permissionStatus,
    requestNotificationPermission,
    isSupported,
  };
};
