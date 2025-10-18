import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import FindFriendsComponent from '@/components/FindFriends';
import CreatePetProfileForm from '@/components/CreatePetProfileForm';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Heart, Search, Users } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type PetProfile = Tables<'pet_profiles'>;

const FindFriendsPage: React.FC = () => {
  const [userPets, setUserPets] = useState<PetProfile[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showFinder, setShowFinder] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const petIdFromUrl = searchParams.get('petId');

  useEffect(() => {
    checkAuthAndFetchPets();
  }, []);

  // If pet ID is provided in URL, show the finder immediately
  useEffect(() => {
    if (petIdFromUrl && userPets.length > 0) {
      const pet = userPets.find(p => p.id === petIdFromUrl);
      if (pet) {
        setSelectedPetId(petIdFromUrl);
        setShowFinder(true);
      }
    }
  }, [petIdFromUrl, userPets]);

  const checkAuthAndFetchPets = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        navigate('/auth');
        return;
      }

      // Fetch user's pets
      const { data: pets, error: petsError } = await supabase
        .from('pet_profiles')
        .select('*')
        .eq('user_id', user.id);

      if (petsError) throw petsError;

      setUserPets(pets || []);
      
      // Auto-select first pet if only one exists
      if (pets?.length === 1) {
        setSelectedPetId(pets[0].id);
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to load your pets.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePetCreated = async () => {
    setIsCreateModalOpen(false);
    await checkAuthAndFetchPets();
  };

  const startFinding = () => {
    if (!selectedPetId) {
      toast({
        title: "Select a Pet",
        description: "Please select which pet you want to find friends for.",
        variant: "destructive",
      });
      return;
    }
    setShowFinder(true);
  };

  const handleMatchFound = () => {
    // Optionally refresh or show success animation
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your pets...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (userPets.length === 0) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto p-6">
          <Card className="text-center">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2">
                <Users className="h-6 w-6" />
                Find Friends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-6xl mb-4">🐕</div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No Pet Profiles Found
              </h3>
              <p className="text-gray-500 mb-6">
                You need to create a pet profile before you can find friends for your pet.
              </p>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                Create Pet Profile
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Create Pet Profile Modal */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent 
            className="fixed inset-4 sm:inset-auto sm:left-[50%] sm:top-[50%] sm:translate-x-[-50%] sm:translate-y-[-50%] sm:max-w-lg sm:w-full h-[calc(100vh-2rem)] sm:h-auto sm:max-h-[85vh] rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden p-0 gap-0"
            aria-describedby="create-pet-description"
          >
            <CreatePetProfileForm onSuccess={handlePetCreated} showHeader={false} />
          </DialogContent>
        </Dialog>
      </Layout>
    );
  }

  if (showFinder) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto p-6">
          <div className="mb-6 text-center">
            <Button 
              variant="outline" 
              onClick={() => setShowFinder(false)}
              className="mb-4"
            >
              ← Back to Pet Selection
            </Button>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Find Friends</h1>
            <p className="text-gray-600">
              Discover compatible pets near you for {userPets.find(p => p.id === selectedPetId)?.name}
            </p>
          </div>
          
          <FindFriendsComponent
            userPetId={selectedPetId}
            onMatchFound={handleMatchFound}
          />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Find Friends</h1>
          <p className="text-gray-600">
            Discover compatible pets in your area and make new friendships!
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-pink-500" />
              Select Your Pet
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Choose which pet you'd like to find friends for:
            </p>
            
            <div className="space-y-3 mb-6">
              {userPets.map((pet) => (
                <div
                  key={pet.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedPetId === pet.id
                      ? 'border-primary bg-primary/10'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedPetId(pet.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      {pet.profile_photo_url ? (
                        <img
                          src={pet.profile_photo_url}
                          alt={pet.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-lg">🐕</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{pet.name}</h3>
                      <p className="text-sm text-gray-600">
                        {pet.breed} {pet.age && `• ${pet.age} years old`}
                      </p>
                    </div>
                    {selectedPetId === pet.id && (
                      <div className="text-primary">✓</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <Button
              onClick={startFinding}
              className="w-full"
              disabled={!selectedPetId}
            >
              <Search className="w-4 h-4 mr-2" />
              Start Finding Friends
            </Button>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>We'll find pets within 5km of your location based on compatibility.</p>
        </div>
      </div>
    </Layout>
  );
};

export default FindFriendsPage;