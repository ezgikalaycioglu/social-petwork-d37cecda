-- Fix user_profiles email exposure security issue
-- Drop existing SELECT policy that may allow unintended access
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;

-- Create a more secure SELECT policy with explicit authentication check
-- This ensures email addresses are only visible to the profile owner
CREATE POLICY "Users can view their own profile securely"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND id = auth.uid()
);

-- Add a comment to document the security measure
COMMENT ON POLICY "Users can view their own profile securely" ON public.user_profiles IS 
'Restricts profile access to authenticated users viewing only their own data. Email addresses are protected from public access.';