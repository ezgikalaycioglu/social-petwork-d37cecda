
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, MapPin, Plus, Users, Heart, PawPrint } from 'lucide-react';
import Layout from '@/components/Layout';
import PageHeader from '@/components/PageHeader';
import PlaydateRequestModal from '@/components/PlaydateRequestModal';
import GroupWalkModal from '@/components/GroupWalkModal';
import type { Tables } from '@/integrations/supabase/types';

type Event = Tables<'events'>;
type PetProfile = Tables<'pet_profiles'>;

const Events = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [userPets, setUserPets] = useState<PetProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>('');
  const [showPlaydateModal, setShowPlaydateModal] = useState(false);
  const [showGroupWalkModal, setShowGroupWalkModal] = useState(false);

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

      setUserId(user.id);
      await Promise.all([
        fetchUserPets(user.id),
        fetchUserEvents(user.id)
      ]);
    } catch (error) {
      console.error('Error checking auth:', error);
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
        .eq('user_id', userId);

      if (error) throw error;
      setUserPets(data || []);
    } catch (error) {
      console.error('Error fetching pets:', error);
    }
  };

  const fetchUserEvents = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .or(`creator_id.eq.${userId},participants.cs.{${userId}}`)
        .order('scheduled_time', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleAcceptRequest = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('events')
        .update({ status: 'confirmed' })
        .eq('id', eventId);

      if (error) throw error;

      await fetchUserEvents(userId);
      toast({
        title: "Request Accepted",
        description: "The playdate has been confirmed!",
      });
    } catch (error) {
      console.error('Error accepting request:', error);
      toast({
        title: "Error",
        description: "Failed to accept the request.",
        variant: "destructive",
      });
    }
  };

  const handleDeclineRequest = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('events')
        .update({ status: 'declined' })
        .eq('id', eventId);

      if (error) throw error;

      await fetchUserEvents(userId);
      toast({
        title: "Request Declined",
        description: "The playdate request has been declined.",
      });
    } catch (error) {
      console.error('Error declining request:', error);
      toast({
        title: "Error",
        description: "Failed to decline the request.",
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

  const incomingRequests = events.filter(
    event => event.creator_id !== userId && event.status === 'pending'
  );

  const outgoingRequests = events.filter(
    event => event.creator_id === userId && event.status === 'pending'
  );

  const upcomingEvents = events.filter(
    event => event.status === 'confirmed' && new Date(event.scheduled_time) > new Date()
  );

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <PawPrint className="w-8 h-8 animate-spin mx-auto mb-4 text-green-600" />
            <p className="text-gray-600">Loading your events...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <PageHeader
        title="My Events"
        subtitle="Manage your playdates and group walks"
        icon={<Calendar className="w-6 h-6 text-primary" />}
        actions={
          userPets.length > 0 && (
            <Button
              onClick={() => setShowGroupWalkModal(true)}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Group Walk
            </Button>
          )
        }
      />

      <div className="bg-background min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <Button
                onClick={() => setShowGroupWalkModal(true)}
                className="bg-primary hover:bg-primary/90 h-16 text-lg"
                disabled={userPets.length === 0}
              >
                <Plus className="w-6 h-6 mr-2" />
                Create Group Walk
              </Button>
              <Button
                onClick={() => navigate('/pet-social')}
                variant="outline"
                className="h-16 text-lg"
              >
                <Users className="w-6 h-6 mr-2" />
                Find Pets for Playdates
              </Button>
            </div>

            {userPets.length === 0 ? (
              <Card className="shadow-lg">
                <CardContent className="p-12 text-center">
                  <PawPrint className="w-16 h-16 mx-auto mb-6 text-muted-foreground" />
                  <h2 className="text-2xl font-semibold text-foreground mb-4">No pets found!</h2>
                  <p className="text-muted-foreground mb-8">
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
            <Tabs defaultValue="incoming" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="incoming" className="relative">
                  Incoming Requests
                  {incomingRequests.length > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                      {incomingRequests.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="outgoing">
                  Outgoing Requests
                  {outgoingRequests.length > 0 && (
                    <span className="ml-2 bg-blue-500 text-white text-xs rounded-full px-2 py-1">
                      {outgoingRequests.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="upcoming">
                  Upcoming Events
                  {upcomingEvents.length > 0 && (
                    <span className="ml-2 bg-green-500 text-white text-xs rounded-full px-2 py-1">
                      {upcomingEvents.length}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="incoming" className="space-y-4">
                {incomingRequests.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Heart className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-600">No incoming requests</p>
                    </CardContent>
                  </Card>
                ) : (
                  incomingRequests.map((event) => (
                    <Card key={event.id} className="bg-white shadow-lg">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          {event.event_type === 'playdate' ? '🐕 Playdate Request' : '🚶 Group Walk Invitation'}
                        </CardTitle>
                        <CardDescription>
                          {event.event_type === 'playdate' ? 'Someone wants to arrange a playdate' : 'You\'re invited to a group walk'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(event.scheduled_time)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="w-4 h-4" />
                            <span>{formatTime(event.scheduled_time)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4" />
                            <span>{event.location_name}</span>
                          </div>
                          {event.message && (
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <p className="text-sm text-gray-700">"{event.message}"</p>
                            </div>
                          )}
                          {event.title && (
                            <div>
                              <h4 className="font-semibold text-gray-800">{event.title}</h4>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button
                            onClick={() => handleAcceptRequest(event.id)}
                            className="bg-green-600 hover:bg-green-700 text-white flex-1"
                          >
                            Accept
                          </Button>
                          <Button
                            onClick={() => handleDeclineRequest(event.id)}
                            variant="outline"
                            className="border-red-500 text-red-600 hover:bg-red-50 flex-1"
                          >
                            Decline
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="outgoing" className="space-y-4">
                {outgoingRequests.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-600">No pending requests</p>
                    </CardContent>
                  </Card>
                ) : (
                  outgoingRequests.map((event) => (
                    <Card key={event.id} className="bg-white shadow-lg">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          {event.event_type === 'playdate' ? '🐕 Playdate Request' : '🚶 Group Walk'}
                          <span className="text-sm font-normal text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
                            Pending
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(event.scheduled_time)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="w-4 h-4" />
                            <span>{formatTime(event.scheduled_time)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4" />
                            <span>{event.location_name}</span>
                          </div>
                          {event.title && (
                            <div>
                              <h4 className="font-semibold text-gray-800">{event.title}</h4>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="upcoming" className="space-y-4">
                {upcomingEvents.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-600">No upcoming events</p>
                    </CardContent>
                  </Card>
                ) : (
                  upcomingEvents.map((event) => (
                    <Card key={event.id} className="bg-white shadow-lg">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          {event.event_type === 'playdate' ? '🐕 Confirmed Playdate' : '🚶 Group Walk'}
                          <span className="text-sm font-normal text-green-600 bg-green-100 px-2 py-1 rounded">
                            Confirmed
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(event.scheduled_time)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="w-4 h-4" />
                            <span>{formatTime(event.scheduled_time)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4" />
                            <span>{event.location_name}</span>
                          </div>
                          {event.title && (
                            <div>
                              <h4 className="font-semibold text-gray-800">{event.title}</h4>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
            </Tabs>
            )}
          </div>
        </div>
      </div>

      <PlaydateRequestModal
        isOpen={showPlaydateModal}
        onClose={() => setShowPlaydateModal(false)}
        onSuccess={() => fetchUserEvents(userId)}
        userPets={userPets}
      />

      <GroupWalkModal
        isOpen={showGroupWalkModal}
        onClose={() => setShowGroupWalkModal(false)}
        onSuccess={() => fetchUserEvents(userId)}
        userId={userId}
      />
    </Layout>
  );
};

export default Events;
