
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Heart, MessageCircle, Smile, Laugh, Frown, Eye, Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { enUS } from "date-fns/locale";

interface TweetCardProps {
  tweet: {
    id: string;
    content: string;
    photo_url?: string;
    created_at: string;
    pet_id: string;
    owner_id: string;
  };
  petInfo: {
    name: string;
    profile_photo_url?: string;
    breed: string;
  };
  userPets: Array<{
    id: string;
    name: string;
  }>;
}

interface Reaction {
  id: string;
  pet_id: string;
  reaction_type: string;
  pet_name: string;
}

interface Reply {
  id: string;
  content: string;
  created_at: string;
  pet_id: string;
  pet_name: string;
  pet_photo?: string;
}

const reactionIcons = {
  like: Heart,
  love: Heart,
  laugh: Laugh,
  wow: Eye,
  sad: Frown,
};

const reactionColors = {
  like: "text-red-500",
  love: "text-pink-500",
  laugh: "text-yellow-500",
  wow: "text-blue-500",
  sad: "text-gray-500",
};

export const TweetCard: React.FC<TweetCardProps> = ({ tweet, petInfo, userPets }) => {
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [showReplies, setShowReplies] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [selectedPetId, setSelectedPetId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchReactions();
    fetchReplies();
  }, [tweet.id]);

  const fetchReactions = async () => {
    try {
      const { data, error } = await supabase
        .from('tweet_reactions')
        .select(`
          id,
          pet_id,
          reaction_type,
          pet_profiles!inner(name)
        `)
        .eq('tweet_id', tweet.id);

      if (error) throw error;

      setReactions(data.map(r => ({
        id: r.id,
        pet_id: r.pet_id,
        reaction_type: r.reaction_type,
        pet_name: r.pet_profiles.name
      })));
    } catch (error) {
      console.error('Error fetching reactions:', error);
    }
  };

  const fetchReplies = async () => {
    try {
      const { data, error } = await supabase
        .from('tweet_replies')
        .select(`
          id,
          content,
          created_at,
          pet_id,
          pet_profiles!inner(name, profile_photo_url)
        `)
        .eq('tweet_id', tweet.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setReplies(data.map(r => ({
        id: r.id,
        content: r.content,
        created_at: r.created_at,
        pet_id: r.pet_id,
        pet_name: r.pet_profiles.name,
        pet_photo: r.pet_profiles.profile_photo_url
      })));
    } catch (error) {
      console.error('Error fetching replies:', error);
    }
  };

  const handleReaction = async (reactionType: string) => {
    if (!selectedPetId) {
      toast({
        title: "Select Pet",
        description: "Please first select which pet is reacting",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Check if reaction already exists
      const existingReaction = reactions.find(
        r => r.pet_id === selectedPetId && r.reaction_type === reactionType
      );

      if (existingReaction) {
        // Remove reaction
        const { error } = await supabase
          .from('tweet_reactions')
          .delete()
          .eq('id', existingReaction.id);

        if (error) throw error;
      } else {
        // Add reaction
        const { error } = await supabase
          .from('tweet_reactions')
          .insert({
            tweet_id: tweet.id,
            pet_id: selectedPetId,
            owner_id: user.id,
            reaction_type: reactionType,
          });

        if (error) throw error;
      }

      fetchReactions();
    } catch (error) {
      console.error('Error handling reaction:', error);
      toast({
        title: "Error",
        description: "Error adding reaction",
        variant: "destructive",
      });
    }
  };

  const handleReply = async () => {
    if (!replyContent.trim() || !selectedPetId) {
      toast({
        title: "Error",
        description: "Please write a reply and select a pet",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('tweet_replies')
        .insert({
          tweet_id: tweet.id,
          pet_id: selectedPetId,
          owner_id: user.id,
          content: replyContent.trim(),
        });

      if (error) throw error;

      setReplyContent('');
      setShowReplyForm(false);
      fetchReplies();
      setShowReplies(true);

      toast({
        title: "Success!",
        description: "Reply posted",
      });
    } catch (error) {
      console.error('Error creating reply:', error);
      toast({
        title: "Error",
        description: "Error posting reply",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const groupedReactions = reactions.reduce((acc, reaction) => {
    if (!acc[reaction.reaction_type]) {
      acc[reaction.reaction_type] = [];
    }
    acc[reaction.reaction_type].push(reaction);
    return acc;
  }, {} as Record<string, Reaction[]>);

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={petInfo.profile_photo_url} />
            <AvatarFallback>{petInfo.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{petInfo.name}</h3>
              <Badge variant="secondary" className="text-xs">
                {petInfo.breed}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(tweet.created_at), { 
                addSuffix: true, 
                locale: enUS 
              })}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-sm mb-3">{tweet.content}</p>
        
        {tweet.photo_url && (
          <img
            src={tweet.photo_url}
            alt="Tweet photo"
            className="rounded-lg max-h-64 w-full object-cover mb-3"
          />
        )}

        {/* Pet Selection for User Actions */}
        {userPets.length > 0 && (
          <div className="mb-3 p-2 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground mb-2">Which pet?</p>
            <div className="flex gap-2 flex-wrap">
              {userPets.map((pet) => (
                <Button
                  key={pet.id}
                  variant={selectedPetId === pet.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedPetId(pet.id)}
                  className="text-xs"
                >
                  {pet.name}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Reactions Display */}
        {Object.keys(groupedReactions).length > 0 && (
          <div className="flex gap-2 mb-3 flex-wrap">
            {Object.entries(groupedReactions).map(([type, reactionList]) => {
              const Icon = reactionIcons[type as keyof typeof reactionIcons];
              return (
                <Badge key={type} variant="secondary" className="text-xs">
                  <Icon className={`h-3 w-3 mr-1 ${reactionColors[type as keyof typeof reactionColors]}`} />
                  {reactionList.length}
                </Badge>
              );
            })}
          </div>
        )}

        {/* Action Buttons - Updated layout with icons above text */}
        <div className="grid grid-cols-6 gap-1 mb-3">
          {Object.keys(reactionIcons).map((type) => {
            const Icon = reactionIcons[type as keyof typeof reactionIcons];
            const hasReacted = reactions.some(
              r => r.pet_id === selectedPetId && r.reaction_type === type
            );
            return (
              <Button
                key={type}
                variant={hasReacted ? "default" : "ghost"}
                size="sm"
                onClick={() => handleReaction(type)}
                disabled={!selectedPetId}
                className="flex flex-col items-center p-2 h-auto text-xs"
              >
                <Icon className={`h-4 w-4 mb-1 ${hasReacted ? 'text-white' : reactionColors[type as keyof typeof reactionColors]}`} />
                <span className="leading-none">
                  {type === 'like' ? 'Like' : type === 'love' ? 'Love' : type === 'laugh' ? 'Laugh' : type === 'wow' ? 'Wow' : 'Sad'}
                </span>
              </Button>
            );
          })}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowReplyForm(!showReplyForm)}
            className="flex flex-col items-center p-2 h-auto text-xs"
          >
            <MessageCircle className="h-4 w-4 mb-1" />
            <span className="leading-none">Reply</span>
          </Button>
        </div>

        {/* Reply Form */}
        {showReplyForm && (
          <div className="mb-3 p-3 border rounded-lg">
            <Textarea
              placeholder="Write your reply..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="mb-2"
              rows={2}
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleReply}
                disabled={isLoading || !replyContent.trim() || !selectedPetId}
              >
                <Send className="h-3 w-3 mr-1" />
                {isLoading ? "Posting..." : "Post"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReplyForm(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Replies */}
        {replies.length > 0 && (
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowReplies(!showReplies)}
              className="text-xs mb-2"
            >
              {replies.length} {replies.length === 1 ? 'reply' : 'replies'} {showReplies ? 'hide' : 'show'}
            </Button>
            
            {showReplies && (
              <div className="space-y-2 pl-4 border-l-2 border-muted">
                {replies.map((reply) => (
                  <div key={reply.id} className="flex gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={reply.pet_photo} />
                      <AvatarFallback className="text-xs">{reply.pet_name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium">{reply.pet_name}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(reply.created_at), { 
                            addSuffix: true, 
                            locale: enUS 
                          })}
                        </span>
                      </div>
                      <p className="text-xs">{reply.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
