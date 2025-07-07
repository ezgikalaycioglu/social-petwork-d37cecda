
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('User not authenticated');
        return;
      }

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
      
      if (subscription) {
        // Store subscription in database
        const subscriptionData = {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.getKey('p256dh') ? btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))) : null,
            auth: subscription.getKey('auth') ? btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!))) : null,
          }
        };

        const { error } = await supabase
          .from('push_subscriptions')
          .upsert({
            user_id: user.id,
            subscription_details: subscriptionData,
          }, {
            onConflict: 'user_id'
          });

        if (error) {
          console.error('Error storing push subscription:', error);
        } else {
          console.log('Push subscription stored successfully');
        }
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
