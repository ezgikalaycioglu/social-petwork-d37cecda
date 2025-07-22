-- Add hide_pwa_popup preference to notification_preferences table
ALTER TABLE public.notification_preferences 
ADD COLUMN hide_pwa_popup BOOLEAN DEFAULT FALSE;