
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Heart, Plus, Edit, Trash2, Camera, PawPrint, Home, LogOut } from 'lucide-react';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog"
import { useToast } from '@/hooks/use-toast';

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
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuthAndFetchPets();
  }, []);

  const checkAuthAndFetchPets = async () => {
    try {
      // Check if user is authenticated
      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('Auth error:', userError);
        throw userError;
      }
      
      if (!currentUser) {
        console.log('No user found, redirecting to auth');
        toast({
          title: "Authentication Required",
          description: "Please log in to view your pets.",
          variant: "destructive",
        });
        navigate('/auth');
        return;
      }

      console.log('User authenticated:', currentUser.id);
      setUser(currentUser);
      
      // Fetch pets belonging to the authenticated user
      await fetchUserPets(currentUser.id);
    } catch (error) {
      console.error('Error checking auth:', error);
      toast({
        title: "Authentication Error",
        description: "Please log in to access your pets.",
        variant: "destructive",
      });
      navigate('/auth');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPets = async (userId: string) => {
    try {
      console.log('Fetching pets for user:', userId);
      
      // With RLS policies in place, this query will automatically only return
      // pets belonging to the authenticated user
      const { data, error } = await supabase
        .from('pet_profiles')
        .select('id, name, breed, age, profile_photo_url')
        .eq('user_id', userId) // Explicitly filter by user_id for clarity
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching pets:', error);
        toast({
          title: "Error",
          description: "Failed to load your pet profiles.",
          variant: "destructive",
        });
      } else {
        console.log('Fetched pets:', data);
        setPets(data || []);
      }
    } catch (error) {
      console.error('Unexpected error fetching pets:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while loading your pets.",
        variant: "destructive",
      });
    }
  };

  const handleDeletePet = async (petId: string) => {
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to delete pets.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('pet_profiles')
        .delete()
        .eq('id', petId);

      if (error) {
        console.error('Error deleting pet:', error);
        toast({
          title: "Error",
          description: "Failed to delete pet profile.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success!",
          description: "Pet profile deleted successfully!",
        });
        // Refresh the pet list
        await fetchUserPets(user.id);
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

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <PawPrint className="w-8 h-8 animate-spin mx-auto mb-4 text-green-600" />
            <p className="text-gray-600">Loading your pets...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <PawPrint className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">Authentication Required</h2>
            <p className="text-gray-600 mb-6">Please log in to view your pets.</p>
            <Button
              onClick={() => navigate('/auth')}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Log In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">My Pets</h1>
          <p className="text-gray-600">Manage your pet profiles and their adventures</p>
        </div>

        {pets.length === 0 ? (
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

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
          <div className="flex justify-center space-x-4">
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2"
            >
              <Home className="w-4 h-4" />
              <span>Dashboard</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleSignOut}
              className="flex items-center space-x-2 text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyPets;
