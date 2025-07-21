
import React from 'react';
import PetCard from './PetCard';
import type { Tables } from '@/integrations/supabase/types';

type PetProfile = Tables<'pet_profiles'>;

interface DiscoverPetsGridProps {
  pets: PetProfile[];
  onPetSelect?: (pet: PetProfile) => void;
  isLoading?: boolean;
  onSendFriendRequest?: (petId: string) => void;
  userPetIds?: string[];
}

const DiscoverPetsGrid: React.FC<DiscoverPetsGridProps> = ({ 
  pets, 
  onPetSelect,
  isLoading = false,
  onSendFriendRequest,
  userPetIds = []
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="bg-gray-200 rounded-lg h-48 animate-pulse" />
        ))}
      </div>
    );
  }

  if (pets.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🐕</div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">No pets found</h3>
        <p className="text-gray-500">Try adjusting your search or check back later!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {pets.map((pet) => (
        <PetCard
          key={pet.id}
          pet={pet}
          onClick={() => onPetSelect?.(pet)}
          showLocation={true}
          showBoopButton={true}
          showFriendRequestButton={true}
          onSendFriendRequest={onSendFriendRequest}
          userPetIds={userPetIds}
        />
      ))}
    </div>
  );
};

export default DiscoverPetsGrid;
