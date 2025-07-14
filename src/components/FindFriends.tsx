import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Heart, X, MapPin, Star, Loader2 } from 'lucide-react';
import { useLocation } from '@/hooks/useLocation';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

type PetProfile = Tables<'pet_profiles'>;

interface MatchedPet extends PetProfile {
  compatibilityScore: number;
  distance: number;
}

interface FindFriendsProps {
  userPetId: string;
  onMatchFound?: () => void;
}

const FindFriends: React.FC<FindFriendsProps> = ({ userPetId, onMatchFound }) => {
  const [matches, setMatches] = useState<MatchedPet[]>([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [processingAction, setProcessingAction] = useState(false);
  const { coordinates, loading: locationLoading, error: locationError } = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    if (coordinates && !locationLoading) {
      fetchMatches();
    }
  }, [coordinates, locationLoading, userPetId]);

  const fetchMatches = async () => {
    if (!coordinates) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('find-pet-matches', {
        body: {
          petId: userPetId,
          latitude: coordinates.lat,
          longitude: coordinates.lng,
          radius: 5
        }
      });

      if (error) throw error;

      setMatches(data.matches || []);
      setCurrentMatchIndex(0);
    } catch (error) {
      console.error('Error fetching matches:', error);
      toast({
        title: "Error",
        description: "Failed to find potential matches. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    const currentMatch = matches[currentMatchIndex];
    if (!currentMatch || processingAction) return;

    setProcessingAction(true);
    try {
      // Send friend request
      const { error } = await supabase
        .from('pet_friendships')
        .insert({
          requester_pet_id: userPetId,
          recipient_pet_id: currentMatch.id,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Friend Request Sent! 💕",
        description: `You sent a friend request to ${currentMatch.name}`,
        duration: 2000,
      });

      onMatchFound?.();
      nextMatch();
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast({
        title: "Error",
        description: "Failed to send friend request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingAction(false);
    }
  };

  const handleSkip = () => {
    if (processingAction) return;
    nextMatch();
  };

  const nextMatch = () => {
    if (currentMatchIndex < matches.length - 1) {
      setCurrentMatchIndex(currentMatchIndex + 1);
    } else {
      // No more matches, could fetch more or show end screen
      setCurrentMatchIndex(matches.length);
    }
  };

  const getCompatibilityColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-orange-600 bg-orange-100';
  };

  const getCompatibilityText = (score: number) => {
    if (score >= 80) return 'Great Match!';
    if (score >= 60) return 'Good Match';
    return 'Potential Match';
  };

  if (locationLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Getting your location...</p>
        </div>
      </div>
    );
  }

  if (locationError) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Location access is required to find nearby friends.</p>
          <Button onClick={() => window.location.reload()}>
            Enable Location
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Finding your perfect matches...</p>
        </div>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-6xl mb-4">🐕</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No matches found</h3>
          <p className="text-gray-500 mb-4">Try expanding your search radius or check back later!</p>
          <Button onClick={fetchMatches}>
            Search Again
          </Button>
        </div>
      </div>
    );
  }

  if (currentMatchIndex >= matches.length) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-6xl mb-4">✨</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">That's all for now!</h3>
          <p className="text-gray-500 mb-4">You've seen all available matches in your area.</p>
          <Button onClick={fetchMatches}>
            Search Again
          </Button>
        </div>
      </div>
    );
  }

  const currentMatch = matches[currentMatchIndex];

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-4 text-center">
        <p className="text-sm text-gray-600">
          {currentMatchIndex + 1} of {matches.length} matches
        </p>
      </div>

      <Card className="overflow-hidden shadow-lg">
        <CardHeader className="relative p-0">
          {/* Pet Image */}
          <div className="h-80 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
            {currentMatch.profile_photo_url ? (
              <img
                src={currentMatch.profile_photo_url}
                alt={currentMatch.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-6xl">🐕</div>
            )}
          </div>

          {/* Compatibility Score Badge */}
          <div className="absolute top-4 right-4">
            <Badge className={`${getCompatibilityColor(currentMatch.compatibilityScore)} font-semibold`}>
              <Star className="w-3 h-3 mr-1" />
              {currentMatch.compatibilityScore}% {getCompatibilityText(currentMatch.compatibilityScore)}
            </Badge>
          </div>

          {/* Distance Badge */}
          <div className="absolute top-4 left-4">
            <Badge variant="secondary" className="bg-white/90 text-gray-700">
              <MapPin className="w-3 h-3 mr-1" />
              {currentMatch.distance}km away
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {/* Pet Info */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold text-gray-800">{currentMatch.name}</h2>
              {currentMatch.age && (
                <Badge variant="outline">
                  {currentMatch.age} {currentMatch.age === 1 ? 'year' : 'years'}
                </Badge>
              )}
            </div>
            <p className="text-gray-600 mb-3">{currentMatch.breed}</p>
            
            {currentMatch.bio && (
              <p className="text-gray-700 text-sm mb-3">{currentMatch.bio}</p>
            )}
          </div>

          {/* Personality Traits */}
          {currentMatch.personality_traits && currentMatch.personality_traits.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Personality</h4>
              <div className="flex flex-wrap gap-2">
                {currentMatch.personality_traits.map((trait, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {trait}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Vaccination Status */}
          {currentMatch.vaccination_status && (
            <div className="mb-4">
              <Badge
                variant={currentMatch.vaccination_status === 'Up-to-date' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {currentMatch.vaccination_status === 'Up-to-date' ? '✓ Vaccinated' : currentMatch.vaccination_status}
              </Badge>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 mt-6">
            <Button
              variant="outline"
              size="lg"
              className="flex-1 border-red-200 hover:bg-red-50 hover:border-red-300"
              onClick={handleSkip}
              disabled={processingAction}
            >
              <X className="w-5 h-5 mr-2 text-red-500" />
              Skip
            </Button>
            <Button
              size="lg"
              className="flex-1 bg-pink-500 hover:bg-pink-600"
              onClick={handleLike}
              disabled={processingAction}
            >
              {processingAction ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Heart className="w-5 h-5 mr-2" />
              )}
              Like
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FindFriends;