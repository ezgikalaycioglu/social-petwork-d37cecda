
-- Add boop_count column to pet_profiles table
ALTER TABLE public.pet_profiles 
ADD COLUMN boop_count integer DEFAULT 0 NOT NULL;

-- Create an index on boop_count for potential leaderboard features
CREATE INDEX idx_pet_profiles_boop_count ON public.pet_profiles(boop_count DESC);
