-- Drop existing policies for tweet_replies that have performance issues
DROP POLICY IF EXISTS "Users can create replies for their pets" ON public.tweet_replies;
DROP POLICY IF EXISTS "Users can delete their pets' replies" ON public.tweet_replies;
DROP POLICY IF EXISTS "Users can update their pets' replies" ON public.tweet_replies;

-- Create optimized policies with cached auth.uid() calls
CREATE POLICY "Users can create replies for their pets" 
ON public.tweet_replies 
FOR INSERT 
WITH CHECK ((owner_id = (SELECT auth.uid())) AND (EXISTS ( SELECT 1
 FROM pet_profiles
WHERE ((pet_profiles.id = tweet_replies.pet_id) AND (pet_profiles.user_id = (SELECT auth.uid()))))));

CREATE POLICY "Users can delete their pets' replies" 
ON public.tweet_replies 
FOR DELETE 
USING (owner_id = (SELECT auth.uid()));

CREATE POLICY "Users can update their pets' replies" 
ON public.tweet_replies 
FOR UPDATE 
USING (owner_id = (SELECT auth.uid()));