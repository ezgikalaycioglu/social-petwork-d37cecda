-- Restrict public access to sensitive business contact details while preserving public access to non-sensitive info via RPC

-- 1) Drop permissive SELECT policy if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'business_profiles' 
      AND policyname = 'Users can view all business profiles'
  ) THEN
    EXECUTE 'DROP POLICY "Users can view all business profiles" ON public.business_profiles';
  END IF;
END $$;

-- 2) Create restrictive SELECT policies
-- Allow business owners to view their own profile
CREATE POLICY IF NOT EXISTS "Business owners can view their own profile"
ON public.business_profiles
FOR SELECT
USING (user_id = auth.uid());

-- Allow users who have claimed any deal from a business to view that business profile
CREATE POLICY IF NOT EXISTS "Users with claimed deals can view profiles"
ON public.business_profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.deals d
    JOIN public.deal_redemptions dr ON dr.deal_id = d.id
    WHERE d.business_id = public.business_profiles.id
      AND dr.user_id = auth.uid()
  )
);

-- Note: INSERT/UPDATE policies remain unchanged

-- 3) Provide a safe public interface for non-sensitive fields
-- Create a SECURITY DEFINER function to return only non-sensitive columns
CREATE OR REPLACE FUNCTION public.get_public_business_profiles(_ids uuid[])
RETURNS TABLE (
  id uuid,
  business_name text,
  business_category text,
  logo_url text,
  website text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT bp.id, bp.business_name, bp.business_category, bp.logo_url, bp.website
  FROM public.business_profiles bp
  WHERE bp.id = ANY (_ids)
$$;

-- Grant execute to anon and authenticated so both signed-out and signed-in users can fetch public info
GRANT EXECUTE ON FUNCTION public.get_public_business_profiles(uuid[]) TO anon, authenticated;
