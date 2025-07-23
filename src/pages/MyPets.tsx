
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
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Heart, 
  Users, 
  MapPin,
  Calendar,
  Star,
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
  is_available: boolean | null;
}

const MyPets = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pets, setPets] = useState<PetProfile[]>([]);
  const [filteredPets, setFilteredPets] = useState<PetProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    checkAuthAndFetchPets();
  }, []);

  useEffect(() => {
    const filtered = pets.filter(pet =>
      pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pet.breed.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPets(filtered);
  }, [pets, searchTerm]);

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

      setPets(data || []);
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
      <div className="min-h-screen bg-background font-sans tracking-tighter leading-relaxed">
        {/* Hero Header */}
        <div className="bg-gradient-to-br from-primary-light via-accent-light to-coral-light border-b border-border/50">
          <div className="max-w-7xl mx-auto px-8 py-16">
            <div className="text-center space-y-6">
              <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-2xl shadow-sm">
                <PawPrint className="w-8 h-8 text-primary" />
                <h1 className="text-4xl font-bold text-foreground">My Pet Family</h1>
              </div>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Manage your furry friends and connect with the pet community
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-8 py-12">
          {/* Search & Actions Bar */}
          <div className="flex flex-col sm:flex-row gap-6 items-center justify-between mb-12">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                type="text"
                placeholder="Search your pets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-14 text-lg rounded-2xl border-2 bg-white shadow-sm focus:shadow-md transition-all duration-300"
              />
            </div>

            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
              <DialogTrigger asChild>
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary-hover text-primary-foreground px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <Plus className="w-5 h-5 mr-2" />
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
          {filteredPets.length === 0 && !loading ? (
            <div className="text-center py-24">
              <div className="max-w-md mx-auto space-y-6">
                <div className="relative">
                  <div className="w-32 h-32 mx-auto bg-gradient-to-br from-primary-light to-accent-light rounded-full flex items-center justify-center shadow-lg">
                    <PawPrint className="w-16 h-16 text-primary" />
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-foreground">No pets yet!</h3>
                  <p className="text-muted-foreground">
                    {searchTerm ? 'No pets match your search.' : 'Create your first pet profile to get started.'}
                  </p>
                </div>
                {!searchTerm && (
                  <Button 
                    onClick={() => setShowCreateModal(true)}
                    size="lg"
                    className="bg-primary hover:bg-primary-hover text-primary-foreground px-8 py-4 rounded-2xl shadow-lg"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Create Pet Profile
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredPets.map((pet) => (
                <Card 
                  key={pet.id} 
                  className="group bg-white hover:shadow-2xl transition-all duration-500 rounded-2xl border-2 border-border/50 hover:border-primary/20 overflow-hidden transform hover:scale-105"
                >
                  <CardHeader className="p-0 relative">
                    <div className="aspect-square relative overflow-hidden rounded-t-2xl bg-gradient-to-br from-primary-light to-accent-light">
                      {pet.profile_photo_url ? (
                        <img 
                          src={pet.profile_photo_url} 
                          alt={pet.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <PawPrint className="w-16 h-16 text-primary opacity-50" />
                        </div>
                      )}
                      
                      {/* Status Badge */}
                      <div className="absolute top-4 right-4">
                        <Badge 
                          variant={pet.is_available ? "default" : "secondary"}
                          className={`${
                            pet.is_available 
                              ? 'bg-accent text-accent-foreground' 
                              : 'bg-muted text-muted-foreground'
                          } rounded-full px-3 py-1 shadow-lg`}
                        >
                          {pet.is_available ? 'Available' : 'Busy'}
                        </Badge>
                      </div>

                      {/* Quick Action Overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => navigate(`/pet-adventures/${pet.id}`)}
                          className="bg-white/90 hover:bg-white text-foreground rounded-xl shadow-lg"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => navigate(`/edit-pet-profile/${pet.id}`)}
                          className="bg-white/90 hover:bg-white text-foreground rounded-xl shadow-lg"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="secondary"
                              className="bg-white/90 hover:bg-white text-coral rounded-xl shadow-lg"
                            >
                              <Trash2 className="w-4 h-4" />
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
                                className="bg-coral hover:bg-coral-hover text-coral-foreground rounded-xl"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-foreground">{pet.name}</h3>
                        <div className="flex items-center gap-1 text-coral">
                          <Heart className="w-4 h-4 fill-current" />
                          <span className="text-sm font-medium">{pet.boop_count || 0}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-muted-foreground font-medium">{pet.breed}</p>
                        {pet.age && (
                          <p className="text-sm text-muted-foreground">{pet.age} years old</p>
                        )}
                        {pet.gender && (
                          <p className="text-sm text-muted-foreground capitalize">{pet.gender}</p>
                        )}
                      </div>
                    </div>

                    {/* Personality Traits */}
                    {pet.personality_traits && pet.personality_traits.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Personality</p>
                        <div className="flex flex-wrap gap-1">
                          {pet.personality_traits.slice(0, 3).map((trait, index) => (
                            <Badge 
                              key={index} 
                              variant="outline" 
                              className="text-xs rounded-full border-primary/20 text-primary"
                            >
                              {trait}
                            </Badge>
                          ))}
                          {pet.personality_traits.length > 3 && (
                            <Badge variant="outline" className="text-xs rounded-full border-muted text-muted-foreground">
                              +{pet.personality_traits.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Vaccination Status */}
                    {pet.vaccination_status && (
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-accent" />
                        <span className="text-sm text-muted-foreground capitalize">{pet.vaccination_status} vaccinated</span>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        onClick={() => navigate(`/pet-adventures/${pet.id}`)}
                        className="flex-1 bg-accent hover:bg-accent-hover text-accent-foreground rounded-xl"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/edit-pet-profile/${pet.id}`)}
                        className="flex-1 rounded-xl border-primary/20 text-primary hover:bg-primary-light"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Quick Stats */}
          {pets.length > 0 && (
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-primary-light to-primary/10 border-primary/20 rounded-2xl p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                    <PawPrint className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{pets.length}</p>
                    <p className="text-sm text-muted-foreground">Total Pets</p>
                  </div>
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-accent-light to-accent/10 border-accent/20 rounded-2xl p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center">
                    <Heart className="w-6 h-6 text-accent-foreground" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {pets.reduce((sum, pet) => sum + (pet.boop_count || 0), 0)}
                    </p>
                    <p className="text-sm text-muted-foreground">Total Boops</p>
                  </div>
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-coral-light to-coral/10 border-coral/20 rounded-2xl p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-coral rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-coral-foreground" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {pets.filter(pet => pet.is_available).length}
                    </p>
                    <p className="text-sm text-muted-foreground">Available for Play</p>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default MyPets;
