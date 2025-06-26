import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Heart, Plus, Edit, Trash2, Camera } from 'lucide-react';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog"
import { useToast } from '@/hooks/use-toast';
import GlobalNavBar from '@/components/GlobalNavBar';

interface PetProfile {
  id: string;
  name: string;
  breed: string;
  age: number | null;
  profile_photo_url: string | null;
}

const MyPets = () => {
  const [pets, setPets] = useState<PetProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchPets();
  }, []);

  const fetchPets = async () => {
    try {
      setLoading(true);
      // With the new RLS policies, we can still fetch our own pets normally
      // The policy "Users can update their own pet profiles" handles ownership checks
      const { data, error } = await supabase
        .from('pet_profiles')
        .select('id, name, breed, age, profile_photo_url')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching pets:', error);
        toast({
          title: "Error",
          description: "Failed to load pet profiles",
          variant: "destructive",
        });
      } else {
        setPets(data || []);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePet = async (petId: string) => {
    try {
      const { error } = await supabase
        .from('pet_profiles')
        .delete()
        .eq('id', petId);

      if (error) {
        console.error('Error deleting pet:', error);
        toast({
          title: "Error",
          description: "Failed to delete pet profile",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success!",
          description: "Pet profile deleted successfully!",
        });
        fetchPets(); // Refresh the pet list
      }
    } catch (error) {
      console.error('Unexpected error deleting pet:', error);
      toast({
        title: "Unexpected Error",
        description: "An unexpected error occurred while deleting the pet profile.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <GlobalNavBar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">My Pets</h1>
          <p className="text-gray-600">Manage your pet profiles and their adventures</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3 mx-auto"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : pets.length === 0 ? (
          <Card className="p-8 text-center">
            <CardContent>
              <div className="mb-6">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-12 h-12 text-green-600" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">No pets yet!</h2>
                <p className="text-gray-600 mb-6">Create your first pet profile to get started</p>
                <Button 
                  onClick={() => navigate('/create-pet-profile')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Pet Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pets.map((pet) => (
                <Card key={pet.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="text-center mb-4">
                      <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-green-200">
                        <AvatarImage src={pet.profile_photo_url || ''} alt={pet.name} />
                        <AvatarFallback className="bg-green-100 text-green-600 text-2xl">
                          {pet.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="text-xl font-semibold text-gray-800">{pet.name}</h3>
                      <p className="text-gray-600">{pet.breed}</p>
                      {pet.age && <p className="text-sm text-gray-500">{pet.age} years old</p>}
                    </div>

                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => navigate(`/edit-pet-profile/${pet.id}`)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                      
                      <Button
                        variant="outline"
                        className="w-full border-green-500 text-green-600 hover:bg-green-50"
                        onClick={() => navigate(`/pet-adventures/${pet.id}`)}
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        View Adventures
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" className="w-full text-red-600 hover:bg-red-50">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete {pet.name}'s profile?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete {pet.name}'s profile and all associated data.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeletePet(pet.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-8 text-center">
              <Button 
                onClick={() => navigate('/create-pet-profile')}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Another Pet
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MyPets;
