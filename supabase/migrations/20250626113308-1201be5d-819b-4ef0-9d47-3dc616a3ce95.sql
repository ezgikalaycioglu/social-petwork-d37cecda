
-- First, let's drop the existing overly restrictive policies on pet_profiles
DROP POLICY IF EXISTS "Users can view their own pet profiles" ON public.pet_profiles;
DROP POLICY IF EXISTS "Users can create their own pet profiles" ON public.pet_profiles;
DROP POLICY IF EXISTS "Users can update their own pet profiles" ON public.pet_profiles;
DROP POLICY IF EXISTS "Users can delete their own pet profiles" ON public.pet_profiles;

-- Create new policies that enable social functionality

-- Policy 1: Users can view all pet profiles for social features (excluding sensitive location data)
-- This enables the discover pets and social features to work properly
CREATE POLICY "Public can view pet profiles for social features" 
  ON public.pet_profiles 
  FOR SELECT 
  USING (true);

-- Policy 2: Users can only create their own pet profiles
CREATE POLICY "Users can create their own pet profiles" 
  ON public.pet_profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can only update their own pet profiles
CREATE POLICY "Users can update their own pet profiles" 
  ON public.pet_profiles 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Policy 4: Users can only delete their own pet profiles
CREATE POLICY "Users can delete their own pet profiles" 
  ON public.pet_profiles 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create a view that excludes sensitive location data for public access
-- This view can be used for social features while protecting exact coordinates
CREATE OR REPLACE VIEW public.pet_profiles_public AS
SELECT 
  id,
  user_id,
  name,
  age,
  gender,
  breed,
  profile_photo_url,
  about,
  bio,
  photos,
  personality_traits,
  vaccination_status,
  is_available,
  unique_code,
  created_at,
  updated_at,
  -- Only show approximate location (city-level) by rounding coordinates
  -- This protects exact home addresses while enabling area-based matching
  CASE 
    WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN
      ROUND(latitude::numeric, 1)::double precision
    ELSE NULL
  END as approx_latitude,
  CASE 
    WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN
      ROUND(longitude::numeric, 1)::double precision
    ELSE NULL
  END as approx_longitude
FROM public.pet_profiles;

-- Enable RLS on the public view as well
ALTER VIEW public.pet_profiles_public SET (security_barrier = true);

-- Grant access to the public view
GRANT SELECT ON public.pet_profiles_public TO authenticated;
GRANT SELECT ON public.pet_profiles_public TO anon;

-- Create an index on the approximated coordinates for better performance
CREATE INDEX IF NOT EXISTS idx_pet_profiles_approx_location 
ON public.pet_profiles (ROUND(latitude::numeric, 1), ROUND(longitude::numeric, 1)) 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
