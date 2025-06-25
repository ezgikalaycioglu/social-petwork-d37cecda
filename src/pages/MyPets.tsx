
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Plus, Heart, Edit, Trash2, PawPrint } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type PetProfile = Tables<'pet_profiles'>;

const MyPets = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pets, setPets] = useState<PetProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPets();
  }, []);

  const fetchPets = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase
        .from('pet_profiles')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setPets(data || []);
    } catch (error) {
      console.error('Error fetching pets:', error);
      toast({
        title: "Error",
        description: "Failed to load your pets.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deletePet = async (petId: string) => {
    if (!confirm('Are you sure you want to delete this pet profile?')) return;

    try {
      const { error } = await supabase
        .from('pet_profiles')
        .delete()
        .eq('id', petId);

      if (error) {
        throw error;
      }

      setPets(pets.filter(pet => pet.id !== petId));
      toast({
        title: "Success",
        description: "Pet profile deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting pet:', error);
      toast({
        title: "Error",
        description: "Failed to delete pet profile.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <PawPrint className="w-8 h-8 animate-spin mx-auto mb-4 text-green-600" />
          <p className="text-gray-600">Loading your pets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                My Pets
                <Heart className="h-6 w-6 text-red-500" />
              </h1>
              <p className="text-gray-600 mt-1">Manage your furry friends' profiles</p>
            </div>
            <Button
              onClick={() => navigate('/create-pet-profile')}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Pet
            </Button>
          </div>

          {/* Pet Cards */}
          {pets.length === 0 ? (
            <div className="text-center py-12">
              <PawPrint className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">No pets yet!</h2>
              <p className="text-gray-600 mb-6">Create your first pet profile to get started.</p>
              <Button
                onClick={() => navigate('/create-pet-profile')}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Pet Profile
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pets.map((pet) => (
                <Card key={pet.id} className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-200">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center">
                      <Avatar className="w-24 h-24 mb-4 border-4 border-green-200">
                        <AvatarImage src={pet.profile_photo_url || ''} alt={pet.name} />
                        <AvatarFallback className="bg-green-100 text-green-600 text-2xl">
                          {pet.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{pet.name}</h3>
                      
                      <div className="text-sm text-gray-600 mb-4 space-y-1">
                        <p><span className="font-medium">Breed:</span> {pet.breed}</p>
                        {pet.age && <p><span className="font-medium">Age:</span> {pet.age} years old</p>}
                        {pet.gender && <p><span className="font-medium">Gender:</span> {pet.gender}</p>}
                      </div>
                      
                      {pet.about && (
                        <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                          {pet.about}
                        </p>
                      )}
                      
                      <div className="flex gap-2 mt-auto">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/edit-pet-profile/${pet.id}`)}
                          className="border-green-500 text-green-600 hover:bg-green-50"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deletePet(pet.id)}
                          className="border-red-500 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyPets;
