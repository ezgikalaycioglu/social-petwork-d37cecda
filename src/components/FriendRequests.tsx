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

  if (requests.length === 0) {
    return null;
  }

  return (
    <Card className="rounded-2xl bg-white border border-gray-100 shadow-sm">
      <Collapsible defaultOpen={requests.length > 0}>
        <CardContent className="p-4">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-between h-10 px-3 hover:bg-gray-50 mb-3">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold">Friend Requests</span>
                {requests.length > 0 && (
                  <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                    {requests.length}
                  </span>
                )}
              </div>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            {requests.length === 0 ? (
              <div className="text-center py-6">
                <Heart className="w-10 h-10 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600">No pending requests</p>
              </div>
            ) : (
              <div className="space-y-3">
                {requests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl bg-white">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <Avatar className="w-12 h-12 flex-shrink-0">
                        <AvatarImage 
                          src={request.requester_pet.profile_photo_url || ''} 
                          alt={request.requester_pet.name} 
                        />
                        <AvatarFallback className="bg-green-100 text-green-600 text-sm">
                          {request.requester_pet.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-sm truncate">
                          {request.requester_pet.name}
                        </h4>
                        <p className="text-xs text-muted-foreground truncate">
                          {request.requester_pet.breed}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        size="sm"
                        onClick={() => handleRequest(request.id, 'accepted')}
                        disabled={processingRequests.has(request.id)}
                        className="h-9 w-9 p-0"
                      >
                        {processingRequests.has(request.id) ? (
                          <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white"></div>
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRequest(request.id, 'rejected')}
                        disabled={processingRequests.has(request.id)}
                        className="h-9 w-9 p-0 border-gray-200"
                      >
                        {processingRequests.has(request.id) ? (
                          <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-gray-400"></div>
                        ) : (
                          <X className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CollapsibleContent>
        </CardContent>
      </Collapsible>
    </Card>
  );
};

export default FriendRequests;
