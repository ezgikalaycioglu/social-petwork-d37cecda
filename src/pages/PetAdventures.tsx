
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AdventureTimeline from '@/components/AdventureTimeline';
import GlobalNavBar from '@/components/GlobalNavBar';

interface PetProfile {
  id: string;
  name: string;
  user_id: string;
  profile_photo_url: string | null;
}

const PetAdventures = () => {
  const { petId } = useParams<{ petId: string }>();
  const navigate = useNavigate();
  const [pet, setPet] = useState<PetProfile | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (petId) {
      fetchPetAndUser();
    }
  }, [petId]);

  const fetchPetAndUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);

      const { data: petData, error: petError } = await supabase
        .from('pet_profiles')
        .select('id, name, user_id, profile_photo_url')
        .eq('id', petId)
        .single();

      if (petError) throw petError;
      setPet(petData);
    } catch (error) {
      console.error('Error fetching pet:', error);
      toast({
        title: "Error",
        description: "Failed to load pet profile",
        variant: "destructive",
      });
      navigate('/my-pets');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <GlobalNavBar />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="min-h-screen bg-gray-50">
        <GlobalNavBar />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Pet Not Found</h1>
          <Button onClick={() => navigate('/my-pets')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to My Pets
          </Button>
        </div>
      </div>
    );
  }

  const isOwner = currentUserId === pet.user_id;

  return (
    <div className="min-h-screen bg-gray-50">
      <GlobalNavBar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/my-pets')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Pets
          </Button>
          
          <div className="flex items-center gap-4 mb-6">
            {pet.profile_photo_url && (
              <img
                src={pet.profile_photo_url}
                alt={pet.name}
                className="w-16 h-16 rounded-full object-cover border-4 border-green-200"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{pet.name}'s Adventures</h1>
              <p className="text-gray-600">
                {isOwner ? 'Your pet\'s adventure timeline' : `${pet.name}'s shared adventures`}
              </p>
            </div>
          </div>
        </div>

        <AdventureTimeline
          petId={pet.id}
          petName={pet.name}
          isOwner={isOwner}
        />
      </div>
    </div>
  );
};

export default PetAdventures;
