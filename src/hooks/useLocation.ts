import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';

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

  const fetchLocation = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (Capacitor.getPlatform() === 'web') {
        if (!navigator.geolocation) {
          setError('Geolocation is not supported by this browser');
          setLoading(false);
          return;
        }

        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setCoordinates({ lat: latitude, lng: longitude });
            setLoading(false);
          },
          (err) => {
            handleGeolocationError(err);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000,
          }
        );
      } else {
        // Mobile (Capacitor) konum alma
        await Geolocation.requestPermissions();
        const position = await Geolocation.getCurrentPosition();
        setCoordinates({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLoading(false);
      }
    } catch (err: any) {
      setError('Failed to get location');
      setLoading(false);
    }
  }, []);

  const handleGeolocationError = (error: GeolocationPositionError) => {
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
  };

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
