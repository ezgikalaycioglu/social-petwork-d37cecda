
import React, { useState } from 'react';
import { useDiscoverPets } from '@/hooks/useDiscoverPets';
import PlaydateRequestModal from './PlaydateRequestModal';
import DiscoverPetsLoading from './DiscoverPetsLoading';
import DiscoverPetsEmpty from './DiscoverPetsEmpty';
import DiscoverPetsGrid from './DiscoverPetsGrid';

interface DiscoverPetsProps {
  userPetIds: string[];
  onFriendRequestSent: () => void;
}

const DiscoverPets = ({ userPetIds, onFriendRequestSent }: DiscoverPetsProps) => {
  const [showPlaydateModal, setShowPlaydateModal] = useState(false);
  const [selectedPetForPlaydate, setSelectedPetForPlaydate] = useState<{ petId: string; userId: string } | null>(null);
  
  const {
    availablePets,
    loading,
    loadingRequests,
    sentRequests,
    handleSendFriendRequest,
  } = useDiscoverPets({ userPetIds, onFriendRequestSent });

  const handlePetSelect = (pet: any) => {
    // Handle pet selection - could navigate to pet details or open a modal
    console.log('Pet selected:', pet);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-base font-semibold">Discover Pets</h2>
      </div>

      {loading ? (
        <DiscoverPetsLoading />
      ) : availablePets.length === 0 ? (
        <DiscoverPetsEmpty />
      ) : (
        <DiscoverPetsGrid
          pets={availablePets}
          onPetSelect={handlePetSelect}
          isLoading={loading}
          onSendFriendRequest={handleSendFriendRequest}
          userPetIds={userPetIds}
          loadingRequests={loadingRequests}
          sentRequests={sentRequests}
        />
      )}

      <PlaydateRequestModal
        isOpen={showPlaydateModal}
        onClose={() => setShowPlaydateModal(false)}
        onSuccess={() => setShowPlaydateModal(false)}
        userPets={[]} // Not needed for this use case
        targetPetId={selectedPetForPlaydate?.petId}
        targetUserId={selectedPetForPlaydate?.userId}
      />
    </div>
  );
};

export default DiscoverPets;
