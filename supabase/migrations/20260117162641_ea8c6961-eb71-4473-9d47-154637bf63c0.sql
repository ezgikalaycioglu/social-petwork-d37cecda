-- Fix RLS policies on sitter_bookings table
-- The current policies incorrectly compare sitter_id (which is sitter_profiles.id) with auth.uid() (which is user id)
-- They need to join through sitter_profiles to check if the user owns the sitter profile

-- Drop the broken SELECT policy
DROP POLICY IF EXISTS "Users can view their own bookings" ON sitter_bookings;

-- Create the corrected SELECT policy
CREATE POLICY "Users can view their own bookings" ON sitter_bookings
FOR SELECT
USING (
  (owner_id = auth.uid()) 
  OR 
  (EXISTS (
    SELECT 1 FROM sitter_profiles 
    WHERE sitter_profiles.id = sitter_bookings.sitter_id 
    AND sitter_profiles.user_id = auth.uid()
  ))
);

-- Drop the broken UPDATE policy
DROP POLICY IF EXISTS "Sitters and owners can update bookings" ON sitter_bookings;

-- Create the corrected UPDATE policy
CREATE POLICY "Sitters and owners can update bookings" ON sitter_bookings
FOR UPDATE
USING (
  (owner_id = auth.uid()) 
  OR 
  (EXISTS (
    SELECT 1 FROM sitter_profiles 
    WHERE sitter_profiles.id = sitter_bookings.sitter_id 
    AND sitter_profiles.user_id = auth.uid()
  ))
);