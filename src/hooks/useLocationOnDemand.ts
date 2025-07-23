import { useState, useCallback, useRef } from 'react';

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
  
  // Use a ref to store the watchId so it persists across renders
  const watchIdRef = useRef<number | null>(null);

  // Function to handle location success
  const handleSuccess = useCallback((position: GeolocationPosition) => {
    const { latitude, longitude } = position.coords;
    setCoordinates({ lat: latitude, lng: longitude });
    setHasPermission(true);
    setError(null);
    setLoading(false);
  }, []);

  // Function to handle location errors
  const handleError = useCallback((err: GeolocationPositionError) => {
    console.error('Location error in useLocationOnDemand:', err);
    let errorMessage = 'Failed to get location';
    
    switch (err.code) {
      case err.PERMISSION_DENIED:
        errorMessage = 'Location permission was denied. Please enable it in your browser/device settings.';
        break;
      case err.POSITION_UNAVAILABLE:
        errorMessage = 'Location information is unavailable.';
        break;
      case err.TIMEOUT:
        errorMessage = 'Location request timed out.';
        break;
      default:
        errorMessage = `An unknown location error occurred: ${err.message}`;
        break;
    }
    
    setError(errorMessage);
    setCoordinates(null);
    setHasPermission(false); // Permission might be denied or temporarily unavailable
    setLoading(false);
  }, []);

  const requestLocation = useCallback(async (): Promise<void> => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      // No need to set hasPermission to false here, as it's not applicable
      return Promise.reject(new Error('Geolocation not supported'));
    }

    setLoading(true);
    setError(null);

    // First, check current permission status
    // This part helps in understanding if a prompt will even show
    try {
      const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });
      
      if (permissionStatus.state === 'denied') {
        const message = 'Location permission is permanently denied. Please enable it manually in your browser or device settings.';
        setError(message);
        setHasPermission(false);
        setLoading(false);
        return Promise.reject(new Error(message));
      }
    } catch (queryError: any) {
      console.warn("Could not query geolocation permission status:", queryError);
      // Continue even if query fails, watchPosition will still attempt
    }

    // Clear any existing watch to start a fresh one
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
      console.log("Cleared previous geolocation watch.");
    }

    // Start watching position
    return new Promise((resolve, reject) => {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          handleSuccess(position);
          resolve(); // Resolve promise on first successful position
        },
        (error) => {
          handleError(error);
          reject(error); // Reject promise if an error occurs
        },
        {
          enableHighAccuracy: true,
          timeout: 15000, // Increased timeout slightly
          maximumAge: 0, // Request fresh position immediately
        }
      );
      console.log("Started new geolocation watch.");
    });
  }, [handleSuccess, handleError]);

  const clearLocation = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
      console.log("Geolocation watch explicitly cleared.");
    }
    setCoordinates(null);
    setError(null);
    setHasPermission(false);
    setLoading(false); // Stop loading state when clearing
  }, []);

  // Cleanup effect: clear watch when the hook unmounts
  // This is important for preventing memory leaks
  // However, for "on-demand" usage where clearLocation is called explicitly,
  // this might not be strictly necessary, but good practice.
  /*
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
        console.log("Geolocation watch cleared on unmount.");
      }
    };
  }, []);
  */

  return {
    loading,
    coordinates,
    error,
    requestLocation,
    clearLocation,
    hasPermission,
  };
};