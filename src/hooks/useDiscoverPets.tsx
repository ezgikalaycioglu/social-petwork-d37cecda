
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

type PetProfile = Tables<'pet_profiles'>;

interface UseDiscoverPetsProps {
  userPetIds: string[];
  onFriendRequestSent: () => void;
}

export const useDiscoverPets = ({ userPetIds, onFriendRequestSent }: UseDiscoverPetsProps) => {
  const { toast } = useToast();
  const [availablePets, setAvailablePets] = useState<PetProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState<Record<string, boolean>>({});
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchAvailablePets();
  }, [userPetIds]);

  const fetchAvailablePets = async () => {
    setLoading(true);
    try {
      // If user has no pets, we can show all pets from non-private accounts
      if (userPetIds.length === 0) {
        // First get non-private users
        const { data: nonPrivateUsers, error: usersError } = await supabase
          .from('user_profiles')
          .select('id')
          .or('is_private.is.null,is_private.eq.false');

        if (usersError) throw usersError;

        const nonPrivateUserIds = nonPrivateUsers?.map(u => u.id) || [];
        
        if (nonPrivateUserIds.length === 0) {
          setAvailablePets([]);
          return;
        }

        const { data, error } = await supabase
          .from('pet_profiles')
          .select('*')
          .in('user_id', nonPrivateUserIds)
          .limit(12);

        if (error) throw error;
        setAvailablePets(data || []);
        return;
      }

      // 1. Get user's existing friendships (only accepted ones to exclude)
      const { data: friendships, error: friendshipsError } = await supabase
        .from('pet_friendships')
        .select('requester_pet_id, recipient_pet_id, status')
        .or(`requester_pet_id.in.(${userPetIds.join(',')}),recipient_pet_id.in.(${userPetIds.join(',')})`)
        .eq('status', 'accepted'); // Only exclude accepted friendships, keep pending ones visible

      if (friendshipsError) throw friendshipsError;

      // Extract friend IDs (pets that are already accepted friends)
      const friendIds = friendships?.map(f => 
        userPetIds.includes(f.requester_pet_id) ? f.recipient_pet_id : f.requester_pet_id
      ) || [];

      // Get existing pending requests to track sent status
      const { data: pendingRequests, error: pendingError } = await supabase
        .from('pet_friendships')
        .select('requester_pet_id, recipient_pet_id')
        .or(`requester_pet_id.in.(${userPetIds.join(',')}),recipient_pet_id.in.(${userPetIds.join(',')})`)
        .eq('status', 'pending');

      if (pendingError) throw pendingError;

      // Track which pets have pending requests sent by current user
      const sentRequestIds = pendingRequests?.filter(req => 
        userPetIds.includes(req.requester_pet_id)
      ).map(req => req.recipient_pet_id) || [];
      
      setSentRequests(new Set(sentRequestIds));
      
      // Combine user's own pets and their friends/pending requests to exclude
      const excludedPetIds = [...new Set([...userPetIds, ...friendIds])];

      // Get non-private users first
      const { data: nonPrivateUsers, error: usersError } = await supabase
        .from('user_profiles')
        .select('id')
        .or('is_private.is.null,is_private.eq.false');

      if (usersError) throw usersError;

      const nonPrivateUserIds = nonPrivateUsers?.map(u => u.id) || [];
      
      if (nonPrivateUserIds.length === 0) {
        setAvailablePets([]);
        return;
      }

      // 2. Fetch pets excluding the ones already connected to user and from private accounts
      let query = supabase
        .from('pet_profiles')
        .select('*')
        .in('user_id', nonPrivateUserIds);

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

      // Mark the request as sent
      setSentRequests(prev => new Set(prev).add(recipientPetId));

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

  return {
    availablePets,
    loading,
    loadingRequests,
    sentRequests,
    handleSendFriendRequest,
  };
};
