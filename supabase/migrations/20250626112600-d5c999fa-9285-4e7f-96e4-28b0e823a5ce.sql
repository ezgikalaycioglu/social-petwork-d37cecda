
-- Create FCM tokens table to store user device tokens
CREATE TABLE public.fcm_tokens (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token text NOT NULL,
  device_info jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, token)
);

-- Enable RLS on FCM tokens
ALTER TABLE public.fcm_tokens ENABLE ROW LEVEL SECURITY;

-- Policy for users to manage their own FCM tokens
CREATE POLICY "Users can manage their own FCM tokens" 
  ON public.fcm_tokens 
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create function to trigger notifications on playdate requests
CREATE OR REPLACE FUNCTION public.notify_playdate_request()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Call edge function to send notification
  PERFORM net.http_post(
    url := 'https://jiezjfwsbemcmtbsoifi.supabase.co/functions/v1/send-playdate-notification',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppZXpqZndzYmVtY210YnNvaWZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzMzQ5MjksImV4cCI6MjA2NTkxMDkyOX0.MlvpyjPasQ6i3PRHOBT3uc5mQu8WtKgLOVsTvJv6-nM"}'::jsonb,
    body := json_build_object(
      'event_id', NEW.id,
      'event_type', 'playdate_request'
    )::text
  );
  
  RETURN NEW;
END;
$$;

-- Create function to trigger notifications on playdate confirmations
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
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppZXpqZndzYmVtY210YnNvaWZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzMzQ5MjksImV4cCI6MjA2NTkxMDkyOX0.MlvpyjPasQ6i3PRHOBT3uc5mQu8WtKgLOVsTvJv6-nM"}'::jsonb,
      body := json_build_object(
        'event_id', NEW.id,
        'event_type', 'playdate_confirmation'
      )::text
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create triggers for playdate events
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

-- Enable the http extension for making HTTP requests
CREATE EXTENSION IF NOT EXISTS http;
