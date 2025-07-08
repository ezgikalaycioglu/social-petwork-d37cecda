-- Fix security vulnerability: Set explicit search path for handle_new_redemption function
CREATE OR REPLACE FUNCTION public.handle_new_redemption()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  IF NEW.redemption_code IS NULL OR NEW.redemption_code = '' THEN
    NEW.redemption_code := public.generate_redemption_code();
  END IF;
  RETURN NEW;
END;
$function$;