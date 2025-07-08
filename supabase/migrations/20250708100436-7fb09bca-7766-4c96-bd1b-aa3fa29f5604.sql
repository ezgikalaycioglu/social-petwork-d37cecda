-- Add missing index on created_by foreign key column for better performance
-- This resolves the unindexed foreign key constraint issue on packs_created_by_fkey

CREATE INDEX idx_packs_created_by ON public.packs(created_by);