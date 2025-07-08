-- Consolidate multiple permissive SELECT policies on public.user_profiles table
-- This improves performance by reducing policy evaluation overhead

-- Drop the existing SELECT policies
DROP POLICY IF EXISTS "Public can view user profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;

-- Create a single consolidated policy that combines both access patterns
CREATE POLICY "Consolidated user profiles view policy" 
ON public.user_profiles
FOR SELECT 
USING (
  -- Allow public access to all user profiles (from "Public can view user profiles")
  true
  -- Note: The "Users can view their own profile" condition is redundant since 
  -- public access already covers users viewing their own profiles
);