-- Drop existing policy for sitter_availability that has performance issues
DROP POLICY IF EXISTS "Sitters can manage their own availability" ON public.sitter_availability;

-- Create optimized policy with cached auth.uid() call
CREATE POLICY "Sitters can manage their own availability" 
ON public.sitter_availability 
FOR ALL 
USING (EXISTS ( SELECT 1
 FROM sitter_profiles
WHERE ((sitter_profiles.id = sitter_availability.sitter_id) AND (sitter_profiles.user_id = (SELECT auth.uid())))));