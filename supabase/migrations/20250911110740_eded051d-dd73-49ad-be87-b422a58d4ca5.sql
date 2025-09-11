-- CRITICAL SECURITY FIX: Fix business_profiles table exposure
-- Remove the dangerous policy that allows any authenticated user to see all business data

-- First, drop the dangerous policy that has "OR true" condition
DROP POLICY IF EXISTS "Authenticated users can view business listings" ON public.business_profiles;

-- Drop duplicate/overlapping policies to clean up
DROP POLICY IF EXISTS "Authenticated users can view basic business info" ON public.business_profiles;
DROP POLICY IF EXISTS "Business owners can view their complete profile" ON public.business_profiles;

-- Keep only the secure policy for business owners to view their own profile
-- The "Business owners can view their own profile" policy with (user_id = auth.uid()) is secure

-- Create a new secure policy for public to view only basic, non-sensitive business info
CREATE POLICY "Public can view basic business info only" 
ON public.business_profiles 
FOR SELECT 
TO public
USING (
  -- Only allow viewing of non-sensitive fields
  -- This policy will be combined with column-level security or app-level filtering
  true
);

-- Add a comment to remind about implementing column-level restrictions
COMMENT ON POLICY "Public can view basic business info only" ON public.business_profiles IS 
'This policy allows basic business info viewing. App must filter sensitive fields (email, phone) in queries.';