import { useState, useCallback } from 'react';

interface LocationSuggestion {
  display_name: string;
  lat: string;
  lon: string;
  place_id: string;
}

interface UseLocationAutocompleteReturn {
  searchValue: string;
  setSearchValue: (value: string) => void;
  selectedLocation: LocationSuggestion | null;
  handleLocationSelect: (location: LocationSuggestion) => void;
  clearSelection: () => void;
}

export const useLocationAutocomplete = (
  initialValue: string = ''
): UseLocationAutocompleteReturn => {
  const [searchValue, setSearchValue] = useState(initialValue);
  const [selectedLocation, setSelectedLocation] = useState<LocationSuggestion | null>(null);

  const handleLocationSelect = useCallback((location: LocationSuggestion) => {
    setSelectedLocation(location);
    setSearchValue(location.display_name);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedLocation(null);
    setSearchValue('');
  }, []);

  return {
    searchValue,
    setSearchValue,
    selectedLocation,
    handleLocationSelect,
    clearSelection,
  };
};