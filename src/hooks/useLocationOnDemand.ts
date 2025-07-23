import { useState, useCallback } from 'react';

interface Coordinates {
  lat: number;
  lng: number;
}

interface UseLocationOnDemandReturn {
  loading: boolean;
  coordinates: Coordinates | null;
  error: string | null;
  requestLocation: () => Promise<void>;
  clearLocation: () => void;
  hasPermission: boolean;
}

export const useLocationOnDemand = (): UseLocationOnDemandReturn => {
  const [loading, setLoading] = useState(false);
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);

  const requestLocation = useCallback(async (): Promise<void> => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return;
    }

    setLoading(true);
    setError(null);

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCoordinates({ lat: latitude, lng: longitude });
          setHasPermission(true);
          setError(null);
          setLoading(false);
          resolve();
        },
        (error) => {
          console.error('Location error:', error);
          let errorMessage = 'Failed to get location';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location permission was denied';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out';
              break;
          }
          
          setError(errorMessage);
          setCoordinates(null);
          setHasPermission(false);
          setLoading(false);
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000,
        }
      );
    });
  }, []);

  const clearLocation = useCallback(() => {
    setCoordinates(null);
    setError(null);
    setHasPermission(false);
  }, []);

  return {
    loading,
    coordinates,
    error,
    requestLocation,
    clearLocation,
    hasPermission,
  };
};