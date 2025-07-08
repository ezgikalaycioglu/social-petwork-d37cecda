-- Fix search path security issue for notification functions
-- Adding SET search_path = '' prevents search path manipulation attacks

CREATE OR REPLACE FUNCTION public.notify_playdate_request()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.notify_playdate_confirmation()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
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
$function$;