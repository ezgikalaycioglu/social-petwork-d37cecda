-- Create function to delete all user data while keeping the account
CREATE OR REPLACE FUNCTION public.delete_user_data_only(user_id_to_clear uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  -- Delete AI generated content
  DELETE FROM public.ai_generated_content WHERE user_id = user_id_to_clear;
  
  -- Delete FCM tokens and push subscriptions
  DELETE FROM public.fcm_tokens WHERE user_id = user_id_to_clear;
  DELETE FROM public.push_subscriptions WHERE user_id = user_id_to_clear;
  
  -- Delete pack-related data
  DELETE FROM public.pack_message_reactions 
  WHERE user_id = user_id_to_clear;
  
  DELETE FROM public.pack_message_reads 
  WHERE user_id = user_id_to_clear;
  
  DELETE FROM public.pack_typing_indicators 
  WHERE user_id = user_id_to_clear;
  
  DELETE FROM public.pack_messages 
  WHERE sender_id = user_id_to_clear;
  
  DELETE FROM public.pack_poll_votes 
  WHERE user_id = user_id_to_clear;
  
  DELETE FROM public.pack_contest_submissions 
  WHERE user_id = user_id_to_clear;
  
  DELETE FROM public.pack_announcements 
  WHERE creator_id = user_id_to_clear;
  
  DELETE FROM public.pack_photo_contests 
  WHERE creator_id = user_id_to_clear;
  
  DELETE FROM public.pack_polls 
  WHERE creator_id = user_id_to_clear;
  
  DELETE FROM public.pack_members 
  WHERE user_id = user_id_to_clear;
  
  -- Delete packs created by user (this will cascade to related pack data)
  DELETE FROM public.packs 
  WHERE created_by = user_id_to_clear;
  
  -- Delete sitter-related data
  DELETE FROM public.sitter_reviews 
  WHERE owner_id = user_id_to_clear OR sitter_id IN (
    SELECT id FROM public.sitter_profiles WHERE user_id = user_id_to_clear
  );
  
  DELETE FROM public.sitter_bookings 
  WHERE owner_id = user_id_to_clear OR sitter_id = user_id_to_clear;
  
  DELETE FROM public.sitter_photos 
  WHERE sitter_id IN (
    SELECT id FROM public.sitter_profiles WHERE user_id = user_id_to_clear
  );
  
  DELETE FROM public.sitter_services 
  WHERE sitter_id IN (
    SELECT id FROM public.sitter_profiles WHERE user_id = user_id_to_clear
  );
  
  DELETE FROM public.sitter_availability 
  WHERE sitter_id IN (
    SELECT id FROM public.sitter_profiles WHERE user_id = user_id_to_clear
  );
  
  DELETE FROM public.sitter_profiles 
  WHERE user_id = user_id_to_clear;
  
  -- Delete business-related data
  DELETE FROM public.deal_redemptions 
  WHERE user_id = user_id_to_clear;
  
  DELETE FROM public.deals 
  WHERE business_id IN (
    SELECT id FROM public.business_profiles WHERE user_id = user_id_to_clear
  );
  
  DELETE FROM public.business_profiles 
  WHERE user_id = user_id_to_clear;
  
  -- Delete events
  DELETE FROM public.events 
  WHERE creator_id = user_id_to_clear;
  
  -- Delete pet-related data
  DELETE FROM public.tweet_reactions 
  WHERE owner_id = user_id_to_clear;
  
  DELETE FROM public.tweet_replies 
  WHERE owner_id = user_id_to_clear;
  
  DELETE FROM public.pet_tweets 
  WHERE owner_id = user_id_to_clear;
  
  DELETE FROM public.pet_friendships 
  WHERE requester_pet_id IN (
    SELECT id FROM public.pet_profiles WHERE user_id = user_id_to_clear
  ) OR recipient_pet_id IN (
    SELECT id FROM public.pet_profiles WHERE user_id = user_id_to_clear
  );
  
  DELETE FROM public.adventures 
  WHERE owner_id = user_id_to_clear;
  
  DELETE FROM public.pet_profiles 
  WHERE user_id = user_id_to_clear;
  
  -- Reset user preferences and profile to defaults
  UPDATE public.notification_preferences 
  SET playdate_requests = true,
      playdate_confirmations = true,
      event_reminders = true,
      new_follower_alerts = true,
      weekly_newsletter = false,
      updated_at = now()
  WHERE user_id = user_id_to_clear;
  
  UPDATE public.user_profiles 
  SET display_name = null,
      city = null,
      neighborhood = null,
      is_private = false,
      tour_completed = false,
      updated_at = now()
  WHERE id = user_id_to_clear;
END;
$function$;