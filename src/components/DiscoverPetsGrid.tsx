
import React from 'react';
import PetCard from './PetCard';
import type { Tables } from '@/integrations/supabase/types';

type PetProfile = Tables<'pet_profiles'>;

interface DiscoverPetsGridProps {
  pets: PetProfile[];
  loadingRequests: Record<string, boolean>;
  onSendFriendRequest: (petId: string) => void;
  onRequestPlaydate: (petId: string, userId: string) => void;
}

const DiscoverPetsGrid = ({ 
  pets, 
  loadingRequests, 
  onSendFriendRequest, 
  onRequestPlaydate 
}: DiscoverPetsGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {pets.map((pet) => (
        <PetCard
          key={pet.id}
          pet={pet}
          isLoading={loadingRequests[pet.id] || false}
          onSendFriendRequest={onSendFriendRequest}
          onRequestPlaydate={onRequestPlaydate}
        />
      ))}
    </div>
  );
};

export default DiscoverPetsGrid;
