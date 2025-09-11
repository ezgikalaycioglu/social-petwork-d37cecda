
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Users, UserMinus, Heart, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Tables } from '@/integrations/supabase/types';

type PetProfile = Tables<'pet_profiles'>;

interface Friend {
  id: string;
  friend_pet: PetProfile;
  friendship_id: string;
}

interface PetFriendsListProps {
  petId: string;
  petName: string;
  isOwner?: boolean;
  onFriendRemoved?: () => void;
}

const PetFriendsList = ({ petId, petName, isOwner = false, onFriendRemoved }: PetFriendsListProps) => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingFriends, setRemovingFriends] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchFriends();
  }, [petId]);

  const fetchFriends = async () => {
    try {
      // Get friendships where this pet is either requester or recipient and status is accepted
      const { data, error } = await supabase
        .from('pet_friendships')
        .select(`
          id,
          requester_pet_id,
          recipient_pet_id,
          requester_pet:pet_profiles!pet_friendships_requester_pet_id_fkey(*),
          recipient_pet:pet_profiles!pet_friendships_recipient_pet_id_fkey(*)
        `)
        .or(`requester_pet_id.eq.${petId},recipient_pet_id.eq.${petId}`)
        .eq('status', 'accepted')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to get the friend pet (the one that's not the current pet)
      const friendsList: Friend[] = (data || []).map((friendship: any) => {
        const isRequester = friendship.requester_pet_id === petId;
        return {
          id: isRequester ? friendship.recipient_pet_id : friendship.requester_pet_id,
          friend_pet: isRequester ? friendship.recipient_pet : friendship.requester_pet,
          friendship_id: friendship.id
        };
      });

      setFriends(friendsList);
    } catch (error) {
      console.error('Error fetching friends:', error);
      toast({
        title: "Error",
        description: "Failed to load friends list.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const removeFriend = async (friendshipId: string, friendName: string) => {
    if (!confirm(`Are you sure you want to remove ${friendName} from ${petName}'s friends?`)) {
      return;
    }

    setRemovingFriends(prev => new Set([...prev, friendshipId]));

    try {
      const { error } = await supabase
        .from('pet_friendships')
        .delete()
        .eq('id', friendshipId);

      if (error) throw error;

      toast({
        title: "Friend Removed",
        description: `${friendName} has been removed from ${petName}'s friends.`,
      });

      await fetchFriends();
      if (onFriendRemoved) onFriendRemoved();
    } catch (error) {
      console.error('Error removing friend:', error);
      toast({
        title: "Error",
        description: "Failed to remove friend.",
        variant: "destructive",
      });
    } finally {
      setRemovingFriends(prev => {
        const newSet = new Set(prev);
        newSet.delete(friendshipId);
        return newSet;
      });
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
        <p className="text-gray-600 mt-2">Loading friends...</p>
      </div>
    );
  }

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader className="pb-4 md:pb-6">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-green-600" />
            {petName}'s Friends ({friends.length})
          </CardTitle>
          {isOwner && (
            <Button 
              onClick={() => navigate(`/find-friends?petId=${petId}`)}
              size="sm"
              className="bg-green-600 hover:bg-green-700 self-start md:self-auto"
            >
              <Search className="w-4 h-4 mr-2" />
              Find Friends
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {friends.length === 0 ? (
          <div className="text-center py-8">
            <Heart className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No friends yet!</h3>
            <p className="text-gray-600">
              {isOwner 
                ? `${petName} hasn't made any friends yet. Use the search above to discover new pet friends!`
                : `${petName} hasn't made any friends yet.`
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {friends.map((friend) => (
              <div key={friend.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 border rounded-lg space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-4 flex-1 min-w-0">
                  <Avatar className="w-14 h-14 sm:w-10 sm:h-10 flex-shrink-0">
                    <AvatarImage 
                      src={friend.friend_pet.profile_photo_url || ''} 
                      alt={friend.friend_pet.name} 
                    />
                    <AvatarFallback className="bg-green-100 text-green-600">
                      {friend.friend_pet.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="space-y-1 min-w-0 flex-1">
                    <h4 className="font-semibold text-gray-800 text-base sm:text-sm truncate">
                      {friend.friend_pet.name}
                    </h4>
                    <p className="text-sm sm:text-xs text-gray-600 truncate">
                      {friend.friend_pet.breed}
                    </p>
                  </div>
                </div>
                
                {isOwner && (
                  <div className="flex justify-center sm:justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeFriend(friend.friendship_id, friend.friend_pet.name)}
                      disabled={removingFriends.has(friend.friendship_id)}
                      className="border-red-500 text-red-600 hover:bg-red-50 w-full sm:w-auto"
                    >
                      {removingFriends.has(friend.friendship_id) ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                      ) : (
                        <UserMinus className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PetFriendsList;
