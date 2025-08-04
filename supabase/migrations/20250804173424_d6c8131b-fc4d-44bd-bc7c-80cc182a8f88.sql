-- Update function to use proper security settings
CREATE OR REPLACE FUNCTION public.create_event_responses()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Create responses for invited participants
  IF NEW.invited_participants IS NOT NULL AND array_length(NEW.invited_participants, 1) > 0 THEN
    INSERT INTO public.event_responses (event_id, user_id, response)
    SELECT NEW.id, unnest(NEW.invited_participants), 'pending'
    ON CONFLICT (event_id, user_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;