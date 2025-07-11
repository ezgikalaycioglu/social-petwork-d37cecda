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
import PageHeader from '@/components/PageHeader';
import SocialFeed from '@/components/SocialFeed';
import UpcomingPlaydates from '@/components/UpcomingPlaydates';
import { handleAuthError } from '@/utils/authErrorHandler';
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
      setLoading(true);
      const { data, error: authError } = await supabase.auth.getUser(); 

      console.log("Auth response:", { data, authError });

      if (authError) {
        const authErrorHandled = await handleAuthError(authError, navigate);
        if (authErrorHandled.shouldSignOut) {
          return; // Exit early as user is being redirected
        }
      }

      if (!data?.user) {
        console.error('No user found');
        navigate('/auth');
        return;
      }

      const { user } = data;
      setUserEmail(user.email || '');
      await fetchPets(user.id);

    } catch (outerError) {
      console.error('Caught an unexpected error during auth/fetch process:', outerError);
      
      // Check if this is an auth error
      const authErrorHandled = await handleAuthError(outerError, navigate);
      
      if (!authErrorHandled.shouldSignOut) {
        // Only show generic error if it's not an auth error
        toast({
          title: "An Unexpected Error Occurred",
          description: "Please try logging in again.",
          variant: "destructive",
        });
        navigate('/auth');
      }
    } finally {
      setLoading(false); 
    }
  };

  const fetchPets = async (userId: string) => {
    console.log(userId);
    try {
      const { data, error } = await supabase
        .from('pet_profiles')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(3);
      
      console.log(data);
      
      if (error) {
        // Check for authentication errors in pet fetching
        const authErrorHandled = await handleAuthError(error, navigate);
        if (authErrorHandled.shouldSignOut) {
          return; // Exit early as user is being redirected
        }
        
        console.log("Failed fetching pets");
        throw error;
      }

      setPets(data || []);
      console.log("pets are set");
    } catch (error) {
      console.error('Error fetching pets:', error);
      
      // Double-check for auth errors
      const authErrorHandled = await handleAuthError(error, navigate);
      
      if (!authErrorHandled.shouldSignOut) {
        // Only show error toast if it's not an auth error
        toast({
          title: "Error",
          description: "Failed to load your pets.",
          variant: "destructive",
        });
      }
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
      <PageHeader
        title="Social Petwork"
        subtitle={`Hello ${userEmail}! Welcome back to your pet community.`}
        icon={<PawPrint className="w-6 h-6 text-primary" />}
        actions={
          <Button
            onClick={() => handleQuickAction('Create Pet Profile', '/create-pet-profile')}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Pet Profile
          </Button>
        }
      />

      {/* Upcoming Playdates Horizontal Scroller */}
      <div className="bg-background">
        <div className="container mx-auto">
          <div className="max-w-6xl mx-auto">
            <UpcomingPlaydates />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-background min-h-screen">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Feed - Takes up 2/3 on large screens */}
              <div className="lg:col-span-2">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-foreground mb-2">Community Feed</h2>
                  <p className="text-muted-foreground">See what's happening in your pet network</p>
                </div>
                <SocialFeed />
              </div>

              {/* Sidebar - Takes up 1/3 on large screens */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <Card className="shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      onClick={() => handleQuickAction('My Pets Dashboard', '/my-pets')}
                      variant="outline"
                      className="w-full justify-start"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      My Pets Dashboard
                    </Button>
                    
                    <Button
                      onClick={() => handleQuickAction('Events & Meetups', '/events')}
                      variant="outline"
                      className="w-full justify-start"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Events & Meetups
                    </Button>
                    
                    <Button
                      onClick={() => handleQuickAction('Pet Social Network', '/pet-social')}
                      variant="outline"
                      className="w-full justify-start"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Pet Social Network
                    </Button>
                  </CardContent>
                </Card>

                {/* Recent Pets */}
                {pets.length > 0 && (
                  <Card className="shadow-sm">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg flex items-center gap-2">
                        Your Pets
                        <Heart className="h-4 w-4 text-destructive" />
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {pets.map((pet) => (
                        <div key={pet.id} className="flex items-center space-x-3">
                          <Avatar className="w-12 h-12 border-2 border-primary/20">
                            <AvatarImage src={pet.profile_photo_url || ''} alt={pet.name} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {pet.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground truncate">{pet.name}</p>
                            <p className="text-sm text-muted-foreground truncate">{pet.breed}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Heart className="w-3 h-3 text-pink-400" />
                              <span className="text-xs text-muted-foreground">
                                {(pet.boop_count || 0).toLocaleString()} boops
                              </span>
                            </div>
                          </div>
                          
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => navigate(`/edit-pet-profile/${pet.id}`)}
                            className="text-primary hover:bg-primary/10"
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
                  <Card className="shadow-sm">
                    <CardContent className="p-6 text-center">
                      <PawPrint className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">Get Started!</h3>
                      <p className="text-muted-foreground text-sm mb-4">
                        Create your first pet profile to join the community.
                      </p>
                      <Button
                        onClick={() => handleQuickAction('Create Pet Profile', '/create-pet-profile')}
                        className="bg-primary hover:bg-primary/90"
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
      </div>
    </Layout>
  );
};

export default Dashboard;
