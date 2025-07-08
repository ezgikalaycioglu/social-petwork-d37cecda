-- Add missing index on pet_id foreign key column for better performance
-- This resolves the unindexed foreign key constraint issue on deal_redemptions_pet_id_fkey

CREATE INDEX idx_deal_redemptions_pet_id ON public.deal_redemptions(pet_id);