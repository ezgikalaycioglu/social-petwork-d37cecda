import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface NotificationState {
  friendRequests: {
    unreadIds: Set<string>;
    totalCount: number;
  };
  eventRequests: {
    unreadIds: Set<string>;
    totalCount: number;
  };
}

interface NotificationsContextType {
  friendRequests: {
    unreadIds: Set<string>;
    totalCount: number;
  };
  eventRequests: {
    unreadIds: Set<string>;
    totalCount: number;
  };
  markFriendRequestAsRead: (requestId: string) => void;
  markEventRequestAsRead: (eventId: string) => void;
  markAllAsRead: () => void;
  getUnreadCount: () => number;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

const STORAGE_KEY = 'notificationUnreadIds';
const STALE_DAYS = 7;

// Helper to get stored unread IDs from localStorage
const getStoredUnreadIds = (): { friendRequests: string[]; eventRequests: string[] } => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return { friendRequests: [], eventRequests: [] };
    
    const parsed = JSON.parse(stored);
    // Clean up stale data
    const staleDate = new Date();
    staleDate.setDate(staleDate.getDate() - STALE_DAYS);
    
    return {
      friendRequests: Array.isArray(parsed.friendRequests) ? parsed.friendRequests : [],
      eventRequests: Array.isArray(parsed.eventRequests) ? parsed.eventRequests : []
    };
  } catch {
    return { friendRequests: [], eventRequests: [] };
  }
};

// Helper to save unread IDs to localStorage
const saveUnreadIds = (friendIds: string[], eventIds: string[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      friendRequests: friendIds,
      eventRequests: eventIds,
      timestamp: new Date().toISOString()
    }));
  } catch (error) {
    console.error('Failed to save notification state:', error);
  }
};

export const NotificationsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [state, setState] = useState<NotificationState>({
    friendRequests: { unreadIds: new Set(), totalCount: 0 },
    eventRequests: { unreadIds: new Set(), totalCount: 0 }
  });

  // Initialize from localStorage
  useEffect(() => {
    const stored = getStoredUnreadIds();
    setState({
      friendRequests: {
        unreadIds: new Set(stored.friendRequests),
        totalCount: stored.friendRequests.length
      },
      eventRequests: {
        unreadIds: new Set(stored.eventRequests),
        totalCount: stored.eventRequests.length
      }
    });
  }, []);

  // Fetch actual counts and sync with stored state
  useEffect(() => {
    if (!user) return;

    const fetchCounts = async () => {
      try {
        // Get user's pet IDs
        const { data: pets } = await supabase
          .from('pet_profiles')
          .select('id')
          .eq('user_id', user.id);

        const petIds = pets?.map(p => p.id) || [];

        // Fetch friend requests
        const { data: friendRequests, error: friendError } = await supabase
          .from('pet_friendships')
          .select('id, created_at')
          .in('recipient_pet_id', petIds)
          .eq('status', 'pending')
          .order('created_at', { ascending: false });

        if (friendError) throw friendError;

        // Fetch event requests
        const { data: eventRequests, error: eventError } = await supabase
          .from('events')
          .select('id, created_at')
          .contains('invited_participants', [user.id])
          .neq('creator_id', user.id)
          .gte('scheduled_time', new Date().toISOString())
          .order('created_at', { ascending: false });

        if (eventError) throw eventError;

        // Get stored unread IDs
        const stored = getStoredUnreadIds();

        // Determine which items are unread (new items or stored as unread)
        const friendIds = friendRequests?.map(r => r.id) || [];
        const eventIds = eventRequests?.map(r => r.id) || [];

        // Items are unread if they're in stored unread list OR are new
        const unreadFriendIds = friendIds.filter(id => 
          stored.friendRequests.includes(id) || 
          !stored.friendRequests.length // If no stored state, mark all as unread
        );

        const unreadEventIds = eventIds.filter(id => 
          stored.eventRequests.includes(id) || 
          !stored.eventRequests.length
        );

        setState({
          friendRequests: {
            unreadIds: new Set(unreadFriendIds),
            totalCount: friendIds.length
          },
          eventRequests: {
            unreadIds: new Set(unreadEventIds),
            totalCount: eventIds.length
          }
        });

        // Save to localStorage
        saveUnreadIds(unreadFriendIds, unreadEventIds);
      } catch (error) {
        console.error('Error fetching notification counts:', error);
      }
    };

    fetchCounts();

    // Set up real-time subscriptions with unique channel names to avoid duplicate subscription errors
    const channelId = `${user.id}-${Date.now()}`;
    const friendsChannel = supabase
      .channel(`friend_requests_notifications_${channelId}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'pet_friendships' },
        () => fetchCounts()
      )
      .subscribe();

    const eventsChannel = supabase
      .channel(`events_notifications_${channelId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'events' },
        () => fetchCounts()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(friendsChannel);
      supabase.removeChannel(eventsChannel);
    };
  }, [user]);

  const markFriendRequestAsRead = (requestId: string) => {
    setState(prev => {
      const newUnreadIds = new Set(prev.friendRequests.unreadIds);
      newUnreadIds.delete(requestId);
      
      const newState = {
        ...prev,
        friendRequests: {
          ...prev.friendRequests,
          unreadIds: newUnreadIds
        }
      };

      // Save to localStorage
      saveUnreadIds(
        Array.from(newUnreadIds),
        Array.from(prev.eventRequests.unreadIds)
      );

      return newState;
    });
  };

  const markEventRequestAsRead = (eventId: string) => {
    setState(prev => {
      const newUnreadIds = new Set(prev.eventRequests.unreadIds);
      newUnreadIds.delete(eventId);
      
      const newState = {
        ...prev,
        eventRequests: {
          ...prev.eventRequests,
          unreadIds: newUnreadIds
        }
      };

      // Save to localStorage
      saveUnreadIds(
        Array.from(prev.friendRequests.unreadIds),
        Array.from(newUnreadIds)
      );

      return newState;
    });
  };

  const markAllAsRead = () => {
    setState(prev => ({
      friendRequests: {
        ...prev.friendRequests,
        unreadIds: new Set()
      },
      eventRequests: {
        ...prev.eventRequests,
        unreadIds: new Set()
      }
    }));

    // Clear localStorage
    saveUnreadIds([], []);
  };

  const getUnreadCount = () => {
    return state.friendRequests.unreadIds.size + state.eventRequests.unreadIds.size;
  };

  return (
    <NotificationsContext.Provider
      value={{
        friendRequests: state.friendRequests,
        eventRequests: state.eventRequests,
        markFriendRequestAsRead,
        markEventRequestAsRead,
        markAllAsRead,
        getUnreadCount
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotificationsContext = () => {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotificationsContext must be used within a NotificationsProvider');
  }
  return context;
};
