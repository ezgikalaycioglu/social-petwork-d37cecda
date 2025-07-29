import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { TweetCard } from './TweetCard';
import { CreateTweetModal } from './CreateTweetModal';
import { handleAuthError } from '@/utils/authErrorHandler';
import { Plus, PawPrint } from 'lucide-react';

interface Tweet {
  id: string;
  content: string;
  photo_url?: string;
  created_at: string;
  pet_id: string;
  owner_id: string;
  pet_profiles: {
    name: string;
    profile_photo_url?: string;
    breed: string;
  };
}

interface UserPet {
  id: string;
  name: string;
  profile_photo_url?: string;
}

const TWEETS_PER_PAGE = 10;

export const TweetFeed: React.FC = () => {
  const navigate = useNavigate();
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [userPets, setUserPets] = useState<UserPet[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { toast } = useToast();

  // Fetch user's pets for tweet creation
  const fetchUserPets = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('pet_profiles')
        .select('id, name, profile_photo_url')
        .eq('user_id', user.id);

      if (error) throw error;
      setUserPets(data || []);
    } catch (error) {
      console.error('Error fetching user pets:', error);
    }
  }, []);

  // Fetch tweets
  const fetchTweets = useCallback(async (isInitial = true) => {
    try {
      console.log('🔄 Fetching tweets...', { isInitial, currentOffset: isInitial ? 0 : offset });
      
      if (isInitial) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const currentOffset = isInitial ? 0 : offset;

      // Simplified query - let's first get tweets loading, then add privacy filter
      const { data, error } = await supabase
        .from('pet_tweets')
        .select(`
          id,
          content,
          photo_url,
          created_at,
          pet_id,
          owner_id,
          pet_profiles!inner(
            name, 
            profile_photo_url, 
            breed
          )
        `)
        .order('created_at', { ascending: false })
        .range(currentOffset, currentOffset + TWEETS_PER_PAGE - 1);

      console.log('📊 Tweet query result:', { data, error, dataLength: data?.length });

      if (error) {
        console.error('❌ Tweet fetch error:', error);
        const authErrorHandled = await handleAuthError(error, navigate);
        if (authErrorHandled.shouldSignOut) {
          return;
        }
        throw error;
      }

      const newTweets = (data || []) as Tweet[];
      console.log('✅ Processed tweets:', newTweets.length);

      if (isInitial) {
        setTweets(newTweets);
        setOffset(newTweets.length);
      } else {
        setTweets(prev => [...prev, ...newTweets]);
        setOffset(prev => prev + newTweets.length);
      }

      setHasMore(newTweets.length === TWEETS_PER_PAGE);

    } catch (error) {
      console.error('Error fetching tweets:', error);
      
      const authErrorHandled = await handleAuthError(error, navigate);
      
      if (!authErrorHandled.shouldSignOut) {
        toast({
          title: "Error",
          description: "Error loading tweets",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [offset, toast, navigate]);

  // Load more tweets for infinite scroll
  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      fetchTweets(false);
    }
  }, [fetchTweets, loadingMore, hasMore]);

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
    fetchUserPets();
    fetchTweets(true);
  }, []);

  // Real-time subscriptions for new tweets
  useEffect(() => {
    const channel = supabase
      .channel('pet_tweets_changes')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'pet_tweets' },
        (payload) => {
          console.log('New tweet:', payload);
          fetchTweets(true);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchTweets]);

  const handleTweetCreated = () => {
    fetchTweets(true);
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-card rounded-lg shadow-sm p-6">
            <div className="flex items-center space-x-4 mb-4">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-4" />
            <Skeleton className="h-32 w-full rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto relative">
      {tweets.length === 0 ? (
        <div className="text-center py-12">
          <PawPrint className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-semibold mb-2">No Tweets Yet</h2>
          <p className="text-muted-foreground mb-4">
            Be the first to tweet! What's your pet up to?
          </p>
          {userPets.length > 0 && (
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              First Tweet
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {tweets.map((tweet) => (
            <TweetCard
              key={tweet.id}
              tweet={tweet}
              petInfo={tweet.pet_profiles}
              userPets={userPets}
            />
          ))}
          
          {loadingMore && (
            <div className="bg-card rounded-lg shadow-sm p-6">
              <div className="flex items-center space-x-4 mb-4">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-32 w-full rounded-lg" />
            </div>
          )}
          
          {!hasMore && tweets.length > 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">You've seen all tweets!</p>
            </div>
          )}
        </div>
      )}


      {/* Create Tweet Modal */}
      <CreateTweetModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        pets={userPets}
        onTweetCreated={handleTweetCreated}
      />
    </div>
  );
};