-- Drop existing policies for sitter_profiles that have performance issues
DROP POLICY IF EXISTS "Users can create their own sitter profile" ON public.sitter_profiles;
DROP POLICY IF EXISTS "Users can delete their own sitter profile" ON public.sitter_profiles;
DROP POLICY IF EXISTS "Users can update their own sitter profile" ON public.sitter_profiles;
DROP POLICY IF EXISTS "Users can view all active sitter profiles" ON public.sitter_profiles;

-- Create optimized policies with cached auth.uid() calls
CREATE POLICY "Users can create their own sitter profile" 
ON public.sitter_profiles 
FOR INSERT 
WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete their own sitter profile" 
ON public.sitter_profiles 
FOR DELETE 
USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update their own sitter profile" 
ON public.sitter_profiles 
FOR UPDATE 
USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can view all active sitter profiles" 
ON public.sitter_profiles 
FOR SELECT 
USING ((is_active = true) OR (user_id = (SELECT auth.uid())));