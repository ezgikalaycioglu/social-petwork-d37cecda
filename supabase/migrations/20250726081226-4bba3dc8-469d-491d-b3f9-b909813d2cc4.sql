-- Drop existing overlapping policies for sitter_photos
DROP POLICY IF EXISTS "Users can manage their own sitter photos" ON public.sitter_photos;
DROP POLICY IF EXISTS "Users can view all sitter photos" ON public.sitter_photos;

-- Create consolidated policies for better performance
-- All users can view all sitter photos
CREATE POLICY "All users can view sitter photos" 
ON public.sitter_photos 
FOR SELECT 
USING (true);

-- Only sitter owners can manage (INSERT, UPDATE, DELETE) their own photos
CREATE POLICY "Sitters can manage their own photos" 
ON public.sitter_photos 
FOR ALL 
USING (EXISTS ( SELECT 1
 FROM sitter_profiles
WHERE ((sitter_profiles.id = sitter_photos.sitter_id) AND (sitter_profiles.user_id = (SELECT auth.uid())))))
WITH CHECK (EXISTS ( SELECT 1
 FROM sitter_profiles
WHERE ((sitter_profiles.id = sitter_photos.sitter_id) AND (sitter_profiles.user_id = (SELECT auth.uid())))));