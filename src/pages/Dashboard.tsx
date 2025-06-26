import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Plus, Heart, Eye, Edit, PawPrint, Users, MapPin } from 'lucide-react';
import Layout from '@/components/Layout';
import type { Tables } from '@/integrations/supabase/types';

type PetProfile = Tables<'pet_profiles'>;

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pets, setPets] = useState<PetProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string>('');

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

      setUserEmail(user.email || '');
      await fetchPets(user.id);
    } catch (error) {
      console.error('Error checking auth:', error);
      navigate('/auth');
    } finally {
      setLoading(false);
    }
  };

  const fetchPets = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('pet_profiles')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(3); // Show only first 3 pets on dashboard

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
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <PawPrint className="w-8 h-8 animate-spin mx-auto mb-4 text-green-600" />
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              🐾 Welcome to Social Petwork
            </h1>
            <p className="text-gray-600 mt-1">Hello {userEmail}! Manage your pets and connect with other pet lovers.</p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-200 cursor-pointer" 
                  onClick={() => navigate('/create-pet-profile')}>
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle className="text-xl text-gray-800">Create Pet Profile</CardTitle>
                <CardDescription>Add a new furry friend to your collection</CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-200 cursor-pointer" 
                  onClick={() => navigate('/my-pets')}>
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Eye className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl text-gray-800">My Pets Dashboard</CardTitle>
                <CardDescription>View and manage all your pet profiles</CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-200 cursor-pointer" 
                  onClick={() => navigate('/events')}>
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-orange-600" />
                </div>
                <CardTitle className="text-xl text-gray-800">My Events</CardTitle>
                <CardDescription>Manage playdates and group walks</CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-200 cursor-pointer" 
                  onClick={() => navigate('/pet-social')}>
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
                <CardTitle className="text-xl text-gray-800">Pet Social Network</CardTitle>
                <CardDescription>Connect your pets with new friends</CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Recent Pets */}
          {pets.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  Your Recent Pets
                  <Heart className="h-5 w-5 text-red-500" />
                </h2>
                <Button
                  onClick={() => navigate('/my-pets')}
                  variant="outline"
                  className="border-green-500 text-green-600 hover:bg-green-50"
                >
                  View All Pets
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pets.map((pet) => (
                  <Card key={pet.id} className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-200">
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
                        </div>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/edit-pet-profile/${pet.id}`)}
                          className="border-green-500 text-green-600 hover:bg-green-50"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit Profile
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Welcome Message for New Users */}
          {pets.length === 0 && (
            <Card className="bg-white shadow-lg">
              <CardContent className="p-12 text-center">
                <PawPrint className="w-16 h-16 mx-auto mb-6 text-gray-400" />
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">Welcome to Social Petwork!</h2>
                <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                  You haven't created any pet profiles yet. Get started by creating your first pet profile 
                  and join our amazing pet community!
                </p>
                <Button
                  onClick={() => navigate('/create-pet-profile')}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Your First Pet Profile
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
