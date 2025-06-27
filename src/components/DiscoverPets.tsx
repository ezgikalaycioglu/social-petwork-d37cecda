
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
    handleSendFriendRequest,
  } = useDiscoverPets({ userPetIds, onFriendRequestSent });

  const handleRequestPlaydate = (petId: string, userId: string) => {
    setSelectedPetForPlaydate({ petId, userId });
    setShowPlaydateModal(true);
  };

  const handleClosePlaydateModal = () => {
    setShowPlaydateModal(false);
    setSelectedPetForPlaydate(null);
  };

  const handlePlaydateSuccess = () => {
    setShowPlaydateModal(false);
    setSelectedPetForPlaydate(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Discover Pets
        </h2>
      </div>

      {loading ? (
        <DiscoverPetsLoading />
      ) : availablePets.length === 0 ? (
        <DiscoverPetsEmpty />
      ) : (
        <DiscoverPetsGrid
          pets={availablePets}
          loadingRequests={loadingRequests}
          onSendFriendRequest={handleSendFriendRequest}
          onRequestPlaydate={handleRequestPlaydate}
        />
      )}

      <PlaydateRequestModal
        isOpen={showPlaydateModal}
        onClose={handleClosePlaydateModal}
        onSuccess={handlePlaydateSuccess}
        userPets={[]} // Not needed for this use case
        targetPetId={selectedPetForPlaydate?.petId}
        targetUserId={selectedPetForPlaydate?.userId}
      />
    </div>
  );
};

export default DiscoverPets;
