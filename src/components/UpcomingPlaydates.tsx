
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, Users, Plus } from 'lucide-react';
import { format, formatDistanceToNow, isPast } from 'date-fns';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import EventDetailsModal from '@/components/EventDetailsModal';
import GroupWalkModal from '@/components/GroupWalkModal';

interface UpcomingPlaydate {
  id: string;
  event_type: string;
  scheduled_time: string;
  location_name: string;
  title: string | null;
  message: string | null;
  participants: string[];
  status: string;
  creator_id: string;
  invited_participants?: string[];
  event_responses?: Array<{
    user_id: string;
    response: string;
  }>;
}

const UpcomingPlaydates: React.FC = () => {
  const [playdates, setPlaydates] = useState<UpcomingPlaydate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<UpcomingPlaydate | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGroupWalkModalOpen, setIsGroupWalkModalOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [userPets, setUserPets] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchUpcomingPlaydates();
  }, []);

  const fetchUpcomingPlaydates = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      setCurrentUserId(user.id);

      // Fetch user pets for group walk modal
      const { data: pets } = await supabase
        .from('pet_profiles')
        .select('*')
        .eq('user_id', user.id);
      setUserPets(pets || []);

      // Get events where user is creator or invited
      const { data: allEvents, error } = await supabase
        .from('events')
        .select('*')
        .or(`creator_id.eq.${user.id},invited_participants.cs.{${user.id}}`)
        .neq('status', 'cancelled')
        .gte('scheduled_time', new Date().toISOString())
        .order('scheduled_time', { ascending: true });

      if (error) throw error;

      // Get user's responses to events
      const { data: userResponses, error: responsesError } = await supabase
        .from('event_responses')
        .select('*')
        .eq('user_id', user.id);

      if (responsesError) throw responsesError;

      // Filter events where user is creator OR has accepted
      const upcomingEvents = (allEvents || []).filter(event => {
        const isCreator = event.creator_id === user.id;
        const userResponse = (userResponses || []).find(r => r.event_id === event.id);
        const hasAccepted = userResponse?.response === 'accepted';
        const isInFuture = !isPast(new Date(event.scheduled_time));
        
        return isInFuture && (isCreator || hasAccepted);
      });

      // Only show the first upcoming event
      setPlaydates(upcomingEvents.slice(0, 1));
    } catch (error) {
      console.error('Error fetching upcoming playdates:', error);
      toast({
        title: "Error",
        description: "Failed to load upcoming playdates.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatEventTime = (dateString: string) => {
    const date = new Date(dateString);
    const timeAgo = formatDistanceToNow(date, { addSuffix: true });
    const formattedDate = format(date, 'MMM d');
    const formattedTime = format(date, 'h:mm a');
    
    return {
      timeAgo,
      date: formattedDate,
      time: formattedTime
    };
  };

  const handleEventClick = (event: UpcomingPlaydate) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const handleEventUpdate = () => {
    fetchUpcomingPlaydates();
  };

  const handleGroupWalkSuccess = () => {
    setIsGroupWalkModalOpen(false);
    fetchUpcomingPlaydates();
    toast({
      title: "Success",
      description: "Group walk event created successfully!",
    });
  };

  if (loading) {
    return (
      <div className="mb-2">
        <div className="flex items-center justify-between mt-2 mb-2 px-4">
          <h2 className="text-base font-semibold text-gray-900">Upcoming Playdates</h2>
          <Button
            onClick={() => setIsGroupWalkModalOpen(true)}
            size="sm"
            className="h-9 rounded-full px-4 text-sm font-medium shadow-sm"
          >
            <Plus className="w-4 h-4 mr-1" />
            Create
          </Button>
        </div>
        <div className="px-4 space-y-2">
          {Array.from({ length: 1 }).map((_, i) => (
            <div key={i} className="rounded-2xl h-20 w-full bg-gray-200 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (playdates.length === 0) {
    return (
      <div className="mb-2">
        <div className="flex items-center justify-between mt-2 mb-2 px-4">
          <h2 className="text-base font-semibold text-gray-900">Upcoming Playdates</h2>
          <Button
            onClick={() => setIsGroupWalkModalOpen(true)}
            size="sm"
            className="h-9 rounded-full px-4 text-sm font-medium shadow-sm"
          >
            <Plus className="w-4 h-4 mr-1" />
            Create
          </Button>
        </div>
        <div className="px-4">
          <Card className="rounded-2xl bg-white border border-gray-100 shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl mb-2">📅</div>
              <h3 className="text-base font-semibold mb-1">No upcoming playdates</h3>
              <p className="text-sm text-muted-foreground">Create one or check back later.</p>
            </CardContent>
          </Card>
        </div>
        
        <GroupWalkModal
          isOpen={isGroupWalkModalOpen}
          onClose={() => setIsGroupWalkModalOpen(false)}
          onSuccess={handleGroupWalkSuccess}
          userId={currentUserId}
          userPets={userPets}
        />
      </div>
    );
  }

  return (
    <div className="mb-2">
      <div className="flex items-center justify-between mt-2 mb-2 px-4">
        <h2 className="text-base font-semibold text-gray-900">Upcoming Playdates</h2>
        <Button
          onClick={() => setIsGroupWalkModalOpen(true)}
          size="sm"
          className="h-9 rounded-full px-4 text-sm font-medium shadow-sm"
        >
          <Plus className="w-4 h-4 mr-1" />
          Create
        </Button>
      </div>
      <div className="px-4 space-y-2">
        {playdates.map((playdate) => {
          const timeInfo = formatEventTime(playdate.scheduled_time);
          const isGroupWalk = playdate.event_type === 'group_walk';
          
          // Determine status and accent color
          const status = playdate.status || 'confirmed';
          const getAccentColor = () => {
            if (status === 'confirmed') return 'border-l-green-300';
            if (status === 'pending') return 'border-l-amber-300';
            if (status === 'cancelled') return 'border-l-rose-300';
            return 'border-l-blue-300';
          };
          
          const getStatusPillClasses = () => {
            if (status === 'confirmed') return 'bg-green-100 text-green-700';
            if (status === 'pending') return 'bg-amber-100 text-amber-700';
            if (status === 'cancelled') return 'bg-rose-100 text-rose-700';
            return 'bg-blue-100 text-blue-700';
          };
          
          return (
            <Card 
              key={playdate.id} 
              className={`rounded-2xl bg-white border border-gray-100 shadow-sm p-3 cursor-pointer border-l-4 ${getAccentColor()} hover:shadow-md transition-shadow`}
              onClick={() => handleEventClick(playdate)}
            >
              <CardContent className="p-0">
                {/* Top row: Title + Time + Arrow */}
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <h3 className="font-semibold text-gray-900 text-sm min-w-0 truncate">
                    {playdate.title || (isGroupWalk ? '🚶‍♂️ Group Walk' : '🐕 Playdate')}
                  </h3>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusPillClasses()}`}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </div>
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
                
                {/* Meta row: Date, time, location, participants */}
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
                  <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="whitespace-nowrap">{timeInfo.date}, {timeInfo.time}</span>
                  <span>•</span>
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="min-w-0 truncate">{playdate.location_name}</span>
                  <span>•</span>
                  <Users className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="whitespace-nowrap">{playdate.participants.length}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
        
        <EventDetailsModal
          event={selectedEvent}
          isOpen={isModalOpen}
          onClose={handleModalClose}
          currentUserId={currentUserId}
          onEventUpdate={handleEventUpdate}
        />
        
        <GroupWalkModal
          isOpen={isGroupWalkModalOpen}
          onClose={() => setIsGroupWalkModalOpen(false)}
          onSuccess={handleGroupWalkSuccess}
          userId={currentUserId}
          userPets={userPets}
        />
      </div>
    );
  };

  export default UpcomingPlaydates;
