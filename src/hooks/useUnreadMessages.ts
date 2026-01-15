import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useUnreadMessages = () => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    fetchUnreadCount();

    // Only subscribe if not already subscribed
    if (!channelRef.current) {
      const channelName = `unread-messages-${user.id}-${Date.now()}`;
      channelRef.current = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'sitter_messages',
          },
          () => {
            fetchUnreadCount();
          }
        )
        .subscribe();
    }

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [user]);

  const fetchUnreadCount = async () => {
    if (!user) return;

    try {
      // First get all conversations the user is part of
      const { data: conversations, error: convError } = await supabase
        .from('sitter_conversations')
        .select('id')
        .or(`participant_a.eq.${user.id},participant_b.eq.${user.id}`);

      if (convError || !conversations) return;

      const conversationIds = conversations.map((c) => c.id);

      if (conversationIds.length === 0) {
        setUnreadCount(0);
        return;
      }

      // Count unread messages in those conversations
      const { count, error } = await supabase
        .from('sitter_messages')
        .select('*', { count: 'exact', head: true })
        .in('conversation_id', conversationIds)
        .neq('sender_user_id', user.id)
        .is('read_at', null);

      if (error) throw error;
      setUnreadCount(count || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  return { unreadCount, refetch: fetchUnreadCount };
};
