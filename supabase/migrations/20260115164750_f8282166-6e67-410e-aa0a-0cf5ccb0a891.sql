-- Create storage bucket for sitter profile photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('sitter-photos', 'sitter-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Add profile_photo_url column to sitter_profiles if it doesn't exist
ALTER TABLE public.sitter_profiles 
ADD COLUMN IF NOT EXISTS profile_photo_url TEXT;

-- Create storage policies for sitter photos bucket
CREATE POLICY "Anyone can view sitter photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'sitter-photos');

CREATE POLICY "Authenticated users can upload their own sitter photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'sitter-photos' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own sitter photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'sitter-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own sitter photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'sitter-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);