
-- Drop the existing view
DROP VIEW IF EXISTS public.pet_profiles_public;

-- Recreate the view with SECURITY INVOKER to respect the querying user's permissions
CREATE VIEW public.pet_profiles_public 
WITH (security_invoker = true)
AS
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
  -- Approximate location for privacy (rounded to ~1km precision)
  ROUND(latitude::numeric, 2) as approx_latitude,
  ROUND(longitude::numeric, 2) as approx_longitude,
  created_at,
  updated_at
FROM public.pet_profiles
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Add RLS policies for the pet_profiles table if they don't exist
-- This ensures proper access control when the view is queried

-- Policy to allow users to view their own pet profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'pet_profiles' 
    AND policyname = 'Users can view their own pet profiles'
  ) THEN
    CREATE POLICY "Users can view their own pet profiles" 
      ON public.pet_profiles 
      FOR SELECT 
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Policy to allow public viewing of pet profiles (for discovery features)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'pet_profiles' 
    AND policyname = 'Public can view available pet profiles'
  ) THEN
    CREATE POLICY "Public can view available pet profiles" 
      ON public.pet_profiles 
      FOR SELECT 
      USING (is_available = true);
  END IF;
END $$;

-- Enable RLS on pet_profiles if not already enabled
ALTER TABLE public.pet_profiles ENABLE ROW LEVEL SECURITY;
