-- Create pack messages table
CREATE TABLE public.pack_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pack_id uuid NOT NULL,
  sender_id uuid NOT NULL,
  content text NOT NULL,
  message_type text NOT NULL DEFAULT 'text',
  media_url text,
  replied_to_message_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  is_deleted boolean NOT NULL DEFAULT false
);

-- Create message reactions table
CREATE TABLE public.pack_message_reactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id uuid NOT NULL,
  user_id uuid NOT NULL,
  emoji text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (message_id, user_id, emoji)
);

-- Create message read receipts table
CREATE TABLE public.pack_message_reads (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id uuid NOT NULL,
  user_id uuid NOT NULL,
  read_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (message_id, user_id)
);

-- Create typing indicators table for real-time typing status
CREATE TABLE public.pack_typing_indicators (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pack_id uuid NOT NULL,
  user_id uuid NOT NULL,
  is_typing boolean NOT NULL DEFAULT false,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (pack_id, user_id)
);

-- Enable RLS
ALTER TABLE public.pack_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pack_message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pack_message_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pack_typing_indicators ENABLE ROW LEVEL SECURITY;

-- Pack messages policies
CREATE POLICY "Pack members can view messages"
ON public.pack_messages
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM pack_members 
  WHERE pack_members.pack_id = pack_messages.pack_id 
  AND pack_members.user_id = auth.uid()
));

CREATE POLICY "Pack members can create messages"
ON public.pack_messages
FOR INSERT
WITH CHECK (
  sender_id = auth.uid() 
  AND EXISTS (
    SELECT 1 FROM pack_members 
    WHERE pack_members.pack_id = pack_messages.pack_id 
    AND pack_members.user_id = auth.uid()
  )
);

CREATE POLICY "Senders can update their own messages"
ON public.pack_messages
FOR UPDATE
USING (sender_id = auth.uid());

-- Message reactions policies
CREATE POLICY "Pack members can view reactions"
ON public.pack_message_reactions
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM pack_messages pm
  JOIN pack_members pmem ON pm.pack_id = pmem.pack_id
  WHERE pm.id = pack_message_reactions.message_id 
  AND pmem.user_id = auth.uid()
));

CREATE POLICY "Pack members can create reactions"
ON public.pack_message_reactions
FOR INSERT
WITH CHECK (
  user_id = auth.uid() 
  AND EXISTS (
    SELECT 1 FROM pack_messages pm
    JOIN pack_members pmem ON pm.pack_id = pmem.pack_id
    WHERE pm.id = pack_message_reactions.message_id 
    AND pmem.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own reactions"
ON public.pack_message_reactions
FOR DELETE
USING (user_id = auth.uid());

-- Message read receipts policies
CREATE POLICY "Pack members can view read receipts"
ON public.pack_message_reads
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM pack_messages pm
  JOIN pack_members pmem ON pm.pack_id = pmem.pack_id
  WHERE pm.id = pack_message_reads.message_id 
  AND pmem.user_id = auth.uid()
));

CREATE POLICY "Pack members can create read receipts"
ON public.pack_message_reads
FOR INSERT
WITH CHECK (
  user_id = auth.uid() 
  AND EXISTS (
    SELECT 1 FROM pack_messages pm
    JOIN pack_members pmem ON pm.pack_id = pmem.pack_id
    WHERE pm.id = pack_message_reads.message_id 
    AND pmem.user_id = auth.uid()
  )
);

-- Typing indicators policies
CREATE POLICY "Pack members can view typing indicators"
ON public.pack_typing_indicators
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM pack_members 
  WHERE pack_members.pack_id = pack_typing_indicators.pack_id 
  AND pack_members.user_id = auth.uid()
));

CREATE POLICY "Pack members can manage their typing status"
ON public.pack_typing_indicators
FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Add triggers for updated_at
CREATE TRIGGER update_pack_messages_updated_at
BEFORE UPDATE ON public.pack_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pack_typing_indicators_updated_at
BEFORE UPDATE ON public.pack_typing_indicators
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.pack_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.pack_message_reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.pack_message_reads;
ALTER PUBLICATION supabase_realtime ADD TABLE public.pack_typing_indicators;