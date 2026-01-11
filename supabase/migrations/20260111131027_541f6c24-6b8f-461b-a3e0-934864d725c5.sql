-- Add OneSignal player ID column for native push notifications
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS onesignal_player_id TEXT;