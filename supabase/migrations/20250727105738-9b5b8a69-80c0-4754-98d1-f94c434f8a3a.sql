-- Drop existing overlapping policies for sitter_photos
DROP POLICY IF EXISTS "All users can view sitter photos" ON public.sitter_photos;
DROP POLICY IF EXISTS "Sitters can manage their own photos" ON public.sitter_photos;

-- Create consolidated view policy - since all users can view, this simplifies to true
CREATE POLICY "Consolidated sitter photos view policy" 
ON public.sitter_photos 
FOR SELECT 
USING (true);

-- Recreate management policies for sitters only (INSERT, UPDATE, DELETE)
CREATE POLICY "Sitters can manage their own photos" 
ON public.sitter_photos 
FOR ALL 
USING (EXISTS ( SELECT 1
 FROM sitter_profiles
WHERE ((sitter_profiles.id = sitter_photos.sitter_id) AND (sitter_profiles.user_id = (SELECT auth.uid())))))
WITH CHECK (EXISTS ( SELECT 1
 FROM sitter_profiles
WHERE ((sitter_profiles.id = sitter_photos.sitter_id) AND (sitter_profiles.user_id = (SELECT auth.uid())))));