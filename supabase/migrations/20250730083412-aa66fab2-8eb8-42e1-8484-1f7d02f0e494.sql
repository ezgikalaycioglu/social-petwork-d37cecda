-- Add pet_username column to pet_profiles table
ALTER TABLE public.pet_profiles 
ADD COLUMN pet_username TEXT;

-- Create unique index on pet_username
CREATE UNIQUE INDEX idx_pet_profiles_pet_username_unique 
ON public.pet_profiles(pet_username);

-- Populate existing pets with their name as username
UPDATE public.pet_profiles 
SET pet_username = name 
WHERE pet_username IS NULL;

-- Handle duplicates by appending numbers
WITH ranked_pets AS (
  SELECT id, name, 
         ROW_NUMBER() OVER (PARTITION BY name ORDER BY created_at) as rn
  FROM public.pet_profiles 
  WHERE pet_username = name
)
UPDATE public.pet_profiles 
SET pet_username = CASE 
  WHEN rp.rn = 1 THEN rp.name
  ELSE rp.name || rp.rn::text
END
FROM ranked_pets rp
WHERE public.pet_profiles.id = rp.id;

-- Make pet_username NOT NULL after populating
ALTER TABLE public.pet_profiles 
ALTER COLUMN pet_username SET NOT NULL;

-- Create function to generate unique pet username
CREATE OR REPLACE FUNCTION public.generate_unique_pet_username(base_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  username TEXT;
  counter INTEGER := 1;
BEGIN
  username := base_name;
  
  -- Check if base name is available
  IF NOT EXISTS (SELECT 1 FROM public.pet_profiles WHERE pet_username = username) THEN
    RETURN username;
  END IF;
  
  -- Find next available username with number
  LOOP
    username := base_name || counter::text;
    IF NOT EXISTS (SELECT 1 FROM public.pet_profiles WHERE pet_username = username) THEN
      RETURN username;
    END IF;
    counter := counter + 1;
  END LOOP;
END;
$$;

-- Create trigger function to auto-generate pet_username
CREATE OR REPLACE FUNCTION public.handle_pet_username()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Only generate username if not provided or empty
  IF NEW.pet_username IS NULL OR NEW.pet_username = '' THEN
    NEW.pet_username := public.generate_unique_pet_username(NEW.name);
  ELSE
    -- If username is provided, ensure it's unique
    IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.pet_username != NEW.pet_username) THEN
      IF EXISTS (SELECT 1 FROM public.pet_profiles WHERE pet_username = NEW.pet_username AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)) THEN
        RAISE EXCEPTION 'Pet username already exists: %', NEW.pet_username;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER trigger_pet_username
  BEFORE INSERT OR UPDATE ON public.pet_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_pet_username();