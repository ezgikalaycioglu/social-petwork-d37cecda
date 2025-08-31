-- Create beta_testers table for beta signups
CREATE TABLE IF NOT EXISTS public.beta_testers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  email text NOT NULL
);

-- Ensure unique emails (case-insensitive)
CREATE UNIQUE INDEX IF NOT EXISTS beta_testers_email_unique ON public.beta_testers (lower(email));

-- Enable RLS
ALTER TABLE public.beta_testers ENABLE ROW LEVEL SECURITY;

-- Policies: allow public inserts only; no select/update/delete
DROP POLICY IF EXISTS "Public can insert beta testers" ON public.beta_testers;
CREATE POLICY "Public can insert beta testers"
ON public.beta_testers
FOR INSERT
TO public
WITH CHECK (true);

DROP POLICY IF EXISTS "No one can select beta testers" ON public.beta_testers;
CREATE POLICY "No one can select beta testers"
ON public.beta_testers
FOR SELECT
TO public
USING (false);

DROP POLICY IF EXISTS "No one can update beta testers" ON public.beta_testers;
CREATE POLICY "No one can update beta testers"
ON public.beta_testers
FOR UPDATE
TO public
USING (false);

DROP POLICY IF EXISTS "No one can delete beta testers" ON public.beta_testers;
CREATE POLICY "No one can delete beta testers"
ON public.beta_testers
FOR DELETE
TO public
USING (false);
