
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, List, Grid, Users, Calendar, Star } from 'lucide-react';
import MapSearchFilters, { SearchFilters } from './MapSearchFilters';
import InteractiveMap from './InteractiveMap';
import type { Tables } from '@/integrations/supabase/types';

type PetProfile = Tables<'pet_profiles'>;

interface MapLayoutProps {
  userPets: PetProfile[];
  onLocationPermissionChange?: (granted: boolean) => void;
}

const MapLayout: React.FC<MapLayoutProps> = ({ userPets, onLocationPermissionChange }) => {
  const [activeView, setActiveView] = useState<'map' | 'list'>('map');
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    searchQuery: '',
    breed: '',
    age: '',
    distance: '',
    availability: '',
    personality: []
  });

  const handleFiltersChange = (filters: SearchFilters) => {
    setSearchFilters(filters);
    // TODO: Apply filters to pet data
    console.log('Filters changed:', filters);
  };

  // Mock data for demonstration - in real implementation, this would come from filtered results
  const filteredPets = userPets; // TODO: Apply actual filtering logic

  const stats = [
    { label: 'Pets Nearby', value: '12', icon: Users, color: 'text-green-600' },
    { label: 'Available Now', value: '5', icon: MapPin, color: 'text-blue-600' },
    { label: 'Events Today', value: '3', icon: Calendar, color: 'text-purple-600' },
    { label: 'New This Week', value: '8', icon: Star, color: 'text-orange-600' }
  ];

  return (
    <div className="space-y-6">
      {/* Search Filters Section */}
      <MapSearchFilters onFiltersChange={handleFiltersChange} />

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="bg-white shadow-sm border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                </div>
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* View Toggle and Content */}
      <Card className="bg-white shadow-lg border-0 overflow-hidden">
        <div className="border-b bg-gray-50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Pet Discovery
              </h2>
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                {filteredPets.length} pets found
              </Badge>
            </div>
            
            <Tabs value={activeView} onValueChange={(value) => setActiveView(value as 'map' | 'list')}>
              <TabsList className="grid w-[200px] grid-cols-2">
                <TabsTrigger value="map" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Map
                </TabsTrigger>
                <TabsTrigger value="list" className="flex items-center gap-2">
                  <List className="w-4 h-4" />
                  List
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        <CardContent className="p-0">
          {activeView === 'map' && (
            <div className="h-96 md:h-[500px]">
              <InteractiveMap 
                userPets={userPets}
                onLocationPermissionChange={onLocationPermissionChange}
              />
            </div>
          )}
          
          {activeView === 'list' && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPets.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <Users className="w-16 h-16 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-700 mb-2">No pets found</h3>
                    <p className="text-gray-600">Try adjusting your search filters to find more pets in your area.</p>
                  </div>
                ) : (
                  filteredPets.map((pet) => (
                    <Card key={pet.id} className="border-2 border-gray-100 hover:border-green-200 hover:shadow-md transition-all">
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                            {pet.profile_photo_url ? (
                              <img 
                                src={pet.profile_photo_url} 
                                alt={pet.name}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-green-600 font-medium">
                                {pet.name.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900 truncate">
                              {pet.name}
                            </h3>
                            <p className="text-sm text-gray-600">{pet.breed}</p>
                            {pet.age && (
                              <p className="text-xs text-gray-500">{pet.age} years old</p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              {pet.is_available && (
                                <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                                  Available
                                </Badge>
                              )}
                              <Badge variant="outline" className="text-xs">
                                0.8 mi away
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3 justify-center">
        <Button variant="outline" className="flex items-center gap-2 border-2 border-gray-200 hover:border-green-500">
          <Calendar className="w-4 h-4" />
          Schedule Playdate
        </Button>
        <Button variant="outline" className="flex items-center gap-2 border-2 border-gray-200 hover:border-blue-500">
          <Users className="w-4 h-4" />
          Join Group Walk
        </Button>
        <Button variant="outline" className="flex items-center gap-2 border-2 border-gray-200 hover:border-purple-500">
          <Star className="w-4 h-4" />
          Save Favorites
        </Button>
      </div>
    </div>
  );
};

export default MapLayout;
