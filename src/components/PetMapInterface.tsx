import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Filter, MapPin, Users, ChevronDown } from 'lucide-react';
import InteractiveMap from './InteractiveMap';
import type { Tables } from '@/integrations/supabase/types';
import type { PetMapFilters } from '@/pages/PetMap';

type PetProfile = Tables<'pet_profiles'>;

interface PetMapInterfaceProps {
  userPets: PetProfile[];
  onLocationPermissionChange?: (granted: boolean) => void;
}

const PetMapInterface: React.FC<PetMapInterfaceProps> = ({ 
  userPets, 
  onLocationPermissionChange 
}) => {
  const { toast } = useToast();
  const [filters, setFilters] = useState<PetMapFilters>({
    readyToPlay: false,
    petSizes: [],
    personalities: [],
    openForAdoption: false,
    searchQuery: ''
  });
  
  const [filteredPets, setFilteredPets] = useState<PetProfile[]>([]);
  const [loading, setLoading] = useState(false);

  const petSizes = [
    { value: 'small', label: 'Small', description: 'Under 25 lbs' },
    { value: 'medium', label: 'Medium', description: '25-60 lbs' },
    { value: 'large', label: 'Large', description: 'Over 60 lbs' }
  ];

  const personalityTraits = [
    'Playful', 'Calm', 'Energetic', 'Friendly', 'Protective', 'Social',
    'Good with Kids', 'Good with Cats', 'Good with Dogs', 'High Energy',
    'Low Energy', 'Cuddly', 'Independent', 'Loyal'
  ];

  useEffect(() => {
    fetchFilteredPets();
  }, [filters]);

  const fetchFilteredPets = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('pet_profiles')
        .select('*')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);

      // Apply ready to play filter
      if (filters.readyToPlay) {
        query = query.eq('is_available', true);
      }

      // Apply search query filter
      if (filters.searchQuery.trim()) {
        query = query.or(`name.ilike.%${filters.searchQuery}%,breed.ilike.%${filters.searchQuery}%`);
      }

      // Apply personality traits filter
      if (filters.personalities.length > 0) {
        query = query.overlaps('personality_traits', filters.personalities);
      }

      // Note: Pet size filtering would require additional field in database
      // For now, we'll filter by breed as a proxy

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error fetching filtered pets:', error);
        throw error;
      }

      // Filter out user's own pets
      const otherPets = (data || []).filter(pet => 
        !userPets.some(userPet => userPet.id === pet.id)
      );

      setFilteredPets(otherPets);
    } catch (error) {
      console.error('Error fetching pets:', error);
      toast({
        title: "Error",
        description: "Failed to load pets. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof PetMapFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const togglePetSize = (size: string) => {
    setFilters(prev => ({
      ...prev,
      petSizes: prev.petSizes.includes(size)
        ? prev.petSizes.filter(s => s !== size)
        : [...prev.petSizes, size]
    }));
  };

  const togglePersonality = (trait: string) => {
    setFilters(prev => ({
      ...prev,
      personalities: prev.personalities.includes(trait)
        ? prev.personalities.filter(t => t !== trait)
        : [...prev.personalities, trait]
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      readyToPlay: false,
      petSizes: [],
      personalities: [],
      openForAdoption: false,
      searchQuery: ''
    });
  };

  const activeFiltersCount = 
    (filters.readyToPlay ? 1 : 0) +
    filters.petSizes.length +
    filters.personalities.length +
    (filters.openForAdoption ? 1 : 0) +
    (filters.searchQuery ? 1 : 0);

  return (
    <div className="relative w-full h-screen">
      {/* Filter Bar Overlay */}
      <div className="absolute top-4 left-4 right-4 z-[1000]">
        <Card className="bg-background/95 backdrop-blur-sm shadow-lg border-0">
          <CardContent className="p-4">
            {/* Main Search Bar */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                placeholder="Search pets by name, breed, or location..."
                value={filters.searchQuery}
                onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                className="pl-10 h-12 text-base border-2 focus:border-primary rounded-xl"
              />
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Ready to Play Toggle */}
              <div className="flex items-center space-x-3 bg-primary/10 rounded-full px-4 py-2">
                <Switch
                  checked={filters.readyToPlay}
                  onCheckedChange={(checked) => handleFilterChange('readyToPlay', checked)}
                />
                <span className="font-medium text-primary">Ready to Play Now</span>
              </div>

              {/* Pet Size Buttons */}
              <div className="flex gap-2">
                {petSizes.map((size) => (
                  <Button
                    key={size.value}
                    variant={filters.petSizes.includes(size.value) ? "default" : "outline"}
                    size="sm"
                    onClick={() => togglePetSize(size.value)}
                    className="rounded-full border-2"
                  >
                    {size.label}
                  </Button>
                ))}
              </div>

              {/* Personality Dropdown */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="rounded-full border-2">
                    <Filter className="w-4 h-4 mr-2" />
                    Personality
                    {filters.personalities.length > 0 && (
                      <Badge variant="secondary" className="ml-2 bg-primary text-primary-foreground">
                        {filters.personalities.length}
                      </Badge>
                    )}
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4">
                  <h4 className="font-medium mb-3">Personality Traits</h4>
                  <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                    {personalityTraits.map((trait) => (
                      <div key={trait} className="flex items-center space-x-2">
                        <Checkbox
                          id={trait}
                          checked={filters.personalities.includes(trait)}
                          onCheckedChange={() => togglePersonality(trait)}
                        />
                        <label
                          htmlFor={trait}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {trait}
                        </label>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              {/* Open for Adoption Toggle */}
              <div className="flex items-center space-x-2">
                <Switch
                  checked={filters.openForAdoption}
                  onCheckedChange={(checked) => handleFilterChange('openForAdoption', checked)}
                />
                <span className="text-sm font-medium">Open for Adoption</span>
              </div>

              {/* Clear Filters */}
              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Clear All ({activeFiltersCount})
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results Counter */}
      <div className="absolute top-32 right-4 z-[1000]">
        <Card className="bg-background/95 backdrop-blur-sm shadow-lg border-0">
          <CardContent className="p-3">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">
                {loading ? 'Loading...' : `${filteredPets.length} pets found`}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Map */}
      <div className="w-full h-full">
        <InteractiveMap 
          userPets={userPets}
          filteredPets={filteredPets}
          onLocationPermissionChange={onLocationPermissionChange}
        />
      </div>
    </div>
  );
};

export default PetMapInterface;