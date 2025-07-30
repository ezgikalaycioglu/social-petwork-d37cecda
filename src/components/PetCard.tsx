
import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, UserPlus } from 'lucide-react';
import BoopButton from './BoopButton';
import type { Tables } from '@/integrations/supabase/types';

type PetProfile = Tables<'pet_profiles'>;

interface PetCardProps {
  pet: PetProfile;
  onClick?: () => void;
  showLocation?: boolean;
  showBoopButton?: boolean;
  showVaccinationStatus?: boolean;
  showFriendRequestButton?: boolean;
  onSendFriendRequest?: (petId: string) => void;
  userPetIds?: string[];
}

const PetCard: React.FC<PetCardProps> = ({ 
  pet, 
  onClick, 
  showLocation = true,
  showBoopButton = true,
  showVaccinationStatus = true,
  showFriendRequestButton = false,
  onSendFriendRequest,
  userPetIds = []
}) => {
  const [currentBoopCount, setCurrentBoopCount] = useState(pet.boop_count || 0);

  const handleBoopUpdate = (newCount: number) => {
    setCurrentBoopCount(newCount);
  };

  const formatDistance = (lat: number, lon: number) => {
    // This would typically calculate distance from user's location
    // For now, we'll show approximate distance
    return "~2.5 km away";
  };

  return (
    <Card 
      className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer bg-white"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start space-x-4">
          {/* Pet Avatar */}
          <Avatar className="w-16 h-16 border-2 border-green-200">
            <AvatarImage 
              src={pet.profile_photo_url || ''} 
              alt={pet.name}
              className="object-cover"
            />
            <AvatarFallback className="bg-green-100 text-green-600 text-lg font-semibold">
              {pet.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {/* Pet Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-gray-800 truncate">{pet.name}</h3>
              {pet.age && (
                <Badge variant="secondary" className="text-xs">
                  {pet.age} {pet.age === 1 ? 'year' : 'years'}
                </Badge>
              )}
            </div>
            
            {pet.pet_username && (
              <p className="text-sm text-primary font-medium mb-1">@{pet.pet_username}</p>
            )}
            
            <p className="text-sm text-gray-600 mb-2">{pet.breed}</p>
            
            {pet.bio && (
              <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                {pet.bio}
              </p>
            )}

            {/* Location */}
            {showLocation && pet.latitude && pet.longitude && (
              <div className="flex items-center text-xs text-gray-500 mb-2">
                <MapPin className="w-3 h-3 mr-1" />
                <span>{formatDistance(pet.latitude, pet.longitude)}</span>
              </div>
            )}

            {/* Personality Traits */}
            {pet.personality_traits && pet.personality_traits.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {pet.personality_traits.slice(0, 3).map((trait, index) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className="text-xs py-0 px-2"
                  >
                    {trait}
                  </Badge>
                ))}
                {pet.personality_traits.length > 3 && (
                  <Badge variant="outline" className="text-xs py-0 px-2">
                    +{pet.personality_traits.length - 3}
                  </Badge>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-2">
                {showBoopButton && (
                  <BoopButton
                    petId={pet.id}
                    currentBoopCount={currentBoopCount}
                    onBoopUpdate={handleBoopUpdate}
                    size="sm"
                  />
                )}
                
                {showFriendRequestButton && onSendFriendRequest && userPetIds.length > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSendFriendRequest(pet.id);
                    }}
                    className="text-xs px-2 py-1 h-auto"
                  >
                    <UserPlus className="w-3 h-3 mr-1" />
                    Add Friend
                  </Button>
                )}
              </div>
              
              {showVaccinationStatus && pet.vaccination_status && (
                <Badge 
                  variant={pet.vaccination_status === 'Up-to-date' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {pet.vaccination_status === 'Up-to-date' ? '✓ Vaccinated' : pet.vaccination_status}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PetCard;
