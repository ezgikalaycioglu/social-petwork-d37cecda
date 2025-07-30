
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, MessageSquare, MapPin, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import AdventureTimeline from '@/components/AdventureTimeline';
import { TweetCard } from '@/components/TweetCard';
import GlobalNavBar from '@/components/GlobalNavBar';

interface PetProfile {
  id: string;
  name: string;
  user_id: string;
  profile_photo_url: string | null;
}

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

const PetAdventures = () => {
  const { petId } = useParams<{ petId: string }>();
  const navigate = useNavigate();
  const [pet, setPet] = useState<PetProfile | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [tweetsLoading, setTweetsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (petId) {
      fetchPetAndUser();
      fetchPetTweets();
    }
  }, [petId]);

  const fetchPetAndUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);

      const { data: petData, error: petError } = await supabase
        .from('pet_profiles')
        .select('id, name, user_id, profile_photo_url, breed')
        .eq('id', petId)
        .single();

      if (petError) throw petError;
      setPet(petData);
    } catch (error) {
      console.error('Error fetching pet:', error);
      toast({
        title: "Error",
        description: "Failed to load pet profile",
        variant: "destructive",
      });
      navigate('/my-pets');
    } finally {
      setLoading(false);
    }
  };

  const fetchPetTweets = async () => {
    setTweetsLoading(true);
    try {
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
        .eq('pet_id', petId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTweets(data || []);
    } catch (error) {
      console.error('Error fetching pet tweets:', error);
      toast({
        title: "Error",
        description: "Failed to load pet tweets",
        variant: "destructive",
      });
    } finally {
      setTweetsLoading(false);
    }
  };

  const handleDeleteTweet = async (tweetId: string) => {
    try {
      const { error } = await supabase
        .from('pet_tweets')
        .delete()
        .eq('id', tweetId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Tweet deleted successfully",
      });
      
      fetchPetTweets();
    } catch (error) {
      console.error('Error deleting tweet:', error);
      toast({
        title: "Error",
        description: "Failed to delete tweet",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <GlobalNavBar />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="min-h-screen bg-gray-50">
        <GlobalNavBar />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Pet Not Found</h1>
          <Button onClick={() => navigate('/my-pets')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to My Pets
          </Button>
        </div>
      </div>
    );
  }

  const isOwner = currentUserId === pet.user_id;

  return (
    <div className="min-h-screen bg-gray-50">
      <GlobalNavBar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/my-pets')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Pets
          </Button>
          
          <div className="flex items-center gap-4 mb-6">
            {pet.profile_photo_url && (
              <img
                src={pet.profile_photo_url}
                alt={pet.name}
                className="w-16 h-16 rounded-full object-cover border-4 border-green-200"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{pet.name}'s Profile</h1>
              <p className="text-gray-600">
                {isOwner ? 'Your pet\'s adventures and tweets' : `${pet.name}'s shared content`}
              </p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="adventures" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="adventures" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Adventures
            </TabsTrigger>
            <TabsTrigger value="tweets" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Tweets
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="adventures" className="mt-6">
            <AdventureTimeline
              petId={pet.id}
              petName={pet.name}
              isOwner={isOwner}
            />
          </TabsContent>
          
          <TabsContent value="tweets" className="mt-6">
            {tweetsLoading ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Loading tweets...</p>
              </div>
            ) : tweets.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold mb-2">No Tweets Yet</h3>
                <p className="text-gray-600">
                  {isOwner ? `${pet.name} hasn't tweeted anything yet.` : `${pet.name} has no tweets to show.`}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {tweets.map((tweet) => (
                  <div key={tweet.id} className="relative">
                    <TweetCard
                      tweet={tweet}
                      petInfo={tweet.pet_profiles}
                      userPets={[]}
                    />
                    {isOwner && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2 opacity-75 hover:opacity-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Tweet</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this tweet? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteTweet(tweet.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PetAdventures;
