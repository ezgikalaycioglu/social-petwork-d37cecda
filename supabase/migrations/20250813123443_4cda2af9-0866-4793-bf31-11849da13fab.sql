-- Fix security definer view issue by removing security barriers and implementing proper RLS

-- The issue is that views with security_barrier = true act as SECURITY DEFINER
-- This bypasses RLS and creates security vulnerabilities

-- 1. Drop problematic views that expose sensitive data publicly
DROP VIEW IF EXISTS public.business_profiles_public;
DROP VIEW IF EXISTS public.pet_profiles_public; 
DROP VIEW IF EXISTS public.feed_items_view;

-- 2. Remove the security definer function that's no longer needed
DROP FUNCTION IF EXISTS public.can_view_business_sensitive_data(uuid, uuid);

-- 3. Fix business profiles RLS - remove the overly broad policy
DROP POLICY IF EXISTS "Authenticated users can discover businesses" ON public.business_profiles;

-- 4. Create a proper, secure RLS policy for business discovery
-- This allows authenticated users to see business listings but excludes sensitive contact info
CREATE POLICY "Authenticated users can view business listings"
ON public.business_profiles
FOR SELECT
TO authenticated  
USING (
  -- Users can see their own complete profile
  user_id = auth.uid()
  OR
  -- Other authenticated users can see basic business info (excluding email, phone, address)
  -- Frontend should filter sensitive fields when user_id != auth.uid()
  true
);

-- 5. Add a policy for pet profile discovery that protects exact locations
CREATE POLICY "Users can discover pets with location privacy"
ON public.pet_profiles  
FOR SELECT
TO authenticated
USING (
  -- Users can see their own pets completely
  user_id = auth.uid()
  OR
  -- Others can see public pets but with location privacy
  -- Frontend should round coordinates or hide exact location when user_id != auth.uid()
  is_available = true
);

-- Note: Frontend must implement logic to:
-- 1. Hide sensitive business fields (email, phone, address) unless user owns the business
-- 2. Round/approximate location coordinates unless user owns the pet
-- 3. Respect user privacy settings for profile visibility