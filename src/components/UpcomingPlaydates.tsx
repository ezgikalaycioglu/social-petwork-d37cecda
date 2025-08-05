
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';
import { format, formatDistanceToNow, isPast } from 'date-fns';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface UpcomingPlaydate {
  id: string;
  event_type: string;
  scheduled_time: string;
  location_name: string;
  title: string | null;
  participants: string[];
  status: string;
  creator_id: string;
  event_responses?: Array<{
    user_id: string;
    response: string;
  }>;
}

const UpcomingPlaydates: React.FC = () => {
  const [playdates, setPlaydates] = useState<UpcomingPlaydate[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchUpcomingPlaydates();
  }, []);

  const fetchUpcomingPlaydates = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get events where user is creator or invited
      const { data: allEvents, error } = await supabase
        .from('events')
        .select('*')
        .or(`creator_id.eq.${user.id},invited_participants.cs.{${user.id}}`)
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

  if (loading) {
    return (
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3 px-4">Upcoming Playdates</h2>
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex w-max space-x-4 px-4 pb-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="w-72 h-24 bg-gray-200 rounded-lg animate-pulse" />
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    );
  }

  if (playdates.length === 0) {
    return (
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3 px-4">Upcoming Playdates</h2>
        <div className="px-4">
          <Card className="border-dashed border-2 border-gray-300">
            <CardContent className="flex items-center justify-center py-8">
              <div className="text-center">
                <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 text-sm">No upcoming playdates scheduled</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-3 px-4">Upcoming Playdates</h2>
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex w-max space-x-4 px-4 pb-4">
          {playdates.map((playdate) => {
            const timeInfo = formatEventTime(playdate.scheduled_time);
            const isGroupWalk = playdate.event_type === 'group_walk';
            
            return (
              <Card 
                key={playdate.id} 
                className="w-72 flex-shrink-0 bg-gradient-to-r from-green-50 to-blue-50 border-l-4 border-l-green-500 hover:shadow-md transition-shadow cursor-pointer"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800 text-sm">
                        {playdate.title || (isGroupWalk ? '🚶‍♂️ Group Walk' : '🐕 Playdate')}
                      </h3>
                      <div className="flex items-center text-xs text-gray-600 mt-1">
                        <Calendar className="w-3 h-3 mr-1" />
                        <span>{timeInfo.date}</span>
                        <Clock className="w-3 h-3 ml-2 mr-1" />
                        <span>{timeInfo.time}</span>
                      </div>
                    </div>
                    <div className="text-xs text-green-600 font-medium">
                      {timeInfo.timeAgo}
                    </div>
                  </div>
                  
                  <div className="flex items-center text-xs text-gray-600">
                    <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                    <span className="truncate">{playdate.location_name}</span>
                  </div>
                  
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center text-xs text-gray-500">
                      <Users className="w-3 h-3 mr-1" />
                      <span>{playdate.participants.length} participants</span>
                    </div>
                    <div className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                      Confirmed
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};

export default UpcomingPlaydates;
