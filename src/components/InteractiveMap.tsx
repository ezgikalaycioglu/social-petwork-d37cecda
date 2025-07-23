
import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon, divIcon } from 'leaflet';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useLocationOnDemand } from '@/hooks/useLocationOnDemand';
import { MapPin, Navigation, PawPrint } from 'lucide-react';
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
             </div>`,
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
           </div>`,
    className: 'custom-pet-marker',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

const LocationTracker: React.FC<{ onLocationUpdate: (lat: number, lng: number) => void }> = ({ onLocationUpdate }) => {
  const map = useMap();
  
  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        onLocationUpdate(latitude, longitude);
        map.setView([latitude, longitude], map.getZoom());
      },
      (error) => {
        console.error('Error watching position:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [map, onLocationUpdate]);

  return null;
};

const InteractiveMap: React.FC<InteractiveMapProps> = ({ 
  userPets, 
  onLocationPermissionChange,
  showLocationToasts = false
}) => {
  const { toast } = useToast();
  const { loading, coordinates, error, requestLocation, clearLocation, hasPermission } = useLocationOnDemand();
  const [isReady, setIsReady] = useState(false);
  const [isReadyIntent, setIsReadyIntent] = useState(false);
  const [nearbyPets, setNearbyPets] = useState<PetProfile[]>([]);
  const [hasShownLocationToast, setHasShownLocationToast] = useState(false);
  const channelRef = useRef<any>(null);
  const locationUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Default location (San Francisco)
  const defaultLocation: [number, number] = [37.7749, -122.4194];
  
  // Convert coordinates to map format
  const currentLocation: [number, number] | null = coordinates 
    ? [coordinates.lat, coordinates.lng] 
    : null;
  
  const locationPermission = hasPermission && !!coordinates;

  useEffect(() => {
    // Notify parent about location permission status
    onLocationPermissionChange?.(locationPermission);
    
    if (locationPermission) {
      setupRealtimeListener();
    }
    
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [locationPermission, onLocationPermissionChange, showLocationToasts, hasShownLocationToast]);

  useEffect(() => {
    if (error) {
      onLocationPermissionChange?.(false);
    }
  }, [error, onLocationPermissionChange]);

  // Complete the Ready to Play activation once we have coordinates
  const completeReadyToPlayActivation = async () => {
    if (!coordinates || !isReadyIntent || isReady) return;

    try {
      const [latitude, longitude] = [coordinates.lat, coordinates.lng];
      
      console.log('Completing Ready to Play activation:', { latitude, longitude, petCount: userPets.length });
      
      // Update all user's pets with location and availability
      const updates = userPets.map(pet => 
        supabase
          .from('pet_profiles')
          .update({
            is_available: true,
            latitude,
            longitude,
            updated_at: new Date().toISOString(),
          })
          .eq('id', pet.id)
      );

      const results = await Promise.all(updates);
      
      // Check for errors in any of the updates
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        console.error('Update errors:', errors);
        throw new Error('Failed to update some pets');
      }
      
      setIsReady(true);
      
      toast({
        title: "Ready to Play!",
        description: "Your pets are now visible to others on the map (location updates every 60 seconds)",
      });
    } catch (error) {
      console.error('Error completing Ready to Play activation:', error);
      setIsReady(false);
      setIsReadyIntent(false);
      
      toast({
        title: "Error",
        description: "Failed to activate Ready to Play mode",
        variant: "destructive",
      });
    }
  };

  // Handle successful location acquisition when user has indicated intent to be ready
  useEffect(() => {
    if (isReadyIntent && coordinates && hasPermission && !isReady) {
      // Complete the "Ready to Play" action now that we have coordinates
      completeReadyToPlayActivation();
    }
  }, [isReadyIntent, coordinates, hasPermission, isReady]);

  const setupRealtimeListener = () => {
    fetchNearbyPets();
    
    // Listen for real-time updates to pet locations
    channelRef.current = supabase
      .channel('pet-locations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pet_profiles',
          filter: 'is_available=eq.true'
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
      
      const { data, error } = await supabase
        .from('pet_profiles')
        .select('*')
        .eq('is_available', true)
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);

      if (error) {
        console.error('Error fetching nearby pets:', error);
        throw error;
      }

      console.log('Fetched nearby pets:', data);
      setNearbyPets(data || []);
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
  const updateLocationInDatabase = async () => {
    if (!currentLocation || !isReady || userPets.length === 0) {
      return;
    }

    try {
      const [latitude, longitude] = currentLocation;
      
      console.log('Updating pet locations in database:', { latitude, longitude, petCount: userPets.length });
      
      // Update all user's pets with new location
      const updates = userPets.map(pet => 
        supabase
          .from('pet_profiles')
          .update({
            latitude,
            longitude,
            updated_at: new Date().toISOString(),
          })
          .eq('id', pet.id)
      );

      const results = await Promise.all(updates);
      
      // Check for errors in any of the updates
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        console.error('Location update errors:', errors);
      } else {
        console.log('Successfully updated pet locations');
      }
    } catch (error) {
      console.error('Error updating pet locations:', error);
    }
  };

  // Start/stop location update interval based on "Ready to Play" status
  useEffect(() => {
    if (isReady && currentLocation && userPets.length > 0) {
      // Start 60-second interval for location updates
      console.log('Starting location update interval (60 seconds)');
      locationUpdateIntervalRef.current = setInterval(() => {
        updateLocationInDatabase();
      }, 60000); // 60 seconds

      // Update immediately when starting
      updateLocationInDatabase();
    } else {
      // Clear interval when not ready to play
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
  }, [isReady, currentLocation, userPets]);

  const updateAvailabilityStatus = async (available: boolean) => {
    if (userPets.length === 0) {
      toast({
        title: "Error",
        description: "No pets found",
        variant: "destructive",
      });
      return;
    }

    // Set user intent immediately for UI feedback
    setIsReadyIntent(available);

    // If toggling OFF, clear everything immediately
    if (!available) {
      try {
        // Clear location tracking first
        clearLocation();
        
        // Update database to clear availability and location
        const updates = userPets.map(pet => 
          supabase
            .from('pet_profiles')
            .update({
              is_available: false,
              latitude: null,
              longitude: null,
              updated_at: new Date().toISOString(),
            })
            .eq('id', pet.id)
        );

        const results = await Promise.all(updates);
        
        // Check for errors in any of the updates
        const errors = results.filter(result => result.error);
        if (errors.length > 0) {
          console.error('Update errors:', errors);
          throw new Error('Failed to update some pets');
        }
        
        setIsReady(false);
        setIsReadyIntent(false);
        
        toast({
          title: "No longer available",
          description: "Your pets have been removed from the map and location tracking stopped",
        });
      } catch (error) {
        console.error('Error updating availability:', error);
        setIsReadyIntent(false);
        toast({
          title: "Error",
          description: "Failed to update availability status",
          variant: "destructive",
        });
      }
      return;
    }

    // If toggling ON, request location first (async completion handled by useEffect)
    try {
      console.log('Requesting location for Ready to Play...');
      await requestLocation();
      // The completeReadyToPlayActivation function will be called by useEffect
      // once coordinates are available
    } catch (error) {
      console.error('Error requesting location:', error);
      setIsReady(false);
      setIsReadyIntent(false);
      
      toast({
        title: "Location Required",
        description: "Please allow location access to share your pet's location",
        variant: "destructive",
      });
    }
  };

  const handleLocationUpdate = (lat: number, lng: number) => {
    // Location updates for map display only - database updates are handled by interval
    // No database operations here to prevent excessive updates
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
    <div className="w-full h-96 relative">
      {/* Ready to Play Toggle */}
      <Card className="absolute top-4 left-4 z-[1000] bg-white shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <Switch
              checked={isReady}
              onCheckedChange={updateAvailabilityStatus}
              disabled={userPets.length === 0}
            />
            <div>
              <p className="font-medium text-sm">Ready to Play</p>
              <p className="text-xs text-gray-500">
                {locationPermission ? 'Share location with others' : 'Tap to enable location'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pet Counter */}
      <Card className="absolute top-4 right-4 z-[1000] bg-white shadow-lg">
        <CardContent className="p-3">
          <div className="flex items-center space-x-2">
            <PawPrint className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium">{nearbyPets.length} pets nearby</span>
          </div>
        </CardContent>
      </Card>

      {/* Map */}
      <MapContainer
        center={currentLocation || defaultLocation}
        zoom={13}
        className="w-full h-full rounded-lg"
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {locationPermission && currentLocation && (
          <LocationTracker onLocationUpdate={handleLocationUpdate} />
        )}

        {/* Current location marker */}
        {currentLocation && (
          <Marker 
            position={currentLocation}
            icon={divIcon({
              html: `<div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg"></div>`,
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

      {/* Location Permission Warning */}
      {!locationPermission && (
        <div className="absolute bottom-4 left-4 right-4 z-[1000]">
          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="text-sm font-medium text-orange-800">Location Access Required</p>
                  <p className="text-xs text-orange-600">
                    Enable location sharing to find pets near you and let others discover your pets.
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
