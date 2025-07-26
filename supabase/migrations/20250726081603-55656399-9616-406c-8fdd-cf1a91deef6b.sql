-- Drop existing policies for pack_message_reactions that have performance issues
DROP POLICY IF EXISTS "Pack members can view reactions" ON public.pack_message_reactions;
DROP POLICY IF EXISTS "Pack members can create reactions" ON public.pack_message_reactions;
DROP POLICY IF EXISTS "Users can delete their own reactions" ON public.pack_message_reactions;

-- Create optimized policies with cached auth.uid() calls
CREATE POLICY "Pack members can view reactions" 
ON public.pack_message_reactions 
FOR SELECT 
USING (EXISTS ( SELECT 1
 FROM (pack_messages pm
   JOIN pack_members pmem ON ((pm.pack_id = pmem.pack_id)))
WHERE ((pm.id = pack_message_reactions.message_id) AND (pmem.user_id = (SELECT auth.uid())))));

CREATE POLICY "Pack members can create reactions" 
ON public.pack_message_reactions 
FOR INSERT 
WITH CHECK ((user_id = (SELECT auth.uid())) AND (EXISTS ( SELECT 1
 FROM (pack_messages pm
   JOIN pack_members pmem ON ((pm.pack_id = pmem.pack_id)))
WHERE ((pm.id = pack_message_reactions.message_id) AND (pmem.user_id = (SELECT auth.uid()))))));

CREATE POLICY "Users can delete their own reactions" 
ON public.pack_message_reactions 
FOR DELETE 
USING (user_id = (SELECT auth.uid()));