import { useState, useCallback, useEffect } from 'react';
import { despia, isDespiaNative } from '@/utils/despia';
import { supabase } from '@/integrations/supabase/client';

interface UseNativePushNotificationsReturn {
  isNative: boolean;
  playerId: string | null;
  isRegistered: boolean;
  registerForPushNotifications: () => Promise<boolean>;
  isRegistering: boolean;
}

/**
 * Hook for native push notifications via OneSignal through Despia SDK
 * Only functional in native Despia environment
 */
export const useNativePushNotifications = (): UseNativePushNotificationsReturn => {
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const isNative = isDespiaNative();

  // Check for existing registration on mount
  useEffect(() => {
    const checkExistingRegistration = async () => {
      if (!isNative) return;

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from('user_profiles')
          .select('onesignal_player_id')
          .eq('id', user.id)
          .single();

        if (profile?.onesignal_player_id) {
          setPlayerId(profile.onesignal_player_id);
          setIsRegistered(true);
        }
      } catch (error) {
        console.error('[NativePush] Error checking registration:', error);
      }
    };

    checkExistingRegistration();
  }, [isNative]);

  const registerForPushNotifications = useCallback(async (): Promise<boolean> => {
    if (!isNative) {
      console.log('[NativePush] Not in native environment');
      return false;
    }

    setIsRegistering(true);
    try {
      // Get OneSignal player ID from Despia
      const result = await despia('getonesignalplayerid://', ['onesignalplayerid']);
      
      if (!result?.onesignalplayerid) {
        console.error('[NativePush] Failed to get OneSignal player ID');
        return false;
      }

      const newPlayerId = result.onesignalplayerid;

      // Store player ID in user profile
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('[NativePush] User not authenticated');
        return false;
      }

      const { error } = await supabase
        .from('user_profiles')
        .update({ onesignal_player_id: newPlayerId })
        .eq('id', user.id);

      if (error) {
        console.error('[NativePush] Error storing player ID:', error);
        return false;
      }

      setPlayerId(newPlayerId);
      setIsRegistered(true);
      console.log('[NativePush] Successfully registered:', newPlayerId);
      return true;
    } catch (error) {
      console.error('[NativePush] Error registering:', error);
      return false;
    } finally {
      setIsRegistering(false);
    }
  }, [isNative]);

  return {
    isNative,
    playerId,
    isRegistered,
    registerForPushNotifications,
    isRegistering,
  };
};
