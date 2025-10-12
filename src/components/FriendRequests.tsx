import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import { Check, X, Mail, ChevronDown } from 'lucide-react';
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
  const [isOpen, setIsOpen] = useState(true);
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
    // Optimistic UI: remove immediately
    const requestToRemove = requests.find(r => r.id === requestId);
    setRequests(prev => prev.filter(r => r.id !== requestId));
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

      onRequestHandled();
    } catch (error) {
      console.error(`Error ${action} friend request:`, error);
      
      // Restore on error
      if (requestToRemove) {
        setRequests(prev => [requestToRemove, ...prev]);
      }
      
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

  if (requests.length === 0 && !loading) {
    return null;
  }

  return (
    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm mb-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <button
            className="w-full p-4 flex items-center justify-between gap-3 hover:bg-gray-50/50 transition-colors rounded-t-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            role="button"
            tabIndex={0}
            aria-expanded={isOpen}
          >
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-primary flex-shrink-0" />
              <span className="text-sm font-semibold">Friend Requests</span>
              {requests.length > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                  {requests.length}
                </span>
              )}
            </div>
            <ChevronDown 
              className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`} 
            />
          </button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="transition-all duration-200 overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
          <div className="px-4 pb-4">
            {loading ? (
              <div className="space-y-2">
                {[1, 2].map((i) => (
                  <div key={i} className="h-16 rounded-xl bg-gray-100/80 animate-pulse" />
                ))}
              </div>
            ) : requests.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                <Mail className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="font-medium text-gray-700">No pending friend requests</p>
                <p className="text-xs mt-1">You'll see new requests here.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {requests.filter(request => request.requester_pet).map((request) => (
                  <div 
                    key={request.id} 
                    className="rounded-xl border border-gray-100 bg-white p-3 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <Avatar className="w-11 h-11 flex-shrink-0">
                        <AvatarImage 
                          src={request.requester_pet.profile_photo_url || ''} 
                          alt={request.requester_pet.name} 
                        />
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
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
                        className="h-9 rounded-full px-3 min-w-[70px]"
                      >
                        {processingRequests.has(request.id) ? (
                          <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white"></div>
                        ) : (
                          <>
                            <Check className="w-3.5 h-3.5 mr-1" />
                            Accept
                          </>
                        )}
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRequest(request.id, 'rejected')}
                        disabled={processingRequests.has(request.id)}
                        className="h-9 rounded-full px-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      >
                        {processingRequests.has(request.id) ? (
                          <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-current"></div>
                        ) : (
                          <X className="w-3.5 h-3.5" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default FriendRequests;
