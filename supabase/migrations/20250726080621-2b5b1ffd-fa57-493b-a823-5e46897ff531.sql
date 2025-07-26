-- Optimize RLS policies for pack_contest_votes to improve performance
-- Replace auth.uid() with (select auth.uid()) to cache the result

-- Drop existing policies
DROP POLICY IF EXISTS "Pack members can view contest votes" ON public.pack_contest_votes;
DROP POLICY IF EXISTS "Pack members can vote on contest submissions" ON public.pack_contest_votes;

-- Create optimized policies with cached auth.uid() calls
CREATE POLICY "Pack members can view contest votes" 
ON public.pack_contest_votes
FOR SELECT 
USING (EXISTS ( 
  SELECT 1
  FROM ((pack_contest_submissions pcs
    JOIN pack_photo_contests ppc ON ((ppc.id = pcs.contest_id)))
    JOIN pack_members pm ON ((pm.pack_id = ppc.pack_id)))
  WHERE ((pcs.id = pack_contest_votes.submission_id) AND (pm.user_id = (select auth.uid())))
));

CREATE POLICY "Pack members can vote on contest submissions" 
ON public.pack_contest_votes
FOR INSERT 
WITH CHECK ((user_id = (select auth.uid())) AND (EXISTS ( 
  SELECT 1
  FROM ((pack_contest_submissions pcs
    JOIN pack_photo_contests ppc ON ((ppc.id = pcs.contest_id)))
    JOIN pack_members pm ON ((pm.pack_id = ppc.pack_id)))
  WHERE ((pcs.id = pack_contest_votes.submission_id) AND (pm.user_id = (select auth.uid())))
)));