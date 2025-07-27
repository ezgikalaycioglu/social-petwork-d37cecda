-- Drop existing policies for pack_typing_indicators that have performance issues
DROP POLICY IF EXISTS "Pack members can manage their typing status" ON public.pack_typing_indicators;
DROP POLICY IF EXISTS "Pack members can view typing indicators" ON public.pack_typing_indicators;

-- Create optimized policies with cached auth.uid() calls
CREATE POLICY "Pack members can manage their typing status" 
ON public.pack_typing_indicators 
FOR ALL 
USING (user_id = (SELECT auth.uid()))
WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Pack members can view typing indicators" 
ON public.pack_typing_indicators 
FOR SELECT 
USING (EXISTS ( SELECT 1
 FROM pack_members
WHERE ((pack_members.pack_id = pack_typing_indicators.pack_id) AND (pack_members.user_id = (SELECT auth.uid())))));