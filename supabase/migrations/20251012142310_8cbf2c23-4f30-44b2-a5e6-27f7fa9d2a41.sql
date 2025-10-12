-- Add RLS policy to allow viewing pet profiles involved in friendships
CREATE POLICY "Users can view pets involved in friendships with their pets"
ON public.pet_profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM pet_friendships pf
    JOIN pet_profiles my_pets ON (
      my_pets.user_id = auth.uid() 
      AND (my_pets.id = pf.requester_pet_id OR my_pets.id = pf.recipient_pet_id)
    )
    WHERE (pf.requester_pet_id = pet_profiles.id OR pf.recipient_pet_id = pet_profiles.id)
  )
);