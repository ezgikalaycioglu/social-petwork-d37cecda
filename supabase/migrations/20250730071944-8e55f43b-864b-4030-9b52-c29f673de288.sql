-- Fix security issue by setting search_path
CREATE OR REPLACE FUNCTION public.can_view_user_content(content_owner_id uuid, viewer_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  -- If viewer is the owner, always allow
  SELECT CASE 
    WHEN content_owner_id = viewer_id THEN true
    -- If owner's profile is not private, allow
    WHEN EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = content_owner_id AND (is_private = false OR is_private IS NULL)
    ) THEN true
    -- If owner's profile is private, only allow if they are friends
    WHEN EXISTS (
      SELECT 1 FROM public.pet_friendships pf
      JOIN public.pet_profiles pp1 ON pp1.id = pf.requester_pet_id
      JOIN public.pet_profiles pp2 ON pp2.id = pf.recipient_pet_id
      WHERE pf.status = 'accepted'
        AND (
          (pp1.user_id = content_owner_id AND pp2.user_id = viewer_id) OR
          (pp1.user_id = viewer_id AND pp2.user_id = content_owner_id)
        )
    ) THEN true
    ELSE false
  END;
$$;