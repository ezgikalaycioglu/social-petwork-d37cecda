-- Drop the conflicting restrictive policy that blocks all access
DROP POLICY IF EXISTS "Block anonymous access to sitter profiles" ON public.sitter_profiles;

-- Drop the existing policy to recreate it with explicit authentication
DROP POLICY IF EXISTS "Authenticated users can view sitter profiles" ON public.sitter_profiles;

-- Create a new, clear policy that allows authenticated users to view active profiles or their own
CREATE POLICY "Authenticated users can view active sitter profiles"
ON public.sitter_profiles
FOR SELECT
TO authenticated
USING (
  (is_active = true) OR (user_id = auth.uid())
);