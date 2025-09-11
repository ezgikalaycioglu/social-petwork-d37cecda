-- Add currency column to sitter_profiles table
ALTER TABLE public.sitter_profiles 
ADD COLUMN currency text DEFAULT 'USD' NOT NULL;

-- Add a constraint to ensure valid currencies
ALTER TABLE public.sitter_profiles 
ADD CONSTRAINT valid_currency CHECK (currency IN ('USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'SEK', 'NOK', 'DKK'));

-- Update existing records to have USD as default
UPDATE public.sitter_profiles SET currency = 'USD' WHERE currency IS NULL;