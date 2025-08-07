
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, MapPin, Plus, Users, Heart, PawPrint, Star, DollarSign } from 'lucide-react';
import Layout from '@/components/Layout';
import PlaydateRequestModal from '@/components/PlaydateRequestModal';
import GroupWalkModal from '@/components/GroupWalkModal';
import UpcomingPlaydates from '@/components/UpcomingPlaydates';
import EventDetailsModal from '@/components/EventDetailsModal';
import type { Tables } from '@/integrations/supabase/types';

type Event = Tables<'events'> & {
  event_responses?: Array<{
    user_id: string;
    response: string;
  }>;
};
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
  const [isMobile, setIsMobile] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
      // Get all events where user is creator or invited
      const { data: allEvents, error } = await supabase
        .from('events')
        .select('*')
        .or(`creator_id.eq.${userId},invited_participants.cs.{${userId}}`)
        .order('scheduled_time', { ascending: true });

      if (error) throw error;

      // Get user's responses to events
      const { data: userResponses, error: responsesError } = await supabase
        .from('event_responses')
        .select('*')
        .eq('user_id', userId);

      if (responsesError) throw responsesError;

      // Combine events with user responses
      const eventsWithResponses = (allEvents || []).map(event => {
        const userResponse = (userResponses || []).find(r => r.event_id === event.id);
        return {
          ...event,
          event_responses: userResponse ? [userResponse] : []
        };
      });

      console.log('Fetched events with responses:', eventsWithResponses);
      setEvents(eventsWithResponses as Event[]);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleAcceptRequest = async (eventId: string) => {
    try {
      // Update user's response to accepted
      const { error: responseError } = await supabase
        .from('event_responses')
        .upsert({
          event_id: eventId,
          user_id: userId,
          response: 'accepted'
        });

      if (responseError) throw responseError;

      await fetchUserEvents(userId);
      toast({
        title: "Request Accepted",
        description: "You've accepted this invitation!",
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
      // Update user's response to declined
      const { error: responseError } = await supabase
        .from('event_responses')
        .upsert({
          event_id: eventId,
          user_id: userId,
          response: 'declined'
        });

      if (responseError) throw responseError;

      await fetchUserEvents(userId);
      toast({
        title: "Request Declined",
        description: "You've declined this invitation.",
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

  // Helper function to get user's response to an event
  const getUserResponse = (event: Event) => {
    const userResponse = event.event_responses?.find((response: any) => response.user_id === userId);
    return userResponse?.response || 'pending';
  };

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setIsEventModalOpen(true);
  };

  const handleEventModalClose = () => {
    setIsEventModalOpen(false);
    setSelectedEvent(null);
  };

  const handleEventUpdate = () => {
    fetchUserEvents(userId);
  };

  const incomingRequests = events.filter(event => {
    // Events where user is invited (not creator) and has pending response
    const isInvited = event.invited_participants?.includes(userId);
    const isNotCreator = event.creator_id !== userId;
    const response = getUserResponse(event);
    const isInFuture = new Date(event.scheduled_time) > new Date();
    
    return isInvited && isNotCreator && response === 'pending' && isInFuture;
  });

  const outgoingRequests = events.filter(event => {
    const isCreator = event.creator_id === userId;
    const hasInvitations = event.invited_participants && event.invited_participants.length > 0;
    const isInFuture = new Date(event.scheduled_time) > new Date();
    
    return isCreator && hasInvitations && isInFuture;
  });

  const upcomingEvents = events.filter(event => {
    const isInFuture = new Date(event.scheduled_time) > new Date();
    const userAccepted = getUserResponse(event) === 'accepted';
    const isCreator = event.creator_id === userId;
    
    // Show if user is creator OR has accepted the invitation
    return isInFuture && (isCreator || userAccepted);
  });

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

  // Mobile Card Component
  const EventCard = ({ event, type }: { event: Event; type: 'incoming' | 'outgoing' | 'upcoming' }) => {
    if (!isMobile) {
      // Desktop card layout (existing)
      return (
        <Card 
          className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer active:scale-95"
          onClick={() => handleEventClick(event)}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {event.event_type === 'playdate' ? '🐕 Playdate Request' : '🚶 Group Walk'}
              {type === 'outgoing' && (
                <span className="text-sm font-normal text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
                  Pending
                </span>
              )}
              {type === 'upcoming' && (
                <span className="text-sm font-normal text-green-600 bg-green-100 px-2 py-1 rounded">
                  Confirmed
                </span>
              )}
            </CardTitle>
            {type === 'incoming' && (
              <CardDescription>
                {event.event_type === 'playdate' ? 'Someone wants to arrange a playdate' : 'You\'re invited to a group walk'}
              </CardDescription>
            )}
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
            {type === 'incoming' && (
              <div className="flex gap-2 mt-4">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAcceptRequest(event.id);
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white flex-1"
                >
                  Accept
                </Button>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeclineRequest(event.id);
                  }}
                  variant="outline"
                  className="border-red-500 text-red-600 hover:bg-red-50 flex-1"
                >
                  Decline
                </Button>
              </div>
            )}
            {type === 'upcoming' && event.creator_id !== userId && (
              <div className="flex gap-2 mt-4">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeclineRequest(event.id);
                  }}
                  variant="outline"
                  size="sm"
                  className="border-red-500 text-red-600 hover:bg-red-50"
                >
                  Can't Attend
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      );
    }

    // Mobile card layout (similar to pet sitters)
    return (
      <Card 
        className="hover:shadow-lg transition-all duration-300 border-0 bg-white cursor-pointer active:scale-95"
        onClick={() => handleEventClick(event)}
      >
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            {/* Event Icon */}
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-lg">
                {event.event_type === 'playdate' ? '🐕' : '🚶'}
              </span>
            </div>
            
            <div className="flex-1 space-y-2">
              <div>
                <h3 className="font-semibold text-sm text-foreground">
                  {event.title || (event.event_type === 'playdate' ? 'Playdate Request' : 'Group Walk')}
                </h3>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(event.scheduled_time)}</span>
                  <Clock className="w-3 h-3" />
                  <span>{formatTime(event.scheduled_time)}</span>
                </div>
              </div>

              <div className="flex items-center text-xs text-muted-foreground">
                <MapPin className="w-3 h-3 mr-1" />
                <span className="truncate">{event.location_name}</span>
              </div>

              {event.message && (
                <p className="text-xs text-muted-foreground line-clamp-2 bg-gray-50 p-2 rounded">
                  "{event.message}"
                </p>
              )}

              <div className="flex flex-col space-y-2 sm:space-y-0">
                {/* Status and Action Row - separate on mobile, inline on desktop */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {type === 'outgoing' && (
                      <span className="text-xs font-medium text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
                        Pending
                      </span>
                    )}
                    {type === 'upcoming' && (
                      <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded">
                        Confirmed
                      </span>
                    )}
                    {type === 'incoming' && (
                      <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
                        New Request
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Action Buttons Row - full width on mobile */}
                {type === 'incoming' && (
                  <div className="flex gap-2 w-full">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAcceptRequest(event.id);
                      }}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white flex-1"
                    >
                      Accept
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeclineRequest(event.id);
                      }}
                      variant="outline"
                      size="sm"
                      className="border-red-500 text-red-600 hover:bg-red-50 flex-1"
                    >
                      Decline
                    </Button>
                  </div>
                )}
                {type === 'upcoming' && event.creator_id !== userId && (
                  <div className="flex gap-2 w-full mt-2">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeclineRequest(event.id);
                      }}
                      variant="outline"
                      size="sm"
                      className="border-red-500 text-red-600 hover:bg-red-50 flex-1"
                    >
                      Can't Attend
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              🗓️ My Events
            </h1>
            <p className="text-gray-600 mt-1">Manage your playdates and group walks</p>
          </div>

          {/* Upcoming Playdates Section - Mobile Only */}
          {isMobile && (
            <div className="mb-6">
              <UpcomingPlaydates />
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Button
              onClick={() => setShowGroupWalkModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white h-16 text-lg"
              disabled={userPets.length === 0}
            >
              <Plus className="w-6 h-6 mr-2" />
              Create Group Walk
            </Button>
            <Button
              onClick={() => navigate('/pet-social')}
              variant="outline"
              className="h-16 text-lg border-green-500 text-green-600 hover:bg-green-50"
            >
              <Users className="w-6 h-6 mr-2" />
              Find Pets for Playdates
            </Button>
          </div>

          {userPets.length === 0 ? (
            <Card className="bg-white shadow-lg">
              <CardContent className="p-12 text-center">
                <PawPrint className="w-16 h-16 mx-auto mb-6 text-gray-400" />
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">No pets found!</h2>
                <p className="text-gray-600 mb-8">
                  You need to create a pet profile before you can schedule playdates or group walks.
                </p>
                <Button
                  onClick={() => navigate('/create-pet-profile')}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Create Pet Profile
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue="incoming" className="w-full">
              <TabsList className={`grid w-full ${isMobile ? 'grid-cols-1 h-auto space-y-1' : 'grid-cols-3'}`}>
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
                    <EventCard key={event.id} event={event} type="incoming" />
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
                    <EventCard key={event.id} event={event} type="outgoing" />
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
                    <EventCard key={event.id} event={event} type="upcoming" />
                  ))
                )}
              </TabsContent>
            </Tabs>
          )}
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
        userPets={userPets}
      />

      <EventDetailsModal
        event={selectedEvent}
        isOpen={isEventModalOpen}
        onClose={handleEventModalClose}
        currentUserId={userId}
        onEventUpdate={handleEventUpdate}
      />
    </Layout>
  );
};

export default Events;
