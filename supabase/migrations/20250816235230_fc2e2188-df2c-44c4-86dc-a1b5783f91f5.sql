-- Enable RLS on waitlist_subscribers table (if not already enabled)
ALTER TABLE public.waitlist_subscribers ENABLE ROW LEVEL SECURITY;

-- Drop existing public access policies if they exist
DROP POLICY IF EXISTS "Public can view waitlist" ON public.waitlist_subscribers;

-- Create policy for waitlist_subscribers: Only admins can read email data
CREATE POLICY "Admins can view waitlist subscribers"
ON public.waitlist_subscribers
FOR SELECT
TO authenticated
USING (
  COALESCE(auth.jwt() ->> 'user_role', auth.jwt() -> 'user_metadata' ->> 'role', 'user') = 'admin'
);

-- Revoke public access to waitlist_subscribers table
REVOKE ALL ON public.waitlist_subscribers FROM anon;
REVOKE ALL ON public.waitlist_subscribers FROM authenticated;

-- Grant specific permissions to authenticated users (they can only insert, admins can select)
GRANT INSERT ON public.waitlist_subscribers TO authenticated;
GRANT SELECT, INSERT ON public.waitlist_subscribers TO authenticated;

-- Update sitter_profiles policies to be more explicit about authentication requirements
-- Drop the existing broad view policy
DROP POLICY IF EXISTS "Users can view all active sitter profiles" ON public.sitter_profiles;

-- Create new policy: Authenticated users can view active sitter profiles OR their own profile
CREATE POLICY "Authenticated users can view sitter profiles"
ON public.sitter_profiles
FOR SELECT
TO authenticated
USING (
  (is_active = true) OR (user_id = auth.uid())
);

-- Create policy: Anonymous users cannot view any sitter profiles
-- (This is implicit with the above policy being TO authenticated, but let's be explicit)
CREATE POLICY "Block anonymous access to sitter profiles"
ON public.sitter_profiles
FOR SELECT
TO anon
USING (false);

-- Revoke public access from sitter_profiles
REVOKE ALL ON public.sitter_profiles FROM anon;