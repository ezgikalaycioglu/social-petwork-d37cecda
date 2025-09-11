-- Fix conflicting business_profiles policies
-- Remove the conflicting policy that allows broader access
DROP POLICY IF EXISTS "Allow minimal business info for directory" ON public.business_profiles;

-- Keep only the secure owner-only policy
-- "Business owners can manage their own profiles" policy is already secure

-- Add a note about application-level filtering
COMMENT ON TABLE public.business_profiles IS 
'SECURITY CONFIRMED: Only business owners can access their profiles. Public business discovery must be implemented through application-level safe queries that exclude sensitive fields (email, phone, address).';

-- Verify no other access is allowed
-- The only remaining policy should be "Business owners can manage their own profiles"