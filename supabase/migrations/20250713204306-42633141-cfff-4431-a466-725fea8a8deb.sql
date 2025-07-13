-- Create tweets table for pet posts
CREATE TABLE public.pet_tweets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pet_id UUID NOT NULL,
  owner_id UUID NOT NULL,
  content TEXT NOT NULL,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tweet reactions table
CREATE TABLE public.tweet_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tweet_id UUID NOT NULL,
  pet_id UUID NOT NULL,
  owner_id UUID NOT NULL,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'love', 'laugh', 'wow', 'sad')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tweet_id, pet_id, reaction_type)
);

-- Create tweet replies table
CREATE TABLE public.tweet_replies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tweet_id UUID NOT NULL,
  pet_id UUID NOT NULL,
  owner_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.pet_tweets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tweet_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tweet_replies ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pet_tweets
CREATE POLICY "Users can create tweets for their pets" 
ON public.pet_tweets 
FOR INSERT 
WITH CHECK (
  owner_id = auth.uid() AND 
  EXISTS (
    SELECT 1 FROM pet_profiles 
    WHERE id = pet_tweets.pet_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their pets' tweets" 
ON public.pet_tweets 
FOR UPDATE 
USING (owner_id = auth.uid());

CREATE POLICY "Users can delete their pets' tweets" 
ON public.pet_tweets 
FOR DELETE 
USING (owner_id = auth.uid());

CREATE POLICY "Public can view tweets" 
ON public.pet_tweets 
FOR SELECT 
USING (true);

-- RLS Policies for tweet_reactions
CREATE POLICY "Users can create reactions for their pets" 
ON public.tweet_reactions 
FOR INSERT 
WITH CHECK (
  owner_id = auth.uid() AND 
  EXISTS (
    SELECT 1 FROM pet_profiles 
    WHERE id = tweet_reactions.pet_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their pets' reactions" 
ON public.tweet_reactions 
FOR DELETE 
USING (owner_id = auth.uid());

CREATE POLICY "Public can view reactions" 
ON public.tweet_reactions 
FOR SELECT 
USING (true);

-- RLS Policies for tweet_replies
CREATE POLICY "Users can create replies for their pets" 
ON public.tweet_replies 
FOR INSERT 
WITH CHECK (
  owner_id = auth.uid() AND 
  EXISTS (
    SELECT 1 FROM pet_profiles 
    WHERE id = tweet_replies.pet_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their pets' replies" 
ON public.tweet_replies 
FOR UPDATE 
USING (owner_id = auth.uid());

CREATE POLICY "Users can delete their pets' replies" 
ON public.tweet_replies 
FOR DELETE 
USING (owner_id = auth.uid());

CREATE POLICY "Public can view replies" 
ON public.tweet_replies 
FOR SELECT 
USING (true);

-- Add foreign key constraints
ALTER TABLE public.pet_tweets 
ADD CONSTRAINT pet_tweets_pet_id_fkey 
FOREIGN KEY (pet_id) REFERENCES public.pet_profiles(id) ON DELETE CASCADE;

ALTER TABLE public.tweet_reactions 
ADD CONSTRAINT tweet_reactions_tweet_id_fkey 
FOREIGN KEY (tweet_id) REFERENCES public.pet_tweets(id) ON DELETE CASCADE;

ALTER TABLE public.tweet_reactions 
ADD CONSTRAINT tweet_reactions_pet_id_fkey 
FOREIGN KEY (pet_id) REFERENCES public.pet_profiles(id) ON DELETE CASCADE;

ALTER TABLE public.tweet_replies 
ADD CONSTRAINT tweet_replies_tweet_id_fkey 
FOREIGN KEY (tweet_id) REFERENCES public.pet_tweets(id) ON DELETE CASCADE;

ALTER TABLE public.tweet_replies 
ADD CONSTRAINT tweet_replies_pet_id_fkey 
FOREIGN KEY (pet_id) REFERENCES public.pet_profiles(id) ON DELETE CASCADE;

-- Enable realtime for all tables
ALTER TABLE public.pet_tweets REPLICA IDENTITY FULL;
ALTER TABLE public.tweet_reactions REPLICA IDENTITY FULL;
ALTER TABLE public.tweet_replies REPLICA IDENTITY FULL;

-- Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.pet_tweets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tweet_reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tweet_replies;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_pet_tweets_updated_at
BEFORE UPDATE ON public.pet_tweets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tweet_replies_updated_at
BEFORE UPDATE ON public.tweet_replies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();