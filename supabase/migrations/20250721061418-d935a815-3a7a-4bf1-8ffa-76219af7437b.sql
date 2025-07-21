-- Add privacy field to packs table to support public/private pack types
ALTER TABLE public.packs 
ADD COLUMN privacy TEXT NOT NULL DEFAULT 'public' CHECK (privacy IN ('public', 'private'));