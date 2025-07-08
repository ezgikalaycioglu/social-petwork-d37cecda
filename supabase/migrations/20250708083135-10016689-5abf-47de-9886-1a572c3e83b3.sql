-- Fix security vulnerability: Set explicit search path for generate_redemption_code function
CREATE OR REPLACE FUNCTION public.generate_redemption_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  code text;
BEGIN
  code := 'PET' || upper(substring(gen_random_uuid()::text from 1 for 8));
  RETURN code;
END;
$function$;