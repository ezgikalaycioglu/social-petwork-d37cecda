-- Drop existing policies for pack_messages that have performance issues
DROP POLICY IF EXISTS "Pack members can view messages" ON public.pack_messages;
DROP POLICY IF EXISTS "Pack members can create messages" ON public.pack_messages;
DROP POLICY IF EXISTS "Senders can update their own messages" ON public.pack_messages;

-- Create optimized policies with cached auth.uid() calls
CREATE POLICY "Pack members can view messages" 
ON public.pack_messages 
FOR SELECT 
USING (EXISTS ( SELECT 1
 FROM pack_members
WHERE ((pack_members.pack_id = pack_messages.pack_id) AND (pack_members.user_id = (SELECT auth.uid())))));

CREATE POLICY "Pack members can create messages" 
ON public.pack_messages 
FOR INSERT 
WITH CHECK ((sender_id = (SELECT auth.uid())) AND (EXISTS ( SELECT 1
 FROM pack_members
WHERE ((pack_members.pack_id = pack_messages.pack_id) AND (pack_members.user_id = (SELECT auth.uid()))))));

CREATE POLICY "Senders can update their own messages" 
ON public.pack_messages 
FOR UPDATE 
USING (sender_id = (SELECT auth.uid()));