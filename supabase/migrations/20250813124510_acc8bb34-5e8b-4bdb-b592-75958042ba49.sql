-- Fix FCM tokens security vulnerability by implementing granular RLS policies

-- Drop the overly broad "ALL" policy
DROP POLICY IF EXISTS "Users can manage their own FCM tokens" ON public.fcm_tokens;

-- Create specific, granular policies for each operation
-- Users can only SELECT their own FCM tokens
CREATE POLICY "Users can view their own FCM tokens"
ON public.fcm_tokens
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Users can only INSERT FCM tokens for themselves
CREATE POLICY "Users can insert their own FCM tokens"
ON public.fcm_tokens
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Users can only UPDATE their own FCM tokens
CREATE POLICY "Users can update their own FCM tokens"
ON public.fcm_tokens
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Users can only DELETE their own FCM tokens
CREATE POLICY "Users can delete their own FCM tokens"
ON public.fcm_tokens
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Ensure RLS is enabled (should already be enabled but double-check)
ALTER TABLE public.fcm_tokens ENABLE ROW LEVEL SECURITY;

-- Revoke any public access that might exist
REVOKE ALL ON public.fcm_tokens FROM anon;
REVOKE ALL ON public.fcm_tokens FROM public;

-- Grant only necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fcm_tokens TO authenticated;