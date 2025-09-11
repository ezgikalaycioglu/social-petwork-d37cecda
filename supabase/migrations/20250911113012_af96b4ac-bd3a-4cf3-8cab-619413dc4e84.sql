-- Fix infinite recursion in pet_profiles policies
-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can view their own pets" ON public.pet_profiles;
DROP POLICY IF EXISTS "Users can create their own pets" ON public.pet_profiles;
DROP POLICY IF EXISTS "Users can update their own pets" ON public.pet_profiles;
DROP POLICY IF EXISTS "Users can delete their own pets" ON public.pet_profiles;
DROP POLICY IF EXISTS "Users can view all pets" ON public.pet_profiles;
DROP POLICY IF EXISTS "Public can view all pets" ON public.pet_profiles;
DROP POLICY IF EXISTS "Allow pet discovery" ON public.pet_profiles;
DROP POLICY IF EXISTS "Users can view pets based on privacy" ON public.pet_profiles;

-- Create simple, non-recursive policies
CREATE POLICY "Users can view their own pets" 
ON public.pet_profiles 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own pets" 
ON public.pet_profiles 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own pets" 
ON public.pet_profiles 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own pets" 
ON public.pet_profiles 
FOR DELETE 
USING (user_id = auth.uid());

-- Allow viewing other pets for discovery (without location data)
CREATE POLICY "Allow pet discovery" 
ON public.pet_profiles 
FOR SELECT 
USING (
  user_id != auth.uid() AND 
  is_available = true
);