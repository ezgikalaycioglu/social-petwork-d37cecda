-- Drop existing overlapping policies for sitter_availability
DROP POLICY IF EXISTS "Sitters can manage their own availability" ON public.sitter_availability;
DROP POLICY IF EXISTS "Users can view sitter availability" ON public.sitter_availability;

-- Create consolidated policies with optimized auth.uid() calls
CREATE POLICY "Consolidated sitter availability view policy" 
ON public.sitter_availability 
FOR SELECT 
USING (
    -- Sitters can view their own availability OR anyone can view all availability
    (EXISTS ( SELECT 1
     FROM sitter_profiles
    WHERE ((sitter_profiles.id = sitter_availability.sitter_id) AND (sitter_profiles.user_id = (SELECT auth.uid()))))) OR
    -- Public can view all sitter availability for booking purposes
    (true)
);

-- Recreate management policies for sitters only
CREATE POLICY "Sitters can manage their own availability" 
ON public.sitter_availability 
FOR ALL 
USING (EXISTS ( SELECT 1
 FROM sitter_profiles
WHERE ((sitter_profiles.id = sitter_availability.sitter_id) AND (sitter_profiles.user_id = (SELECT auth.uid())))))
WITH CHECK (EXISTS ( SELECT 1
 FROM sitter_profiles
WHERE ((sitter_profiles.id = sitter_availability.sitter_id) AND (sitter_profiles.user_id = (SELECT auth.uid())))));