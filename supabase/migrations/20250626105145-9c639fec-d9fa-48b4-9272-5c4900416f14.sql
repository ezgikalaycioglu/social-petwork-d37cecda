
-- Create business_profiles table for pet businesses
CREATE TABLE public.business_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name text NOT NULL,
  email text NOT NULL,
  address text,
  business_category text NOT NULL,
  logo_url text,
  description text,
  phone text,
  website text,
  is_verified boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create deals table for business offers
CREATE TABLE public.deals (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id uuid NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  terms text,
  discount_percentage integer,
  discount_amount decimal(10,2),
  is_active boolean DEFAULT true,
  valid_until date,
  max_redemptions integer,
  current_redemptions integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create deal_redemptions table to track user claims
CREATE TABLE public.deal_redemptions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id uuid NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pet_id uuid REFERENCES public.pet_profiles(id) ON DELETE SET NULL,
  redemption_code text NOT NULL UNIQUE,
  is_redeemed boolean DEFAULT false,
  redeemed_at timestamp with time zone,
  claimed_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(deal_id, user_id)
);

-- Add Row Level Security
ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_redemptions ENABLE ROW LEVEL SECURITY;

-- Business profiles policies
CREATE POLICY "Users can view all business profiles" 
  ON public.business_profiles FOR SELECT 
  USING (true);

CREATE POLICY "Users can create their own business profile" 
  ON public.business_profiles FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own business profile" 
  ON public.business_profiles FOR UPDATE 
  USING (auth.uid() = user_id);

-- Deals policies
CREATE POLICY "Users can view active deals" 
  ON public.deals FOR SELECT 
  USING (is_active = true OR EXISTS (
    SELECT 1 FROM public.business_profiles 
    WHERE id = deals.business_id AND user_id = auth.uid()
  ));

CREATE POLICY "Business owners can manage their deals" 
  ON public.deals FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM public.business_profiles 
    WHERE id = deals.business_id AND user_id = auth.uid()
  ));

-- Deal redemptions policies
CREATE POLICY "Users can view their own redemptions" 
  ON public.deal_redemptions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own redemptions" 
  ON public.deal_redemptions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Business owners can view redemptions for their deals" 
  ON public.deal_redemptions FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.deals d
    JOIN public.business_profiles bp ON d.business_id = bp.id
    WHERE d.id = deal_redemptions.deal_id AND bp.user_id = auth.uid()
  ));

-- Create indexes for better performance
CREATE INDEX idx_business_profiles_user_id ON public.business_profiles (user_id);
CREATE INDEX idx_business_profiles_category ON public.business_profiles (business_category);
CREATE INDEX idx_deals_business_id ON public.deals (business_id);
CREATE INDEX idx_deals_active ON public.deals (is_active, valid_until);
CREATE INDEX idx_deal_redemptions_user_id ON public.deal_redemptions (user_id);
CREATE INDEX idx_deal_redemptions_deal_id ON public.deal_redemptions (deal_id);

-- Function to generate unique redemption codes
CREATE OR REPLACE FUNCTION public.generate_redemption_code()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  code text;
BEGIN
  code := 'PET' || upper(substring(gen_random_uuid()::text from 1 for 8));
  RETURN code;
END;
$$;

-- Trigger to auto-generate redemption codes
CREATE OR REPLACE FUNCTION public.handle_new_redemption()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.redemption_code IS NULL OR NEW.redemption_code = '' THEN
    NEW.redemption_code := public.generate_redemption_code();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_redemption_code
  BEFORE INSERT ON public.deal_redemptions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_redemption();
