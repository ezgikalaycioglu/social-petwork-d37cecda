-- Add name field to sitter_profiles table
ALTER TABLE public.sitter_profiles 
ADD COLUMN name TEXT;