import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Heart, Upload, Clock, Trophy, Camera } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ContestPhotoUpload from './ContestPhotoUpload';

interface ContestSubmission {
  id: string;
  photo_url: string;
  pet_name: string;
  vote_count: number;
  user_voted?: boolean;
  user_id: string;
}

interface PhotoContest {
  id: string;
  title: string;
  description?: string;
  ends_at: string;
  created_at: string;
  submissions: ContestSubmission[];
  user_submitted?: boolean;
}

interface PackPhotoContestProps {
  contest: PhotoContest;
  onSubmit: (contestId: string, photo: File, petName: string) => void;
  onVote: (submissionId: string) => void;
}

const PackPhotoContest: React.FC<PackPhotoContestProps> = ({ 
  contest, 
  onSubmit, 
  onVote 
}) => {
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [petName, setPetName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [votingSubmissions, setVotingSubmissions] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const getTimeRemaining = () => {
    const now = new Date();
    const endDate = new Date(contest.ends_at);
    const diffTime = endDate.getTime() - now.getTime();
    
    if (diffTime <= 0) return 'Contest ended';
    
    const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `Ends in ${days}d ${hours}h`;
    return `Ends in ${hours}h`;
  };

  const handleSubmit = async () => {
    if (!selectedPhoto || !petName.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(contest.id, selectedPhoto, petName.trim());
      setIsSubmitModalOpen(false);
      setSelectedPhoto(null);
      setPetName('');
      
      toast({
        title: "Photo submitted!",
        description: "Your photo has been added to the contest.",
      });
    } catch (error) {
      console.error('Error submitting photo:', error);
      toast({
        title: "Error",
        description: "Failed to submit your photo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVote = async (submissionId: string) => {
    if (votingSubmissions.has(submissionId)) return;

    setVotingSubmissions(prev => new Set([...prev, submissionId]));
    
    try {
      // Get current user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('pack_contest_votes')
        .insert({ 
          submission_id: submissionId,
          user_id: userData.user.id
        });

      if (error) throw error;

      onVote(submissionId);
      
      toast({
        title: "Vote recorded!",
        description: "Your vote has been counted.",
      });
    } catch (error) {
      console.error('Error voting on submission:', error);
      toast({
        title: "Error",
        description: "Failed to record your vote. Please try again.",
        variant: "destructive",
      });
    } finally {
      setVotingSubmissions(prev => {
        const newSet = new Set(prev);
        newSet.delete(submissionId);
        return newSet;
      });
    }
  };

  const isContestActive = new Date(contest.ends_at) > new Date();
  const topSubmissions = contest.submissions
    .sort((a, b) => b.vote_count - a.vote_count)
    .slice(0, 6);

  return (
    <Card className="w-full rounded-2xl shadow-sm border-border/50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-coral/10 rounded-full">
              <Camera className="w-5 h-5 text-coral" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">{contest.title}</h3>
              <div className="flex items-center gap-2">
                <Clock className="w-3 h-3 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{getTimeRemaining()}</span>
              </div>
            </div>
          </div>
          
          {isContestActive && (
            <Badge variant={isContestActive ? "default" : "secondary"} className="bg-coral/10 text-coral hover:bg-coral/20">
              <Trophy className="w-3 h-3 mr-1" />
              Active
            </Badge>
          )}
        </div>

        {contest.description && (
          <p className="text-muted-foreground mt-2">{contest.description}</p>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {topSubmissions.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {topSubmissions.map((submission, index) => (
              <div key={submission.id} className="relative group">
                <div className="aspect-square rounded-xl overflow-hidden bg-muted">
                  <img
                    src={submission.photo_url}
                    alt={submission.pet_name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  
                  {index === 0 && submission.vote_count > 0 && (
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-coral text-coral-foreground">
                        <Trophy className="w-3 h-3 mr-1" />
                        Leading
                      </Badge>
                    </div>
                  )}
                </div>
                
                <div className="mt-2 space-y-1">
                  <p className="font-medium text-sm text-foreground">{submission.pet_name}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Heart className="w-3 h-3" />
                      <span>{submission.vote_count} votes</span>
                    </div>
                    
                    {isContestActive && !submission.user_voted && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2 text-xs hover:bg-coral/10 hover:text-coral"
                        onClick={() => handleVote(submission.id)}
                        disabled={votingSubmissions.has(submission.id)}
                      >
                        <Heart className="w-3 h-3 mr-1" />
                        Vote
                      </Button>
                    )}
                    
                    {submission.user_voted && (
                      <Badge variant="secondary" className="text-xs">
                        <Heart className="w-3 h-3 mr-1 fill-current" />
                        Voted
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 space-y-3">
            <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
              <Camera className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <h4 className="font-medium text-foreground">No submissions yet</h4>
              <p className="text-sm text-muted-foreground">Be the first to submit a photo!</p>
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-2 border-t border-border">
          {isContestActive && !contest.user_submitted && (
            <Dialog open={isSubmitModalOpen} onOpenChange={setIsSubmitModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-coral hover:bg-coral-hover text-coral-foreground">
                  <Upload className="w-4 h-4 mr-2" />
                  Submit Your Photo
                </Button>
              </DialogTrigger>
              
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Submit to {contest.title}</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                  <ContestPhotoUpload
                    onPhotoSelected={setSelectedPhoto}
                    selectedPhoto={selectedPhoto}
                  />
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Pet Name</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-input rounded-md"
                      placeholder="Enter your pet's name"
                      value={petName}
                      onChange={(e) => setPetName(e.target.value)}
                    />
                  </div>
                  
                  <Button
                    onClick={handleSubmit}
                    disabled={!selectedPhoto || !petName.trim() || isSubmitting}
                    className="w-full bg-coral hover:bg-coral-hover text-coral-foreground"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Photo'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
          
          <Button variant="outline" size="sm">
            View all submissions ({contest.submissions.length})
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PackPhotoContest;