
-- First, drop the triggers that depend on the functions
DROP TRIGGER IF EXISTS trigger_playdate_request ON public.events;
DROP TRIGGER IF EXISTS trigger_playdate_confirmation ON public.events;

-- Now we can safely drop the functions with hardcoded API keys
DROP FUNCTION IF EXISTS public.notify_playdate_request();
DROP FUNCTION IF EXISTS public.notify_playdate_confirmation();

-- Recreate the functions without hardcoded authorization headers
-- These functions will use Supabase's built-in service role authentication
CREATE OR REPLACE FUNCTION public.notify_playdate_request()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Call edge function to send notification using service role authentication
  -- The edge function will handle authentication internally
  PERFORM net.http_post(
    url := 'https://jiezjfwsbemcmtbsoifi.supabase.co/functions/v1/send-playdate-notification',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := json_build_object(
      'event_id', NEW.id,
      'event_type', 'playdate_request'
    )::text
  );
  
  RETURN NEW;
END;
$$;

-- Recreate the playdate confirmation function
CREATE OR REPLACE FUNCTION public.notify_playdate_confirmation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only trigger if status changed from pending to confirmed
  IF OLD.status = 'pending' AND NEW.status = 'confirmed' THEN
    PERFORM net.http_post(
      url := 'https://jiezjfwsbemcmtbsoifi.supabase.co/functions/v1/send-playdate-notification',
      headers := '{"Content-Type": "application/json"}'::jsonb,
      body := json_build_object(
        'event_id', NEW.id,
        'event_type', 'playdate_confirmation'
      )::text
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Recreate the triggers that use these functions
CREATE TRIGGER trigger_playdate_request
  AFTER INSERT ON public.events
  FOR EACH ROW
  WHEN (NEW.event_type = 'playdate' AND NEW.status = 'pending')
  EXECUTE FUNCTION public.notify_playdate_request();

CREATE TRIGGER trigger_playdate_confirmation
  AFTER UPDATE ON public.events
  FOR EACH ROW
  WHEN (NEW.event_type = 'playdate')
  EXECUTE FUNCTION public.notify_playdate_confirmation();
