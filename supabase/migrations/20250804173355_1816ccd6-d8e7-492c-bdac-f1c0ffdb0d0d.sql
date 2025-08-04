-- Create function to automatically create event responses for invited participants
CREATE OR REPLACE FUNCTION public.create_event_responses()
RETURNS TRIGGER AS $$
BEGIN
  -- Create responses for invited participants
  IF NEW.invited_participants IS NOT NULL AND array_length(NEW.invited_participants, 1) > 0 THEN
    INSERT INTO public.event_responses (event_id, user_id, response)
    SELECT NEW.id, unnest(NEW.invited_participants), 'pending'
    ON CONFLICT (event_id, user_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to run this function after event insert
CREATE TRIGGER create_event_responses_trigger
AFTER INSERT ON public.events
FOR EACH ROW
EXECUTE FUNCTION public.create_event_responses();