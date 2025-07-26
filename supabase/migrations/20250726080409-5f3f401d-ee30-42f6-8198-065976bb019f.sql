-- Create index for pet_tweets foreign key to improve performance
CREATE INDEX idx_pet_tweets_pet_id ON public.pet_tweets (pet_id);