-- Create table for storing abuse reports
CREATE TABLE public.abuse_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID NOT NULL,
  reported_content_type TEXT NOT NULL CHECK (reported_content_type IN ('tweet', 'pet_profile', 'user')),
  reported_content_id UUID,
  reported_user_name TEXT,
  reported_pet_name TEXT,
  abuse_type TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.abuse_reports ENABLE ROW LEVEL SECURITY;

-- Create policies for abuse reports
CREATE POLICY "Users can create their own reports" 
ON public.abuse_reports 
FOR INSERT 
WITH CHECK (reporter_id = auth.uid());

CREATE POLICY "Users can view their own reports" 
ON public.abuse_reports 
FOR SELECT 
USING (reporter_id = auth.uid());

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_abuse_reports_updated_at
BEFORE UPDATE ON public.abuse_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();