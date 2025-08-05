-- Step 1: Fix missing event_responses for existing events
-- Insert missing event_responses for events that have invited_participants but no responses
INSERT INTO public.event_responses (event_id, user_id, response)
SELECT DISTINCT e.id, unnest(e.invited_participants), 'pending'
FROM public.events e
WHERE e.invited_participants IS NOT NULL 
  AND array_length(e.invited_participants, 1) > 0
  AND NOT EXISTS (
    SELECT 1 FROM public.event_responses er 
    WHERE er.event_id = e.id 
    AND er.user_id = ANY(e.invited_participants)
  );

-- Step 2: Ensure the trigger function properly handles event_responses creation
CREATE OR REPLACE FUNCTION public.create_event_responses()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  -- Create responses for invited participants
  IF NEW.invited_participants IS NOT NULL AND array_length(NEW.invited_participants, 1) > 0 THEN
    INSERT INTO public.event_responses (event_id, user_id, response)
    SELECT NEW.id, unnest(NEW.invited_participants), 'pending'
    ON CONFLICT (event_id, user_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Step 3: Ensure the trigger exists and is active
DROP TRIGGER IF EXISTS create_event_responses_trigger ON public.events;
CREATE TRIGGER create_event_responses_trigger
  AFTER INSERT ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.create_event_responses();

-- Step 4: Add missing RLS policies for event_responses table if they don't exist
DO $$ 
BEGIN
  -- Check if event_responses table exists and has RLS enabled
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'event_responses') THEN
    ALTER TABLE public.event_responses ENABLE ROW LEVEL SECURITY;
    
    -- Drop existing policies to recreate them
    DROP POLICY IF EXISTS "Users can view their own event responses" ON public.event_responses;
    DROP POLICY IF EXISTS "Users can create their own event responses" ON public.event_responses;
    DROP POLICY IF EXISTS "Users can update their own event responses" ON public.event_responses;
    DROP POLICY IF EXISTS "Event creators can view all responses" ON public.event_responses;
    
    -- Create comprehensive RLS policies
    CREATE POLICY "Users can view their own event responses"
    ON public.event_responses FOR SELECT
    USING (user_id = auth.uid());
    
    CREATE POLICY "Users can create their own event responses"
    ON public.event_responses FOR INSERT
    WITH CHECK (user_id = auth.uid());
    
    CREATE POLICY "Users can update their own event responses"
    ON public.event_responses FOR UPDATE
    USING (user_id = auth.uid());
    
    CREATE POLICY "Event creators can view all responses"
    ON public.event_responses FOR SELECT
    USING (EXISTS (
      SELECT 1 FROM public.events 
      WHERE id = event_responses.event_id 
      AND creator_id = auth.uid()
    ));
  END IF;
END $$;