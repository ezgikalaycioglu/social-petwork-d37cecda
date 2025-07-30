-- Update the generate_unique_pet_username function to replace spaces with underscores
CREATE OR REPLACE FUNCTION public.generate_unique_pet_username(base_name text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  username TEXT;
  counter INTEGER := 1;
BEGIN
  -- Replace spaces with underscores and convert to lowercase for consistency
  username := lower(replace(base_name, ' ', '_'));
  
  -- Check if base name is available
  IF NOT EXISTS (SELECT 1 FROM public.pet_profiles WHERE pet_username = username) THEN
    RETURN username;
  END IF;
  
  -- Find next available username with number
  LOOP
    username := lower(replace(base_name, ' ', '_')) || counter::text;
    IF NOT EXISTS (SELECT 1 FROM public.pet_profiles WHERE pet_username = username) THEN
      RETURN username;
    END IF;
    counter := counter + 1;
  END LOOP;
END;
$function$;

-- Update existing pet_username fields to replace spaces with underscores
UPDATE public.pet_profiles 
SET pet_username = lower(replace(pet_username, ' ', '_'))
WHERE pet_username LIKE '% %';

-- Handle any potential duplicates after the update
DO $$
DECLARE
  duplicate_record RECORD;
  new_username TEXT;
  counter INTEGER;
BEGIN
  -- Find and fix any duplicates that might have been created
  FOR duplicate_record IN 
    SELECT pet_username, array_agg(id) as ids
    FROM public.pet_profiles 
    GROUP BY pet_username 
    HAVING count(*) > 1
  LOOP
    -- Keep the first record with the original username
    -- Update subsequent records with numbered versions
    FOR i IN 2..array_length(duplicate_record.ids, 1) LOOP
      counter := i - 1;
      new_username := duplicate_record.pet_username || counter::text;
      
      -- Ensure the new username is unique
      WHILE EXISTS (SELECT 1 FROM public.pet_profiles WHERE pet_username = new_username) LOOP
        counter := counter + 1;
        new_username := duplicate_record.pet_username || counter::text;
      END LOOP;
      
      -- Update the duplicate record
      UPDATE public.pet_profiles 
      SET pet_username = new_username 
      WHERE id = duplicate_record.ids[i];
    END LOOP;
  END LOOP;
END;
$$;