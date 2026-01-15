-- =====================================================
-- Pet Sitting Booking + Messaging + Review Flow
-- =====================================================

-- 1. ALTER sitter_bookings table to add completion fields
ALTER TABLE public.sitter_bookings 
ADD COLUMN IF NOT EXISTS initial_message text,
ADD COLUMN IF NOT EXISTS owner_completed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS sitter_completed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS completed_at timestamp with time zone;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_sitter_bookings_owner_id ON public.sitter_bookings(owner_id);
CREATE INDEX IF NOT EXISTS idx_sitter_bookings_sitter_id ON public.sitter_bookings(sitter_id);
CREATE INDEX IF NOT EXISTS idx_sitter_bookings_status ON public.sitter_bookings(status);

-- 2. CREATE sitter_conversations table
CREATE TABLE IF NOT EXISTS public.sitter_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  participant_a uuid NOT NULL,
  participant_b uuid NOT NULL,
  booking_id uuid REFERENCES public.sitter_bookings(id) ON DELETE SET NULL,
  last_message_at timestamp with time zone DEFAULT now(),
  CONSTRAINT unique_conversation_pair UNIQUE (participant_a, participant_b)
);

-- Create indexes for conversations
CREATE INDEX IF NOT EXISTS idx_sitter_conversations_participant_a ON public.sitter_conversations(participant_a);
CREATE INDEX IF NOT EXISTS idx_sitter_conversations_participant_b ON public.sitter_conversations(participant_b);
CREATE INDEX IF NOT EXISTS idx_sitter_conversations_last_message ON public.sitter_conversations(last_message_at DESC);

-- Enable RLS on conversations
ALTER TABLE public.sitter_conversations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversations
CREATE POLICY "Users can view their own conversations"
ON public.sitter_conversations FOR SELECT
USING (auth.uid() = participant_a OR auth.uid() = participant_b);

CREATE POLICY "Users can create conversations they are part of"
ON public.sitter_conversations FOR INSERT
WITH CHECK (auth.uid() = participant_a OR auth.uid() = participant_b);

CREATE POLICY "Participants can update their conversations"
ON public.sitter_conversations FOR UPDATE
USING (auth.uid() = participant_a OR auth.uid() = participant_b);

-- 3. CREATE sitter_messages table
CREATE TABLE IF NOT EXISTS public.sitter_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  conversation_id uuid NOT NULL REFERENCES public.sitter_conversations(id) ON DELETE CASCADE,
  sender_user_id uuid NOT NULL,
  body text NOT NULL,
  read_at timestamp with time zone
);

-- Create indexes for messages
CREATE INDEX IF NOT EXISTS idx_sitter_messages_conversation_id ON public.sitter_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_sitter_messages_created_at ON public.sitter_messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sitter_messages_sender ON public.sitter_messages(sender_user_id);

-- Enable RLS on messages
ALTER TABLE public.sitter_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for messages
CREATE POLICY "Users can view messages in their conversations"
ON public.sitter_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.sitter_conversations sc
    WHERE sc.id = sitter_messages.conversation_id
    AND (sc.participant_a = auth.uid() OR sc.participant_b = auth.uid())
  )
);

CREATE POLICY "Users can send messages to their conversations"
ON public.sitter_messages FOR INSERT
WITH CHECK (
  sender_user_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.sitter_conversations sc
    WHERE sc.id = sitter_messages.conversation_id
    AND (sc.participant_a = auth.uid() OR sc.participant_b = auth.uid())
  )
);

CREATE POLICY "Recipients can mark messages as read"
ON public.sitter_messages FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.sitter_conversations sc
    WHERE sc.id = sitter_messages.conversation_id
    AND (sc.participant_a = auth.uid() OR sc.participant_b = auth.uid())
  )
  AND sender_user_id != auth.uid()
);

-- 4. UPDATE sitter_bookings RLS policies for completion flow
-- First drop existing policies that might conflict
DROP POLICY IF EXISTS "Owners can update their pending bookings" ON public.sitter_bookings;
DROP POLICY IF EXISTS "Sitters can update booking status" ON public.sitter_bookings;

-- Create new comprehensive update policies
CREATE POLICY "Owners can update their bookings"
ON public.sitter_bookings FOR UPDATE
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Sitters can update bookings for them"
ON public.sitter_bookings FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.sitter_profiles sp
    WHERE sp.id = sitter_bookings.sitter_id
    AND sp.user_id = auth.uid()
  )
);

-- 5. UPDATE sitter_reviews RLS policies
-- Make reviews publicly readable
DROP POLICY IF EXISTS "Users can view reviews" ON public.sitter_reviews;
CREATE POLICY "Anyone can view reviews"
ON public.sitter_reviews FOR SELECT
USING (true);

-- Only booking owner can create review after completion
DROP POLICY IF EXISTS "Owners can create reviews" ON public.sitter_reviews;
CREATE POLICY "Owners can create reviews for completed bookings"
ON public.sitter_reviews FOR INSERT
WITH CHECK (
  owner_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.sitter_bookings sb
    WHERE sb.id = sitter_reviews.booking_id
    AND sb.owner_id = auth.uid()
    AND sb.status = 'completed'
  )
);

-- Owners can update their own reviews
DROP POLICY IF EXISTS "Owners can update their reviews" ON public.sitter_reviews;
CREATE POLICY "Owners can update their reviews"
ON public.sitter_reviews FOR UPDATE
USING (owner_id = auth.uid());

-- 6. CREATE trigger for automatic completion
CREATE OR REPLACE FUNCTION public.check_booking_completion()
RETURNS TRIGGER AS $$
BEGIN
  -- When both parties mark as completed, update status
  IF NEW.owner_completed = true AND NEW.sitter_completed = true AND OLD.status != 'completed' THEN
    NEW.status := 'completed';
    NEW.completed_at := now();
  END IF;
  
  -- Always update updated_at
  NEW.updated_at := now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop existing trigger if exists and create new one
DROP TRIGGER IF EXISTS trigger_booking_completion ON public.sitter_bookings;
CREATE TRIGGER trigger_booking_completion
BEFORE UPDATE ON public.sitter_bookings
FOR EACH ROW
EXECUTE FUNCTION public.check_booking_completion();

-- 7. CREATE function to update conversation last_message_at
CREATE OR REPLACE FUNCTION public.update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.sitter_conversations
  SET last_message_at = NEW.created_at, updated_at = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for updating last message time
DROP TRIGGER IF EXISTS trigger_update_conversation_last_message ON public.sitter_messages;
CREATE TRIGGER trigger_update_conversation_last_message
AFTER INSERT ON public.sitter_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_conversation_last_message();

-- 8. CREATE helper function to find or create conversation
CREATE OR REPLACE FUNCTION public.find_or_create_conversation(
  user_a uuid,
  user_b uuid,
  linked_booking_id uuid DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  conv_id uuid;
  ordered_a uuid;
  ordered_b uuid;
BEGIN
  -- Order the UUIDs consistently to avoid duplicates
  IF user_a < user_b THEN
    ordered_a := user_a;
    ordered_b := user_b;
  ELSE
    ordered_a := user_b;
    ordered_b := user_a;
  END IF;

  -- Try to find existing conversation
  SELECT id INTO conv_id
  FROM public.sitter_conversations
  WHERE participant_a = ordered_a AND participant_b = ordered_b
  LIMIT 1;

  -- If not found, create new one
  IF conv_id IS NULL THEN
    INSERT INTO public.sitter_conversations (participant_a, participant_b, booking_id)
    VALUES (ordered_a, ordered_b, linked_booking_id)
    RETURNING id INTO conv_id;
  END IF;

  RETURN conv_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;