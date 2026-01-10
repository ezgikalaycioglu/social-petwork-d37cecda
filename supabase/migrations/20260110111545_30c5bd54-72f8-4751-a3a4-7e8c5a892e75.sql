-- Add new fields to sitter_profiles for public profile feature
ALTER TABLE public.sitter_profiles 
ADD COLUMN IF NOT EXISTS headline TEXT,
ADD COLUMN IF NOT EXISTS years_experience TEXT,
ADD COLUMN IF NOT EXISTS accepted_pet_types TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS response_time TEXT DEFAULT 'Within a few hours';

-- Add index for faster lookups when accessing public profiles
CREATE INDEX IF NOT EXISTS idx_sitter_profiles_user_id ON public.sitter_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_sitter_profiles_is_active ON public.sitter_profiles(is_active) WHERE is_active = true;