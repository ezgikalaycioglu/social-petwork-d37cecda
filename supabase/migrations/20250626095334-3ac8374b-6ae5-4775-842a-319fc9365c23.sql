
-- Add new columns to the pet_profiles table
ALTER TABLE public.pet_profiles 
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS photos TEXT[], -- Array of photo URLs
ADD COLUMN IF NOT EXISTS personality_traits TEXT[], -- Array of personality traits
ADD COLUMN IF NOT EXISTS vaccination_status TEXT CHECK (vaccination_status IN ('Up-to-date', 'Not vaccinated', 'Unknown'));

-- Set default values for existing records
UPDATE public.pet_profiles 
SET 
  bio = about,
  photos = ARRAY[]::TEXT[],
  personality_traits = ARRAY[]::TEXT[],
  vaccination_status = 'Unknown'
WHERE bio IS NULL OR photos IS NULL OR personality_traits IS NULL OR vaccination_status IS NULL;

-- Make the about column nullable since we're replacing it with bio
-- We'll keep both for now to maintain compatibility
