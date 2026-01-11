import { useState, useCallback, useEffect, useRef } from 'react';
import { despia, isDespiaNative } from '@/utils/despia';

interface Coordinates {
  lat: number;
  lng: number;
}

interface UseNativeLocationReturn {
  isNative: boolean;
  isBackgroundTrackingActive: boolean;
  backgroundCoordinates: Coordinates | null;
  startBackgroundTracking: () => Promise<boolean>;
  stopBackgroundTracking: () => Promise<void>;
}

/**
 * Hook for native background location tracking via Despia SDK
 * Falls back gracefully on web browsers (use useLocationOnDemand for web)
 */
export const useNativeLocation = (): UseNativeLocationReturn => {
  const [isBackgroundTrackingActive, setIsBackgroundTrackingActive] = useState(false);
  const [backgroundCoordinates, setBackgroundCoordinates] = useState<Coordinates | null>(null);
  const isNative = isDespiaNative();
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  const startBackgroundTracking = useCallback(async (): Promise<boolean> => {
    if (!isNative) {
      console.log('[NativeLocation] Not in native environment, use web geolocation instead');
      return false;
    }

    try {
      // Start background location tracking
      await despia('backgroundlocationon://');
      setIsBackgroundTrackingActive(true);
      console.log('[NativeLocation] Background tracking started');

      // Poll for location updates (Despia updates these variables)
      pollingIntervalRef.current = setInterval(async () => {
        try {
          // In a real implementation, you'd read from Despia's window variables
          // For now, we'll use the standard Geolocation API as a fallback
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                setBackgroundCoordinates({
                  lat: position.coords.latitude,
                  lng: position.coords.longitude,
                });
              },
              (error) => {
                console.warn('[NativeLocation] Position update error:', error);
              }
            );
          }
        } catch (error) {
          console.warn('[NativeLocation] Polling error:', error);
        }
      }, 30000); // Poll every 30 seconds

      return true;
    } catch (error) {
      console.error('[NativeLocation] Error starting background tracking:', error);
      return false;
    }
  }, [isNative]);

  const stopBackgroundTracking = useCallback(async (): Promise<void> => {
    if (!isNative) return;

    try {
      await despia('backgroundlocationoff://');
      setIsBackgroundTrackingActive(false);
      setBackgroundCoordinates(null);
      
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      
      console.log('[NativeLocation] Background tracking stopped');
    } catch (error) {
      console.error('[NativeLocation] Error stopping background tracking:', error);
    }
  }, [isNative]);

  return {
    isNative,
    isBackgroundTrackingActive,
    backgroundCoordinates,
    startBackgroundTracking,
    stopBackgroundTracking,
  };
};
