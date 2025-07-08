-- Create waitlist_subscribers table
CREATE TABLE public.waitlist_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.waitlist_subscribers ENABLE ROW LEVEL SECURITY;

-- Create Policy for public insertion
CREATE POLICY "Public can sign up for the waitlist"
ON public.waitlist_subscribers
FOR INSERT
WITH CHECK (true);