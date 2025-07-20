-- Add missing foreign key constraints to establish proper relationships

-- First, add foreign key from sitter_profiles to user_profiles
-- Note: We need to ensure the relationship exists by referencing the id column properly
ALTER TABLE public.sitter_profiles 
ADD CONSTRAINT fk_sitter_profiles_user_profiles 
FOREIGN KEY (user_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE;

-- Add foreign key from sitter_bookings to sitter_profiles  
ALTER TABLE public.sitter_bookings 
ADD CONSTRAINT fk_sitter_bookings_sitter_profiles 
FOREIGN KEY (sitter_id) REFERENCES public.sitter_profiles(id) ON DELETE CASCADE;

-- Add foreign key from sitter_bookings to user_profiles (for owner)
ALTER TABLE public.sitter_bookings 
ADD CONSTRAINT fk_sitter_bookings_owner_profiles 
FOREIGN KEY (owner_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE;

-- Add foreign key from sitter_bookings to pet_profiles
ALTER TABLE public.sitter_bookings 
ADD CONSTRAINT fk_sitter_bookings_pet_profiles 
FOREIGN KEY (pet_id) REFERENCES public.pet_profiles(id) ON DELETE CASCADE;