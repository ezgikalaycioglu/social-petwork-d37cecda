-- Add pet invitation fields to events table
ALTER TABLE public.events ADD COLUMN invited_pet_ids uuid[] DEFAULT '{}';
ALTER TABLE public.events ADD COLUMN invited_participants uuid[] DEFAULT '{}';

-- Add index for better performance when querying by invited pets
CREATE INDEX idx_events_invited_pet_ids ON public.events USING GIN(invited_pet_ids);
CREATE INDEX idx_events_invited_participants ON public.events USING GIN(invited_participants);