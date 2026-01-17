import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MessageSquare, Loader2 } from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';

interface Conversation {
  id: string;
  participant_a: string;
  participant_b: string;
  last_message_at: string;
  booking_id: string | null;
  other_user: {
    id: string;
    display_name: string | null;
    email: string | null;
  } | null;
  last_message?: {
    body: string;
    sender_user_id: string;
  } | null;
  unread_count: number;
}

const Messages = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchConversations();
    
    // Subscribe to new messages for real-time updates
    const channel = supabase
      .channel('conversations-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sitter_messages',
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchConversations = async () => {
    if (!user) return;
    
    try {
      // Fetch conversations where user is a participant
      const { data: convos, error } = await supabase
        .from('sitter_conversations')
        .select('*')
        .or(`participant_a.eq.${user.id},participant_b.eq.${user.id}`)
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      // For each conversation, fetch the other user's details and last message
      const conversationsWithDetails = await Promise.all(
        (convos || []).map(async (conv) => {
          const otherUserId = conv.participant_a === user.id ? conv.participant_b : conv.participant_a;

          // Fetch other user profile
          const { data: userProfile } = await supabase
            .from('user_profiles')
            .select('id, display_name, email')
            .eq('id', otherUserId)
            .single();

          // Fetch last message
          const { data: lastMessage } = await supabase
            .from('sitter_messages')
            .select('body, sender_user_id')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          // Count unread messages
          const { count: unreadCount } = await supabase
            .from('sitter_messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .neq('sender_user_id', user.id)
            .is('read_at', null);

          return {
            ...conv,
            other_user: userProfile,
            last_message: lastMessage,
            unread_count: unreadCount || 0,
          };
        })
      );

      setConversations(conversationsWithDetails);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) {
      return format(date, 'HH:mm');
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'MMM d');
    }
  };

  const getInitials = (name: string | null, email: string | null) => {
    if (name) return name.charAt(0).toUpperCase();
    if (email) return email.charAt(0).toUpperCase();
    return 'U';
  };

  if (!user) {
    return (
      <div className="container max-w-2xl mx-auto p-4">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Please log in to view your messages.</p>
          <Button onClick={() => navigate('/auth')} className="mt-4">
            Sign In
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto p-4 pb-24">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate('/pet-sitters')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-bold">Messages</h1>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : conversations.length === 0 ? (
        <Card className="p-8 text-center">
          <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No messages yet</h3>
          <p className="text-muted-foreground mb-4">
            Start a conversation by booking a pet sitter or messaging from their profile.
          </p>
          <Button onClick={() => navigate('/pet-sitters')}>
            Find Pet Sitters
          </Button>
        </Card>
      ) : (
        <div className="space-y-2">
          {conversations.map((conv) => (
            <Card
              key={conv.id}
              className="p-4 cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => navigate(`/messages/${conv.id}`)}
            >
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(conv.other_user?.display_name || null, conv.other_user?.email || null)}
                    </AvatarFallback>
                  </Avatar>
                  {conv.unread_count > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {conv.unread_count > 9 ? '9+' : conv.unread_count}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className={`font-semibold truncate ${conv.unread_count > 0 ? 'text-foreground' : 'text-foreground'}`}>
                      {conv.other_user?.display_name || conv.other_user?.email || 'Unknown User'}
                    </h3>
                    <span className="text-xs text-muted-foreground ml-2">
                      {formatMessageTime(conv.last_message_at)}
                    </span>
                  </div>
                  <p className={`text-sm truncate ${conv.unread_count > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                    {conv.last_message?.sender_user_id === user.id ? 'You: ' : ''}
                    {conv.last_message?.body || 'No messages yet'}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Messages;
