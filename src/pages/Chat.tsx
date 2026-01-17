import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, Send, Loader2, Calendar, AlertCircle } from 'lucide-react';
import { format, isToday, isYesterday, isSameDay } from 'date-fns';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Message {
  id: string;
  created_at: string;
  conversation_id: string;
  sender_user_id: string;
  body: string;
  read_at: string | null;
}

interface OtherUser {
  id: string;
  display_name: string | null;
  email: string | null;
}

interface BookingContext {
  id: string;
  start_date: string;
  end_date: string;
  status: string;
  pet_name: string;
}

const Chat = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [otherUser, setOtherUser] = useState<OtherUser | null>(null);
  const [bookingContext, setBookingContext] = useState<BookingContext | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user || !conversationId) return;
    
    fetchConversationDetails();
    fetchMessages();
    markMessagesAsRead();

    // Subscribe to new messages
    const channel = supabase
      .channel(`chat-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'sitter_messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          
          // Add message only if it doesn't already exist (prevents duplicates from optimistic updates)
          setMessages((prev) => {
            const exists = prev.some((msg) => msg.id === newMsg.id);
            if (exists) return prev;
            return [...prev, newMsg];
          });
          
          // Mark as read if not from current user
          if (newMsg.sender_user_id !== user.id) {
            markMessageAsRead(newMsg.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversationDetails = async () => {
    if (!conversationId || !user) return;

    try {
      const { data: conv, error } = await supabase
        .from('sitter_conversations')
        .select('*')
        .eq('id', conversationId)
        .single();

      if (error) throw error;

      // Get other user
      const otherUserId = conv.participant_a === user.id ? conv.participant_b : conv.participant_a;
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('id, display_name, email')
        .eq('id', otherUserId)
        .single();

      setOtherUser(userProfile);

      // Get booking context if exists
      if (conv.booking_id) {
        const { data: booking } = await supabase
          .from('sitter_bookings')
          .select(`
            id,
            start_date,
            end_date,
            status,
            pet_id
          `)
          .eq('id', conv.booking_id)
          .single();

        if (booking) {
          // Get pet name
          const { data: pet } = await supabase
            .from('pet_profiles')
            .select('name')
            .eq('id', booking.pet_id)
            .single();

          setBookingContext({
            ...booking,
            pet_name: pet?.name || 'Unknown Pet',
          });
        }
      }
    } catch (error) {
      console.error('Error fetching conversation details:', error);
    }
  };

  const fetchMessages = async () => {
    if (!conversationId) return;

    try {
      const { data, error } = await supabase
        .from('sitter_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const markMessagesAsRead = async () => {
    if (!conversationId || !user) return;

    try {
      await supabase
        .from('sitter_messages')
        .update({ read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .neq('sender_user_id', user.id)
        .is('read_at', null);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const markMessageAsRead = async (messageId: string) => {
    try {
      await supabase
        .from('sitter_messages')
        .update({ read_at: new Date().toISOString() })
        .eq('id', messageId);
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !conversationId) return;

    const messageBody = newMessage.trim();
    setSending(true);
    setNewMessage(''); // Clear input immediately for better UX

    try {
      const { data, error } = await supabase
        .from('sitter_messages')
        .insert({
          conversation_id: conversationId,
          sender_user_id: user.id,
          body: messageBody,
        })
        .select()
        .single();

      if (error) throw error;

      // Optimistically add the message to local state
      // Check if message already exists (in case real-time also delivered it)
      setMessages((prev) => {
        const exists = prev.some((msg) => msg.id === data.id);
        if (exists) return prev;
        return [...prev, data];
      });
    } catch (error) {
      console.error('Error sending message:', error);
      // Restore the message input if send failed
      setNewMessage(messageBody);
    } finally {
      setSending(false);
    }
  };

  const formatMessageTime = (dateString: string) => {
    return format(new Date(dateString), 'HH:mm');
  };

  const formatDateSeparator = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMMM d, yyyy');
  };

  const shouldShowDateSeparator = (currentMsg: Message, prevMsg: Message | null) => {
    if (!prevMsg) return true;
    return !isSameDay(new Date(currentMsg.created_at), new Date(prevMsg.created_at));
  };

  const getInitials = (name: string | null, email: string | null) => {
    if (name) return name.charAt(0).toUpperCase();
    if (email) return email.charAt(0).toUpperCase();
    return 'U';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) {
    return (
      <div className="container max-w-2xl mx-auto p-4">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Please log in to view this conversation.</p>
          <Button onClick={() => navigate('/auth')} className="mt-4">
            Sign In
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-3.5rem)] xl:h-[100dvh] max-w-2xl mx-auto">
      {/* Compact Sticky App Bar - positioned below MobileTopNav on mobile */}
      <div className="sticky top-14 xl:top-0 z-30 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75 border-b">
        <div className="flex items-center h-12 sm:h-14 px-2">
          {/* Left: Back chevron */}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/messages')}
            aria-label="Go back"
            className="h-11 w-11 min-w-[44px] min-h-[44px] shrink-0 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          
          {/* Center: Title + optional status pill */}
          <div className="flex-1 flex items-center justify-center gap-2 min-w-0 px-2">
            <span className="text-base font-semibold truncate">
              {otherUser?.display_name || otherUser?.email || 'Chat'}
            </span>
            {bookingContext && (
              <span className={`text-xs rounded-full px-2 py-0.5 shrink-0 font-medium ${getStatusColor(bookingContext.status)}`}>
                {bookingContext.status.charAt(0).toUpperCase() + bookingContext.status.slice(1)}
              </span>
            )}
          </div>
          
          {/* Right: Spacer for symmetry */}
          <div className="w-11 h-11 shrink-0" />
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto scroll-py-2">
        {/* Booking Context Card - scrolls with content */}
        {bookingContext && (
          <div className="pt-2 px-4">
            <Card className="p-3 bg-accent/50">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="font-medium">{bookingContext.pet_name}</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground whitespace-nowrap">
                  {format(new Date(bookingContext.start_date), 'MMM d')} - {format(new Date(bookingContext.end_date), 'MMM d')}
                </span>
              </div>
            </Card>
          </div>
        )}

        {/* Privacy Notice - scrolls with content */}
        <div className="px-4 pt-2 pb-2">
          <Alert className="bg-amber-50 border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800 text-xs">
              Only share personal contact info (phone, email) in chat if you choose to. PawCult does not automatically share this information.
            </AlertDescription>
          </Alert>
        </div>

        {/* Messages */}
        <div className="p-4 space-y-4 pb-24">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              No messages yet. Start the conversation!
            </div>
          ) : (
            messages.map((msg, index) => {
              const isOwn = msg.sender_user_id === user.id;
              const prevMsg = index > 0 ? messages[index - 1] : null;
              const showDateSeparator = shouldShowDateSeparator(msg, prevMsg);

              return (
                <React.Fragment key={msg.id}>
                  {showDateSeparator && (
                    <div className="flex items-center justify-center my-4">
                      <span className="text-xs text-muted-foreground bg-background px-3 py-1 rounded-full border">
                        {formatDateSeparator(msg.created_at)}
                      </span>
                    </div>
                  )}
                  <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                        isOwn
                          ? 'bg-primary text-primary-foreground rounded-br-md'
                          : 'bg-muted rounded-bl-md'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">{msg.body}</p>
                      <p
                        className={`text-[10px] mt-1 ${
                          isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                        }`}
                      >
                        {formatMessageTime(msg.created_at)}
                      </p>
                    </div>
                  </div>
                </React.Fragment>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Sticky Message Input */}
      <form onSubmit={sendMessage} className="sticky bottom-0 p-4 border-t bg-background pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 h-11 min-h-[44px]"
            disabled={sending}
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={!newMessage.trim() || sending}
            className="h-11 w-11 min-w-[44px] min-h-[44px]"
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Chat;
