-- Optimize RLS policies for public.pet_tweets table
-- Replace auth.uid() with (select auth.uid()) for better performance

-- Drop existing policies
DROP POLICY IF EXISTS "Users can create tweets for their pets" ON public.pet_tweets;
DROP POLICY IF EXISTS "Users can delete their pets' tweets" ON public.pet_tweets;
DROP POLICY IF EXISTS "Users can update their pets' tweets" ON public.pet_tweets;

-- Create optimized policies with cached auth.uid() calls
CREATE POLICY "Users can create tweets for their pets" 
ON public.pet_tweets 
FOR INSERT 
WITH CHECK (
  (owner_id = (select auth.uid())) AND 
  (EXISTS ( 
    SELECT 1
    FROM pet_profiles
    WHERE ((pet_profiles.id = pet_tweets.pet_id) AND (pet_profiles.user_id = (select auth.uid())))
  ))
);

CREATE POLICY "Users can delete their pets' tweets" 
ON public.pet_tweets 
FOR DELETE 
USING (owner_id = (select auth.uid()));

CREATE POLICY "Users can update their pets' tweets" 
ON public.pet_tweets 
FOR UPDATE 
USING (owner_id = (select auth.uid()));