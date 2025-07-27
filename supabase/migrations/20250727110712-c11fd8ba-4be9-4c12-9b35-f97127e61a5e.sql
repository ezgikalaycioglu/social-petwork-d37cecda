-- Optimize RLS policy for sitter_services to cache auth.uid() calls
DROP POLICY IF EXISTS "Users can manage their own sitter services" ON public.sitter_services;
DROP POLICY IF EXISTS "Users can view all sitter services" ON public.sitter_services;

-- Create optimized policy with cached auth.uid() calls
CREATE POLICY "Users can manage their own sitter services" 
ON public.sitter_services 
FOR ALL 
USING (EXISTS ( SELECT 1
 FROM sitter_profiles
WHERE ((sitter_profiles.id = sitter_services.sitter_id) AND (sitter_profiles.user_id = (SELECT auth.uid())))))
WITH CHECK (EXISTS ( SELECT 1
 FROM sitter_profiles
WHERE ((sitter_profiles.id = sitter_services.sitter_id) AND (sitter_profiles.user_id = (SELECT auth.uid())))));

-- Recreate the view policy with optimized auth.uid() caching
CREATE POLICY "Users can view all sitter services" 
ON public.sitter_services 
FOR SELECT 
USING (true);