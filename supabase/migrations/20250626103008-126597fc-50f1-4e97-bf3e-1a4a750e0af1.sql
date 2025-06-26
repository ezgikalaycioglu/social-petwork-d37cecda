
-- Create events table for playdates and group walks
CREATE TABLE public.events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type text NOT NULL CHECK (event_type IN ('playdate', 'group_walk')),
  creator_id uuid NOT NULL,
  participants uuid[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'declined')),
  location_name text NOT NULL,
  location_lat double precision,
  location_lon double precision,
  scheduled_time timestamp with time zone NOT NULL,
  message text,
  title text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add Row Level Security
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Policy for users to view events they're involved in
CREATE POLICY "Users can view their events" 
  ON public.events 
  FOR SELECT 
  USING (creator_id = auth.uid() OR auth.uid() = ANY(participants));

-- Policy for users to create events
CREATE POLICY "Users can create events" 
  ON public.events 
  FOR INSERT 
  WITH CHECK (creator_id = auth.uid());

-- Policy for users to update events they created or are participants in
CREATE POLICY "Users can update their events" 
  ON public.events 
  FOR UPDATE 
  USING (creator_id = auth.uid() OR auth.uid() = ANY(participants));

-- Policy for users to delete events they created
CREATE POLICY "Users can delete their events" 
  ON public.events 
  FOR DELETE 
  USING (creator_id = auth.uid());

-- Create index for better performance
CREATE INDEX idx_events_participants ON public.events USING GIN (participants);
CREATE INDEX idx_events_creator_status ON public.events (creator_id, status);
CREATE INDEX idx_events_scheduled_time ON public.events (scheduled_time);
