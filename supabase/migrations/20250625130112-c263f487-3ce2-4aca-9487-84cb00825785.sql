
-- Create a table for pet friendships/following relationships
CREATE TABLE public.pet_friendships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_pet_id UUID REFERENCES public.pet_profiles(id) ON DELETE CASCADE NOT NULL,
  recipient_pet_id UUID REFERENCES public.pet_profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Prevent duplicate friendship requests
  UNIQUE(requester_pet_id, recipient_pet_id),
  
  -- Prevent pets from following themselves
  CHECK (requester_pet_id != recipient_pet_id)
);

-- Add Row Level Security (RLS) for pet friendships
ALTER TABLE public.pet_friendships ENABLE ROW LEVEL SECURITY;

-- Create policy for viewing friendships (pet owners can see friendships involving their pets)
CREATE POLICY "Users can view friendships involving their pets" 
  ON public.pet_friendships 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.pet_profiles 
      WHERE (id = requester_pet_id OR id = recipient_pet_id) 
      AND user_id = auth.uid()
    )
  );

-- Create policy for creating friendship requests (pet owners can create requests from their pets)
CREATE POLICY "Users can create friendship requests from their pets" 
  ON public.pet_friendships 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.pet_profiles 
      WHERE id = requester_pet_id AND user_id = auth.uid()
    )
  );

-- Create policy for updating friendship requests (pet owners can accept/reject requests to their pets)
CREATE POLICY "Users can update friendship requests to their pets" 
  ON public.pet_friendships 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.pet_profiles 
      WHERE id = recipient_pet_id AND user_id = auth.uid()
    )
  );

-- Create policy for deleting friendships (pet owners can delete friendships involving their pets)
CREATE POLICY "Users can delete friendships involving their pets" 
  ON public.pet_friendships 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.pet_profiles 
      WHERE (id = requester_pet_id OR id = recipient_pet_id) 
      AND user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_pet_friendships_requester ON public.pet_friendships(requester_pet_id);
CREATE INDEX idx_pet_friendships_recipient ON public.pet_friendships(recipient_pet_id);
CREATE INDEX idx_pet_friendships_status ON public.pet_friendships(status);

-- Add a unique_code field to pet_profiles for QR code generation (optional enhancement)
ALTER TABLE public.pet_profiles 
ADD COLUMN unique_code TEXT UNIQUE DEFAULT CONCAT('pet_', LOWER(REPLACE(gen_random_uuid()::text, '-', '')));

-- Create index for unique_code searches
CREATE INDEX idx_pet_profiles_unique_code ON public.pet_profiles(unique_code);
