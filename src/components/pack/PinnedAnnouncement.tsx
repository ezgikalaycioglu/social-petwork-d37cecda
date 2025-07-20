import React from 'react';
import { Calendar, Pin, X, MapPin, Clock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

interface Event {
  id: string;
  title: string;
  location_name: string;
  scheduled_time: string;
}

interface Announcement {
  id: string;
  title: string;
  description?: string;
  event?: Event;
  created_at: string;
}

interface PinnedAnnouncementProps {
  announcement: Announcement;
  onClose: () => void;
  onViewDetails: () => void;
}

const PinnedAnnouncement: React.FC<PinnedAnnouncementProps> = ({
  announcement,
  onClose,
  onViewDetails,
}) => {
  const formatEventTime = (scheduledTime: string) => {
    const date = new Date(scheduledTime);
    const timeFromNow = formatDistanceToNow(date, { addSuffix: true });
    return {
      formatted: date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      relative: timeFromNow
    };
  };

  return (
    <Alert className="relative border-l-4 border-l-accent bg-accent-light/50 mb-6 p-6 rounded-2xl shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center justify-center w-10 h-10 bg-accent/10 rounded-full">
            <Pin className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-foreground">Pinned Meet-up</h3>
            <p className="text-sm text-muted-foreground">Important announcement</p>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 p-0 hover:bg-accent/20"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <AlertDescription className="space-y-4">
        <div>
          <h4 className="font-medium text-base mb-2">{announcement.title}</h4>
          {announcement.description && (
            <p className="text-muted-foreground mb-3">{announcement.description}</p>
          )}
        </div>

        {announcement.event && (
          <div className="bg-card p-4 rounded-xl border space-y-3">
            <h5 className="font-medium text-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4 text-accent" />
              {announcement.event.title}
            </h5>
            
            <div className="flex flex-col sm:flex-row gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{formatEventTime(announcement.event.scheduled_time).formatted}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{announcement.event.location_name}</span>
              </div>
            </div>
            
            <div className="text-xs text-accent font-medium">
              {formatEventTime(announcement.event.scheduled_time).relative}
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button 
            onClick={onViewDetails}
            className="bg-accent hover:bg-accent-hover text-accent-foreground"
          >
            <Calendar className="w-4 h-4 mr-2" />
            View Details
          </Button>
          
          <Button 
            variant="outline" 
            onClick={onViewDetails}
            className="border-accent text-accent hover:bg-accent hover:text-accent-foreground"
          >
            RSVP
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default PinnedAnnouncement;