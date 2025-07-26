-- Drop existing policies for pack_contest_submissions
DROP POLICY IF EXISTS "Pack members can submit to contests" ON public.pack_contest_submissions;
DROP POLICY IF EXISTS "Pack members can view contest submissions" ON public.pack_contest_submissions;

-- Create optimized policies with cached auth.uid() calls
CREATE POLICY "Pack members can submit to contests" 
ON public.pack_contest_submissions 
FOR INSERT 
WITH CHECK ((user_id = (SELECT auth.uid())) AND (EXISTS ( SELECT 1
 FROM (pack_photo_contests ppc
   JOIN pack_members pm ON ((pm.pack_id = ppc.pack_id)))
WHERE ((ppc.id = pack_contest_submissions.contest_id) AND (pm.user_id = (SELECT auth.uid()))))));

CREATE POLICY "Pack members can view contest submissions" 
ON public.pack_contest_submissions 
FOR SELECT 
USING (EXISTS ( SELECT 1
 FROM (pack_photo_contests ppc
   JOIN pack_members pm ON ((pm.pack_id = ppc.pack_id)))
WHERE ((ppc.id = pack_contest_submissions.contest_id) AND (pm.user_id = (SELECT auth.uid())))));