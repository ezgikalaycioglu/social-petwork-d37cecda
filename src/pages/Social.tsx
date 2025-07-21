import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { 
  Heart, 
  Calendar, 
  MapPin, 
  PawPrint,
  Plus,
  Users,
  Clock,
  Loader2
} from 'lucide-react';

// Import components from the individual pages
import DiscoverPets from '@/components/DiscoverPets';
import FriendRequests from '@/components/FriendRequests';
import PetFriendsList from '@/components/PetFriendsList';
import PlaydateRequestModal from '@/components/PlaydateRequestModal';
import GroupWalkModal from '@/components/GroupWalkModal';
import UpcomingPlaydates from '@/components/UpcomingPlaydates';
import InteractiveMap from '@/components/InteractiveMap';
import type { Tables } from '@/integrations/supabase/types';

type Event = Tables<'events'>;
type PetProfile = Tables<'pet_profiles'>;

const Social = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabFromUrl || 'pet-social');
  const [loading, setLoading] = useState(false);
  
  // Shared state
  const [pets, setPets] = useState<PetProfile[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Events state
  const [events, setEvents] = useState<Event[]>([]);
  const [showPlaydateModal, setShowPlaydateModal] = useState(false);
  const [showGroupWalkModal, setShowGroupWalkModal] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserPets();
      if (activeTab === 'events') {
        fetchUserEvents();
      }
    }
  }, [activeTab, user]);

  const fetchUserPets = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pet_profiles')
        .select('*')
        .eq('user_id', user.id)
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
    } finally {
      setLoading(false);
    }
  };

  const fetchUserEvents = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .or(`creator_id.eq.${user.id},participants.cs.{${user.id}}`)
        .order('scheduled_time', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    fetchUserPets();
    if (activeTab === 'events') {
      fetchUserEvents();
    }
  };

  const handleLocationPermissionChange = (granted: boolean) => {
    if (granted) {
      toast({
        title: "Location Enabled",
        description: "You can now find pets near you and share your location!",
      });
    } else {
      toast({
        title: "Location Disabled",
        description: "Enable location access for the full pet map experience.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const userPetIds = pets.map(pet => pet.id);
  const incomingRequests = events.filter(
    event => event.creator_id !== user?.id && event.status === 'pending'
  );
  const upcomingEvents = events.filter(
    event => event.status === 'confirmed' && new Date(event.scheduled_time) > new Date()
  );

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-border/50">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-foreground mb-2">
                🐾 Social
              </h1>
              <p className="text-xl text-muted-foreground">
                Connect, discover, and share with the pet community
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="-mx-4 w-[calc(100%+2rem)] min-h-[320px] grid grid-cols-1 grid-rows-3 gap-x-4 gap-y-12 bg-white rounded-2xl p-6 shadow-sm md:mx-0 md:w-full md:grid-cols-3 md:grid-rows-1 md:gap-x-2 md:gap-y-0 md:min-h-[96px] md:p-4">{/* Increased mobile height and spacing */}
              <TabsTrigger
                value="pet-social"
                className="h-12 flex items-center justify-center rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-base"
              >
                <Heart className="w-5 h-5 mr-2" />
                Pet Social
              </TabsTrigger>
              <TabsTrigger 
                value="events"
                className="h-12 flex items-center justify-center rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-base"
              >
                <Calendar className="w-5 h-5 mr-2" />
                Events
              </TabsTrigger>
              <TabsTrigger 
                value="pet-map"
                className="h-12 flex items-center justify-center rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-base"
              >
                <MapPin className="w-5 h-5 mr-2" />
                Pet Map
              </TabsTrigger>
            </TabsList>

            {/* Pet Social Tab */}
            <TabsContent value="pet-social" className="space-y-6">
              {loading ? (
                <div className="text-center py-12">
                  <PawPrint className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                  <p className="text-muted-foreground">Loading pet social features...</p>
                </div>
              ) : pets.length === 0 ? (
                <Card className="bg-white/80 backdrop-blur-sm border-0">
                  <CardContent className="text-center py-12">
                    <PawPrint className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      No pets yet!
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Create a pet profile first to start making friends.
                    </p>
                    <Button
                      onClick={() => navigate('/create-pet-profile')}
                      className="bg-primary hover:bg-primary/90"
                    >
                      Create Pet Profile
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-8">
                  {/* Discover Pets Section */}
                  <DiscoverPets 
                    userPetIds={userPetIds} 
                    onFriendRequestSent={handleRefresh}
                  />

                  {/* Friends Lists for Each Pet */}
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-foreground">Your Pets' Friends</h2>
                    
                    {/* Friend Requests Section */}
                    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm">
                      <CardContent className="p-4">
                        <FriendRequests 
                          key={`requests-${refreshKey}`}
                          userPetIds={userPetIds} 
                          onRequestHandled={handleRefresh}
                        />
                      </CardContent>
                    </Card>

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
            </TabsContent>

            {/* Events Tab */}
            <TabsContent value="events" className="space-y-6">
              {pets.length === 0 ? (
                <Card className="bg-white/80 backdrop-blur-sm border-0">
                  <CardContent className="text-center py-12">
                    <PawPrint className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      No pets found!
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      You need to create a pet profile before you can schedule playdates or group walks.
                    </p>
                    <Button
                      onClick={() => navigate('/create-pet-profile')}
                      className="bg-primary hover:bg-primary/90"
                    >
                      Create Pet Profile
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {/* Upcoming Playdates */}
                  <UpcomingPlaydates />

                  {/* Quick Actions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button
                      onClick={() => setShowGroupWalkModal(true)}
                      className="bg-primary hover:bg-primary/90 h-16 text-lg"
                    >
                      <Plus className="w-6 h-6 mr-2" />
                      Create Group Walk
                    </Button>
                    <Button
                      onClick={() => setActiveTab('pet-social')}
                      variant="outline"
                      className="h-16 text-lg border-primary text-primary hover:bg-primary/5"
                    >
                      <Users className="w-6 h-6 mr-2" />
                      Find Pets for Playdates
                    </Button>
                  </div>

                  {/* Event Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm">
                      <CardContent className="p-6 text-center">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Heart className="w-6 h-6 text-red-500" />
                        </div>
                        <h3 className="font-semibold text-foreground mb-1">
                          {incomingRequests.length}
                        </h3>
                        <p className="text-sm text-muted-foreground">Incoming Requests</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm">
                      <CardContent className="p-6 text-center">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Calendar className="w-6 h-6 text-green-500" />
                        </div>
                        <h3 className="font-semibold text-foreground mb-1">
                          {upcomingEvents.length}
                        </h3>
                        <p className="text-sm text-muted-foreground">Upcoming Events</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm">
                      <CardContent className="p-6 text-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Clock className="w-6 h-6 text-blue-500" />
                        </div>
                        <h3 className="font-semibold text-foreground mb-1">
                          {events.filter(e => e.creator_id === user?.id && e.status === 'pending').length}
                        </h3>
                        <p className="text-sm text-muted-foreground">Pending Sent</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* View Full Events */}
                  <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm">
                    <CardContent className="p-6">
                      <div className="text-center">
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                          Manage All Events
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          View detailed event history, manage requests, and track upcoming playdates
                        </p>
                        <Button
                          onClick={() => navigate('/events')}
                          variant="outline"
                          className="border-primary text-primary hover:bg-primary/5"
                        >
                          View Full Events Page
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            {/* Pet Map Tab */}
            <TabsContent value="pet-map" className="space-y-6">
              {pets.length === 0 ? (
                <Card className="bg-white/80 backdrop-blur-sm border-0">
                  <CardContent className="text-center py-12">
                    <PawPrint className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      No pets yet!
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Create a pet profile first to use the pet map.
                    </p>
                    <Button
                      onClick={() => navigate('/create-pet-profile')}
                      className="bg-primary hover:bg-primary/90"
                    >
                      Create Pet Profile
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {/* Privacy Notice */}
                  <Card className="bg-blue-50/80 border-blue-200 backdrop-blur-sm">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-white text-xs font-bold">i</span>
                        </div>
                        <div>
                          <h3 className="font-medium text-blue-900 mb-1">Privacy Notice</h3>
                          <p className="text-sm text-blue-800">
                            Your location will only be shared with others when you toggle "Ready to Play" ON. 
                            You can turn it off anytime to stop sharing your location.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Interactive Map */}
                  <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm overflow-hidden">
                    <CardContent className="p-0">
                      <InteractiveMap 
                        userPets={pets}
                        onLocationPermissionChange={handleLocationPermissionChange}
                        showLocationToasts={true}
                      />
                    </CardContent>
                  </Card>

                  {/* Instructions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="bg-green-50/80 border-green-200 backdrop-blur-sm">
                      <CardContent className="p-4">
                        <h3 className="font-medium text-green-900 mb-2">🟢 Ready to Play</h3>
                        <p className="text-sm text-green-800">
                          Toggle this ON to share your location and appear on the map for other pet owners to see.
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-orange-50/80 border-orange-200 backdrop-blur-sm">
                      <CardContent className="p-4">
                        <h3 className="font-medium text-orange-900 mb-2">🐾 Find Friends</h3>
                        <p className="text-sm text-orange-800">
                          Click on pet markers to see their profiles and connect with nearby pet owners.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Modals */}
      <PlaydateRequestModal
        isOpen={showPlaydateModal}
        onClose={() => setShowPlaydateModal(false)}
        onSuccess={handleRefresh}
        userPets={pets}
      />

      <GroupWalkModal
        isOpen={showGroupWalkModal}
        onClose={() => setShowGroupWalkModal(false)}
        onSuccess={handleRefresh}
        userId={user?.id || ''}
      />
    </Layout>
  );
};

export default Social;