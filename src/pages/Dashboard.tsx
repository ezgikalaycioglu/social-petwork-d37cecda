import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Plus, Heart, Eye, Edit, PawPrint, Users, MapPin, Send } from 'lucide-react';
import Layout from '@/components/Layout';
import SocialFeed from '@/components/SocialFeed';
import { TweetFeed } from '@/components/TweetFeed';
import UpcomingPlaydates from '@/components/UpcomingPlaydates';
import { AICoach } from '@/components/AICoach';
import { CreateTweetModal } from '@/components/CreateTweetModal';
import CreatePetProfileForm from '@/components/CreatePetProfileForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { handleAuthError } from '@/utils/authErrorHandler';
import QuickTour from '@/components/QuickTour';
import type { Tables } from '@/integrations/supabase/types';

type PetProfile = Tables<'pet_profiles'>;

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { trackPageView, trackEvent } = useAnalytics();
  const [pets, setPets] = useState<PetProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string>('');
  const [isCreateTweetModalOpen, setIsCreateTweetModalOpen] = useState(false);
  const [isCreatePetModalOpen, setIsCreatePetModalOpen] = useState(false);
  const [tweetFeedKey, setTweetFeedKey] = useState(0);
  const [showQuickTour, setShowQuickTour] = useState(false);
  const [tourCompleted, setTourCompleted] = useState(false);

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
      await checkTourStatus(user.id);

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

  const checkTourStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('tour_completed')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error checking tour status:', error);
        return;
      }

      const completed = data?.tour_completed || false;
      setTourCompleted(completed);
      setShowQuickTour(!completed);
    } catch (error) {
      console.error('Error checking tour status:', error);
    }
  };

  const handleTourComplete = () => {
    setShowQuickTour(false);
    setTourCompleted(true);
  };

  const handleTourSkip = () => {
    setShowQuickTour(false);
    setTourCompleted(true);
  };

  const handleTweetCreated = () => {
    setTweetFeedKey(prev => prev + 1); // Force refresh of tweet feed
  };

  const handlePetCreated = async () => {
    setIsCreatePetModalOpen(false);
    const { data } = await supabase.auth.getUser();
    if (data?.user) {
      await fetchPets(data.user.id);
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
      {showQuickTour && (
        <QuickTour
          onComplete={handleTourComplete}
          onSkip={handleTourSkip}
        />
      )}
      <div className="min-h-screen bg-background">
        {/* Upcoming Playdates */}
        <div className="bg-white border-b border-gray-100">
          <UpcomingPlaydates />
        </div>

        {/* Main Content */}
        <div className="px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Feed - Takes up 2/3 on large screens */}
            <div className="lg:col-span-2">
              <div className="mt-4 mb-2">
                <h2 className="text-lg font-semibold text-gray-900">Community Feed</h2>
              </div>
              
              <Tabs defaultValue="tweets" className="w-full">
                <TabsList className="h-9 grid w-full grid-cols-2 mb-3 rounded-full gap-2 bg-gray-100 p-1">
                  <TabsTrigger value="tweets" className="h-8 text-sm rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm">Pet Tweets</TabsTrigger>
                  <TabsTrigger value="feed" className="h-8 text-sm rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm">Activities</TabsTrigger>
                </TabsList>
                
                {pets.length > 0 && (
                  <Button
                    onClick={() => setIsCreateTweetModalOpen(true)}
                    className="w-full h-11 mb-4 rounded-full px-4 bg-primary hover:bg-primary/90 shadow-sm"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Create New Tweet
                  </Button>
                )}
                
                <TabsContent value="tweets">
                  <TweetFeed key={tweetFeedKey} />
                </TabsContent>
                
                <TabsContent value="feed">
                  <SocialFeed />
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar - Takes up 1/3 on large screens */}
            <div className="space-y-6">
              {/* AI Coach for existing pet owners */}
              {pets.length > 0 && (
                <AICoach 
                  petId={pets[0].id} 
                  petName={pets[0].name} 
                />
              )}

              {/* Welcome Message for New Users */}
              {pets.length === 0 && (
                <Card className="bg-white shadow-sm border border-gray-200">
                  <CardContent className="p-6 text-center">
                    <PawPrint className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Get Started!</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Create your first pet profile to join the community.
                    </p>
                    <Button
                      onClick={() => setIsCreatePetModalOpen(true)}
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

      <CreateTweetModal
        isOpen={isCreateTweetModalOpen}
        onClose={() => setIsCreateTweetModalOpen(false)}
        pets={pets}
        onTweetCreated={handleTweetCreated}
      />

      {/* Create Pet Profile Modal */}
      <Dialog open={isCreatePetModalOpen} onOpenChange={setIsCreatePetModalOpen}>
        <DialogContent className="h-[calc(100vh-2rem)] sm:max-h-[85vh] p-0 overflow-hidden gap-0 rounded-2xl">
          <CreatePetProfileForm onSuccess={handlePetCreated} showHeader={false} />
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Dashboard;
