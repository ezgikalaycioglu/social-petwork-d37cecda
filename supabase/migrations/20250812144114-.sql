-- Fix: Restrict pet location data from non-authenticated users
-- Context: Existing SELECT policy is overly permissive (includes OR true), exposing latitude/longitude publicly

-- 1) Drop the permissive SELECT policy if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'pet_profiles' 
      AND policyname = 'Consolidated pet profiles view policy'
  ) THEN
    EXECUTE 'DROP POLICY "Consolidated pet profiles view policy" ON public.pet_profiles';
  END IF;
END $$;

-- 2) Create safe, role-scoped SELECT policies (authenticated users only)
-- Owners can view their own pets (all columns, including location)
CREATE POLICY "Owners can view their pets"
ON public.pet_profiles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Authenticated users can view pets that opted in to be discoverable (is_available = true)
CREATE POLICY "Authenticated users can view available pets"
ON public.pet_profiles
FOR SELECT
TO authenticated
USING (is_available = true);

-- Note: other INSERT/UPDATE/DELETE policies remain unchanged.
-- This change blocks anon role from selecting any rows on pet_profiles, thus protecting location data from unauthenticated access.