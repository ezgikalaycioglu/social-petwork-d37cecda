-- Consolidate multiple permissive SELECT policies on public.deal_redemptions table
-- This improves performance by reducing policy evaluation overhead

-- Drop the existing SELECT policies
DROP POLICY IF EXISTS "Business owners can view redemptions for their deals" ON public.deal_redemptions;
DROP POLICY IF EXISTS "Users can view their own redemptions" ON public.deal_redemptions;

-- Create a single consolidated policy that combines both access patterns
CREATE POLICY "Consolidated deal redemptions view policy" 
ON public.deal_redemptions
FOR SELECT 
USING (
  -- Users can view their own redemptions (from "Users can view their own redemptions")
  (user_id = ( SELECT auth.uid() AS uid))
  OR
  -- Business owners can view redemptions for their deals (from "Business owners can view redemptions for their deals")
  (EXISTS ( 
    SELECT 1
    FROM (deals d JOIN business_profiles bp ON ((d.business_id = bp.id)))
    WHERE ((d.id = deal_redemptions.deal_id) AND (bp.user_id = ( SELECT auth.uid() AS uid)))
  ))
);