import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Check, X, Heart, Mail } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type PetFriendship = Tables<'pet_friendships'>;
type PetProfile = Tables<'pet_profiles'>;

interface FriendRequest extends PetFriendship {
  requester_pet: PetProfile;
}

interface FriendRequestsProps {
  userPetIds: string[];
  onRequestHandled: () => void;
}

const FriendRequests = ({ userPetIds, onRequestHandled }: FriendRequestsProps) => {
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingRequests, setProcessingRequests] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    fetchPendingRequests();
  }, [userPetIds]);

  const fetchPendingRequests = async () => {
    if (userPetIds.length === 0) {
      setLoading(false);
      return;
    }

    try {
      // With the new RLS policies, we can now properly fetch friend requests
      // The join with pet_profiles will work since all profiles are now viewable
      const { data, error } = await supabase
        .from('pet_friendships')
        .select(`
          *,
          requester_pet:pet_profiles!pet_friendships_requester_pet_id_fkey(*)
        `)
        .in('recipient_pet_id', userPetIds)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching friend requests:', error);
      toast({
        title: "Error",
        description: "Failed to load friend requests.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async (requestId: string, action: 'accepted' | 'rejected') => {
    setProcessingRequests(prev => new Set([...prev, requestId]));

    try {
      const { error } = await supabase
        .from('pet_friendships')
        .update({ 
          status: action,
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: action === 'accepted' ? "Friend Request Accepted!" : "Friend Request Rejected",
        description: action === 'accepted' 
          ? "Your pets are now friends!" 
          : "The friend request has been declined.",
      });

      await fetchPendingRequests();
      onRequestHandled();
    } catch (error) {
      console.error(`Error ${action} friend request:`, error);
      toast({
        title: "Error",
        description: `Failed to ${action === 'accepted' ? 'accept' : 'reject'} friend request.`,
        variant: "destructive",
      });
    } finally {
      setProcessingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
        <p className="text-gray-600 mt-2">Loading friend requests...</p>
      </div>
    );
  }

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-green-600" />
          Friend Requests
          {requests.length > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {requests.length}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <div className="text-center py-8">
            <Heart className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">No pending friend requests</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage 
                      src={request.requester_pet.profile_photo_url || ''} 
                      alt={request.requester_pet.name} 
                    />
                    <AvatarFallback className="bg-green-100 text-green-600">
                      {request.requester_pet.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      {request.requester_pet.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {request.requester_pet.breed}
                    </p>
                    <p className="text-xs text-gray-500">
                      Wants to be friends with your pet
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                  <Button
                    size="sm"
                    onClick={() => handleRequest(request.id, 'accepted')}
                    disabled={processingRequests.has(request.id)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {processingRequests.has(request.id) ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-1" />
                        Accept
                      </>
                    )}
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRequest(request.id, 'rejected')}
                    disabled={processingRequests.has(request.id)}
                    className="border-red-500 text-red-600 hover:bg-red-50"
                  >
                    {processingRequests.has(request.id) ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                    ) : (
                      <>
                        <X className="w-4 h-4 mr-1" />
                        Reject
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FriendRequests;
