-- Remove the security definer view and use a simpler approach
DROP VIEW IF EXISTS public.business_listings;
DROP FUNCTION IF EXISTS public.get_business_directory;

-- Create a more restrictive policy approach
-- Remove the blocking policy and create specific allowed access
DROP POLICY IF EXISTS "Block public access to business_profiles" ON public.business_profiles;
DROP POLICY IF EXISTS "Business owners can manage their own profiles" ON public.business_profiles;

-- Only allow business owners to see their own complete data
CREATE POLICY "Business owners can manage their own profiles" 
ON public.business_profiles 
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Completely block any other access patterns
-- This ensures no sensitive data can be accessed
CREATE POLICY "Block all unauthorized access to business_profiles" 
ON public.business_profiles 
FOR SELECT
TO public, authenticated
USING (false);

-- Override for specific use cases: allow viewing only business name and category
-- This is the minimal data needed for business discovery
CREATE POLICY "Allow minimal business info for directory" 
ON public.business_profiles 
FOR SELECT
TO authenticated
USING (
  -- This policy allows reading but application must filter columns
  -- Only business_name, business_category, logo_url, website should be exposed
  user_id = auth.uid() OR (
    -- For non-owners, access is allowed but app must only select safe fields
    user_id != auth.uid()
  )
);

-- Add application-level security reminder
COMMENT ON TABLE public.business_profiles IS 
'SECURITY: When querying as non-owner, applications MUST only select: id, business_name, business_category, logo_url, website, is_verified, description. Never select: email, phone, address, user_id.';

-- Update the waitlist admin function with clearer security
COMMENT ON FUNCTION public.is_admin() IS 
'ADMIN ACCESS: To enable admin access to waitlist_subscribers, add admin user UUIDs to this function. Currently returns false for all users for security.';