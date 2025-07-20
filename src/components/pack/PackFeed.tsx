import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import PinnedAnnouncement from './PinnedAnnouncement';
import PackPoll from './PackPoll';
import PackPhotoContest from './PackPhotoContest';

interface PackFeedProps {
  packId: string;
}

const PackFeed: React.FC<PackFeedProps> = ({ packId }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [polls, setPolls] = useState([]);
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dismissedAnnouncements, setDismissedAnnouncements] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const fetchFeedData = async () => {
    try {
      setLoading(true);

      // Fetch pinned announcements
      const { data: announcementData, error: announcementError } = await supabase
        .from('pack_announcements')
        .select(`
          *,
          events (
            id,
            title,
            location_name,
            scheduled_time
          )
        `)
        .eq('pack_id', packId)
        .eq('is_pinned', true)
        .order('created_at', { ascending: false });

      if (announcementError) throw announcementError;

      // Fetch polls with votes
      const { data: pollData, error: pollError } = await supabase
        .from('pack_polls')
        .select(`
          *,
          pack_poll_votes (
            option_index,
            user_id
          )
        `)
        .eq('pack_id', packId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (pollError) throw pollError;

      // Get current user for processing
      const { data: currentUserData } = await supabase.auth.getUser();
      
      // Process poll data to include vote counts and user votes
      const processedPolls = pollData?.map(poll => {
        const options = Array.isArray(poll.options) ? poll.options : [];
        const votes = poll.pack_poll_votes || [];
        
        const optionsWithVotes = options.map((option: any, index: number) => ({
          text: option.text || option,
          votes: votes.filter((vote: any) => vote.option_index === index).length
        }));

        const userVote = votes.find((vote: any) => vote.user_id === currentUserData?.user?.id);

        return {
          ...poll,
          options: optionsWithVotes,
          total_votes: votes.length,
          user_vote: userVote?.option_index
        };
      }) || [];

      // Fetch photo contests with submissions
      const { data: contestData, error: contestError } = await supabase
        .from('pack_photo_contests')
        .select(`
          *,
          pack_contest_submissions (
            id,
            photo_url,
            pet_name,
            vote_count,
            user_id,
            pack_contest_votes (user_id)
          )
        `)
        .eq('pack_id', packId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (contestError) throw contestError;

      // Process contest data
      const processedContests = contestData?.map(contest => {
        const submissions = contest.pack_contest_submissions?.map((submission: any) => {
          const userVoted = submission.pack_contest_votes?.some(
            (vote: any) => vote.user_id === currentUserData?.user?.id
          );

          return {
            ...submission,
            user_voted: userVoted
          };
        }) || [];

        const userSubmitted = submissions.some(
          (submission: any) => submission.user_id === currentUserData?.user?.id
        );

        return {
          ...contest,
          submissions,
          user_submitted: userSubmitted
        };
      }) || [];

      setAnnouncements(announcementData || []);
      setPolls(processedPolls);
      setContests(processedContests);

    } catch (error) {
      console.error('Error fetching pack feed:', error);
      toast({
        title: "Error",
        description: "Failed to load pack feed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (packId) {
      fetchFeedData();
    }
  }, [packId]);

  const handleDismissAnnouncement = (announcementId: string) => {
    setDismissedAnnouncements(prev => new Set([...prev, announcementId]));
  };

  const handlePollVote = (pollId: string, optionIndex: number) => {
    // Optimistically update the poll
    setPolls(prev => prev.map(poll => {
      if (poll.id === pollId) {
        const updatedOptions = poll.options.map((option: any, index: number) => ({
          ...option,
          votes: index === optionIndex ? option.votes + 1 : option.votes
        }));
        
        return {
          ...poll,
          options: updatedOptions,
          total_votes: poll.total_votes + 1,
          user_vote: optionIndex
        };
      }
      return poll;
    }));
  };

  const handleContestSubmit = async (contestId: string, photo: File, petName: string) => {
    try {
      // Upload photo to Supabase storage
      const fileExt = photo.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `contest-submissions/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('pet-photos')
        .upload(filePath, photo);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('pet-photos')
        .getPublicUrl(filePath);

      // Get current user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');

      // Submit to database
      const { error: submitError } = await supabase
        .from('pack_contest_submissions')
        .insert({
          contest_id: contestId,
          photo_url: publicUrl,
          pet_name: petName,
          user_id: userData.user.id
        });

      if (submitError) throw submitError;

      // Refresh feed
      fetchFeedData();
      
    } catch (error) {
      console.error('Error submitting photo:', error);
      throw error;
    }
  };

  const handleContestVote = (submissionId: string) => {
    // Optimistically update the contest
    setContests(prev => prev.map(contest => ({
      ...contest,
      submissions: contest.submissions.map(submission => 
        submission.id === submissionId
          ? { ...submission, vote_count: submission.vote_count + 1, user_voted: true }
          : submission
      )
    })));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-card rounded-2xl p-6 shadow-sm">
            <div className="flex items-center space-x-4 mb-4">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  const visibleAnnouncements = announcements.filter(
    (announcement: any) => !dismissedAnnouncements.has(announcement.id)
  );

  return (
    <div className="space-y-6">
      {/* Pinned Announcements */}
      {visibleAnnouncements.map((announcement: any) => (
        <PinnedAnnouncement
          key={announcement.id}
          announcement={announcement}
          onClose={() => handleDismissAnnouncement(announcement.id)}
          onViewDetails={() => {
            // Handle navigation to event details
            console.log('View event details:', announcement.event_id);
          }}
        />
      ))}

      {/* Polls */}
      {polls.map((poll: any) => (
        <PackPoll
          key={poll.id}
          poll={poll}
          onVote={handlePollVote}
        />
      ))}

      {/* Photo Contests */}
      {contests.map((contest: any) => (
        <PackPhotoContest
          key={contest.id}
          contest={contest}
          onSubmit={handleContestSubmit}
          onVote={handleContestVote}
        />
      ))}

      {/* Empty State */}
      {visibleAnnouncements.length === 0 && polls.length === 0 && contests.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
            <div className="w-8 h-8 rounded-full bg-primary/20" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Pack feed is empty</h3>
          <p className="text-muted-foreground">
            Start engaging with your pack by creating polls, contests, or announcements!
          </p>
        </div>
      )}
    </div>
  );
};

export default PackFeed;