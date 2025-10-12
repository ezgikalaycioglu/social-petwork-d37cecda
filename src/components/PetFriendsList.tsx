
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
      // Filter out friendships where the friend's pet profile has been deleted
      const friendsList: Friend[] = (data || [])
        .map((friendship: any) => {
          const isRequester = friendship.requester_pet_id === petId;
          const friendPet = isRequester ? friendship.recipient_pet : friendship.requester_pet;
          
          // Skip if friend pet is null (deleted profile)
          if (!friendPet) return null;
          
          return {
            id: isRequester ? friendship.recipient_pet_id : friendship.requester_pet_id,
            friend_pet: friendPet,
            friendship_id: friendship.id
          };
        })
        .filter((friend): friend is Friend => friend !== null);

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
    <Card className="rounded-2xl bg-white border border-gray-100 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">{petName}'s Friends</h3>
            <span className="text-xs text-muted-foreground">({friends.length})</span>
          </div>
          {isOwner && (
            <Button 
              onClick={() => navigate(`/find-friends?petId=${petId}`)}
              size="sm"
              variant="ghost"
              className="h-8 px-2 text-xs"
            >
              <Search className="w-3.5 h-3.5 mr-1" />
              Find
            </Button>
          )}
        </div>
        
        {friends.length === 0 ? (
          <div className="text-center py-6">
            <Heart className="w-10 h-10 mx-auto mb-2 text-gray-400" />
            <p className="text-xs text-muted-foreground">
              {isOwner ? 'No friends yet. Use search to find pet friends!' : 'No friends yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {friends.map((friend) => (
              <div key={friend.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl bg-white">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <Avatar className="w-10 h-10 flex-shrink-0">
                    <AvatarImage 
                      src={friend.friend_pet.profile_photo_url || ''} 
                      alt={friend.friend_pet.name} 
                    />
                    <AvatarFallback className="bg-green-100 text-green-600 text-xs">
                      {friend.friend_pet.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-sm truncate">
                      {friend.friend_pet.name}
                    </h4>
                    <p className="text-xs text-muted-foreground truncate">
                      {friend.friend_pet.breed}
                    </p>
                  </div>
                </div>
                
                {isOwner && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeFriend(friend.friendship_id, friend.friend_pet.name)}
                    disabled={removingFriends.has(friend.friendship_id)}
                    className="h-8 w-8 p-0 flex-shrink-0"
                  >
                    {removingFriends.has(friend.friendship_id) ? (
                      <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-gray-400"></div>
                    ) : (
                      <UserMinus className="w-4 h-4 text-gray-400 hover:text-red-500" />
                    )}
                  </Button>
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
