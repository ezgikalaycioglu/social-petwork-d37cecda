
-- Create adventures table for pet adventure tracking
CREATE TABLE public.adventures (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pet_id uuid NOT NULL,
  owner_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  adventure_date date NOT NULL,
  photos text[] DEFAULT '{}',
  tagged_pet_ids uuid[] DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add Row Level Security
ALTER TABLE public.adventures ENABLE ROW LEVEL SECURITY;

-- Policy for users to view adventures of their pets or pets they're tagged in
CREATE POLICY "Users can view relevant adventures" 
  ON public.adventures 
  FOR SELECT 
  USING (
    owner_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.pet_profiles 
      WHERE id = ANY(adventures.tagged_pet_ids) 
      AND user_id = auth.uid()
    )
  );

-- Policy for users to create adventures for their pets
CREATE POLICY "Users can create adventures for their pets" 
  ON public.adventures 
  FOR INSERT 
  WITH CHECK (
    owner_id = auth.uid() AND 
    EXISTS (
      SELECT 1 FROM public.pet_profiles 
      WHERE id = pet_id AND user_id = auth.uid()
    )
  );

-- Policy for users to update adventures they created
CREATE POLICY "Users can update their adventures" 
  ON public.adventures 
  FOR UPDATE 
  USING (owner_id = auth.uid());

-- Policy for users to delete adventures they created
CREATE POLICY "Users can delete their adventures" 
  ON public.adventures 
  FOR DELETE 
  USING (owner_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX idx_adventures_pet_id ON public.adventures (pet_id);
CREATE INDEX idx_adventures_owner_id ON public.adventures (owner_id);
CREATE INDEX idx_adventures_date ON public.adventures (adventure_date DESC);
CREATE INDEX idx_adventures_tagged_pets ON public.adventures USING GIN (tagged_pet_ids);

-- Create storage bucket for adventure photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('adventures', 'adventures', true);

-- Create storage policies for adventure photos
CREATE POLICY "Users can upload adventure photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'adventures' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view adventure photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'adventures');

CREATE POLICY "Users can update their adventure photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'adventures' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their adventure photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'adventures' AND auth.uid()::text = (storage.foldername(name))[1]);
