-- Create AI_GeneratedContent table for storing generated captions
CREATE TABLE public.ai_generated_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  pet_id UUID,
  content_type TEXT NOT NULL CHECK (content_type IN ('coach_tip', 'caption')),
  prompt_data JSONB,
  generated_text TEXT NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_generated_content ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own AI content" 
ON public.ai_generated_content 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own AI content" 
ON public.ai_generated_content 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own AI content" 
ON public.ai_generated_content 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own AI content" 
ON public.ai_generated_content 
FOR DELETE 
USING (user_id = auth.uid());

-- Add trigger for timestamps
CREATE TRIGGER update_ai_generated_content_updated_at
BEFORE UPDATE ON public.ai_generated_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();