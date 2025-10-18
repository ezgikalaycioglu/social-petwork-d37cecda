
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, PawPrint } from 'lucide-react';
import Layout from '@/components/Layout';
import DiscoverPets from '@/components/DiscoverPets';
import FriendRequests from '@/components/FriendRequests';
import PetFriendsList from '@/components/PetFriendsList';
import CreatePetProfileForm from '@/components/CreatePetProfileForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Tables } from '@/integrations/supabase/types';

type PetProfile = Tables<'pet_profiles'>;

const PetSocial = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pets, setPets] = useState<PetProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    checkAuthAndFetchData();
  }, []);

  const checkAuthAndFetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/auth');
        return;
      }

      await fetchUserPets(user.id);
    } catch (error) {
      console.error('Error checking auth:', error);
      navigate('/auth');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPets = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('pet_profiles')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPets(data || []);
    } catch (error) {
      console.error('Error fetching pets:', error);
      toast({
        title: "Error",
        description: "Failed to load your pets.",
        variant: "destructive",
      });
    }
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handlePetCreated = async () => {
    setIsCreateModalOpen(false);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await fetchUserPets(user.id);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <PawPrint className="w-8 h-8 animate-spin mx-auto mb-4 text-green-600" />
            <p className="text-gray-600">Loading pet social features...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const userPetIds = pets.map(pet => pet.id);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              🐾 Pet Social Network
            </h1>
            <p className="text-gray-600 mt-1">Connect your pets with new friends!</p>
          </div>

          {pets.length === 0 ? (
            <div className="text-center py-12">
              <PawPrint className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">No pets yet!</h2>
              <p className="text-gray-600 mb-6">Create a pet profile first to start making friends.</p>
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Create Pet Profile
              </Button>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Discover Pets Section */}
              <DiscoverPets 
                userPetIds={userPetIds} 
                onFriendRequestSent={handleRefresh}
              />

              {/* Friends Lists for Each Pet */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800">Your Pets' Friends</h2>
                
                {/* Friend Requests Section - smaller and moved below title */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <FriendRequests 
                    key={`requests-${refreshKey}`}
                    userPetIds={userPetIds} 
                    onRequestHandled={handleRefresh}
                  />
                </div>

                {pets.map((pet) => (
                  <PetFriendsList
                    key={`${pet.id}-${refreshKey}`}
                    petId={pet.id}
                    petName={pet.name}
                    isOwner={true}
                    onFriendRemoved={handleRefresh}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Pet Profile Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Create New Pet Profile</DialogTitle>
            <p className="text-muted-foreground">Add a new furry friend to your family</p>
          </DialogHeader>
          <CreatePetProfileForm onSuccess={handlePetCreated} showHeader={false} />
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default PetSocial;
