
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';
import PlaydateRequestModal from './PlaydateRequestModal';
import PetCard from './PetCard';
import DiscoverPetsLoading from './DiscoverPetsLoading';
import DiscoverPetsEmpty from './DiscoverPetsEmpty';

type PetProfile = Tables<'pet_profiles'>;

interface DiscoverPetsProps {
  userPetIds: string[];
  onFriendRequestSent: () => void;
}

const DiscoverPets = ({ userPetIds, onFriendRequestSent }: DiscoverPetsProps) => {
  const { toast } = useToast();
  const [availablePets, setAvailablePets] = useState<PetProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState<Record<string, boolean>>({});
  const [showPlaydateModal, setShowPlaydateModal] = useState(false);
  const [selectedPetForPlaydate, setSelectedPetForPlaydate] = useState<{ petId: string; userId: string } | null>(null);

  useEffect(() => {
    fetchAvailablePets();
  }, [userPetIds]);

  const fetchAvailablePets = async () => {
    setLoading(true);
    try {
      // If user has no pets, we can show all pets
      if (userPetIds.length === 0) {
        const { data, error } = await supabase
          .from('pet_profiles')
          .select('*')
          .limit(12);

        if (error) throw error;
        setAvailablePets(data || []);
        return;
      }

      // 1. Get user's existing friendships (both accepted and pending)
      const { data: friendships, error: friendshipsError } = await supabase
        .from('pet_friendships')
        .select('requester_pet_id, recipient_pet_id, status')
        .or(`requester_pet_id.in.(${userPetIds.join(',')}),recipient_pet_id.in.(${userPetIds.join(',')})`)
        .in('status', ['accepted', 'pending']);

      if (friendshipsError) throw friendshipsError;

      // Extract friend IDs (pets that are already friends or have pending requests)
      const friendIds = friendships?.map(f => 
        userPetIds.includes(f.requester_pet_id) ? f.recipient_pet_id : f.requester_pet_id
      ) || [];
      
      // Combine user's own pets and their friends/pending requests to exclude
      const excludedPetIds = [...new Set([...userPetIds, ...friendIds])];

      // 2. Fetch pets excluding the ones already connected to user
      let query = supabase
        .from('pet_profiles')
        .select('*');

      // Only apply the exclusion filter if there are pets to exclude
      if (excludedPetIds.length > 0) {
        query = query.not('id', 'in', `(${excludedPetIds.join(',')})`);
      }

      const { data, error } = await query.limit(12);

      if (error) throw error;
      setAvailablePets(data || []);
    } catch (error) {
      console.error('Error fetching available pets:', error);
      toast({
        title: "Error",
        description: "Failed to load available pets.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendFriendRequest = async (recipientPetId: string) => {
    setLoadingRequests(prev => ({ ...prev, [recipientPetId]: true }));
    try {
      // Get the current user's pet ID (using the first pet ID for simplicity)
      const requesterPetId = userPetIds[0];

      if (!requesterPetId) {
        toast({
          title: "Error",
          description: "No pet profiles found for the current user.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('pet_friendships')
        .insert({
          requester_pet_id: requesterPetId,
          recipient_pet_id: recipientPetId,
          status: 'pending',
        });

      if (error) throw error;

      toast({
        title: "Friend Request Sent! ❤️",
        description: "Your friend request has been sent successfully.",
      });
      onFriendRequestSent();
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast({
        title: "Error",
        description: "Failed to send friend request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingRequests(prev => ({ ...prev, [recipientPetId]: false }));
    }
  };

  const handleRequestPlaydate = (petId: string, userId: string) => {
    setSelectedPetForPlaydate({ petId, userId });
    setShowPlaydateModal(true);
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availablePets.map((pet) => (
            <PetCard
              key={pet.id}
              pet={pet}
              isLoading={loadingRequests[pet.id] || false}
              onSendFriendRequest={handleSendFriendRequest}
              onRequestPlaydate={handleRequestPlaydate}
            />
          ))}
        </div>
      )}

      <PlaydateRequestModal
        isOpen={showPlaydateModal}
        onClose={() => {
          setShowPlaydateModal(false);
          setSelectedPetForPlaydate(null);
        }}
        onSuccess={() => {
          setShowPlaydateModal(false);
          setSelectedPetForPlaydate(null);
        }}
        userPets={[]} // Not needed for this use case
        targetPetId={selectedPetForPlaydate?.petId}
        targetUserId={selectedPetForPlaydate?.userId}
      />
    </div>
  );
};

export default DiscoverPets;
