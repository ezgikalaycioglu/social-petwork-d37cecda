-- Drop existing policies for ai_generated_content that have performance issues
DROP POLICY IF EXISTS "Users can create their own AI content" ON public.ai_generated_content;
DROP POLICY IF EXISTS "Users can delete their own AI content" ON public.ai_generated_content;
DROP POLICY IF EXISTS "Users can update their own AI content" ON public.ai_generated_content;
DROP POLICY IF EXISTS "Users can view their own AI content" ON public.ai_generated_content;

-- Create optimized policies with cached auth.uid() calls
CREATE POLICY "Users can create their own AI content" 
ON public.ai_generated_content 
FOR INSERT 
WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete their own AI content" 
ON public.ai_generated_content 
FOR DELETE 
USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update their own AI content" 
ON public.ai_generated_content 
FOR UPDATE 
USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can view their own AI content" 
ON public.ai_generated_content 
FOR SELECT 
USING (user_id = (SELECT auth.uid()));