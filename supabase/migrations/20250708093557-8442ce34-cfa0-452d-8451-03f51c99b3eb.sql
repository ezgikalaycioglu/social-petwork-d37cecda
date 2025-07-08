-- Consolidate multiple permissive SELECT policies on public.adventures table
-- This improves performance by reducing policy evaluation overhead

-- Drop the existing SELECT policies
DROP POLICY IF EXISTS "Public can view adventures" ON public.adventures;
DROP POLICY IF EXISTS "Users can view relevant adventures" ON public.adventures;

-- Create a single consolidated policy that combines both access patterns
CREATE POLICY "Consolidated adventures view policy" 
ON public.adventures
FOR SELECT 
USING (
  -- Allow public access to all adventures (from "Public can view adventures")
  true
  OR
  -- Allow users to view their own adventures and adventures where their pets are tagged
  -- (from "Users can view relevant adventures" - though this is now redundant due to public access)
  (
    owner_id = (SELECT auth.uid()) 
    OR 
    EXISTS (
      SELECT 1 
      FROM pet_profiles 
      WHERE pet_profiles.id = ANY (adventures.tagged_pet_ids) 
      AND pet_profiles.user_id = (SELECT auth.uid())
    )
  )
);