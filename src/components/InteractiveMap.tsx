import React, { useEffect, useState, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon, divIcon } from 'leaflet';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useLocationOnDemand } from '@/hooks/useLocationOnDemand';
import { useNativeLocation } from '@/hooks/useNativeLocation';
import { useHaptics } from '@/hooks/useHaptics';
import { useReadyToPlay } from '@/contexts/ReadyToPlayContext';
import { MapPin, Navigation, PawPrint, Plus, Minus, Locate } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import type { Tables } from '@/integrations/supabase/types';

type PetProfile = Tables<'pet_profiles'>;

interface InteractiveMapProps {
  userPets: PetProfile[];
  onLocationPermissionChange?: (granted: boolean) => void;
  showLocationToasts?: boolean;
}

// Custom marker icons
const createPetMarker = (petPhotoUrl?: string) => {
  if (petPhotoUrl) {
    return divIcon({
      html: `<div class="w-10 h-10 rounded-full border-2 border-green-500 overflow-hidden bg-white shadow-lg">
               <img src="${petPhotoUrl}" class="w-full h-full object-cover" />
             </div>`, // Corrected to template literal
      className: 'custom-pet-marker',
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });
  }
  
  return divIcon({
    html: `<div class="w-10 h-10 rounded-full border-2 border-green-500 bg-green-100 flex items-center justify-center shadow-lg">
             <svg class="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
               <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
             </svg>
           </div>`, // Corrected to template literal
    className: 'custom-pet-marker',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

const LocationTracker: React.FC<{ onLocationUpdate: (lat: number, lng: number) => void }> = ({ onLocationUpdate }) => {
  const map = useMap();
  
  useEffect(() => {
    if (!navigator.geolocation) {
      console.warn("Geolocation is not supported by this browser.");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        onLocationUpdate(latitude, longitude);
        map.setView([latitude, longitude], map.getZoom());
      },
      (error) => {
        console.error('Error watching position in LocationTracker:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
      console.log("LocationTracker: Geolocation watch cleared.");
    };
  }, [map, onLocationUpdate]);

  return null;
};

// Custom Map Controls Component (Google Maps style - bottom right vertical stack)
interface MapControlsProps {
  userLocation: [number, number] | null;
}

const MapControls: React.FC<MapControlsProps> = ({ userLocation }) => {
  const map = useMap();

  const handleCenterOnLocation = () => {
    if (userLocation) {
      map.setView(userLocation, 15);
    }
  };

  return (
    <div className="absolute bottom-20 sm:bottom-6 right-3 z-[1000] flex flex-col gap-2">
      <Button
        size="icon"
        variant="secondary"
        className="w-10 h-10 sm:w-11 sm:h-11 rounded-full shadow-lg bg-white hover:bg-gray-100 border border-gray-200"
        onClick={() => map.zoomIn()}
        aria-label="Zoom in"
      >
        <Plus className="w-5 h-5 text-gray-700" />
      </Button>
      <Button
        size="icon"
        variant="secondary"
        className="w-10 h-10 sm:w-11 sm:h-11 rounded-full shadow-lg bg-white hover:bg-gray-100 border border-gray-200"
        onClick={() => map.zoomOut()}
        aria-label="Zoom out"
      >
        <Minus className="w-5 h-5 text-gray-700" />
      </Button>
      {userLocation && (
        <Button
          size="icon"
          variant="secondary"
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-full shadow-lg bg-white hover:bg-gray-100 border border-gray-200"
          onClick={handleCenterOnLocation}
          aria-label="Center on my location"
        >
          <Locate className="w-5 h-5 text-blue-600" />
        </Button>
      )}
    </div>
  );
};

const InteractiveMap: React.FC<InteractiveMapProps> = ({ 
  userPets, 
  onLocationPermissionChange,
  showLocationToasts = false
}) => {
  const { toast } = useToast();
  const { loading, coordinates, error, requestLocation, clearLocation, hasPermission } = useLocationOnDemand();
  const { isNative, startBackgroundTracking, stopBackgroundTracking, isBackgroundTrackingActive } = useNativeLocation();
  const { lightHaptic, successHaptic } = useHaptics();
  const { setIsReady: setGlobalIsReady } = useReadyToPlay();
  
  const [isReady, setIsReady] = useState(false); // Actual "Ready to Play" status (location confirmed)
  const [isReadyIntent, setIsReadyIntent] = useState(false); // User's desired "Ready to Play" status (from switch)

  const [nearbyPets, setNearbyPets] = useState<PetProfile[]>([]);
  const channelRef = useRef<any>(null);
  const locationUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Default location (San Francisco)
  const defaultLocation: [number, number] = [37.7749, -122.4194];
  
  // Convert coordinates to map format
  const currentLocation: [number, number] | null = coordinates 
    ? [coordinates.lat, coordinates.lng] 
    : null;
  
  // Location permission is granted if hasPermission from hook is true AND we have coordinates
  const locationPermission = hasPermission && !!currentLocation;

  // Use useCallback for database updates to ensure stable function reference
  const updatePetsAvailabilityInDB = useCallback(async (available: boolean, latitude: number | null, longitude: number | null) => {
    if (userPets.length === 0) {
      console.warn("No user pets to update availability for.");
      return;
    }

    try {
      console.log('Updating availability status in DB:', { available, latitude, longitude, petCount: userPets.length });
      
      const updates = userPets.map(pet => 
        supabase
          .from('pet_profiles')
          .update({
            latitude: available ? latitude : null,
            longitude: available ? longitude : null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', pet.id)
      );

      const results = await Promise.all(updates);
      
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        console.error('Update errors:', errors);
        throw new Error('Failed to update some pets');
      }
      console.log('Successfully updated pet availability in DB.');
    } catch (error) {
      console.error('Error updating pet availability in DB:', error);
      toast({
        title: "Error",
        description: "Failed to update availability status",
        variant: "destructive",
      });
    }
  }, [userPets, toast]); // Dependencies: userPets, toast

  // Effect to notify parent and manage real-time listener based on locationPermission
  useEffect(() => {
    onLocationPermissionChange?.(locationPermission);
    
    if (locationPermission) {
      setupRealtimeListener();
    } else {
      // Clear real-time channel if permission is lost or not available
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    }
    
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [locationPermission, onLocationPermissionChange]);

  // Handle location errors from useLocationOnDemand
  useEffect(() => {
    if (error) {
      onLocationPermissionChange?.(false);
      // If an error occurs while we were trying to be ready, reset states
      if (isReadyIntent || isReady) {
        setIsReadyIntent(false);
        setIsReady(false);
        toast({
          title: "Location Error",
          description: "Could not get location. Please check your device settings or grant permission.",
          variant: "destructive",
        });
        // Important: Update DB to set available to false if an error occurs
        updatePetsAvailabilityInDB(false, null, null);
      }
    }
  }, [error, onLocationPermissionChange, isReadyIntent, isReady, toast, updatePetsAvailabilityInDB]);

  const setupRealtimeListener = () => {
    fetchNearbyPets(); // Initial fetch
    
    // Ensure only one listener is active
    if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
    }

    channelRef.current = supabase
      .channel('pet-locations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pet_profiles'
        },
        () => {
          fetchNearbyPets();
        }
      )
      .subscribe();
  };

  const fetchNearbyPets = async () => {
    try {
      console.log('Fetching nearby pets...');
      
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('pet_profiles')
        .select('*')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);

      if (error) {
        console.error('Error fetching nearby pets:', error);
        throw error;
      }

      // Apply privacy protection: use approximate locations for other users' pets
      const privacyProtectedPets = (data || []).map(pet => {
        const isOwnPet = pet.user_id === user?.id;
        
        if (isOwnPet) {
          // Show exact location for user's own pets
          return pet;
        } else {
          // For other users' pets, round coordinates to ~1km precision (0.01 degree)
          // This protects exact home locations while still showing approximate area
          return {
            ...pet,
            latitude: pet.latitude ? Math.round(pet.latitude * 100) / 100 : null,
            longitude: pet.longitude ? Math.round(pet.longitude * 100) / 100 : null,
          };
        }
      });

      console.log('Fetched nearby pets with privacy protection:', privacyProtectedPets.length);
      setNearbyPets(privacyProtectedPets);
    } catch (error) {
      console.error('Error fetching nearby pets:', error);
      toast({
        title: "Error",
        description: "Failed to load nearby pets.",
        variant: "destructive",
      });
    }
  };

  // Function to update location in database (throttled)
  const updateLocationInDatabase = useCallback(async () => {
    if (!currentLocation || !isReady || userPets.length === 0) {
      console.log('Skipping periodic location update: not ready, no current location, or no user pets.');
      return;
    }
    // Only update if isReady is true and we have current location
    await updatePetsAvailabilityInDB(true, currentLocation[0], currentLocation[1]);
  }, [currentLocation, isReady, userPets, updatePetsAvailabilityInDB]);

  // Start/stop location update interval based on "Ready to Play" status and actual location availability
  useEffect(() => {
    if (isReady && currentLocation && userPets.length > 0) {
      console.log('Starting location update interval (60 seconds)');
      // Clear any existing interval before setting a new one
      if (locationUpdateIntervalRef.current) {
        clearInterval(locationUpdateIntervalRef.current);
      }
      locationUpdateIntervalRef.current = setInterval(() => {
        updateLocationInDatabase();
      }, 60000); // 60 seconds

      // Update immediately when becoming ready
      updateLocationInDatabase();
    } else {
      // Clear interval when not ready to play or location is lost
      if (locationUpdateIntervalRef.current) {
        console.log('Stopping location update interval');
        clearInterval(locationUpdateIntervalRef.current);
        locationUpdateIntervalRef.current = null;
      }
    }

    // Cleanup on unmount
    return () => {
      if (locationUpdateIntervalRef.current) {
        clearInterval(locationUpdateIntervalRef.current);
        locationUpdateIntervalRef.current = null;
      }
    };
  }, [isReady, currentLocation, userPets, updateLocationInDatabase]);

  // Complete the Ready to Play activation once we have coordinates and user intent
  // This useEffect will trigger after requestLocation() successfully gets coordinates
  useEffect(() => {
    if (isReadyIntent && coordinates && hasPermission && !isReady) {
      // Now that we have coordinates and permission, set actual ready state and update DB
      setIsReady(true);
      updatePetsAvailabilityInDB(true, coordinates.lat, coordinates.lng);
      toast({
        title: "Ready to Play!",
        description: "Your pets are now visible to others on the map (location updates every 60 seconds)",
      });
    }
  }, [isReadyIntent, coordinates, hasPermission, isReady, updatePetsAvailabilityInDB, toast]);

  // Sync local isReady state with global context
  useEffect(() => {
    setGlobalIsReady(isReady);
  }, [isReady, setGlobalIsReady]);

  const handleReadyToPlayToggle = async (checked: boolean) => {
    await lightHaptic();
    
    if (userPets.length === 0) {
      toast({
        title: "Error",
        description: "No pets found to set ready status.",
        variant: "destructive",
      });
      // Do not change isReadyIntent if there are no pets
      return;
    }
    
    // Immediately update user's intent in the UI
    setIsReadyIntent(checked);

    if (checked) { // User wants to be ready
      // Start native background tracking if available
      if (isNative) {
        await startBackgroundTracking();
      }
      
      if (!hasPermission || !coordinates) { // If we don't have active permission or coordinates
        try {
          console.log('Requesting location for Ready to Play...');
          await requestLocation();
          // The useEffect above will handle setting isReady and updating DB once coordinates are available.
        } catch (err) {
          console.error("Failed to request location:", err);
          setIsReady(false); // Ensure actual ready state is off
          setIsReadyIntent(false); // Reset intent if permission denied/error
          toast({
            title: "Location Required",
            description: "Please allow location access to share your pet's location.",
            variant: "destructive",
          });
          // Also clear database status if request fails
          updatePetsAvailabilityInDB(false, null, null);
        }
      } else {
        // If hasPermission and coordinates already exist, trigger the useEffect manually
        // or ensure it will fire. For robust re-prompts, requestLocation should handle it.
        // For existing permission, we just confirm state.
        if (!isReady) { // If intent is on, and we have location, but not yet ready
            // Manually trigger the ready state update if useEffect hasn't caught up
            setIsReady(true);
            updatePetsAvailabilityInDB(true, coordinates.lat, coordinates.lng);
            toast({
              title: "Ready to Play!",
              description: "Your pets are now visible to others on the map (location updates every 60 seconds)",
            });
        }
      }
    } else { // User wants to turn off 'Ready to Play'
      try {
        // Stop native background tracking if it was active
        if (isNative) {
          await stopBackgroundTracking();
        }
        
        clearLocation(); // Tell the hook to stop location tracking
        setIsReady(false); // Immediately reflect 'off' in UI
        await updatePetsAvailabilityInDB(false, null, null); // Clear location in DB
        await successHaptic();
        toast({
          title: "No longer available",
          description: "Your pets have been removed from the map and location tracking stopped.",
        });
      } catch (error) {
        console.error('Error turning off availability:', error);
        // Reset intent if there's an error turning it off
        setIsReadyIntent(true); // Revert UI switch if there was an error clearing status
        toast({
          title: "Error",
          description: "Failed to turn off availability status.",
          variant: "destructive",
        });
      }
    }
  };

  const handleLocationUpdate = (lat: number, lng: number) => {
    // This function is for the `LocationTracker` to update the map view,
    // not for initiating database updates, which are handled by the interval.
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Navigation className="w-8 h-8 animate-spin mx-auto mb-4 text-green-600" />
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[60vh] sm:h-96 relative">
      {/* Responsive Top Control Bar - unified layout for mobile */}
      <div className="absolute top-3 left-3 right-14 sm:right-3 z-[1000] flex items-center justify-between gap-2">
        {/* Ready to Play Toggle - compact on mobile */}
        <Card className="bg-white/95 backdrop-blur-sm shadow-lg flex-shrink-0 max-w-[200px] sm:max-w-none">
          <CardContent className="p-2 sm:p-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <Switch
                checked={isReadyIntent}
                onCheckedChange={handleReadyToPlayToggle}
                disabled={userPets.length === 0}
                className="shrink-0"
              />
              <div className="min-w-0">
                <p className="font-medium text-xs sm:text-sm truncate">Ready to Play</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground truncate hidden sm:block">
                  {isReadyIntent && !currentLocation && hasPermission
                    ? 'Waiting for location...'
                    : locationPermission
                      ? 'Share location with others'
                      : 'Tap to enable location'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pet Counter Badge - compact on mobile */}
        <Card className="bg-white/95 backdrop-blur-sm shadow-lg flex-shrink-0">
          <CardContent className="p-2 sm:p-3">
            <div className="flex items-center gap-1 sm:gap-2">
              <PawPrint className="w-4 h-4 text-green-600 shrink-0" />
              <span className="text-xs sm:text-sm font-medium">{nearbyPets.length}</span>
              <span className="hidden sm:inline text-xs sm:text-sm text-muted-foreground">pets nearby</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Map */}
      <MapContainer
        center={currentLocation || defaultLocation}
        zoom={13}
        zoomControl={false}
        className="w-full h-full rounded-lg"
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Custom Map Controls - bottom right vertical stack (Google Maps style) */}
        <MapControls userLocation={currentLocation} />

        {/* LocationTracker now only active when actual `isReady` is true and we have a current location */}
        {isReady && currentLocation && (
          <LocationTracker onLocationUpdate={handleLocationUpdate} />
        )}

        {/* Current location marker */}
        {currentLocation && (
          <Marker 
            position={currentLocation}
            icon={divIcon({
              html: `<div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg"></div>`, // Corrected to template literal
              className: 'current-location-marker',
              iconSize: [16, 16],
              iconAnchor: [8, 8],
            })}
          >
            <Popup>
              <div className="text-center">
                <p className="font-medium">You are here</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Pet markers - only show pets that have location data and are not user's pets */}
        {nearbyPets
          .filter(pet => 
            !userPets.some(userPet => userPet.id === pet.id) && 
            pet.latitude !== null && 
            pet.longitude !== null
          )
          .map((pet) => (
            <Marker
              key={pet.id}
              position={[pet.latitude!, pet.longitude!]}
              icon={createPetMarker(pet.profile_photo_url || undefined)}
            >
              <Popup>
                <div className="text-center space-y-3 min-w-[200px]">
                  <Avatar className="w-16 h-16 mx-auto">
                    <AvatarImage src={pet.profile_photo_url || ''} alt={pet.name} />
                    <AvatarFallback className="bg-green-100 text-green-600 text-lg">
                      {pet.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <h3 className="font-bold text-lg">{pet.name}</h3>
                    <p className="text-gray-600">{pet.breed}</p>
                    {pet.age && <p className="text-sm text-gray-500">{pet.age} years old</p>}
                  </div>
                  
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => console.log('View profile for pet:', pet.id)}
                  >
                    View Profile
                  </Button>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>

      {/* Location Permission Warning - shown if user intent is ON but no actual permission/location */}
      {isReadyIntent && !locationPermission && (
        <div className="absolute bottom-3 left-3 right-16 sm:right-3 z-[1000]">
          <Card className="bg-orange-50/95 backdrop-blur-sm border-orange-200">
            <CardContent className="p-2 sm:p-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-orange-800">Location Required</p>
                  <p className="text-[10px] sm:text-xs text-orange-600 hidden sm:block">
                    Enable location to find pets near you.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default InteractiveMap;