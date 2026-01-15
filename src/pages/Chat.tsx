import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Send, Loader2, Calendar, AlertCircle } from 'lucide-react';
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
          setMessages((prev) => [...prev, newMsg]);
          
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

    setSending(true);
    try {
      const { error } = await supabase.from('sitter_messages').insert({
        conversation_id: conversationId,
        sender_user_id: user.id,
        body: newMessage.trim(),
      });

      if (error) throw error;
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
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
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b bg-background">
        <Button variant="ghost" size="icon" onClick={() => navigate('/messages')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <Avatar className="h-10 w-10">
          <AvatarImage src="" />
          <AvatarFallback className="bg-primary/10 text-primary">
            {getInitials(otherUser?.display_name || null, otherUser?.email || null)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h2 className="font-semibold">
            {otherUser?.display_name || otherUser?.email || 'Loading...'}
          </h2>
        </div>
      </div>

      {/* Booking Context Card */}
      {bookingContext && (
        <div className="p-4 border-b">
          <Card className="p-3 bg-accent/50">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">{bookingContext.pet_name}</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">
                {format(new Date(bookingContext.start_date), 'MMM d')} - {format(new Date(bookingContext.end_date), 'MMM d, yyyy')}
              </span>
              <span className={`ml-auto px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(bookingContext.status)}`}>
                {bookingContext.status.charAt(0).toUpperCase() + bookingContext.status.slice(1)}
              </span>
            </div>
          </Card>
        </div>
      )}

      {/* Privacy Notice */}
      <div className="px-4 pt-2">
        <Alert className="bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800 text-xs">
            Only share personal contact info (phone, email) in chat if you choose to. PawCult does not automatically share this information.
          </AlertDescription>
        </Alert>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
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

      {/* Message Input */}
      <form onSubmit={sendMessage} className="p-4 border-t bg-background">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
            disabled={sending}
          />
          <Button type="submit" size="icon" disabled={!newMessage.trim() || sending}>
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
