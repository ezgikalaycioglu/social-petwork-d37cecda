
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, BellOff, Smartphone } from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useToast } from '@/hooks/use-toast';

const PushNotificationSettings = () => {
  const { permissionStatus, requestNotificationPermission, isSupported } = usePushNotifications();
  const { toast } = useToast();

  const handleEnablePushNotifications = async () => {
    const success = await requestNotificationPermission();
    
    if (success) {
      toast({
        title: "Push Notifications Enabled",
        description: "You'll now receive push notifications for important updates.",
      });
    } else {
      toast({
        title: "Failed to Enable Notifications",
        description: "Please check your browser settings and try again.",
        variant: "destructive",
      });
    }
  };

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="w-5 h-5" />
            Push Notifications
          </CardTitle>
          <CardDescription>
            Push notifications are not supported in your browser
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="w-5 h-5" />
          Push Notifications
        </CardTitle>
        <CardDescription>
          Receive instant notifications for playdate requests, confirmations, and other important updates
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium">
              Status: {
                permissionStatus === 'granted' ? (
                  <span className="text-green-600">Enabled</span>
                ) : permissionStatus === 'denied' ? (
                  <span className="text-red-600">Blocked</span>
                ) : (
                  <span className="text-gray-600">Not configured</span>
                )
              }
            </p>
            <p className="text-sm text-gray-600">
              {permissionStatus === 'granted' 
                ? 'Push notifications are active for this device'
                : permissionStatus === 'denied'
                ? 'Push notifications have been blocked. Please enable them in your browser settings.'
                : 'Enable push notifications to stay updated on pet activities'
              }
            </p>
          </div>
          
          {permissionStatus !== 'granted' && permissionStatus !== 'denied' && (
            <Button
              onClick={handleEnablePushNotifications}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Bell className="w-4 h-4 mr-2" />
              Enable Notifications
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PushNotificationSettings;
