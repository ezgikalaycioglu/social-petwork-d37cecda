-- Drop ALL existing policies on pet_profiles to eliminate recursion
DROP POLICY IF EXISTS "Owners can view their own pets with location" ON public.pet_profiles;
DROP POLICY IF EXISTS "Friends can view basic pet info without location" ON public.pet_profiles;
DROP POLICY IF EXISTS "Limited pet discovery without location data" ON public.pet_profiles;
DROP POLICY IF EXISTS "Users can view their own pets" ON public.pet_profiles;
DROP POLICY IF EXISTS "Users can create their own pets" ON public.pet_profiles;
DROP POLICY IF EXISTS "Users can update their own pets" ON public.pet_profiles;
DROP POLICY IF EXISTS "Users can delete their own pets" ON public.pet_profiles;
DROP POLICY IF EXISTS "Allow pet discovery" ON public.pet_profiles;
DROP POLICY IF EXISTS "Users can create their own pet profiles" ON public.pet_profiles;
DROP POLICY IF EXISTS "Users can update their own pet profiles" ON public.pet_profiles;
DROP POLICY IF EXISTS "Users can delete their own pet profiles" ON public.pet_profiles;
DROP POLICY IF EXISTS "Owners can view their pets" ON public.pet_profiles;

-- Create simple, non-recursive policies
CREATE POLICY "Users can manage their own pets" 
ON public.pet_profiles 
FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Allow authenticated users to discover available pets (basic info only)
CREATE POLICY "Authenticated users can discover pets" 
ON public.pet_profiles 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND is_available = true);