
-- Add location and availability columns to pet_profiles table
ALTER TABLE public.pet_profiles 
ADD COLUMN latitude DOUBLE PRECISION,
ADD COLUMN longitude DOUBLE PRECISION,
ADD COLUMN is_available BOOLEAN DEFAULT false;

-- Create an index for better performance when querying available pets with location
CREATE INDEX idx_pet_profiles_available_location 
ON public.pet_profiles (is_available, latitude, longitude) 
WHERE is_available = true AND latitude IS NOT NULL AND longitude IS NOT NULL;
