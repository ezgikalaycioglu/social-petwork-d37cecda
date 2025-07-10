import { useState, useEffect, useCallback } from 'react';

interface Coordinates {
  lat: number;
  lng: number;
}

interface UseLocationReturn {
  loading: boolean;
  coordinates: Coordinates | null;
  error: string | null;
  refetch: () => void;
}

export const useLocation = (): UseLocationReturn => {
  const [loading, setLoading] = useState(true);
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLoading(false);
      setError('Geolocation is not supported by this browser');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoordinates({ lat: latitude, lng: longitude });
        setError(null);
        setLoading(false);
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
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  }, []);

  const refetch = useCallback(() => {
    fetchLocation();
  }, [fetchLocation]);

  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  return {
    loading,
    coordinates,
    error,
    refetch,
  };
};