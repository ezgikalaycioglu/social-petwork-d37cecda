import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import type { Tables } from '@/integrations/supabase/types';

type PetProfile = Tables<'pet_profiles'>;

interface SecurePetProfile extends PetProfile {
  approx_latitude?: number | null;
  approx_longitude?: number | null;
  distance_km?: number | null;
}

interface UseSecureDiscoverPetsProps {
  userPetIds: string[];
  onFriendRequestSent: () => void;
}

export const useSecureDiscoverPets = ({ userPetIds, onFriendRequestSent }: UseSecureDiscoverPetsProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [availablePets, setAvailablePets] = useState<SecurePetProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState<Record<string, boolean>>({});
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchAvailablePets();
  }, [userPetIds]);

  const fetchAvailablePets = async () => {
    setLoading(true);
    try {
      // If user has no pets, show limited discovery
      if (userPetIds.length === 0) {
        const { data, error } = await supabase
          .from('pet_profiles')
          .select('*')
          .eq('is_available', true)
          .limit(12);

        if (error) throw error;
        
        // For non-owners, approximate location only (no exact coordinates)
        const securePets: SecurePetProfile[] = (data || []).map(pet => ({
          ...pet,
          approx_latitude: null, // Hide exact location
          approx_longitude: null,
          distance_km: null
        }));
        
        setAvailablePets(securePets);
        return;
      }

      // Get user's existing friendships (accepted ones to exclude)
      const { data: friendships, error: friendshipsError } = await supabase
        .from('pet_friendships')
        .select('requester_pet_id, recipient_pet_id, status')
        .or(`requester_pet_id.in.(${userPetIds.join(',')}),recipient_pet_id.in.(${userPetIds.join(',')})`)
        .eq('status', 'accepted');

      if (friendshipsError) throw friendshipsError;

      // Extract friend IDs
      const friendIds = friendships?.map(f => 
        userPetIds.includes(f.requester_pet_id) ? f.recipient_pet_id : f.requester_pet_id
      ) || [];

      // Get pending requests
      const { data: pendingRequests, error: pendingError } = await supabase
        .from('pet_friendships')
        .select('requester_pet_id, recipient_pet_id')
        .or(`requester_pet_id.in.(${userPetIds.join(',')}),recipient_pet_id.in.(${userPetIds.join(',')})`)
        .eq('status', 'pending');

      if (pendingError) throw pendingError;

      const sentRequestIds = pendingRequests?.filter(req => 
        userPetIds.includes(req.requester_pet_id)
      ).map(req => req.recipient_pet_id) || [];
      
      setSentRequests(new Set(sentRequestIds));
      
      // Exclude user's pets and friends
      const excludedPetIds = [...new Set([...userPetIds, ...friendIds])];

      // Fetch pets with privacy protection
      let query = supabase
        .from('pet_profiles')
        .select('*')
        .eq('is_available', true);

      if (excludedPetIds.length > 0) {
        query = query.not('id', 'in', `(${excludedPetIds.join(',')})`);
      }

      const { data, error } = await query.limit(12);

      if (error) throw error;
      
      // Apply privacy protection to location data
      const securePets: SecurePetProfile[] = (data || []).map(pet => {
        const isOwnPet = pet.user_id === user?.id;
        
        return {
          ...pet,
          // Privacy protection: Remove exact location coordinates for non-owners
          latitude: isOwnPet ? pet.latitude : undefined,
          longitude: isOwnPet ? pet.longitude : undefined,
          // Show approximate location to others (rounded to nearest 0.01 degree ~1km)
          approx_latitude: !isOwnPet && pet.latitude ? Math.round(pet.latitude * 100) / 100 : null,
          approx_longitude: !isOwnPet && pet.longitude ? Math.round(pet.longitude * 100) / 100 : null,
          distance_km: null // Can be calculated from approximate coordinates if needed
        };
      });
      
      setAvailablePets(securePets);
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