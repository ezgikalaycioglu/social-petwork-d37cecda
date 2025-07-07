
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, MapPin, Clock, Heart, Zap } from 'lucide-react';

interface MapSearchFiltersProps {
  onFiltersChange: (filters: SearchFilters) => void;
}

export interface SearchFilters {
  searchQuery: string;
  breed: string;
  age: string;
  distance: string;
  availability: string;
  personality: string[];
}

const MapSearchFilters: React.FC<MapSearchFiltersProps> = ({ onFiltersChange }) => {
  const [filters, setFilters] = useState<SearchFilters>({
    searchQuery: '',
    breed: '',
    age: '',
    distance: '',
    availability: '',
    personality: []
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const personalityTraits = [
    { value: 'friendly', label: 'Friendly', icon: '😊' },
    { value: 'energetic', label: 'Energetic', icon: '⚡' },
    { value: 'calm', label: 'Calm', icon: '😌' },
    { value: 'playful', label: 'Playful', icon: '🎾' },
    { value: 'protective', label: 'Protective', icon: '🛡️' },
    { value: 'social', label: 'Social', icon: '🤝' }
  ];

  const handleFilterChange = (key: keyof SearchFilters, value: string | string[]) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const togglePersonality = (trait: string) => {
    const newPersonality = filters.personality.includes(trait)
      ? filters.personality.filter(p => p !== trait)
      : [...filters.personality, trait];
    handleFilterChange('personality', newPersonality);
  };

  const clearFilters = () => {
    const emptyFilters: SearchFilters = {
      searchQuery: '',
      breed: '',
      age: '',
      distance: '',
      availability: '',
      personality: []
    };
    setFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  const activeFiltersCount = Object.values(filters).flat().filter(v => v && v.length > 0).length;

  return (
    <Card className="w-full bg-white shadow-lg border-0">
      <CardContent className="p-6">
        {/* Main Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search by pet name, breed, or owner..."
            value={filters.searchQuery}
            onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
            className="pl-10 pr-4 h-12 text-lg border-2 border-gray-200 focus:border-green-500 rounded-xl"
          />
        </div>

        {/* Quick Filters Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <Select value={filters.distance} onValueChange={(value) => handleFilterChange('distance', value)}>
            <SelectTrigger className="h-11 border-2 border-gray-200 rounded-lg">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-green-600" />
                <SelectValue placeholder="Distance" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0.5">Within 0.5 miles</SelectItem>
              <SelectItem value="1">Within 1 mile</SelectItem>
              <SelectItem value="2">Within 2 miles</SelectItem>
              <SelectItem value="5">Within 5 miles</SelectItem>
              <SelectItem value="10">Within 10 miles</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.availability} onValueChange={(value) => handleFilterChange('availability', value)}>
            <SelectTrigger className="h-11 border-2 border-gray-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <SelectValue placeholder="Availability" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="now">Available Now</SelectItem>
              <SelectItem value="today">Available Today</SelectItem>
              <SelectItem value="weekend">Available Weekends</SelectItem>
              <SelectItem value="flexible">Flexible Schedule</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.breed} onValueChange={(value) => handleFilterChange('breed', value)}>
            <SelectTrigger className="h-11 border-2 border-gray-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-pink-600" />
                <SelectValue placeholder="Breed" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="golden-retriever">Golden Retriever</SelectItem>
              <SelectItem value="labrador">Labrador</SelectItem>
              <SelectItem value="german-shepherd">German Shepherd</SelectItem>
              <SelectItem value="bulldog">Bulldog</SelectItem>
              <SelectItem value="poodle">Poodle</SelectItem>
              <SelectItem value="mixed">Mixed Breed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.age} onValueChange={(value) => handleFilterChange('age', value)}>
            <SelectTrigger className="h-11 border-2 border-gray-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-600" />
                <SelectValue placeholder="Age" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="puppy">Puppy (0-1 year)</SelectItem>
              <SelectItem value="young">Young (1-3 years)</SelectItem>
              <SelectItem value="adult">Adult (3-7 years)</SelectItem>
              <SelectItem value="senior">Senior (7+ years)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Advanced Filters Toggle */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="outline"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 border-2 border-gray-200 hover:border-green-500"
          >
            <Filter className="w-4 h-4" />
            Advanced Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>

          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              onClick={clearFilters}
              className="text-gray-600 hover:text-gray-800"
            >
              Clear All
            </Button>
          )}
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="border-t pt-4 space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Personality Traits</h3>
              <div className="flex flex-wrap gap-2">
                {personalityTraits.map((trait) => (
                  <Button
                    key={trait.value}
                    variant={filters.personality.includes(trait.value) ? "default" : "outline"}
                    size="sm"
                    onClick={() => togglePersonality(trait.value)}
                    className={`rounded-full ${
                      filters.personality.includes(trait.value)
                        ? 'bg-green-500 hover:bg-green-600 text-white'
                        : 'border-2 border-gray-200 hover:border-green-500'
                    }`}
                  >
                    <span className="mr-1">{trait.icon}</span>
                    {trait.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex flex-wrap gap-2">
              {filters.searchQuery && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  Search: "{filters.searchQuery}"
                </Badge>
              )}
              {filters.distance && (
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  Distance: {filters.distance} miles
                </Badge>
              )}
              {filters.availability && (
                <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                  {filters.availability}
                </Badge>
              )}
              {filters.breed && (
                <Badge variant="secondary" className="bg-pink-100 text-pink-700">
                  {filters.breed}
                </Badge>
              )}
              {filters.age && (
                <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                  {filters.age}
                </Badge>
              )}
              {filters.personality.map((trait) => (
                <Badge key={trait} variant="secondary" className="bg-yellow-100 text-yellow-700">
                  {personalityTraits.find(p => p.value === trait)?.icon} {trait}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MapSearchFilters;
