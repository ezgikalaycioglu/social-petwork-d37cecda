
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Plus, Heart, Eye, Edit, PawPrint, Users, MapPin } from 'lucide-react';
import Layout from '@/components/Layout';
import SocialFeed from '@/components/SocialFeed';
import type { Tables } from '@/integrations/supabase/types';

type PetProfile = Tables<'pet_profiles'>;

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { trackPageView, trackEvent } = useAnalytics();
  const [pets, setPets] = useState<PetProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => {
    // Track page view safely
    try {
      trackPageView('Dashboard', '/dashboard');
    } catch (error) {
      console.warn('Analytics tracking failed:', error);
    }
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

  const handleQuickAction = (action: string, path: string) => {
    try {
      trackEvent('Feature Accessed', {
        feature_name: action,
        source: 'dashboard_quick_actions',
      });
    } catch (error) {
      console.warn('Analytics tracking failed:', error);
    }
    navigate(path);
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
            <p className="text-gray-600 mt-1">Hello {userEmail}! Stay connected with the pet community.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Feed - Takes up 2/3 on large screens */}
            <div className="lg:col-span-2">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Community Feed</h2>
                <p className="text-gray-600">See what's happening in your pet network</p>
              </div>
              <SocialFeed />
            </div>

            {/* Sidebar - Takes up 1/3 on large screens */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card className="bg-white shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={() => handleQuickAction('Create Pet Profile', '/create-pet-profile')}
                    className="w-full justify-start bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Pet Profile
                  </Button>
                  
                  <Button
                    onClick={() => handleQuickAction('My Pets Dashboard', '/my-pets')}
                    variant="outline"
                    className="w-full justify-start border-blue-500 text-blue-600 hover:bg-blue-50"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    My Pets Dashboard
                  </Button>
                  
                  <Button
                    onClick={() => handleQuickAction('Events & Meetups', '/events')}
                    variant="outline"
                    className="w-full justify-start border-orange-500 text-orange-600 hover:bg-orange-50"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Events & Meetups
                  </Button>
                  
                  <Button
                    onClick={() => handleQuickAction('Pet Social Network', '/pet-social')}
                    variant="outline"
                    className="w-full justify-start border-purple-500 text-purple-600 hover:bg-purple-50"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Pet Social Network
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Pets */}
              {pets.length > 0 && (
                <Card className="bg-white shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      Your Pets
                      <Heart className="h-4 w-4 text-red-500" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {pets.map((pet) => (
                      <div key={pet.id} className="flex items-center space-x-3">
                        <Avatar className="w-12 h-12 border-2 border-green-200">
                          <AvatarImage src={pet.profile_photo_url || ''} alt={pet.name} />
                          <AvatarFallback className="bg-green-100 text-green-600">
                            {pet.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 truncate">{pet.name}</p>
                          <p className="text-sm text-gray-600 truncate">{pet.breed}</p>
                        </div>
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => navigate(`/edit-pet-profile/${pet.id}`)}
                          className="text-green-600 hover:bg-green-50"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    
                    <Button
                      onClick={() => navigate('/my-pets')}
                      variant="outline"
                      size="sm"
                      className="w-full mt-3"
                    >
                      View All Pets
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Welcome Message for New Users */}
              {pets.length === 0 && (
                <Card className="bg-white shadow-lg">
                  <CardContent className="p-6 text-center">
                    <PawPrint className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Get Started!</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Create your first pet profile to join the community.
                    </p>
                    <Button
                      onClick={() => handleQuickAction('Create Pet Profile', '/create-pet-profile')}
                      className="bg-green-600 hover:bg-green-700 text-white"
                      size="sm"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Create Pet Profile
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
