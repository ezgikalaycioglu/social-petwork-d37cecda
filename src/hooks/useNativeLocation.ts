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
  const watchIdRef = useRef<number | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  const startBackgroundTracking = useCallback(async (): Promise<boolean> => {
    // In native environment, use Despia SDK
    if (isNative) {
      try {
        await despia('backgroundlocationon://');
        setIsBackgroundTrackingActive(true);
        console.log('[NativeLocation] Background tracking started via Despia');
        
        // Still use web geolocation for coordinate updates
        // Despia handles background permissions, web API provides coordinates
        if (navigator.geolocation) {
          watchIdRef.current = navigator.geolocation.watchPosition(
            (position) => {
              setBackgroundCoordinates({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              });
            },
            (error) => {
              console.warn('[NativeLocation] Position update error:', error);
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 30000,
            }
          );
        }
        return true;
      } catch (error) {
        console.error('[NativeLocation] Error starting background tracking:', error);
        return false;
      }
    }

    // Web fallback - use standard geolocation
    console.log('[NativeLocation] Using web geolocation fallback');
    
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.error('[NativeLocation] Geolocation not supported');
        resolve(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setBackgroundCoordinates({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setIsBackgroundTrackingActive(true);
          
          // Set up watch for continuous updates
          watchIdRef.current = navigator.geolocation.watchPosition(
            (pos) => {
              setBackgroundCoordinates({
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
              });
            },
            (error) => {
              console.warn('[NativeLocation] Watch position error:', error);
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 30000,
            }
          );
          
          resolve(true);
        },
        (error) => {
          console.error('[NativeLocation] Permission denied or error:', error);
          resolve(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  }, [isNative]);

  const stopBackgroundTracking = useCallback(async (): Promise<void> => {
    // Stop Despia background tracking if native
    if (isNative) {
      try {
        await despia('backgroundlocationoff://');
        console.log('[NativeLocation] Background tracking stopped via Despia');
      } catch (error) {
        console.error('[NativeLocation] Error stopping background tracking:', error);
      }
    }

    // Clear web geolocation watch
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    setIsBackgroundTrackingActive(false);
    setBackgroundCoordinates(null);
  }, [isNative]);

  return {
    isNative,
    isBackgroundTrackingActive,
    backgroundCoordinates,
    startBackgroundTracking,
    stopBackgroundTracking,
  };
};
