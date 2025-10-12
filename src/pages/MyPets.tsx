
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Heart, 
  Users, 
  PawPrint
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import Layout from '@/components/Layout';
import CreatePetProfileForm from '@/components/CreatePetProfileForm';

interface PetProfile {
  id: string;
  name: string;
  breed: string;
  age: number | null;
  gender: string | null;
  profile_photo_url: string | null;
  boop_count: number;
  personality_traits: string[] | null;
  vaccination_status: string | null;
  friend_count?: number;
}

const MyPets = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pets, setPets] = useState<PetProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    checkAuthAndFetchPets();
  }, []);

  const checkAuthAndFetchPets = async () => {
    try {
      setLoading(true);
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        console.error('Auth error:', error);
        navigate('/auth');
        return;
      }

      setUserId(user.id);
      await fetchUserPets(user.id);
    } catch (error) {
      console.error('Error during auth check:', error);
      toast({
        title: "Authentication Error",
        description: "Please sign in to view your pets.",
        variant: "destructive",
      });
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

      if (error) {
        throw error;
      }

      const pets = data || [];

      // Fetch friend counts for each pet
      const petsWithFriendCounts = await Promise.all(
        pets.map(async (pet) => {
          const { data: friendships, error: friendError } = await supabase
            .from('pet_friendships')
            .select('id')
            .or(`requester_pet_id.eq.${pet.id},recipient_pet_id.eq.${pet.id}`)
            .eq('status', 'accepted');

          if (friendError) {
            console.error('Error fetching friend count for pet:', pet.id, friendError);
            return { ...pet, friend_count: 0 };
          }

          return { ...pet, friend_count: friendships?.length || 0 };
        })
      );

      setPets(petsWithFriendCounts);
    } catch (error) {
      console.error('Error fetching pets:', error);
      toast({
        title: "Error",
        description: "Failed to load your pets. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeletePet = async (petId: string) => {
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
        description: "Failed to delete pet profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    if (userId) {
      fetchUserPets(userId);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center space-y-4">
            <PawPrint className="w-16 h-16 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground font-medium tracking-tighter">Loading your pets...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-2">
          {/* Header with Add Button */}
          <div className="flex items-center justify-end gap-2 mt-2 mb-2">
            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
              <DialogTrigger asChild>
                <Button 
                  className="h-10 px-4 rounded-full inline-flex items-center gap-2 bg-primary text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Add New Pet
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-center">Create New Pet Profile</DialogTitle>
                  <DialogDescription className="text-center text-muted-foreground">
                    Add a new furry friend to your family
                  </DialogDescription>
                </DialogHeader>
                <CreatePetProfileForm
                  onSuccess={handleCreateSuccess}
                  showHeader={false}
                />
              </DialogContent>
            </Dialog>
          </div>

          {/* Pet Grid */}
          {pets.length === 0 && !loading ? (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto space-y-4">
                <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                  <PawPrint className="w-10 h-10 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-base font-semibold">No pets yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Create your first pet profile to get started.
                  </p>
                </div>
                <Button 
                  onClick={() => setShowCreateModal(true)}
                  className="h-10 px-4 rounded-full inline-flex items-center gap-2 bg-primary text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Create Pet Profile
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {pets.map((pet) => (
                <Card 
                  key={pet.id} 
                  className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  <CardHeader className="p-0">
                    <div className="aspect-[16/9] relative overflow-hidden bg-gray-100">
                      {pet.profile_photo_url ? (
                        <img 
                          src={pet.profile_photo_url} 
                          alt={pet.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <PawPrint className="w-12 h-12 text-muted-foreground opacity-30" />
                        </div>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="p-4 space-y-3">
                    <div className="space-y-1">
                      <h3 className="text-base font-semibold truncate">{pet.name}</h3>
                      <p className="text-sm text-muted-foreground truncate">{pet.breed}</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => navigate(`/pet-adventures/${pet.id}`)}
                        className="flex-1 h-9 text-xs rounded-xl"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/edit-pet-profile/${pet.id}`)}
                        className="flex-1 h-9 text-xs rounded-xl"
                      >
                        <Edit className="w-3.5 h-3.5 mr-1" />
                        Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-9 w-9 p-0 rounded-xl border-red-200 text-red-600 hover:bg-red-50"
                            aria-label="Delete pet"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-2xl">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Pet Profile</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete {pet.name}'s profile? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeletePet(pet.id)}
                              className="bg-red-600 hover:bg-red-700 text-white rounded-xl"
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
          )}

          {/* Quick Stats */}
          {pets.length > 0 && (
            <div className="mt-4">
              <h2 className="text-base font-semibold mb-2 px-1">Quick Stats</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <Card className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
                  <div className="flex flex-col items-center text-center gap-2">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <PawPrint className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xl font-semibold">{pets.length}</p>
                      <p className="text-xs text-muted-foreground">Total Pets</p>
                    </div>
                  </div>
                </Card>

                <Card className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
                  <div className="flex flex-col items-center text-center gap-2">
                    <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
                      <Heart className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                      <p className="text-xl font-semibold">
                        {pets.reduce((sum, pet) => sum + (pet.boop_count || 0), 0)}
                      </p>
                      <p className="text-xs text-muted-foreground">Total Boops</p>
                    </div>
                  </div>
                </Card>

                <Card className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
                  <div className="flex flex-col items-center text-center gap-2">
                    <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-xl font-semibold">
                        {pets.reduce((sum, pet) => sum + (pet.friend_count || 0), 0)}
                      </p>
                      <p className="text-xs text-muted-foreground">Total Friends</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default MyPets;
