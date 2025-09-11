-- FINAL SECURITY FIX: Create column-level security for business_profiles

-- Drop existing policies to rebuild with proper column-level security
DROP POLICY IF EXISTS "Public can view non-sensitive business info" ON public.business_profiles;
DROP POLICY IF EXISTS "Authenticated users can view business listings" ON public.business_profiles;

-- Create secure view that only exposes safe business information to public
CREATE OR REPLACE VIEW public.business_listings AS
SELECT 
    id,
    business_name,
    business_category, 
    description,
    logo_url,
    website,
    is_verified,
    created_at,
    updated_at
FROM public.business_profiles
WHERE is_verified = true OR is_verified IS NULL;

-- Grant public access to the safe view only
GRANT SELECT ON public.business_listings TO public;
GRANT SELECT ON public.business_listings TO authenticated;

-- Create restrictive policies for the main table
-- Only business owners can access their full profile data
CREATE POLICY "Business owners can manage their own profiles" 
ON public.business_profiles 
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Block all other access to the main business_profiles table
CREATE POLICY "Block public access to business_profiles" 
ON public.business_profiles 
FOR SELECT
TO public
USING (false);

-- Create a secure function for business directory that only returns safe data
CREATE OR REPLACE FUNCTION public.get_business_directory(category_filter text DEFAULT NULL)
RETURNS TABLE (
    id uuid,
    business_name text,
    business_category text,
    description text,
    logo_url text,
    website text,
    is_verified boolean,
    created_at timestamptz,
    updated_at timestamptz
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
    SELECT 
        bl.id,
        bl.business_name,
        bl.business_category,
        bl.description,
        bl.logo_url,
        bl.website,
        bl.is_verified,
        bl.created_at,
        bl.updated_at
    FROM public.business_listings bl
    WHERE (category_filter IS NULL OR bl.business_category = category_filter)
    ORDER BY bl.created_at DESC;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.get_business_directory TO public;
GRANT EXECUTE ON FUNCTION public.get_business_directory TO authenticated;