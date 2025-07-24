-- Create rate_limit_attempts table for tracking rate limiting
CREATE TABLE public.rate_limit_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier TEXT NOT NULL,
  action TEXT NOT NULL,
  attempt_count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for efficient lookups
CREATE INDEX idx_rate_limit_attempts_lookup ON public.rate_limit_attempts(identifier, action, window_start);

-- Enable RLS
ALTER TABLE public.rate_limit_attempts ENABLE ROW LEVEL SECURITY;

-- Create security_events table for logging security incidents
CREATE TABLE public.security_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL CHECK (event_type IN ('failed_login', 'suspicious_access', 'data_breach_attempt', 'rate_limit_exceeded')),
  user_id UUID,
  email TEXT,
  ip_address INET,
  user_agent TEXT,
  details JSONB DEFAULT '{}',
  severity TEXT NOT NULL DEFAULT 'low' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for security event queries
CREATE INDEX idx_security_events_type_time ON public.security_events(event_type, created_at DESC);
CREATE INDEX idx_security_events_user ON public.security_events(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_security_events_ip ON public.security_events(ip_address) WHERE ip_address IS NOT NULL;

-- Enable RLS
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- RLS policies for rate_limit_attempts (system-only access)
CREATE POLICY "System can manage rate limit attempts" 
ON public.rate_limit_attempts 
FOR ALL 
USING (false);

-- RLS policies for security_events (system-only access, users can view their own)
CREATE POLICY "Users can view their own security events" 
ON public.security_events 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "System can create security events" 
ON public.security_events 
FOR INSERT 
WITH CHECK (false);

-- Create function to clean up old rate limit attempts
CREATE OR REPLACE FUNCTION public.cleanup_rate_limit_attempts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Delete attempts older than 1 hour
  DELETE FROM public.rate_limit_attempts 
  WHERE created_at < (now() - INTERVAL '1 hour');
END;
$$;

-- Create function to clean up old security events
CREATE OR REPLACE FUNCTION public.cleanup_security_events()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Delete events older than 30 days (except critical events)
  DELETE FROM public.security_events 
  WHERE created_at < (now() - INTERVAL '30 days')
  AND severity != 'critical';
  
  -- Delete critical events older than 90 days
  DELETE FROM public.security_events 
  WHERE created_at < (now() - INTERVAL '90 days')
  AND severity = 'critical';
END;
$$;

-- Add trigger for updated_at on rate_limit_attempts
CREATE TRIGGER update_rate_limit_attempts_updated_at
BEFORE UPDATE ON public.rate_limit_attempts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();