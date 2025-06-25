
-- Create a table for pet profiles
CREATE TABLE public.pet_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  age INTEGER,
  gender TEXT CHECK (gender IN ('Male', 'Female', 'Unknown/Other')),
  breed TEXT NOT NULL,
  profile_photo_url TEXT,
  about TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) to ensure users can only see their own pets
ALTER TABLE public.pet_profiles ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to SELECT their own pet profiles
CREATE POLICY "Users can view their own pet profiles" 
  ON public.pet_profiles 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy that allows users to INSERT their own pet profiles
CREATE POLICY "Users can create their own pet profiles" 
  ON public.pet_profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy that allows users to UPDATE their own pet profiles
CREATE POLICY "Users can update their own pet profiles" 
  ON public.pet_profiles 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policy that allows users to DELETE their own pet profiles
CREATE POLICY "Users can delete their own pet profiles" 
  ON public.pet_profiles 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create a storage bucket for pet profile photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('pet-photos', 'pet-photos', true);

-- Create storage policies for pet photos
CREATE POLICY "Users can upload pet photos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'pet-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Pet photos are publicly viewable" ON storage.objects
  FOR SELECT USING (bucket_id = 'pet-photos');

CREATE POLICY "Users can update their pet photos" ON storage.objects
  FOR UPDATE USING (bucket_id = 'pet-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their pet photos" ON storage.objects
  FOR DELETE USING (bucket_id = 'pet-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
