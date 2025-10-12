-- Create configurations table
CREATE TABLE public.app_configurations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value boolean NOT NULL DEFAULT false,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.app_configurations ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read configurations (they control UI visibility, not sensitive data)
CREATE POLICY "Anyone can read configurations"
  ON public.app_configurations
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Only service role can manage configurations
CREATE POLICY "Service role can manage configurations"
  ON public.app_configurations
  FOR ALL
  TO authenticated
  USING (false)
  WITH CHECK (false);

-- Insert default configuration
INSERT INTO public.app_configurations (key, value, description)
VALUES 
  ('business_section_enabled', false, 'Controls visibility of business-related features'),
  ('pet_sitters_enabled', true, 'Controls visibility of pet sitters features'),
  ('packs_enabled', true, 'Controls visibility of packs features');

-- Create updated_at trigger
CREATE TRIGGER update_app_configurations_updated_at
  BEFORE UPDATE ON public.app_configurations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();