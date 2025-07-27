-- Drop existing overlapping policies for pet_profiles
DROP POLICY IF EXISTS "Public can view available pet profiles" ON public.pet_profiles;
DROP POLICY IF EXISTS "Public can view pet profiles for social features" ON public.pet_profiles;
DROP POLICY IF EXISTS "Users can view their own pet profiles" ON public.pet_profiles;

-- Create a single consolidated policy with optimized auth.uid() calls
CREATE POLICY "Consolidated pet profiles view policy" 
ON public.pet_profiles 
FOR SELECT 
USING (
    -- Users can always view their own pets
    (user_id = (SELECT auth.uid())) OR 
    -- Public can view available pets for adoption/social features
    (is_available = true) OR 
    -- Public can view pets with social features enabled
    (enable_social_features = true)
);