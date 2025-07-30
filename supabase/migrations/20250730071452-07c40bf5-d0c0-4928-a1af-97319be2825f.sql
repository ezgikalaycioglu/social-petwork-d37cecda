-- Add foreign key constraint between pet_profiles and user_profiles
ALTER TABLE public.pet_profiles 
ADD CONSTRAINT pet_profiles_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE;