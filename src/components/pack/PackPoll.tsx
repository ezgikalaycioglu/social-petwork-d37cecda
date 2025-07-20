import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BarChart3, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PollOption {
  text: string;
  votes: number;
}

interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  creator_id: string;
  created_at: string;
  total_votes: number;
  user_vote?: number;
  creator_name?: string;
  creator_avatar?: string;
}

interface PackPollProps {
  poll: Poll;
  onVote: (pollId: string, optionIndex: number) => void;
}

const PackPoll: React.FC<PackPollProps> = ({ poll, onVote }) => {
  const [isVoting, setIsVoting] = useState(false);
  const [userVote, setUserVote] = useState<number | undefined>(poll.user_vote);
  const { toast } = useToast();

  const hasVoted = userVote !== undefined;

  const handleVote = async (optionIndex: number) => {
    if (hasVoted || isVoting) return;

    setIsVoting(true);
    try {
      // Get current user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('pack_poll_votes')
        .insert({
          poll_id: poll.id,
          option_index: optionIndex,
          user_id: userData.user.id
        });

      if (error) throw error;

      setUserVote(optionIndex);
      onVote(poll.id, optionIndex);
      
      toast({
        title: "Vote recorded!",
        description: "Your vote has been counted.",
      });
    } catch (error) {
      console.error('Error voting on poll:', error);
      toast({
        title: "Error",
        description: "Failed to record your vote. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVoting(false);
    }
  };

  const getVotePercentage = (optionIndex: number) => {
    if (poll.total_votes === 0) return 0;
    return Math.round((poll.options[optionIndex].votes / poll.total_votes) * 100);
  };

  const getCreatorInitials = () => {
    return poll.creator_name?.split(' ').map(n => n[0]).join('') || 'U';
  };

  return (
    <Card className="w-full rounded-2xl shadow-sm border-border/50">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            {poll.creator_avatar && (
              <AvatarImage src={poll.creator_avatar} alt={poll.creator_name} />
            )}
            <AvatarFallback className="bg-primary/10 text-primary">
              {getCreatorInitials()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground">{poll.creator_name || 'Pack member'}</span>
              <span className="text-muted-foreground text-sm">asked a poll</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <BarChart3 className="w-3 h-3" />
              <span>{new Date(poll.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">{poll.question}</h3>

        <div className="space-y-3">
          {poll.options.map((option, index) => (
            <div key={index} className="w-full">
              {!hasVoted ? (
                <Button
                  variant="outline"
                  className="w-full justify-start p-4 h-auto text-left hover:bg-primary/5 hover:border-primary/20"
                  onClick={() => handleVote(index)}
                  disabled={isVoting}
                >
                  <span className="text-foreground">{option.text}</span>
                </Button>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-foreground font-medium">{option.text}</span>
                      {userVote === index && (
                        <CheckCircle className="w-4 h-4 text-primary" />
                      )}
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">
                      {getVotePercentage(index)}%
                    </span>
                  </div>
                  
                  <Progress 
                    value={getVotePercentage(index)} 
                    className={`h-2 ${userVote === index ? 'bg-primary/20' : 'bg-muted'}`}
                  />
                  
                  <div className="text-xs text-muted-foreground">
                    {option.votes} {option.votes === 1 ? 'vote' : 'votes'}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {hasVoted && (
          <div className="pt-2 border-t border-border">
            <p className="text-sm text-muted-foreground text-center">
              {poll.total_votes} total {poll.total_votes === 1 ? 'vote' : 'votes'} • Poll results are live
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PackPoll;