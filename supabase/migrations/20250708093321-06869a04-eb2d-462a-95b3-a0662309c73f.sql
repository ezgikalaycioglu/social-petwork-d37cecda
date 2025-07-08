-- Optimize RLS policy on public.deals table to improve query performance
-- Replace direct auth.uid() calls with subquery to cache the result

-- Drop and recreate the policy with optimized auth.uid() usage
DROP POLICY IF EXISTS "Users can view active deals" ON public.deals;

CREATE POLICY "Users can view active deals" 
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

-- Also optimize the "Business owners can manage their deals" policy for consistency
DROP POLICY IF EXISTS "Business owners can manage their deals" ON public.deals;

CREATE POLICY "Business owners can manage their deals" 
ON public.deals 
FOR ALL 
USING (
  EXISTS (
    SELECT 1
    FROM business_profiles
    WHERE business_profiles.id = deals.business_id 
    AND business_profiles.user_id = (SELECT auth.uid())
  )
);