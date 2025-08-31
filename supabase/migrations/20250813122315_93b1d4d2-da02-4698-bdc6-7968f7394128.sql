-- Fix: Secure events table from public data exposure
-- CRITICAL SECURITY ISSUE: Current policy allows public read access to all events

-- 1) Drop the dangerous public SELECT policy
DROP POLICY IF EXISTS "Public can view events" ON public.events;

-- 2) Create secure, role-scoped SELECT policies (authenticated users only)
-- Users can view events where they are creator
CREATE POLICY "Users can view their created events"
ON public.events
FOR SELECT
TO authenticated
USING (creator_id = auth.uid());

-- Users can view events where they are participants
CREATE POLICY "Users can view events they participate in"
ON public.events
FOR SELECT
TO authenticated
USING (auth.uid() = ANY (participants));

-- Users can view events where they are invited
CREATE POLICY "Users can view events they are invited to"
ON public.events
FOR SELECT
TO authenticated
USING (auth.uid() = ANY (invited_participants));

-- 3) Ensure INSERT policy is properly scoped to authenticated users only
DROP POLICY IF EXISTS "Users can create events" ON public.events;

CREATE POLICY "Users can create events"
ON public.events
FOR INSERT
TO authenticated
WITH CHECK (creator_id = auth.uid());

-- Note: UPDATE and DELETE policies already correctly scoped to authenticated users
-- This change blocks anon role from selecting any rows on events, protecting location and activity data from unauthenticated access.