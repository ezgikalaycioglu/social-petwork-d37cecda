-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Users can view pets involved in friendships with their pets" ON public.pet_profiles;

-- Create a security definer function to check if a user can view a pet profile
-- This bypasses RLS and prevents infinite recursion
CREATE OR REPLACE FUNCTION public.can_view_pet_profile(_pet_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- User can view if:
  -- 1. The pet belongs to them
  -- 2. The pet is involved in a friendship with one of their pets
  SELECT EXISTS (
    SELECT 1 FROM pet_profiles WHERE id = _pet_id AND user_id = _user_id
  ) OR EXISTS (
    SELECT 1 
    FROM pet_friendships pf
    WHERE (pf.requester_pet_id = _pet_id OR pf.recipient_pet_id = _pet_id)
      AND EXISTS (
        SELECT 1 FROM pet_profiles my_pets 
        WHERE my_pets.user_id = _user_id 
          AND (my_pets.id = pf.requester_pet_id OR my_pets.id = pf.recipient_pet_id)
      )
  );
$$;

-- Create a new policy using the security definer function
CREATE POLICY "Users can view pets via friendship function"
ON public.pet_profiles
FOR SELECT
TO authenticated
USING (public.can_view_pet_profile(id, auth.uid()));