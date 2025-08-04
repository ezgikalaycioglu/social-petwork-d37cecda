import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Heart, Users, UserPlus } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type PetProfile = Tables<'pet_profiles'>;

interface PetInviteSelectorProps {
  userPetIds: string[];
  selectedPets: string[];
  onPetToggle: (petId: string, petOwnerId: string) => void;
}

const PetInviteSelector: React.FC<PetInviteSelectorProps> = ({
  userPetIds,
  selectedPets,
  onPetToggle
}) => {
  const [friendPets, setFriendPets] = useState<PetProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchFriendPets();
  }, [userPetIds]);

  const fetchFriendPets = async () => {
    if (userPetIds.length === 0) {
      setLoading(false);
      return;
    }

    try {
      // Get all accepted friendships for user's pets
      const { data: friendships, error: friendshipsError } = await supabase
        .from('pet_friendships')
        .select(`
          requester_pet_id,
          recipient_pet_id,
          requester_pet:pet_profiles!pet_friendships_requester_pet_id_fkey(*),
          recipient_pet:pet_profiles!pet_friendships_recipient_pet_id_fkey(*)
        `)
        .or(`requester_pet_id.in.(${userPetIds.join(',')}),recipient_pet_id.in.(${userPetIds.join(',')})`)
        .eq('status', 'accepted');

      if (friendshipsError) throw friendshipsError;

      // Extract friend pets (the ones that are not user's pets)
      const friends: PetProfile[] = [];
      friendships?.forEach((friendship: any) => {
        const isRequester = userPetIds.includes(friendship.requester_pet_id);
        const friendPet = isRequester ? friendship.recipient_pet : friendship.requester_pet;
        
        // Avoid duplicates
        if (!friends.find(f => f.id === friendPet.id)) {
          friends.push(friendPet);
        }
      });

      setFriendPets(friends);
    } catch (error) {
      console.error('Error fetching friend pets:', error);
      toast({
        title: "Error",
        description: "Failed to load friend pets.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto"></div>
        <p className="text-sm text-gray-600 mt-2">Loading friend pets...</p>
      </div>
    );
  }

  if (friendPets.length === 0) {
    return (
      <Card className="bg-gray-50">
        <CardContent className="p-4 text-center">
          <Heart className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-600">
            No friend pets available to invite.
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Make some pet friends first to invite them to events!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <Users className="w-4 h-4" />
        Invite Friend Pets ({selectedPets.length} selected)
      </div>
      
      <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
        {friendPets.map((pet) => {
          const isSelected = selectedPets.includes(pet.id);
          
          return (
            <Card 
              key={pet.id} 
              className={`cursor-pointer transition-all hover:shadow-md ${
                isSelected ? 'ring-2 ring-green-500 bg-green-50' : 'hover:bg-gray-50'
              }`}
              onClick={() => onPetToggle(pet.id, pet.user_id)}
            >
              <CardContent className="p-3">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage 
                      src={pet.profile_photo_url || ''} 
                      alt={pet.name} 
                    />
                    <AvatarFallback className="bg-green-100 text-green-600">
                      {pet.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm text-gray-800">
                        {pet.name}
                      </h4>
                      {isSelected && (
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          <UserPlus className="w-3 h-3 mr-1" />
                          Invited
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-600">
                      {pet.breed} • @{pet.pet_username}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {selectedPets.length > 0 && (
        <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
          💡 Invited pets will receive notifications and see this event in their incoming requests.
        </div>
      )}
    </div>
  );
};

export default PetInviteSelector;