-- First, drop the problematic policy that references user metadata
DROP POLICY IF EXISTS "Admins can view waitlist subscribers" ON public.waitlist_subscribers;

-- Create a security definer function to check if the current user is an admin
-- This function will be used in RLS policies to avoid direct metadata references
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- For now, we'll use a simple approach where only specific user IDs are admins
  -- In a production environment, you would typically have a proper roles table
  SELECT auth.uid() IN (
    -- Add specific admin user IDs here, or create a roles table
    -- For now, returning false to be safe until proper admin system is set up
    SELECT null::uuid WHERE false
  );
$$;

-- Create a more secure policy for waitlist subscribers that uses the function
CREATE POLICY "Admins can view waitlist subscribers"
ON public.waitlist_subscribers
FOR SELECT
TO authenticated
USING (public.is_admin());

-- Add a comment explaining the admin function
COMMENT ON FUNCTION public.is_admin() IS 'Returns true if the current user is an admin. Currently returns false for all users until admin system is properly configured.';