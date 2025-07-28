-- Add privacy field to user_profiles
ALTER TABLE public.user_profiles 
ADD COLUMN is_private boolean DEFAULT false;

-- Create function to delete user account and all related data
CREATE OR REPLACE FUNCTION public.delete_user_account(user_id_to_delete uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Delete all user-related data in proper order to handle dependencies
  
  -- Delete AI generated content
  DELETE FROM public.ai_generated_content WHERE user_id = user_id_to_delete;
  
  -- Delete FCM tokens and push subscriptions
  DELETE FROM public.fcm_tokens WHERE user_id = user_id_to_delete;
  DELETE FROM public.push_subscriptions WHERE user_id = user_id_to_delete;
  
  -- Delete pack-related data
  DELETE FROM public.pack_message_reactions 
  WHERE user_id = user_id_to_delete;
  
  DELETE FROM public.pack_message_reads 
  WHERE user_id = user_id_to_delete;
  
  DELETE FROM public.pack_typing_indicators 
  WHERE user_id = user_id_to_delete;
  
  DELETE FROM public.pack_messages 
  WHERE sender_id = user_id_to_delete;
  
  DELETE FROM public.pack_poll_votes 
  WHERE user_id = user_id_to_delete;
  
  DELETE FROM public.pack_contest_submissions 
  WHERE user_id = user_id_to_delete;
  
  DELETE FROM public.pack_announcements 
  WHERE creator_id = user_id_to_delete;
  
  DELETE FROM public.pack_photo_contests 
  WHERE creator_id = user_id_to_delete;
  
  DELETE FROM public.pack_polls 
  WHERE creator_id = user_id_to_delete;
  
  DELETE FROM public.pack_members 
  WHERE user_id = user_id_to_delete;
  
  -- Delete packs created by user (this will cascade to related pack data)
  DELETE FROM public.packs 
  WHERE created_by = user_id_to_delete;
  
  -- Delete sitter-related data
  DELETE FROM public.sitter_reviews 
  WHERE owner_id = user_id_to_delete OR sitter_id IN (
    SELECT id FROM public.sitter_profiles WHERE user_id = user_id_to_delete
  );
  
  DELETE FROM public.sitter_bookings 
  WHERE owner_id = user_id_to_delete OR sitter_id = user_id_to_delete;
  
  DELETE FROM public.sitter_photos 
  WHERE sitter_id IN (
    SELECT id FROM public.sitter_profiles WHERE user_id = user_id_to_delete
  );
  
  DELETE FROM public.sitter_services 
  WHERE sitter_id IN (
    SELECT id FROM public.sitter_profiles WHERE user_id = user_id_to_delete
  );
  
  DELETE FROM public.sitter_availability 
  WHERE sitter_id IN (
    SELECT id FROM public.sitter_profiles WHERE user_id = user_id_to_delete
  );
  
  DELETE FROM public.sitter_profiles 
  WHERE user_id = user_id_to_delete;
  
  -- Delete business-related data
  DELETE FROM public.deal_redemptions 
  WHERE user_id = user_id_to_delete;
  
  DELETE FROM public.deals 
  WHERE business_id IN (
    SELECT id FROM public.business_profiles WHERE user_id = user_id_to_delete
  );
  
  DELETE FROM public.business_profiles 
  WHERE user_id = user_id_to_delete;
  
  -- Delete events
  DELETE FROM public.events 
  WHERE creator_id = user_id_to_delete;
  
  -- Delete pet-related data
  DELETE FROM public.tweet_reactions 
  WHERE owner_id = user_id_to_delete;
  
  DELETE FROM public.tweet_replies 
  WHERE owner_id = user_id_to_delete;
  
  DELETE FROM public.pet_tweets 
  WHERE owner_id = user_id_to_delete;
  
  DELETE FROM public.pet_friendships 
  WHERE requester_pet_id IN (
    SELECT id FROM public.pet_profiles WHERE user_id = user_id_to_delete
  ) OR recipient_pet_id IN (
    SELECT id FROM public.pet_profiles WHERE user_id = user_id_to_delete
  );
  
  DELETE FROM public.adventures 
  WHERE owner_id = user_id_to_delete;
  
  DELETE FROM public.pet_profiles 
  WHERE user_id = user_id_to_delete;
  
  -- Delete user preferences and profile
  DELETE FROM public.notification_preferences 
  WHERE user_id = user_id_to_delete;
  
  DELETE FROM public.user_profiles 
  WHERE id = user_id_to_delete;
  
  -- Finally delete the auth user (this should cascade to any remaining references)
  DELETE FROM auth.users 
  WHERE id = user_id_to_delete;
END;
$$;