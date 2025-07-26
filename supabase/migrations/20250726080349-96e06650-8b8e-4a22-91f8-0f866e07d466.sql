-- Create index for pet_tweets foreign key to improve performance
CREATE INDEX CONCURRENTLY idx_pet_tweets_pet_id ON public.pet_tweets (pet_id);