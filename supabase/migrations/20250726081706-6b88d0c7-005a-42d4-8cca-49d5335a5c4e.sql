-- Drop existing policies for pack_message_reads that have performance issues
DROP POLICY IF EXISTS "Pack members can view read receipts" ON public.pack_message_reads;
DROP POLICY IF EXISTS "Pack members can create read receipts" ON public.pack_message_reads;

-- Create optimized policies with cached auth.uid() calls
CREATE POLICY "Pack members can view read receipts" 
ON public.pack_message_reads 
FOR SELECT 
USING (EXISTS ( SELECT 1
 FROM (pack_messages pm
   JOIN pack_members pmem ON ((pm.pack_id = pmem.pack_id)))
WHERE ((pm.id = pack_message_reads.message_id) AND (pmem.user_id = (SELECT auth.uid())))));

CREATE POLICY "Pack members can create read receipts" 
ON public.pack_message_reads 
FOR INSERT 
WITH CHECK ((user_id = (SELECT auth.uid())) AND (EXISTS ( SELECT 1
 FROM (pack_messages pm
   JOIN pack_members pmem ON ((pm.pack_id = pmem.pack_id)))
WHERE ((pm.id = pack_message_reads.message_id) AND (pmem.user_id = (SELECT auth.uid()))))));