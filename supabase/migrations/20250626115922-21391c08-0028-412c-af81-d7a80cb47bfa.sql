
-- Drop the existing view
DROP VIEW IF EXISTS public.feed_items_view;

-- Recreate the unified feed view with SECURITY INVOKER to respect the querying user's permissions
CREATE VIEW public.feed_items_view 
WITH (security_invoker = true)
AS
SELECT
    'new_pet' AS item_type,
    pp.id,
    pp.name AS title,
    COALESCE(pp.bio, pp.about, 'Just joined the network!') AS description,
    pp.profile_photo_url AS image_url,
    pp.created_at,
    pp.user_id,
    up.display_name AS user_display_name,
    NULL::text AS location_name,
    NULL::uuid AS event_id
FROM pet_profiles pp
LEFT JOIN user_profiles up ON pp.user_id = up.id
WHERE pp.created_at >= NOW() - INTERVAL '30 days' -- Only show recent pets

UNION ALL

SELECT
    'new_adventure' AS item_type,
    a.id,
    a.title,
    a.description,
    CASE 
        WHEN array_length(a.photos, 1) > 0 THEN a.photos[1]
        ELSE NULL
    END AS image_url,
    a.created_at,
    a.owner_id AS user_id,
    up.display_name AS user_display_name,
    NULL::text AS location_name,
    NULL::uuid AS event_id
FROM adventures a
LEFT JOIN user_profiles up ON a.owner_id = up.id
WHERE a.created_at >= NOW() - INTERVAL '30 days' -- Only show recent adventures

UNION ALL

SELECT
    'group_walk' AS item_type,
    e.id,
    COALESCE(e.title, 'Group Walk Event') AS title,
    COALESCE(e.message, 'Join us for a fun group walk!') AS description,
    NULL AS image_url,
    e.created_at,
    e.creator_id AS user_id,
    up.display_name AS user_display_name,
    e.location_name,
    e.id AS event_id
FROM events e
LEFT JOIN user_profiles up ON e.creator_id = up.id
WHERE e.event_type = 'group_walk' 
    AND e.status = 'pending'
    AND e.scheduled_time > NOW() -- Only show upcoming events

ORDER BY created_at DESC;

-- Ensure RLS policies exist on underlying tables
-- Add basic RLS policies for adventures table if they don't exist
DO $$
BEGIN
  -- Enable RLS on adventures table
  ALTER TABLE public.adventures ENABLE ROW LEVEL SECURITY;
  
  -- Policy to allow public viewing of adventures
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'adventures' 
    AND policyname = 'Public can view adventures'
  ) THEN
    CREATE POLICY "Public can view adventures" 
      ON public.adventures 
      FOR SELECT 
      USING (true);
  END IF;
END $$;

-- Add basic RLS policies for events table if they don't exist
DO $$
BEGIN
  -- Enable RLS on events table
  ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
  
  -- Policy to allow public viewing of events
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'events' 
    AND policyname = 'Public can view events'
  ) THEN
    CREATE POLICY "Public can view events" 
      ON public.events 
      FOR SELECT 
      USING (true);
  END IF;
END $$;

-- Add basic RLS policies for user_profiles table if they don't exist
DO $$
BEGIN
  -- Enable RLS on user_profiles table
  ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
  
  -- Policy to allow public viewing of user profiles (for display names in feed)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'user_profiles' 
    AND policyname = 'Public can view user profiles'
  ) THEN
    CREATE POLICY "Public can view user profiles" 
      ON public.user_profiles 
      FOR SELECT 
      USING (true);
  END IF;
END $$;
