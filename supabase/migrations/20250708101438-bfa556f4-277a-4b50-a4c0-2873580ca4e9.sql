-- Consolidate RLS policies on public.deals table to improve performance
-- Currently there are overlapping policies for SELECT operations

-- Drop the existing policies
DROP POLICY IF EXISTS "Business owners can manage their deals" ON public.deals;
DROP POLICY IF EXISTS "Users can view active deals" ON public.deals;

-- Create a consolidated SELECT policy that combines both conditions
CREATE POLICY "Consolidated deals view policy" 
ON public.deals 
FOR SELECT 
USING (
  (is_active = true) OR (
    EXISTS (
      SELECT 1 
      FROM business_profiles 
      WHERE business_profiles.id = deals.business_id 
      AND business_profiles.user_id = (SELECT auth.uid())
    )
  )
);

-- Create separate policies for business owners to manage their deals (INSERT, UPDATE, DELETE)
CREATE POLICY "Business owners can insert deals" 
ON public.deals 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM business_profiles
    WHERE business_profiles.id = deals.business_id 
    AND business_profiles.user_id = (SELECT auth.uid())
  )
);

CREATE POLICY "Business owners can update their deals" 
ON public.deals 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1
    FROM business_profiles
    WHERE business_profiles.id = deals.business_id 
    AND business_profiles.user_id = (SELECT auth.uid())
  )
);

CREATE POLICY "Business owners can delete their deals" 
ON public.deals 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1
    FROM business_profiles
    WHERE business_profiles.id = deals.business_id 
    AND business_profiles.user_id = (SELECT auth.uid())
  )
);