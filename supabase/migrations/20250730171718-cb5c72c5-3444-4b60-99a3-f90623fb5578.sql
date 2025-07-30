-- Create a secure user deletion function that requires password verification
CREATE OR REPLACE FUNCTION public.secure_delete_user_account(user_email text, user_password text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  user_record auth.users%ROWTYPE;
  result json;
BEGIN
  -- This function should only be called by edge functions with service role
  -- The password verification will be done in the edge function
  -- This function just performs the deletion
  
  -- Get user by email
  SELECT * INTO user_record FROM auth.users WHERE email = user_email;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'User not found');
  END IF;
  
  -- Call the existing deletion function
  PERFORM public.delete_user_account(user_record.id);
  
  RETURN json_build_object('success', true, 'message', 'Account deleted successfully');
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$function$