import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { PawPrint } from 'lucide-react';
import { handleAuthError } from '@/utils/authErrorHandler';
import NewPetCard from './feed/NewPetCard';
import AdventureCard from './feed/AdventureCard';
import GroupWalkCard from './feed/GroupWalkCard';

interface FeedItem {
  item_type: 'new_pet' | 'new_adventure' | 'group_walk';
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  created_at: string;
  user_id: string;
  user_display_name: string | null;
  location_name: string | null;
  event_id: string | null;
}

const ITEMS_PER_PAGE = 10;

const SocialFeed: React.FC = () => {
  const navigate = useNavigate();
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const { toast } = useToast();

  // Fetch initial feed items
  const fetchFeedItems = useCallback(async (isInitial = true) => {
    try {
      if (isInitial) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const currentOffset = isInitial ? 0 : offset;

      // Fetch feed data from separate tables instead of using the dropped view
      const [petsResponse, adventuresResponse, eventsResponse] = await Promise.all([
        // New pets (last 30 days)
        supabase
          .from('pet_profiles')
          .select(`
            id, name, bio, about, profile_photo_url, created_at, user_id
          `)
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
          .order('created_at', { ascending: false })
          .limit(5),
        
        // Recent adventures
        supabase
          .from('adventures')
          .select(`
            id, title, description, photos, created_at, owner_id
          `)
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
          .order('created_at', { ascending: false })
          .limit(5),
        
        // Upcoming group walks
        supabase
          .from('events')
          .select(`
            id, title, message, location_name, created_at, creator_id
          `)
          .eq('event_type', 'group_walk')
          .eq('status', 'pending')
          .gt('scheduled_time', new Date().toISOString())
          .order('created_at', { ascending: false })
          .limit(5)
      ]);

      // Check for errors
      if (petsResponse.error) throw petsResponse.error;
      if (adventuresResponse.error) throw adventuresResponse.error;
      if (eventsResponse.error) throw eventsResponse.error;

      // Fetch user display names separately for privacy
      const userIds = [
        ...(petsResponse.data || []).map(pet => pet.user_id),
        ...(adventuresResponse.data || []).map(adventure => adventure.owner_id),
        ...(eventsResponse.data || []).map(event => event.creator_id)
      ];
      
      const { data: userProfiles } = await supabase
        .from('user_profiles')
        .select('id, display_name')
        .in('id', [...new Set(userIds)]);

      const userDisplayNames = (userProfiles || []).reduce((acc, profile) => {
        acc[profile.id] = profile.display_name;
        return acc;
      }, {} as Record<string, string>);

      // Transform data to feed items format
      const feedItemsData: FeedItem[] = [
        // New pets
        ...(petsResponse.data || []).map(pet => ({
          item_type: 'new_pet' as const,
          id: pet.id,
          title: pet.name,
          description: pet.bio || pet.about || 'Just joined the network!',
          image_url: pet.profile_photo_url,
          created_at: pet.created_at,
          user_id: pet.user_id,
          user_display_name: userDisplayNames[pet.user_id] || null,
          location_name: null,
          event_id: null
        })),
        
        // Adventures
        ...(adventuresResponse.data || []).map(adventure => ({
          item_type: 'new_adventure' as const,
          id: adventure.id,
          title: adventure.title,
          description: adventure.description || '',
          image_url: adventure.photos && adventure.photos.length > 0 ? adventure.photos[0] : null,
          created_at: adventure.created_at,
          user_id: adventure.owner_id,
          user_display_name: userDisplayNames[adventure.owner_id] || null,
          location_name: null,
          event_id: null
        })),
        
        // Group walks
        ...(eventsResponse.data || []).map(event => ({
          item_type: 'group_walk' as const,
          id: event.id,
          title: event.title || 'Group Walk Event',
          description: event.message || 'Join us for a fun group walk!',
          image_url: null,
          created_at: event.created_at,
          user_id: event.creator_id,
          user_display_name: userDisplayNames[event.creator_id] || null,
          location_name: event.location_name,
          event_id: event.id
        }))
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      // Apply pagination
      const startIndex = currentOffset;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      const newItems = feedItemsData.slice(startIndex, endIndex);

      // No error handling needed here as we already checked each response above

      // newItems is already defined above

      if (isInitial) {
        setFeedItems(newItems);
        setOffset(newItems.length);
      } else {
        setFeedItems(prev => [...prev, ...newItems]);
        setOffset(prev => prev + newItems.length);
      }

      setHasMore(newItems.length === ITEMS_PER_PAGE);

    } catch (error) {
      console.error('Error fetching feed items:', error);
      
      // Double-check for auth errors
      const authErrorHandled = await handleAuthError(error, navigate);
      
      if (!authErrorHandled.shouldSignOut) {
        // Only show error toast if it's not an auth error
        toast({
          title: "Error",
          description: "Failed to load feed items. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [offset, toast, navigate]);

  // Load more items for infinite scroll
  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      fetchFeedItems(false);
    }
  }, [fetchFeedItems, loadingMore, hasMore]);

  // Handle scroll for infinite loading
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop
        >= document.documentElement.offsetHeight - 1000
      ) {
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMore]);

  // Initial data fetch
  useEffect(() => {
    fetchFeedItems(true);
  }, []);

  // Real-time subscriptions
  useEffect(() => {
    const channels = [
      // Listen for new pet profiles
      supabase
        .channel('pet_profiles_changes')
        .on('postgres_changes', 
          { event: 'INSERT', schema: 'public', table: 'pet_profiles' },
          (payload) => {
            console.log('New pet profile:', payload);
            // Refresh feed to get the new item with proper formatting
            fetchFeedItems(true);
          }
        ),

      // Listen for new adventures
      supabase
        .channel('adventures_changes')
        .on('postgres_changes', 
          { event: 'INSERT', schema: 'public', table: 'adventures' },
          (payload) => {
            console.log('New adventure:', payload);
            fetchFeedItems(true);
          }
        ),

      // Listen for new events
      supabase
        .channel('events_changes')
        .on('postgres_changes', 
          { event: 'INSERT', schema: 'public', table: 'events' },
          (payload) => {
            console.log('New event:', payload);
            if (payload.new.event_type === 'group_walk') {
              fetchFeedItems(true);
            }
          }
        )
    ];

    // Subscribe to all channels
    channels.forEach(channel => channel.subscribe());

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [fetchFeedItems]);

  const renderFeedItem = (item: FeedItem) => {
    switch (item.item_type) {
      case 'new_pet':
        return <NewPetCard key={`${item.item_type}-${item.id}`} item={item} />;
      case 'new_adventure':
        return <AdventureCard key={`${item.item_type}-${item.id}`} item={item} />;
      case 'group_walk':
        return <GroupWalkCard key={`${item.item_type}-${item.id}`} item={item} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-4 mb-4">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-4" />
            <Skeleton className="h-48 w-full rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {feedItems.length === 0 ? (
        <div className="text-center py-12">
          <PawPrint className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">No Recent Activity</h2>
          <p className="text-gray-600">
            Be the first to share something! Create a pet profile or log an adventure.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {feedItems.map(renderFeedItem)}
          
          {loadingMore && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center space-x-4 mb-4">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-48 w-full rounded-lg" />
            </div>
          )}
          
          {!hasMore && feedItems.length > 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">You've reached the end of the feed!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SocialFeed;
