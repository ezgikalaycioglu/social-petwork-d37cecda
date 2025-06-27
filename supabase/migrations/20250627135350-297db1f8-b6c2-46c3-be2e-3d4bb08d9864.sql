
-- Enable Row Level Security on pet_profiles table
ALTER TABLE public.pet_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own pet profiles" ON public.pet_profiles;
DROP POLICY IF EXISTS "Users can create their own pet profiles" ON public.pet_profiles;
DROP POLICY IF EXISTS "Users can update their own pet profiles" ON public.pet_profiles;
DROP POLICY IF EXISTS "Users can delete their own pet profiles" ON public.pet_profiles;

-- Create secure RLS policies for pet_profiles table
CREATE POLICY "Users can view their own pet profiles" 
  ON public.pet_profiles 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own pet profiles" 
  ON public.pet_profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pet profiles" 
  ON public.pet_profiles 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pet profiles" 
  ON public.pet_profiles 
  FOR DELETE 
  USING (auth.uid() = user_id);
