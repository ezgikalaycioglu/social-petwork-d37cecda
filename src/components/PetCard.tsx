
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, Users } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type PetProfile = Tables<'pet_profiles'>;

interface PetCardProps {
  pet: PetProfile;
  isLoading: boolean;
  onSendFriendRequest: (petId: string) => void;
  onRequestPlaydate: (petId: string, userId: string) => void;
}

const PetCard = ({ pet, isLoading, onSendFriendRequest, onRequestPlaydate }: PetCardProps) => {
  return (
    <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center">
          <Avatar className="w-20 h-20 mb-4 border-4 border-green-200">
            <AvatarImage src={pet.profile_photo_url || ''} alt={pet.name} />
            <AvatarFallback className="bg-green-100 text-green-600 text-xl">
              {pet.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <h3 className="text-lg font-bold text-gray-800 mb-2">{pet.name}</h3>
          
          <div className="text-sm text-gray-600 mb-4 space-y-1">
            <p><span className="font-medium">Breed:</span> {pet.breed}</p>
            {pet.age && <p><span className="font-medium">Age:</span> {pet.age} years old</p>}
            {pet.gender && <p><span className="font-medium">Gender:</span> {pet.gender}</p>}
          </div>

          {pet.personality_traits && pet.personality_traits.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-1 justify-center">
                {pet.personality_traits.slice(0, 3).map((trait, index) => (
                  <span key={index} className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                    {trait}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex gap-2 w-full">
            <Button
              size="sm"
              onClick={() => onSendFriendRequest(pet.id)}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 text-white flex-1"
            >
              {isLoading ? (
                'Sending...'
              ) : (
                <>
                  <Heart className="w-4 h-4 mr-1" />
                  Add Friend
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onRequestPlaydate(pet.id, pet.user_id)}
              className="border-blue-500 text-blue-600 hover:bg-blue-50 flex-1"
            >
              <Users className="w-4 h-4 mr-1" />
              Playdate
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PetCard;
