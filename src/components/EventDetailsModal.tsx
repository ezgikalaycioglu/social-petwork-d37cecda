import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  MessageSquare,
  AlertTriangle,
  Check,
  X
} from 'lucide-react';
import { format } from 'date-fns';

interface Event {
  id: string;
  creator_id: string;
  event_type: string;
  scheduled_time: string;
  location_name: string;
  title: string | null;
  message: string | null;
  participants: string[];
  invited_participants?: string[];
  status: string;
  event_responses?: Array<{
    user_id: string;
    response: string;
  }>;
}

interface EventDetailsModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
  onEventUpdate: () => void;
  modalType?: 'request' | 'upcoming' | 'pending';
  onEditEvent?: () => void;
}

const EventDetailsModal: React.FC<EventDetailsModalProps> = ({
  event,
  isOpen,
  onClose,
  currentUserId,
  onEventUpdate,
  modalType,
  onEditEvent,
}) => {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  if (!event) return null;

  const isCreator = event.creator_id === currentUserId;
  const userResponse = event.event_responses?.find(r => r.user_id === currentUserId);
  const currentUserResponse = userResponse?.response || 'pending';
  const isAttending = currentUserResponse === 'accepted';
  const isPast = Date.parse(event.scheduled_time) < Date.now();

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: format(date, 'EEEE, MMMM d, yyyy'),
      time: format(date, 'h:mm a'),
    };
  };

  const handleRSVPChange = async (newResponse: 'accepted' | 'declined') => {
    if (isUpdating) return;

    if (newResponse === 'accepted') {
      const scheduledMs = Date.parse(event.scheduled_time);
      if (!isNaN(scheduledMs) && scheduledMs < Date.now()) {
        toast({
          title: "Event Passed",
          description: "This event has already passed. You can't accept it.",
          variant: "destructive",
        });
        return;
      }
    }

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('event_responses')
        .upsert({
          event_id: event.id,
          user_id: currentUserId,
          response: newResponse
        }, { onConflict: 'event_id,user_id' });

      if (error) throw error;

      const actionText = newResponse === 'accepted' ? 'accepted' : 'declined';
      toast({
        title: "RSVP Updated",
        description: `You have ${actionText} this invitation.`,
      });

      onEventUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating RSVP:', error);
      toast({
        title: "Error",
        description: "Failed to update your RSVP.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelEvent = async () => {
    if (isUpdating || !isCreator) return;
    
    setIsUpdating(true);
    try {
      // Update event status to cancelled instead of deleting
      const { error } = await supabase
        .from('events')
        .update({ status: 'cancelled' })
        .eq('id', event.id);

      if (error) throw error;

      toast({
        title: "Event Cancelled",
        description: "The event has been cancelled successfully.",
      });

      onEventUpdate();
      onClose();
    } catch (error) {
      console.error('Error cancelling event:', error);
      toast({
        title: "Error",
        description: "Failed to cancel the event.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const { date, time } = formatDateTime(event.scheduled_time);
  const eventTypeDisplay = event.event_type === 'playdate' ? 'Playdate' : 'Group Walk';
  const eventIcon = event.event_type === 'playdate' ? '🐕' : '🚶‍♂️';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <span className="text-2xl">{eventIcon}</span>
            {event.title || eventTypeDisplay}
          </DialogTitle>
          <DialogDescription>
            {isCreator ? "Event you created" : "Event invitation"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status Badge */}
          <div className="flex items-center gap-2">
            {isCreator ? (
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                Organizer
              </Badge>
            ) : (
              <Badge 
                variant={currentUserResponse === 'accepted' ? 'default' : 
                         currentUserResponse === 'declined' ? 'destructive' : 'secondary'}
                className={
                  currentUserResponse === 'accepted' ? 'bg-green-100 text-green-700' :
                  currentUserResponse === 'declined' ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
                }
              >
                {currentUserResponse === 'accepted' ? 'Attending' :
                 currentUserResponse === 'declined' ? 'Not Attending' : 'Pending'}
              </Badge>
            )}
          </div>

          <Separator />

          {/* Event Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">{date}</span>
            </div>
            
            <div className="flex items-center gap-3 text-sm">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">{time}</span>
            </div>
            
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">{event.location_name}</span>
            </div>
            
            <div className="flex items-center gap-3 text-sm">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">
                {event.participants.length} participant{event.participants.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Message */}
          {event.message && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <MessageSquare className="w-4 h-4 text-muted-foreground" />
                  Message
                </div>
                <div className="bg-muted/50 p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground">"{event.message}"</p>
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Action Buttons */}
          <div className="space-y-3">
            {!isCreator && isPast && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <AlertTriangle className="w-4 h-4" />
                This event has already passed.
              </div>
            )}
            
            {modalType === 'pending' && isCreator ? (
              // Pending: Edit or Cancel
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={onEditEvent}
                  disabled={isUpdating}
                  variant="outline"
                  className="w-full"
                >
                  Edit Event
                </Button>
                <Button
                  onClick={handleCancelEvent}
                  disabled={isUpdating}
                  variant="destructive"
                  className="w-full"
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  {isUpdating ? 'Cancelling...' : 'Cancel Event'}
                </Button>
              </div>
            ) : modalType === 'request' && !isCreator ? (
              // Request: Accept or Decline
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => handleRSVPChange('declined')}
                  disabled={isUpdating}
                  variant="outline"
                  className="border-red-500 text-red-600 hover:bg-red-50"
                >
                  <X className="w-4 h-4 mr-2" />
                  {isUpdating ? 'Updating...' : 'Decline'}
                </Button>
                <Button
                  onClick={() => handleRSVPChange('accepted')}
                  disabled={isUpdating || isPast}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Check className="w-4 h-4 mr-2" />
                  {isUpdating ? 'Updating...' : isPast ? 'Event Passed' : 'Accept'}
                </Button>
              </div>
            ) : modalType === 'upcoming' && !isCreator ? (
              // Upcoming: Can't Attend
              <Button
                onClick={() => handleRSVPChange('declined')}
                disabled={isUpdating}
                variant="outline"
                className="w-full border-red-500 text-red-600 hover:bg-red-50"
              >
                <X className="w-4 h-4 mr-2" />
                {isUpdating ? 'Updating...' : "Can't Attend"}
              </Button>
            ) : isCreator ? (
              // Creator actions (fallback)
              <Button
                onClick={handleCancelEvent}
                disabled={isUpdating}
                variant="destructive"
                className="w-full"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                {isUpdating ? 'Cancelling...' : 'Cancel Event'}
              </Button>
            ) : (
              // Attendee actions (fallback)
              <div className="grid grid-cols-2 gap-3">
                {currentUserResponse === 'accepted' ? (
                  <>
                    <Button
                      onClick={() => handleRSVPChange('declined')}
                      disabled={isUpdating}
                      variant="outline"
                      className="border-red-500 text-red-600 hover:bg-red-50"
                    >
                      <X className="w-4 h-4 mr-2" />
                      {isUpdating ? 'Updating...' : "Can't Attend"}
                    </Button>
                    <Button disabled className="bg-green-600 text-white">
                      <Check className="w-4 h-4 mr-2" />
                      Attending
                    </Button>
                  </>
                ) : currentUserResponse === 'declined' ? (
                  <>
                    <Button disabled variant="outline" className="border-red-500 text-red-600">
                      <X className="w-4 h-4 mr-2" />
                      Not Attending
                    </Button>
                    <Button
                      onClick={() => handleRSVPChange('accepted')}
                      disabled={isUpdating || isPast}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      {isUpdating ? 'Updating...' : isPast ? 'Event Passed' : 'Accept'}
                    </Button>
                  </>
                ) : (
                  // Pending response
                  <>
                    <Button
                      onClick={() => handleRSVPChange('declined')}
                      disabled={isUpdating}
                      variant="outline"
                      className="border-red-500 text-red-600 hover:bg-red-50"
                    >
                      <X className="w-4 h-4 mr-2" />
                      {isUpdating ? 'Updating...' : 'Decline'}
                    </Button>
                    <Button
                      onClick={() => handleRSVPChange('accepted')}
                      disabled={isUpdating || isPast}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      {isUpdating ? 'Updating...' : isPast ? 'Event Passed' : 'Accept'}
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventDetailsModal;