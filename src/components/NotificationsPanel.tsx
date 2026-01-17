import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNotificationsContext } from '@/contexts/NotificationsContext';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { X, ChevronDown, ChevronRight, Heart, Calendar, MessageSquare } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FriendRequest {
  id: string;
  created_at: string;
  requester_pet: {
    id: string;
    name: string;
    breed: string;
    profile_photo_url: string | null;
  };
}

interface EventRequest {
  id: string;
  title: string | null;
  event_type: string;
  scheduled_time: string;
  location_name: string;
  created_at: string;
}

interface MessageNotification {
  id: string;
  conversation_id: string;
  body: string;
  created_at: string;
  sender_name: string;
  sender_id: string;
  is_read: boolean;
}

const NotificationsPanel = ({ isOpen, onClose }: NotificationsPanelProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    friendRequests: friendReqState, 
    eventRequests: eventReqState,
    messages: messagesState,
    markFriendRequestAsRead,
    markEventRequestAsRead,
    markMessageAsRead,
    markAllAsRead,
    getUnreadCount
  } = useNotificationsContext();

  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [eventRequests, setEventRequests] = useState<EventRequest[]>([]);
  const [messages, setMessages] = useState<MessageNotification[]>([]);
  const [friendsOpen, setFriendsOpen] = useState(true);
  const [eventsOpen, setEventsOpen] = useState(true);
  const [messagesOpen, setMessagesOpen] = useState(true);

  useEffect(() => {
    if (isOpen && user) {
      fetchNotifications();
    }
  }, [isOpen, user]);

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      // Get user's pet IDs
      const { data: pets } = await supabase
        .from('pet_profiles')
        .select('id')
        .eq('user_id', user.id);

      const petIds = pets?.map(p => p.id) || [];

      // Fetch friend requests
      const { data: friendReqs } = await supabase
        .from('pet_friendships')
        .select(`
          id,
          created_at,
          requester_pet:pet_profiles!pet_friendships_requester_pet_id_fkey(
            id,
            name,
            breed,
            profile_photo_url
          )
        `)
        .in('recipient_pet_id', petIds)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      // Fetch event requests
      const { data: eventReqs } = await supabase
        .from('events')
        .select('id, title, event_type, scheduled_time, location_name, created_at')
        .contains('invited_participants', [user.id])
        .neq('creator_id', user.id)
        .gte('scheduled_time', new Date().toISOString())
        .order('created_at', { ascending: false });

      // Fetch recent messages (last 10 conversations with unread or recent messages)
      const { data: conversations } = await supabase
        .from('sitter_conversations')
        .select('id, participant_a, participant_b')
        .or(`participant_a.eq.${user.id},participant_b.eq.${user.id}`)
        .order('last_message_at', { ascending: false })
        .limit(10);

      // Fetch recent messages from those conversations
      const messageNotifications: MessageNotification[] = [];
      
      if (conversations && conversations.length > 0) {
        for (const conv of conversations) {
          const otherUserId = conv.participant_a === user.id ? conv.participant_b : conv.participant_a;
          
          // Get the latest message
          const { data: latestMessage } = await supabase
            .from('sitter_messages')
            .select('id, body, created_at, sender_user_id, read_at')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          if (latestMessage) {
            // Get sender name (prefer sitter name, then display name)
            const [sitterResult, userResult] = await Promise.all([
              supabase
                .from('sitter_profiles')
                .select('name')
                .eq('user_id', otherUserId)
                .single(),
              supabase
                .from('user_profiles')
                .select('display_name, email')
                .eq('id', otherUserId)
                .single()
            ]);

            const senderName = sitterResult.data?.name || 
                              userResult.data?.display_name || 
                              userResult.data?.email?.split('@')[0] || 
                              'Unknown';

            // Only include if it's from the other user
            if (latestMessage.sender_user_id !== user.id) {
              messageNotifications.push({
                id: latestMessage.id,
                conversation_id: conv.id,
                body: latestMessage.body,
                created_at: latestMessage.created_at,
                sender_name: senderName,
                sender_id: otherUserId,
                is_read: !!latestMessage.read_at
              });
            }
          }
        }
      }

      setFriendRequests(friendReqs || []);
      setEventRequests(eventReqs || []);
      setMessages(messageNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleFriendRequestClick = (requestId: string) => {
    markFriendRequestAsRead(requestId);
    navigate('/social?tab=pet-social&highlight=friend-' + requestId);
    onClose();
  };

  const handleEventRequestClick = (eventId: string) => {
    markEventRequestAsRead(eventId);
    navigate('/social?tab=events&highlight=event-' + eventId);
    onClose();
  };

  const handleMessageClick = async (message: MessageNotification) => {
    // Mark message as read in database
    await supabase
      .from('sitter_messages')
      .update({ read_at: new Date().toISOString() })
      .eq('id', message.id);
    
    markMessageAsRead(message.id);
    navigate(`/messages/${message.conversation_id}`);
    onClose();
  };

  const handleViewAllMessages = () => {
    navigate('/messages');
    onClose();
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const truncateMessage = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const unreadCount = getUnreadCount();
  const unreadMessagesCount = messagesState.unreadIds.size;

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent 
        className="fixed bottom-0 left-0 right-0 z-[100] mb-16 rounded-t-2xl shadow-xl border-t pb-[env(safe-area-inset-bottom)] bg-background"
        style={{ maxHeight: '75vh' }}
        role="dialog"
        aria-labelledby="notifications-title"
      >
        <div className="mx-auto mt-2 h-1.5 w-12 rounded-full bg-muted" />
        
        {/* Header */}
        <DrawerHeader className="sticky top-0 bg-background px-4 py-3 border-b flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <DrawerTitle id="notifications-title" className="text-lg font-semibold">
              Notifications
            </DrawerTitle>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="rounded-full">
                {unreadCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="h-8 text-xs"
              >
                Mark all as read
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onClose}
              aria-label="Close notifications"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DrawerHeader>

        {/* Content */}
        <div className="overflow-y-auto p-4 space-y-3" style={{ maxHeight: 'calc(75vh - 80px)' }}>
          {/* Messages Section */}
          <Collapsible open={messagesOpen} onOpenChange={setMessagesOpen}>
            <CollapsibleTrigger asChild>
              <button
                className="w-full flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40"
                aria-label={`Messages section, ${messages.length} items`}
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-primary" />
                  <span className="font-medium text-sm">Messages</span>
                  {unreadMessagesCount > 0 && (
                    <Badge variant="destructive" className="rounded-full text-xs">
                      {unreadMessagesCount}
                    </Badge>
                  )}
                </div>
                {messagesOpen ? (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 mt-2">
              {messages.length === 0 ? (
                <div className="text-center py-4 text-sm text-muted-foreground">
                  No recent messages
                </div>
              ) : (
                messages.map((message) => {
                  const isUnread = !message.is_read;
                  return (
                    <button
                      key={message.id}
                      onClick={() => handleMessageClick(message)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 rounded-lg transition-colors text-left focus:outline-none focus:ring-2 focus:ring-primary/40"
                      style={{
                        minHeight: '44px',
                        borderLeft: isUnread ? '3px solid hsl(var(--primary))' : 'none',
                        paddingLeft: isUnread ? 'calc(0.75rem - 3px)' : '0.75rem'
                      }}
                      aria-label={`Message from ${message.sender_name}: ${message.body}`}
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {message.sender_name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {truncateMessage(message.body)} • {formatDate(message.created_at)}
                        </p>
                      </div>
                      {isUnread && (
                        <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" aria-hidden="true" />
                      )}
                      <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    </button>
                  );
                })
              )}
              {/* View All Messages Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleViewAllMessages}
                className="w-full mt-2 text-primary hover:text-primary/80"
              >
                View all messages
              </Button>
            </CollapsibleContent>
          </Collapsible>

          {/* Friend Requests Section */}
          <Collapsible open={friendsOpen} onOpenChange={setFriendsOpen}>
            <CollapsibleTrigger asChild>
              <button
                className="w-full flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40"
                aria-label={`Friend Requests section, ${friendRequests.length} items`}
              >
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-primary" />
                  <span className="font-medium text-sm">Friend Requests</span>
                  {friendRequests.length > 0 && (
                    <Badge variant="secondary" className="rounded-full text-xs">
                      {friendRequests.length}
                    </Badge>
                  )}
                </div>
                {friendsOpen ? (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 mt-2">
              {friendRequests.length === 0 ? (
                <div className="text-center py-6 text-sm text-muted-foreground">
                  No friend requests
                </div>
              ) : (
                friendRequests.map((request) => {
                  const isUnread = friendReqState.unreadIds.has(request.id);
                  return (
                    <button
                      key={request.id}
                      onClick={() => handleFriendRequestClick(request.id)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 rounded-lg transition-colors text-left focus:outline-none focus:ring-2 focus:ring-primary/40"
                      style={{
                        minHeight: '44px',
                        borderLeft: isUnread ? '3px solid hsl(var(--primary))' : 'none',
                        paddingLeft: isUnread ? 'calc(0.75rem - 3px)' : '0.75rem'
                      }}
                      aria-label={`View friend request from ${request.requester_pet.name}, ${request.requester_pet.breed}`}
                    >
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={request.requester_pet.profile_photo_url || ''} />
                        <AvatarFallback>{request.requester_pet.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {request.requester_pet.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {request.requester_pet.breed} • {formatDate(request.created_at)}
                        </p>
                      </div>
                      {isUnread && (
                        <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" aria-hidden="true" />
                      )}
                      <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    </button>
                  );
                })
              )}
            </CollapsibleContent>
          </Collapsible>

          {/* Event Requests Section */}
          <Collapsible open={eventsOpen} onOpenChange={setEventsOpen}>
            <CollapsibleTrigger asChild>
              <button
                className="w-full flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40"
                aria-label={`Event Requests section, ${eventRequests.length} items`}
              >
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="font-medium text-sm">Event Requests</span>
                  {eventRequests.length > 0 && (
                    <Badge variant="secondary" className="rounded-full text-xs">
                      {eventRequests.length}
                    </Badge>
                  )}
                </div>
                {eventsOpen ? (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 mt-2">
              {eventRequests.length === 0 ? (
                <div className="text-center py-6 text-sm text-muted-foreground">
                  No event requests
                </div>
              ) : (
                eventRequests.map((event) => {
                  const isUnread = eventReqState.unreadIds.has(event.id);
                  return (
                    <button
                      key={event.id}
                      onClick={() => handleEventRequestClick(event.id)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 rounded-lg transition-colors text-left focus:outline-none focus:ring-2 focus:ring-primary/40"
                      style={{
                        minHeight: '44px',
                        borderLeft: isUnread ? '3px solid hsl(var(--primary))' : 'none',
                        paddingLeft: isUnread ? 'calc(0.75rem - 3px)' : '0.75rem'
                      }}
                      aria-label={`View event request: ${event.title || (event.event_type === 'playdate' ? 'Playdate' : 'Group Walk')} on ${formatEventDate(event.scheduled_time)}`}
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-lg">
                          {event.event_type === 'playdate' ? '🐕' : '🚶'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {event.title || (event.event_type === 'playdate' ? 'Playdate Request' : 'Group Walk')}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {formatEventDate(event.scheduled_time)} • {event.location_name}
                        </p>
                      </div>
                      {isUnread && (
                        <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" aria-hidden="true" />
                      )}
                      <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    </button>
                  );
                })
              )}
            </CollapsibleContent>
          </Collapsible>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default NotificationsPanel;
