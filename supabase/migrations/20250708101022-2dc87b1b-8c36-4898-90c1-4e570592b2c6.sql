-- Add missing index on user_id foreign key column for better performance
-- This resolves the unindexed foreign key constraint issue on pet_profiles_user_id_fkey

CREATE INDEX idx_pet_profiles_user_id ON public.pet_profiles(user_id);