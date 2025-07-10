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

      const { data, error } = await supabase
        .from('feed_items_view')
        .select('*')
        .order('created_at', { ascending: false })
        .range(currentOffset, currentOffset + ITEMS_PER_PAGE - 1);

      if (error) {
        // Check for authentication errors
        const authErrorHandled = await handleAuthError(error, navigate);
        if (authErrorHandled.shouldSignOut) {
          return; // Exit early as user is being redirected
        }
        throw error;
      }

      const newItems = (data || []) as FeedItem[];

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
