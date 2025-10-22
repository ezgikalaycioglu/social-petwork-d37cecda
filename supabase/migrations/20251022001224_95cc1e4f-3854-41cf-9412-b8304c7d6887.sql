-- Add phone_number column to user_profiles
ALTER TABLE public.user_profiles 
ADD COLUMN phone_number text;

-- Create security definer function to check if two users have a confirmed booking
CREATE OR REPLACE FUNCTION public.can_view_phone_number(
  profile_owner_id uuid,
  viewer_id uuid
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- User can always see their own phone number
  SELECT CASE 
    WHEN profile_owner_id = viewer_id THEN true
    -- Check if they have a confirmed or accepted booking together
    WHEN EXISTS (
      SELECT 1 FROM public.sitter_bookings
      WHERE status IN ('confirmed', 'accepted')
        AND (
          (sitter_id = profile_owner_id AND owner_id = viewer_id) OR
          (sitter_id = viewer_id AND owner_id = profile_owner_id)
        )
    ) THEN true
    ELSE false
  END;
$$;

-- Add comment for documentation
COMMENT ON FUNCTION public.can_view_phone_number IS 'Returns true if viewer can see the profile owner phone number (own profile or confirmed booking)';
