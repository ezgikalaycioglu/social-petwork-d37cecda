import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
  ChevronDown
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import SegmentedControl from '@/components/SegmentedControl';
import DiscoverPets from '@/components/DiscoverPets';
import FriendRequests from '@/components/FriendRequests';
import PetFriendsList from '@/components/PetFriendsList';
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
        .neq('status', 'cancelled')
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
    // Location permission changes are handled by the icon tooltip on mobile
    // No toasts needed here
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

  const segmentedItems = [
    { value: 'pet-social', label: 'Social', icon: Heart },
    { value: 'events', label: 'Events', icon: Calendar },
    { value: 'pet-map', label: 'Pet Map', icon: MapPin },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Segmented Control - sticky under global app bar */}
        <div className="mt-2">
          <SegmentedControl
            items={segmentedItems}
            value={activeTab}
            onChange={setActiveTab}
          />
        </div>

        {/* Main Content */}
        <div className="px-4">
        {/* Pet Social Tab */}
        {activeTab === 'pet-social' && (
          <div className="space-y-4 mt-4">
            {loading ? (
              <div className="text-center py-12">
                <PawPrint className="w-6 h-6 animate-spin mx-auto mb-3 text-primary" />
                <p className="text-sm text-muted-foreground">Loading...</p>
              </div>
            ) : pets.length === 0 ? (
              <Card className="rounded-2xl bg-white border border-gray-100 shadow-sm mt-4">
                <CardContent className="text-center py-10 p-4">
                  <div className="text-4xl mb-3">🐾</div>
                  <h3 className="text-base font-semibold mb-2">No pets yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create a pet profile to start making friends
                  </p>
                  <Button
                    onClick={() => navigate('/create-pet-profile')}
                    size="sm"
                    className="h-9"
                  >
                    Create Pet Profile
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Discover Pets Section */}
                <DiscoverPets 
                  userPetIds={userPetIds} 
                  onFriendRequestSent={handleRefresh}
                />

                {/* Friends Section */}
                <div className="space-y-3 mt-4">
                  <h2 className="text-base font-semibold px-1">Your Pets' Friends</h2>
                  
                  {/* Friend Requests - Collapsible */}
                  <FriendRequests 
                    key={`requests-${refreshKey}`}
                    userPetIds={userPetIds} 
                    onRequestHandled={handleRefresh}
                  />

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
              </>
            )}
          </div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div className="space-y-4 mt-4">
            {pets.length === 0 ? (
              <Card className="rounded-2xl bg-white border border-gray-100 shadow-sm">
                <CardContent className="text-center py-10 p-4">
                  <div className="text-4xl mb-3">🐾</div>
                  <h3 className="text-base font-semibold mb-2">No pets found</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create a pet profile to schedule events
                  </p>
                  <Button
                    onClick={() => navigate('/create-pet-profile')}
                    size="sm"
                    className="h-9"
                  >
                    Create Pet Profile
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Upcoming Playdates */}
                <UpcomingPlaydates />

                {/* Event Summary Stats */}
                <div className="grid grid-cols-3 gap-2 my-2">
                  <Card className="rounded-xl bg-white border border-gray-100 shadow-sm">
                    <CardContent className="p-3 text-center">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-1.5">
                        <Heart className="w-4 h-4 text-red-500" />
                      </div>
                      <h3 className="text-lg font-semibold mb-0.5">
                        {incomingRequests.length}
                      </h3>
                      <p className="text-xs text-muted-foreground">Requests</p>
                    </CardContent>
                  </Card>

                  <Card className="rounded-xl bg-white border border-gray-100 shadow-sm">
                    <CardContent className="p-3 text-center">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-1.5">
                        <Calendar className="w-4 h-4 text-green-500" />
                      </div>
                      <h3 className="text-lg font-semibold mb-0.5">
                        {upcomingEvents.length}
                      </h3>
                      <p className="text-xs text-muted-foreground">Upcoming</p>
                    </CardContent>
                  </Card>

                  <Card className="rounded-xl bg-white border border-gray-100 shadow-sm">
                    <CardContent className="p-3 text-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-1.5">
                        <Clock className="w-4 h-4 text-blue-500" />
                      </div>
                      <h3 className="text-lg font-semibold mb-0.5">
                        {events.filter(e => e.creator_id === user?.id && e.status === 'pending').length}
                      </h3>
                      <p className="text-xs text-muted-foreground">Pending</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Manage All Events */}
                <Card className="rounded-xl bg-white border border-gray-100 shadow-sm">
                  <CardContent className="p-3 flex items-center justify-between">
                    <div className="text-left">
                      <h3 className="text-sm font-semibold text-gray-900">
                        Manage All Events
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        View history & manage requests
                      </p>
                    </div>
                    <Button
                      onClick={() => navigate('/events')}
                      variant="outline"
                      size="sm"
                      className="h-8 px-3 rounded-full"
                    >
                      View All
                    </Button>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        )}

        {/* Pet Map Tab */}
        {activeTab === 'pet-map' && (
          <div className="space-y-4 mt-4">
            {pets.length === 0 ? (
              <Card className="rounded-2xl bg-white border border-gray-100 shadow-sm">
                <CardContent className="text-center py-10 p-4">
                  <div className="text-4xl mb-3">🐾</div>
                  <h3 className="text-base font-semibold mb-2">No pets yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create a pet profile to use the map
                  </p>
                  <Button
                    onClick={() => navigate('/create-pet-profile')}
                    size="sm"
                    className="h-9"
                  >
                    Create Pet Profile
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Privacy Notice */}
                <Card className="rounded-2xl bg-blue-50 border border-blue-200">
                  <CardContent className="p-3">
                    <Collapsible>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="w-full justify-between h-9 px-3 text-blue-900 hover:bg-blue-100/50">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-bold">i</span>
                            </div>
                            <span className="text-sm font-medium">Privacy Notice</span>
                          </div>
                          <ChevronDown className="h-3.5 w-3.5" />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="pt-3">
                        <p className="text-xs text-blue-800 leading-relaxed">
                          Your location is only shared when "Ready to Play" is ON. You can turn it off anytime.
                        </p>
                      </CollapsibleContent>
                    </Collapsible>
                  </CardContent>
                </Card>

                {/* Interactive Map */}
                <Card className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
                  <CardContent className="p-0">
                    <InteractiveMap 
                      userPets={pets}
                      onLocationPermissionChange={handleLocationPermissionChange}
                      showLocationToasts={true}
                    />
                  </CardContent>
                </Card>

                {/* Instructions */}
                <div className="grid grid-cols-2 gap-3">
                  <Card className="rounded-2xl bg-white border border-gray-100 shadow-sm">
                    <CardContent className="p-4 text-center">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <PawPrint className="w-5 h-5 text-green-500" />
                      </div>
                      <h3 className="text-sm font-semibold mb-1">Ready to Play</h3>
                      <p className="text-xs text-muted-foreground">Toggle to show location</p>
                    </CardContent>
                  </Card>
                  <Card className="rounded-2xl bg-white border border-gray-100 shadow-sm">
                    <CardContent className="p-4 text-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Users className="w-5 h-5 text-blue-500" />
                      </div>
                      <h3 className="text-sm font-semibold mb-1">Find Friends</h3>
                      <p className="text-xs text-muted-foreground">Search nearby pets</p>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </div>
        )}
      </div>

        {/* Modals */}
        <GroupWalkModal
          isOpen={showGroupWalkModal}
          onClose={() => setShowGroupWalkModal(false)}
          onSuccess={handleRefresh}
          userId={user?.id || ''}
          userPets={pets}
        />
      </div>
    </Layout>
  );
};

export default Social;