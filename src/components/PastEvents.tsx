import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, Clock, MapPin, Users, History } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import type { Tables } from '@/integrations/supabase/types';

type Event = Tables<'events'>;

interface PastEventsProps {
  events: Event[];
  currentUserId: string;
  onEventClick: (event: Event, type: 'request' | 'upcoming' | 'pending') => void;
}

interface GroupedEvents {
  [monthYear: string]: Event[];
}

const PastEvents = ({ events, currentUserId, onEventClick }: PastEventsProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAll, setShowAll] = useState(false);

  // Filter past events (scheduled time is in the past)
  const pastEvents = useMemo(() => {
    const now = new Date();
    return events
      .filter(event => new Date(event.scheduled_time) < now)
      .sort((a, b) => new Date(b.scheduled_time).getTime() - new Date(a.scheduled_time).getTime());
  }, [events]);

  // Group events by month
  const groupedEvents = useMemo(() => {
    const groups: GroupedEvents = {};
    
    pastEvents.forEach(event => {
      const date = new Date(event.scheduled_time);
      const monthYear = date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long' 
      });
      
      if (!groups[monthYear]) {
        groups[monthYear] = [];
      }
      groups[monthYear].push(event);
    });
    
    return groups;
  }, [pastEvents]);

  const monthKeys = Object.keys(groupedEvents);
  const displayedEvents = showAll ? pastEvents : pastEvents.slice(0, 10);

  // Default expansion behavior
  React.useEffect(() => {
    setIsExpanded(pastEvents.length > 3);
  }, [pastEvents.length]);

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getEventStatus = (event: Event): { label: string; variant: 'default' | 'secondary' | 'outline' } => {
    if (event.status === 'confirmed') {
      return { label: 'Past', variant: 'secondary' };
    }
    if (event.status === 'pending' && event.creator_id !== currentUserId) {
      return { label: 'Past (Request)', variant: 'outline' };
    }
    if (event.status === 'pending' && event.creator_id === currentUserId) {
      return { label: 'Past (Pending)', variant: 'outline' };
    }
    return { label: 'Past', variant: 'secondary' };
  };

  const determineModalType = (event: Event): 'request' | 'upcoming' | 'pending' => {
    if (event.creator_id !== currentUserId && event.status === 'pending') {
      return 'request';
    }
    if (event.creator_id === currentUserId && event.status === 'pending') {
      return 'pending';
    }
    return 'upcoming';
  };

  if (pastEvents.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        {/* Section Header */}
        <div className="flex items-center justify-between px-1">
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 hover:bg-transparent focus:ring-2 focus:ring-primary/40"
              aria-expanded={isExpanded}
              aria-label={isExpanded ? 'Collapse past events' : 'Expand past events'}
            >
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold">Past Events</h2>
                <ChevronDown 
                  className={`w-4 h-4 text-muted-foreground transition-transform ${
                    isExpanded ? 'rotate-0' : '-rotate-90'
                  }`}
                />
              </div>
            </Button>
          </CollapsibleTrigger>
          <span className="text-xs text-muted-foreground">{pastEvents.length} total</span>
        </div>

        <CollapsibleContent className="space-y-3">
          {monthKeys.length === 0 ? (
            // Empty state (should not happen since we return null above, but keeping for safety)
            <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <History className="w-5 h-5 text-muted-foreground" />
              </div>
              <h3 className="text-sm font-semibold mb-1">No past events yet</h3>
              <p className="text-xs text-muted-foreground">
                Completed and expired playdates will appear here.
              </p>
            </div>
          ) : (
            <>
              {/* Grouped by month */}
              {monthKeys.map(monthYear => {
                const monthEvents = groupedEvents[monthYear];
                const displayedMonthEvents = showAll 
                  ? monthEvents 
                  : monthEvents.filter(event => displayedEvents.includes(event));

                if (displayedMonthEvents.length === 0) return null;

                return (
                  <div key={monthYear} className="space-y-2">
                    {/* Month Header */}
                    <div className="sticky top-0 bg-background py-1 z-10">
                      <h3 className="text-xs font-semibold text-muted-foreground px-1">
                        {monthYear}
                      </h3>
                    </div>

                    {/* Events for this month */}
                    <div className="space-y-2">
                      {displayedMonthEvents.map(event => {
                        const status = getEventStatus(event);
                        const modalType = determineModalType(event);

                        return (
                          <button
                            key={event.id}
                            onClick={() => onEventClick(event, modalType)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                onEventClick(event, modalType);
                              }
                            }}
                            tabIndex={0}
                            aria-label={`View past event: ${event.title}`}
                            className="w-full rounded-2xl bg-white border border-gray-100 border-l-4 border-l-gray-200 shadow-sm p-4 text-left hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-primary/40 min-h-[44px]"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1.5">
                                  <h4 className="font-semibold text-sm truncate flex-1">
                                    {event.title}
                                  </h4>
                                  <Badge 
                                    variant={status.variant}
                                    className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border-gray-200 flex-shrink-0"
                                  >
                                    {status.label}
                                  </Badge>
                                </div>
                                
                                {/* Meta info row */}
                                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" />
                                    {formatTime(event.scheduled_time)}
                                  </span>
                                  {event.location_name && (
                                    <>
                                      <span className="text-gray-300">•</span>
                                      <span className="flex items-center gap-1 min-w-0">
                                        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                                        <span className="truncate max-w-[120px]">
                                          {event.location_name}
                                        </span>
                                      </span>
                                    </>
                                  )}
                                  {event.participants && event.participants.length > 0 && (
                                    <>
                                      <span className="text-gray-300">•</span>
                                      <span className="flex items-center gap-1">
                                        <Users className="w-3.5 h-3.5" />
                                        {event.participants.length}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                              <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Load More Button */}
              {!showAll && pastEvents.length > 10 && (
                <div className="flex justify-center pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAll(true)}
                    className="text-xs h-8 focus:ring-2 focus:ring-primary/40"
                  >
                    Load more ({pastEvents.length - 10} older)
                  </Button>
                </div>
              )}

              {/* Loading skeleton for load more */}
              {showAll && pastEvents.length > 10 && (
                <div className="space-y-2 pt-2">
                  {[1, 2].map(i => (
                    <div 
                      key={i}
                      className="h-16 rounded-xl bg-gray-100/70 animate-pulse"
                      aria-hidden="true"
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default PastEvents;

