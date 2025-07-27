-- Optimize RLS policy for sitter_bookings to cache auth.uid() calls
DROP POLICY IF EXISTS "Pet owners can create bookings" ON public.sitter_bookings;
DROP POLICY IF EXISTS "Sitters and owners can update bookings" ON public.sitter_bookings;
DROP POLICY IF EXISTS "Users can view their own bookings" ON public.sitter_bookings;

-- Recreate optimized policies with cached auth.uid() calls
CREATE POLICY "Pet owners can create bookings" 
ON public.sitter_bookings 
FOR INSERT 
WITH CHECK (
  (owner_id = (SELECT auth.uid())) AND 
  (EXISTS ( SELECT 1
    FROM pet_profiles
    WHERE ((pet_profiles.id = sitter_bookings.pet_id) AND (pet_profiles.user_id = (SELECT auth.uid())))))
);

CREATE POLICY "Sitters and owners can update bookings" 
ON public.sitter_bookings 
FOR UPDATE 
USING (
  (sitter_id = (SELECT auth.uid())) OR (owner_id = (SELECT auth.uid()))
);

CREATE POLICY "Users can view their own bookings" 
ON public.sitter_bookings 
FOR SELECT 
USING (
  (sitter_id = (SELECT auth.uid())) OR (owner_id = (SELECT auth.uid()))
);