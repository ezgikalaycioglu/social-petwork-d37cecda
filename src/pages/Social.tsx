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
  ChevronDown,
  ChevronRight,
  X
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from '@/components/ui/drawer';
import { Badge } from '@/components/ui/badge';
import SegmentedControl from '@/components/SegmentedControl';
import DiscoverPets from '@/components/DiscoverPets';
import FriendRequests from '@/components/FriendRequests';
import PetFriendsList from '@/components/PetFriendsList';
import GroupWalkModal from '@/components/GroupWalkModal';
import UpcomingPlaydates from '@/components/UpcomingPlaydates';
import InteractiveMap from '@/components/InteractiveMap';
import EventDetailsModal from '@/components/EventDetailsModal';
import PastEvents from '@/components/PastEvents';
import type { Tables } from '@/integrations/supabase/types';

type Event = Tables<'events'>;
type PetProfile = Tables<'pet_profiles'>;

const Social = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const highlightParam = searchParams.get('highlight');
  const [activeTab, setActiveTab] = useState(tabFromUrl || 'pet-social');
  const [loading, setLoading] = useState(false);
  const [friendRequestHighlight, setFriendRequestHighlight] = useState<string | undefined>(undefined);
  const [friendRequestsForceOpen, setFriendRequestsForceOpen] = useState(false);
  
  // Shared state
  const [pets, setPets] = useState<PetProfile[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Events state
  const [events, setEvents] = useState<Event[]>([]);
  const [showPlaydateModal, setShowPlaydateModal] = useState(false);
  const [showGroupWalkModal, setShowGroupWalkModal] = useState(false);
  const [openSheet, setOpenSheet] = useState<'requests' | 'upcoming' | 'pending' | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [eventModalType, setEventModalType] = useState<'request' | 'upcoming' | 'pending'>('request');
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserPets();
      if (activeTab === 'events') {
        fetchUserEvents();
      }
    }
  }, [activeTab, user]);

  // Handle deep linking from notifications
  useEffect(() => {
    if (highlightParam?.startsWith('friend-')) {
      const requestId = highlightParam.replace('friend-', '');
      
      // Ensure we're on the pet-social tab
      if (activeTab !== 'pet-social') {
        setActiveTab('pet-social');
      }
      
      // Force open and highlight the friend request
      setFriendRequestsForceOpen(true);
      setFriendRequestHighlight(requestId);
      
      // Scroll to the friend requests card after a brief delay
      setTimeout(() => {
        const element = document.getElementById('friend-requests-card');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
      
      // Clear highlight after animation
      setTimeout(() => {
        setFriendRequestHighlight(undefined);
        // Clean up URL
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('highlight');
        setSearchParams(newParams, { replace: true });
      }, 1500);
    } else if (highlightParam?.startsWith('event-')) {
      const eventId = highlightParam.replace('event-', '');
      
      // Ensure we're on the events tab
      if (activeTab !== 'events') {
        setActiveTab('events');
      }
      
      // Find the event and determine its category
      setTimeout(() => {
        const event = events.find(e => e.id === eventId);
        if (event) {
          const isRequest = event.creator_id !== user?.id && event.status === 'pending';
          const isUpcoming = event.status === 'confirmed' && new Date(event.scheduled_time) > new Date();
          const isPending = event.creator_id === user?.id && event.status === 'pending';
          
          if (isRequest) {
            handleEventClick(event, 'request');
          } else if (isUpcoming) {
            handleEventClick(event, 'upcoming');
          } else if (isPending) {
            handleEventClick(event, 'pending');
          }
        }
        
        // Clean up URL
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('highlight');
        setSearchParams(newParams, { replace: true });
      }, 500);
    }
  }, [highlightParam, activeTab, searchParams, setSearchParams, events, user]);

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

  const handleEventClick = (event: Event, type: 'request' | 'upcoming' | 'pending') => {
    setSelectedEvent(event);
    setEventModalType(type);
  };

  const handleEventModalClose = () => {
    setSelectedEvent(null);
  };

  const handleEditEvent = () => {
    if (selectedEvent) {
      setEditingEvent(selectedEvent);
      setSelectedEvent(null);
      setShowGroupWalkModal(true);
    }
  };

  const handleGroupWalkSuccess = () => {
    setEditingEvent(null);
    handleRefresh();
  };

  const userPetIds = pets.map(pet => pet.id);
  
  // Filter events by status and time
  const now = new Date();
  const futureEvents = events.filter(event => new Date(event.scheduled_time) > now);
  
  const incomingRequests = futureEvents.filter(
    event => event.creator_id !== user?.id && event.status === 'pending'
  );
  const upcomingEvents = futureEvents.filter(
    event => event.status === 'confirmed'
  );
  const pendingEvents = futureEvents.filter(
    event => event.creator_id === user?.id && event.status === 'pending'
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
                    forceOpen={friendRequestsForceOpen}
                    highlightRequestId={friendRequestHighlight}
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
                  <button
                    onClick={() => setOpenSheet('requests')}
                    className="rounded-xl bg-white border border-gray-100 shadow-sm p-3 text-center hover:shadow-md active:scale-[0.98] transition focus:outline-none focus:ring-2 focus:ring-primary/40"
                    aria-label={`View ${incomingRequests.length} playdate requests`}
                    tabIndex={0}
                  >
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-1.5">
                      <Heart className="w-4 h-4 text-red-500" />
                    </div>
                    <h3 className="text-lg font-semibold mb-0.5">
                      {incomingRequests.length}
                    </h3>
                    <p className="text-xs text-muted-foreground">Requests</p>
                  </button>

                  <button
                    onClick={() => setOpenSheet('upcoming')}
                    className="rounded-xl bg-white border border-gray-100 shadow-sm p-3 text-center hover:shadow-md active:scale-[0.98] transition focus:outline-none focus:ring-2 focus:ring-primary/40"
                    aria-label={`View ${upcomingEvents.length} upcoming events`}
                    tabIndex={0}
                  >
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-1.5">
                      <Calendar className="w-4 h-4 text-green-500" />
                    </div>
                    <h3 className="text-lg font-semibold mb-0.5">
                      {upcomingEvents.length}
                    </h3>
                    <p className="text-xs text-muted-foreground">Upcoming</p>
                  </button>

                  <button
                    onClick={() => setOpenSheet('pending')}
                    className="rounded-xl bg-white border border-gray-100 shadow-sm p-3 text-center hover:shadow-md active:scale-[0.98] transition focus:outline-none focus:ring-2 focus:ring-primary/40"
                    aria-label={`View ${pendingEvents.length} pending events`}
                    tabIndex={0}
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-1.5">
                      <Clock className="w-4 h-4 text-blue-500" />
                    </div>
                    <h3 className="text-lg font-semibold mb-0.5">
                      {pendingEvents.length}
                    </h3>
                    <p className="text-xs text-muted-foreground">Pending</p>
                  </button>
                </div>

                {/* Past Events Section */}
                <PastEvents 
                  events={events}
                  currentUserId={user?.id || ''}
                  onEventClick={handleEventClick}
                />
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
              </>
            )}
          </div>
        )}
      </div>

        {/* Modals */}
        <GroupWalkModal
          isOpen={showGroupWalkModal}
          onClose={() => {
            setShowGroupWalkModal(false);
            setEditingEvent(null);
          }}
          onSuccess={handleGroupWalkSuccess}
          userId={user?.id || ''}
          userPets={pets}
          editEvent={editingEvent}
        />

        {/* Event Lists Drawer */}
        <Drawer 
          open={openSheet !== null} 
          onOpenChange={(open) => !open && setOpenSheet(null)}
          modal={true}
        >
          <DrawerContent 
            className="fixed bottom-0 left-0 right-0 z-[100] mb-16 rounded-t-2xl shadow-xl border-t border-gray-200 pb-[env(safe-area-inset-bottom)] bg-white"
            style={{
              maxHeight: openSheet && 
                ((openSheet === 'requests' && incomingRequests.length === 0) ||
                 (openSheet === 'upcoming' && upcomingEvents.length === 0) ||
                 (openSheet === 'pending' && pendingEvents.length === 0))
                ? '40vh'
                : '75vh'
            }}
          >
            <div className="mx-auto mt-2 h-1.5 w-12 rounded-full bg-gray-300" />
            
            <div className="sticky top-0 bg-white px-4 py-3 border-b border-gray-100 flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">
                  {openSheet === 'requests' && 'Requests'}
                  {openSheet === 'upcoming' && 'Upcoming'}
                  {openSheet === 'pending' && 'Pending'}
                </h3>
                <Badge variant="secondary" className="rounded-full">
                  {openSheet === 'requests' && incomingRequests.length}
                  {openSheet === 'upcoming' && upcomingEvents.length}
                  {openSheet === 'pending' && pendingEvents.length}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 focus:ring-2 focus:ring-primary/40"
                onClick={() => setOpenSheet(null)}
                aria-label="Close drawer"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div 
              className="overflow-y-auto p-4 space-y-2"
              style={{ maxHeight: 'calc(60vh - 100px)' }}
            >
              {openSheet === 'requests' && (
                incomingRequests.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 min-h-[200px]">
                    <div className="text-4xl mb-3">📬</div>
                    <h4 className="font-semibold text-base mb-1">No requests</h4>
                    <p className="text-sm text-muted-foreground">Check back later.</p>
                  </div>
                ) : (
                  incomingRequests.map((event) => (
                    <button
                      key={event.id}
                      role="listitem"
                      onClick={() => handleEventClick(event, 'request')}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleEventClick(event, 'request');
                        }
                      }}
                      tabIndex={0}
                      className="w-full rounded-xl bg-white border border-gray-100 shadow-sm p-3 text-left hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-primary/40"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm mb-1 truncate">{event.title}</h4>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {formatTime(event.scheduled_time)}
                            </span>
                            {event.location_name && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" />
                                <span className="truncate max-w-[120px]">{event.location_name}</span>
                              </span>
                            )}
                            {event.participants && (
                              <span className="flex items-center gap-1">
                                <Users className="w-3.5 h-3.5" />
                                {event.participants.length}
                              </span>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
                      </div>
                    </button>
                  ))
                )
              )}

              {openSheet === 'upcoming' && (
                upcomingEvents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 min-h-[200px]">
                    <div className="text-4xl mb-3">📅</div>
                    <h4 className="font-semibold text-base mb-1">No upcoming events</h4>
                    <p className="text-sm text-muted-foreground">Check back later.</p>
                  </div>
                ) : (
                  upcomingEvents.map((event) => (
                    <button
                      key={event.id}
                      role="listitem"
                      onClick={() => handleEventClick(event, 'upcoming')}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleEventClick(event, 'upcoming');
                        }
                      }}
                      tabIndex={0}
                      className="w-full rounded-xl bg-white border border-gray-100 shadow-sm p-3 text-left hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-primary/40"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm mb-1 truncate">{event.title}</h4>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {formatTime(event.scheduled_time)}
                            </span>
                            {event.location_name && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" />
                                <span className="truncate max-w-[120px]">{event.location_name}</span>
                              </span>
                            )}
                            {event.participants && (
                              <span className="flex items-center gap-1">
                                <Users className="w-3.5 h-3.5" />
                                {event.participants.length}
                              </span>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
                      </div>
                    </button>
                  ))
                )
              )}

              {openSheet === 'pending' && (
                pendingEvents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 min-h-[200px]">
                    <div className="text-4xl mb-3">⏳</div>
                    <h4 className="font-semibold text-base mb-1">No pending events</h4>
                    <p className="text-sm text-muted-foreground">Check back later.</p>
                  </div>
                ) : (
                  pendingEvents.map((event) => (
                    <button
                      key={event.id}
                      role="listitem"
                      onClick={() => handleEventClick(event, 'pending')}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleEventClick(event, 'pending');
                        }
                      }}
                      tabIndex={0}
                      className="w-full rounded-xl bg-white border border-gray-100 shadow-sm p-3 text-left hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-primary/40"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-sm truncate">{event.title}</h4>
                            <Badge variant="outline" className="text-xs">Pending</Badge>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {formatTime(event.scheduled_time)}
                            </span>
                            {event.location_name && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" />
                                <span className="truncate max-w-[120px]">{event.location_name}</span>
                              </span>
                            )}
                            {event.participants && (
                              <span className="flex items-center gap-1">
                                <Users className="w-3.5 h-3.5" />
                                {event.participants.length}
                              </span>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
                      </div>
                    </button>
                  ))
                )
              )}
            </div>
          </DrawerContent>
        </Drawer>

        {/* Event Details Modal */}
        <EventDetailsModal
          event={selectedEvent}
          isOpen={!!selectedEvent}
          onClose={handleEventModalClose}
          currentUserId={user?.id || ''}
          onEventUpdate={handleRefresh}
          modalType={eventModalType}
          onEditEvent={handleEditEvent}
        />
      </div>
    </Layout>
  );
};

export default Social;