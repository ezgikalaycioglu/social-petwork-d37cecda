import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useUnreadMessages = () => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user?.id) {
      setUnreadCount(0);
      return;
    }

    const fetchUnreadCount = async () => {
      try {
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

    fetchUnreadCount();

    // Create channel with unique name including random suffix
    const channelName = `unread-messages-${user.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const channel = supabase
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

    return () => {
      channel.unsubscribe();
    };
  }, [user?.id]);

  return { unreadCount };
};
