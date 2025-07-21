-- Create sitter availability table
CREATE TABLE public.sitter_availability (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sitter_id uuid NOT NULL,
  available_date date NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (sitter_id, available_date)
);

-- Enable RLS
ALTER TABLE public.sitter_availability ENABLE ROW LEVEL SECURITY;

-- Create policies for sitter availability
CREATE POLICY "Sitters can manage their own availability"
ON public.sitter_availability
FOR ALL
USING (EXISTS (
  SELECT 1 FROM sitter_profiles 
  WHERE sitter_profiles.id = sitter_availability.sitter_id 
  AND sitter_profiles.user_id = auth.uid()
));

CREATE POLICY "Users can view sitter availability"
ON public.sitter_availability
FOR SELECT
USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_sitter_availability_updated_at
BEFORE UPDATE ON public.sitter_availability
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();