-- Create event_responses table to track individual participant responses
CREATE TABLE public.event_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL,
  user_id UUID NOT NULL,
  response TEXT NOT NULL DEFAULT 'pending' CHECK (response IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Enable RLS
ALTER TABLE public.event_responses ENABLE ROW LEVEL SECURITY;

-- Create policies for event_responses
CREATE POLICY "Users can view responses for events they're involved in"
ON public.event_responses
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.events e
    WHERE e.id = event_responses.event_id
    AND (e.creator_id = auth.uid() OR auth.uid() = ANY(e.invited_participants))
  )
);

CREATE POLICY "Users can create their own event responses"
ON public.event_responses
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own event responses"
ON public.event_responses
FOR UPDATE
USING (user_id = auth.uid());

-- Create updated_at trigger
CREATE TRIGGER update_event_responses_updated_at
BEFORE UPDATE ON public.event_responses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();