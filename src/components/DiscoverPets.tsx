import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Heart, Users, PawPrint } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';
import PlaydateRequestModal from './PlaydateRequestModal';

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
      const { data, error } = await supabase
        .from('pet_profiles')
        .select('*')
        .not('id', 'in', `(${userPetIds.join(',')})`)
        .limit(9);

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
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <PawPrint className="w-8 h-8 animate-spin mx-auto mb-4 text-green-600" />
            <p className="text-gray-600">Loading available pets...</p>
          </div>
        </div>
      ) : availablePets.length === 0 ? (
        <div className="text-center py-12">
          <PawPrint className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">No new pets found!</h2>
          <p className="text-gray-600 mb-6">Check back later for more furry friends.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availablePets.map((pet) => (
            <Card key={pet.id} className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="w-20 h-20 mb-4 border-4 border-green-200">
                    <AvatarImage src={pet.profile_photo_url || ''} alt={pet.name} />
                    <AvatarFallback className="bg-green-100 text-green-600 text-xl">
                      {pet.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{pet.name}</h3>
                  
                  <div className="text-sm text-gray-600 mb-4 space-y-1">
                    <p><span className="font-medium">Breed:</span> {pet.breed}</p>
                    {pet.age && <p><span className="font-medium">Age:</span> {pet.age} years old</p>}
                    {pet.gender && <p><span className="font-medium">Gender:</span> {pet.gender}</p>}
                  </div>

                  {pet.personality_traits && pet.personality_traits.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1 justify-center">
                        {pet.personality_traits.slice(0, 3).map((trait, index) => (
                          <span key={index} className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                            {trait}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-2 w-full">
                    <Button
                      size="sm"
                      onClick={() => handleSendFriendRequest(pet.id)}
                      disabled={loadingRequests[pet.id]}
                      className="bg-green-600 hover:bg-green-700 text-white flex-1"
                    >
                      {loadingRequests[pet.id] ? (
                        'Sending...'
                      ) : (
                        <>
                          <Heart className="w-4 h-4 mr-1" />
                          Add Friend
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRequestPlaydate(pet.id, pet.user_id)}
                      className="border-blue-500 text-blue-600 hover:bg-blue-50 flex-1"
                    >
                      <Users className="w-4 h-4 mr-1" />
                      Playdate
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
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
