-- Create pack polls functionality
CREATE TABLE public.pack_polls (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    pack_id uuid NOT NULL REFERENCES public.packs(id) ON DELETE CASCADE,
    creator_id uuid NOT NULL,
    question text NOT NULL,
    options jsonb NOT NULL DEFAULT '[]'::jsonb, -- Array of poll options
    expires_at timestamp with time zone,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create pack poll votes
CREATE TABLE public.pack_poll_votes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id uuid NOT NULL REFERENCES public.pack_polls(id) ON DELETE CASCADE,
    user_id uuid NOT NULL,
    option_index integer NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE(poll_id, user_id) -- One vote per user per poll
);

-- Create pack announcements for pinned meetups
CREATE TABLE public.pack_announcements (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    pack_id uuid NOT NULL REFERENCES public.packs(id) ON DELETE CASCADE,
    creator_id uuid NOT NULL,
    event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text,
    is_pinned boolean NOT NULL DEFAULT true,
    expires_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create pack photo contests
CREATE TABLE public.pack_photo_contests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    pack_id uuid NOT NULL REFERENCES public.packs(id) ON DELETE CASCADE,
    creator_id uuid NOT NULL,
    title text NOT NULL,
    description text,
    ends_at timestamp with time zone NOT NULL,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create photo contest submissions
CREATE TABLE public.pack_contest_submissions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    contest_id uuid NOT NULL REFERENCES public.pack_photo_contests(id) ON DELETE CASCADE,
    user_id uuid NOT NULL,
    pet_id uuid REFERENCES public.pet_profiles(id) ON DELETE CASCADE,
    photo_url text NOT NULL,
    pet_name text NOT NULL,
    vote_count integer NOT NULL DEFAULT 0,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE(contest_id, user_id) -- One submission per user per contest
);

-- Create photo contest votes
CREATE TABLE public.pack_contest_votes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id uuid NOT NULL REFERENCES public.pack_contest_submissions(id) ON DELETE CASCADE,
    user_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE(submission_id, user_id) -- One vote per user per submission
);

-- Enable RLS on all new tables
ALTER TABLE public.pack_polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pack_poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pack_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pack_photo_contests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pack_contest_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pack_contest_votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pack_polls
CREATE POLICY "Pack members can view polls" ON public.pack_polls
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.pack_members pm 
            WHERE pm.pack_id = pack_polls.pack_id 
            AND pm.user_id = auth.uid()
        )
    );

CREATE POLICY "Pack members can create polls" ON public.pack_polls
    FOR INSERT WITH CHECK (
        creator_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM public.pack_members pm 
            WHERE pm.pack_id = pack_polls.pack_id 
            AND pm.user_id = auth.uid()
        )
    );

-- RLS Policies for pack_poll_votes
CREATE POLICY "Pack members can view poll votes" ON public.pack_poll_votes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.pack_polls pp 
            JOIN public.pack_members pm ON pm.pack_id = pp.pack_id
            WHERE pp.id = pack_poll_votes.poll_id 
            AND pm.user_id = auth.uid()
        )
    );

CREATE POLICY "Pack members can vote on polls" ON public.pack_poll_votes
    FOR INSERT WITH CHECK (
        user_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM public.pack_polls pp 
            JOIN public.pack_members pm ON pm.pack_id = pp.pack_id
            WHERE pp.id = pack_poll_votes.poll_id 
            AND pm.user_id = auth.uid()
        )
    );

-- RLS Policies for pack_announcements
CREATE POLICY "Pack members can view announcements" ON public.pack_announcements
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.pack_members pm 
            WHERE pm.pack_id = pack_announcements.pack_id 
            AND pm.user_id = auth.uid()
        )
    );

CREATE POLICY "Pack admins can create announcements" ON public.pack_announcements
    FOR INSERT WITH CHECK (
        creator_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM public.pack_members pm 
            WHERE pm.pack_id = pack_announcements.pack_id 
            AND pm.user_id = auth.uid()
            AND pm.role IN ('admin', 'owner')
        )
    );

-- RLS Policies for pack_photo_contests
CREATE POLICY "Pack members can view photo contests" ON public.pack_photo_contests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.pack_members pm 
            WHERE pm.pack_id = pack_photo_contests.pack_id 
            AND pm.user_id = auth.uid()
        )
    );

CREATE POLICY "Pack members can create photo contests" ON public.pack_photo_contests
    FOR INSERT WITH CHECK (
        creator_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM public.pack_members pm 
            WHERE pm.pack_id = pack_photo_contests.pack_id 
            AND pm.user_id = auth.uid()
        )
    );

-- RLS Policies for pack_contest_submissions
CREATE POLICY "Pack members can view contest submissions" ON public.pack_contest_submissions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.pack_photo_contests ppc 
            JOIN public.pack_members pm ON pm.pack_id = ppc.pack_id
            WHERE ppc.id = pack_contest_submissions.contest_id 
            AND pm.user_id = auth.uid()
        )
    );

CREATE POLICY "Pack members can submit to contests" ON public.pack_contest_submissions
    FOR INSERT WITH CHECK (
        user_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM public.pack_photo_contests ppc 
            JOIN public.pack_members pm ON pm.pack_id = ppc.pack_id
            WHERE ppc.id = pack_contest_submissions.contest_id 
            AND pm.user_id = auth.uid()
        )
    );

-- RLS Policies for pack_contest_votes
CREATE POLICY "Pack members can view contest votes" ON public.pack_contest_votes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.pack_contest_submissions pcs
            JOIN public.pack_photo_contests ppc ON ppc.id = pcs.contest_id
            JOIN public.pack_members pm ON pm.pack_id = ppc.pack_id
            WHERE pcs.id = pack_contest_votes.submission_id 
            AND pm.user_id = auth.uid()
        )
    );

CREATE POLICY "Pack members can vote on contest submissions" ON public.pack_contest_votes
    FOR INSERT WITH CHECK (
        user_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM public.pack_contest_submissions pcs
            JOIN public.pack_photo_contests ppc ON ppc.id = pcs.contest_id
            JOIN public.pack_members pm ON pm.pack_id = ppc.pack_id
            WHERE pcs.id = pack_contest_votes.submission_id 
            AND pm.user_id = auth.uid()
        )
    );

-- Add triggers for updated_at columns
CREATE TRIGGER update_pack_polls_updated_at
    BEFORE UPDATE ON public.pack_polls
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pack_announcements_updated_at
    BEFORE UPDATE ON public.pack_announcements
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pack_photo_contests_updated_at
    BEFORE UPDATE ON public.pack_photo_contests
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update contest submission vote counts
CREATE OR REPLACE FUNCTION public.update_contest_submission_vote_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.pack_contest_submissions 
        SET vote_count = vote_count + 1 
        WHERE id = NEW.submission_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.pack_contest_submissions 
        SET vote_count = vote_count - 1 
        WHERE id = OLD.submission_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically update vote counts
CREATE TRIGGER update_vote_count_on_contest_vote
    AFTER INSERT OR DELETE ON public.pack_contest_votes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_contest_submission_vote_count();