
import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon, divIcon } from 'leaflet';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Navigation, PawPrint } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import type { Tables } from '@/integrations/supabase/types';

type PetProfile = Tables<'pet_profiles'>;

interface InteractiveMapProps {
  userPets: PetProfile[];
  onLocationPermissionChange?: (granted: boolean) => void;
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
    if (navigator.geolocation) {
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
    }
  }, [map, onLocationUpdate]);

  return null;
};

const InteractiveMap: React.FC<InteractiveMapProps> = ({ 
  userPets, 
  onLocationPermissionChange 
}) => {
  const { toast } = useToast();
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [nearbyPets, setNearbyPets] = useState<PetProfile[]>([]);
  const [selectedPet, setSelectedPet] = useState<PetProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [locationPermission, setLocationPermission] = useState<boolean>(false);
  const channelRef = useRef<any>(null);

  // Default location (San Francisco)
  const defaultLocation: [number, number] = [37.7749, -122.4194];

  useEffect(() => {
    initializeLocation();
    setupRealtimeListener();
    
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, []);

  const initializeLocation = async () => {
    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocation not supported');
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000,
        });
      });

      const { latitude, longitude } = position.coords;
      setCurrentLocation([latitude, longitude]);
      setLocationPermission(true);
      onLocationPermissionChange?.(true);
      
      toast({
        title: "Location Access Granted",
        description: "Your location will only be shared when you're 'Ready to Play'.",
      });
    } catch (error) {
      console.error('Location error:', error);
      setCurrentLocation(defaultLocation);
      setLocationPermission(false);
      onLocationPermissionChange?.(false);
      
      toast({
        title: "Location Access Denied",
        description: "Using default location. Enable location access for better experience.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeListener = () => {
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

    fetchNearbyPets();
  };

  const fetchNearbyPets = async () => {
    try {
      const { data, error } = await supabase
        .from('pet_profiles')
        .select('*')
        .eq('is_available', true)
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);

      if (error) throw error;

      setNearbyPets(data || []);
    } catch (error) {
      console.error('Error fetching nearby pets:', error);
    }
  };

  const updateAvailabilityStatus = async (available: boolean) => {
    if (!currentLocation || userPets.length === 0) {
      toast({
        title: "Error",
        description: "Location not available or no pets found",
        variant: "destructive",
      });
      return;
    }

    try {
      const [latitude, longitude] = currentLocation;
      
      // Update all user's pets
      const updates = userPets.map(pet => 
        supabase
          .from('pet_profiles')
          .update({
            is_available: available,
            latitude: available ? latitude : null,
            longitude: available ? longitude : null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', pet.id)
      );

      await Promise.all(updates);
      
      setIsReady(available);
      
      toast({
        title: available ? "Ready to Play!" : "No longer available",
        description: available 
          ? "Your pets are now visible to others on the map" 
          : "Your pets have been removed from the map",
      });
    } catch (error) {
      console.error('Error updating availability:', error);
      toast({
        title: "Error",
        description: "Failed to update availability status",
        variant: "destructive",
      });
    }
  };

  const handleLocationUpdate = (lat: number, lng: number) => {
    setCurrentLocation([lat, lng]);
    
    if (isReady) {
      // Update pets location in real-time if ready to play
      updateAvailabilityStatus(true);
    }
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
              disabled={!locationPermission || userPets.length === 0}
            />
            <div>
              <p className="font-medium text-sm">Ready to Play</p>
              <p className="text-xs text-gray-500">
                {locationPermission ? 'Share location with others' : 'Location access required'}
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

        {/* Pet markers - only show pets that have location data */}
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
                    onClick={() => setSelectedPet(pet)}
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
