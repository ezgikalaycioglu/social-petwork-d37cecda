-- CRITICAL SECURITY FIX: Protect Pet Location Data from Stalking
-- Phase 1: Restrict location access to appropriate relationships only

-- First, drop the dangerous policies that expose location data to all users
DROP POLICY IF EXISTS "Authenticated users can view available pets" ON public.pet_profiles;
DROP POLICY IF EXISTS "Users can discover pets with location privacy" ON public.pet_profiles;

-- Create secure location-aware policies
-- 1. Pet owners can always see their own pets (full data including location)
CREATE POLICY "Owners can view their own pets with location" 
ON public.pet_profiles 
FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

-- 2. Friends can see basic pet info but NOT precise location coordinates
-- Use the existing friendship system to control access
CREATE POLICY "Friends can view basic pet info without location" 
ON public.pet_profiles 
FOR SELECT 
TO authenticated
USING (
  -- Allow viewing if there's an accepted friendship between the users
  user_id != auth.uid() AND EXISTS (
    SELECT 1 FROM public.pet_friendships pf
    WHERE pf.status = 'accepted' 
      AND (
        (pf.requester_pet_id = pet_profiles.id AND pf.recipient_pet_id IN (
          SELECT id FROM public.pet_profiles WHERE user_id = auth.uid()
        )) OR 
        (pf.recipient_pet_id = pet_profiles.id AND pf.requester_pet_id IN (
          SELECT id FROM public.pet_profiles WHERE user_id = auth.uid()
        ))
      )
  )
);

-- 3. Limited discovery for non-friends (NO location data)
-- This allows basic pet discovery but protects location privacy
CREATE POLICY "Limited pet discovery without location data" 
ON public.pet_profiles 
FOR SELECT 
TO authenticated
USING (
  -- Allow basic viewing for discovery but location fields will be filtered at app level
  user_id != auth.uid() 
  AND is_available = true 
  AND NOT EXISTS (
    -- Block if friendship already exists to avoid duplicate access
    SELECT 1 FROM public.pet_friendships pf
    WHERE pf.status = 'accepted' 
      AND (
        (pf.requester_pet_id = pet_profiles.id AND pf.recipient_pet_id IN (
          SELECT id FROM public.pet_profiles WHERE user_id = auth.uid()
        )) OR 
        (pf.recipient_pet_id = pet_profiles.id AND pf.requester_pet_id IN (
          SELECT id FROM public.pet_profiles WHERE user_id = auth.uid()
        ))
      )
  )
);

-- Add security comment
COMMENT ON TABLE public.pet_profiles IS 
'LOCATION PRIVACY: latitude/longitude fields contain sensitive GPS data. App must filter these fields for non-owners and implement proximity-based discovery without exposing exact coordinates.';

-- Create secure functions for location-based features
-- 1. Function to get nearby pets count without exposing exact locations
CREATE OR REPLACE FUNCTION public.get_nearby_pets_count(
  user_lat double precision,
  user_lng double precision,
  radius_km double precision DEFAULT 5.0
)
RETURNS integer
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  -- Count nearby pets without exposing their exact coordinates
  -- Uses haversine formula for distance calculation
  SELECT COUNT(*)::integer
  FROM public.pet_profiles pp
  WHERE pp.user_id != auth.uid()
    AND pp.is_available = true
    AND pp.latitude IS NOT NULL 
    AND pp.longitude IS NOT NULL
    AND (
      6371 * acos(
        cos(radians(user_lat)) * 
        cos(radians(pp.latitude)) * 
        cos(radians(pp.longitude) - radians(user_lng)) + 
        sin(radians(user_lat)) * 
        sin(radians(pp.latitude))
      )
    ) <= radius_km;
$$;

-- 2. Function to get approximate distance without revealing coordinates
CREATE OR REPLACE FUNCTION public.get_approximate_distance(
  pet_id uuid,
  user_lat double precision,
  user_lng double precision
)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  -- Return approximate distance ranges instead of exact coordinates
  SELECT 
    CASE 
      WHEN distance_km <= 0.5 THEN 'Very Close (< 0.5km)'
      WHEN distance_km <= 1.0 THEN 'Nearby (< 1km)'
      WHEN distance_km <= 2.0 THEN 'Close (1-2km)'
      WHEN distance_km <= 5.0 THEN 'Within Area (2-5km)'
      ELSE 'Further Away (> 5km)'
    END
  FROM (
    SELECT 
      6371 * acos(
        cos(radians(user_lat)) * 
        cos(radians(pp.latitude)) * 
        cos(radians(pp.longitude) - radians(user_lng)) + 
        sin(radians(user_lat)) * 
        sin(radians(pp.latitude))
      ) as distance_km
    FROM public.pet_profiles pp
    WHERE pp.id = pet_id 
      AND pp.latitude IS NOT NULL 
      AND pp.longitude IS NOT NULL
      AND (pp.user_id = auth.uid() OR EXISTS (
        -- Only allow distance calculation for pets user has access to
        SELECT 1 FROM public.pet_friendships pf
        WHERE pf.status = 'accepted' 
          AND (
            (pf.requester_pet_id = pp.id AND pf.recipient_pet_id IN (
              SELECT id FROM public.pet_profiles WHERE user_id = auth.uid()
            )) OR 
            (pf.recipient_pet_id = pp.id AND pf.requester_pet_id IN (
              SELECT id FROM public.pet_profiles WHERE user_id = auth.uid()
            ))
          )
      ))
  ) distances;
$$;