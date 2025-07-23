-- Add tour_completed column to user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN tour_completed BOOLEAN DEFAULT FALSE;