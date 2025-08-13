-- Fix: Secure user_profiles table from public data exposure
-- CRITICAL SECURITY ISSUE: Current policy allows public read access to all user profiles

-- 1) Drop the overly permissive SELECT policy
DROP POLICY IF EXISTS "Consolidated user profiles view policy" ON public.user_profiles;

-- 2) Create secure, role-scoped SELECT policies (authenticated users only)
-- Users can view their own profile (all columns)
CREATE POLICY "Users can view their own profile"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (id = auth.uid());

-- 3) Ensure INSERT policy is properly scoped to authenticated users only
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;

CREATE POLICY "Users can insert their own profile"
ON public.user_profiles
FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

-- Note: UPDATE policy already correctly scoped to authenticated users and their own data
-- This change blocks anon role from selecting any rows on user_profiles, protecting all personal data from unauthenticated access.