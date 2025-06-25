
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Search, UserPlus, Users } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type PetProfile = Tables<'pet_profiles'>;

interface DiscoverPetsProps {
  userPetIds: string[];
  onFriendRequestSent: () => void;
}

const DiscoverPets = ({ userPetIds, onFriendRequestSent }: DiscoverPetsProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PetProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [sendingRequests, setSendingRequests] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const searchPets = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pet_profiles')
        .select('*')
        .or(`name.ilike.%${query}%,unique_code.ilike.%${query}%`)
        .not('id', 'in', `(${userPetIds.join(',')})`)
        .limit(10);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error('Error searching pets:', error);
      toast({
        title: "Error",
        description: "Failed to search for pets.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchPets(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const sendFriendRequest = async (fromPetId: string, toPetId: string) => {
    setSendingRequests(prev => new Set([...prev, toPetId]));
    
    try {
      const { error } = await supabase
        .from('pet_friendships')
        .insert({
          requester_pet_id: fromPetId,
          recipient_pet_id: toPetId,
          status: 'pending'
        });

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: "Already Connected",
            description: "A friendship request already exists between these pets.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "Friend Request Sent!",
          description: "Your pet's friendship request has been sent.",
        });
        onFriendRequestSent();
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast({
        title: "Error",
        description: "Failed to send friend request.",
        variant: "destructive",
      });
    } finally {
      setSendingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(toPetId);
        return newSet;
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Search className="h-6 w-6 text-green-600" />
          Discover New Pet Friends
        </h2>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by pet name or unique code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Searching for pets...</p>
        </div>
      )}

      {searchResults.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {searchResults.map((pet) => (
            <Card key={pet.id} className="bg-white shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={pet.profile_photo_url || ''} alt={pet.name} />
                    <AvatarFallback className="bg-green-100 text-green-600">
                      {pet.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 truncate">{pet.name}</h3>
                    <p className="text-sm text-gray-600">{pet.breed}</p>
                    {pet.age && <p className="text-xs text-gray-500">{pet.age} years old</p>}
                  </div>
                  
                  {userPetIds.length > 0 && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => sendFriendRequest(userPetIds[0], pet.id)}
                      disabled={sendingRequests.has(pet.id)}
                      className="border-green-500 text-green-600 hover:bg-green-50"
                    >
                      {sendingRequests.has(pet.id) ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4 mr-1" />
                          Follow
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {searchQuery && !loading && searchResults.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No pets found</h3>
          <p className="text-gray-600">Try searching with a different name or unique code.</p>
        </div>
      )}
    </div>
  );
};

export default DiscoverPets;
