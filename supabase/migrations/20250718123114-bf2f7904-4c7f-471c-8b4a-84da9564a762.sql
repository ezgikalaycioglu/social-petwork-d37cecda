-- Create sitter profiles table
CREATE TABLE public.sitter_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  bio TEXT,
  location TEXT,
  rate_per_day DECIMAL(10,2),
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sitter services table
CREATE TABLE public.sitter_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sitter_id UUID NOT NULL,
  service_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sitter photos table
CREATE TABLE public.sitter_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sitter_id UUID NOT NULL,
  photo_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sitter bookings table
CREATE TABLE public.sitter_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sitter_id UUID NOT NULL,
  owner_id UUID NOT NULL,
  pet_id UUID NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  special_instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sitter reviews table
CREATE TABLE public.sitter_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL UNIQUE,
  sitter_id UUID NOT NULL,
  owner_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.sitter_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sitter_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sitter_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sitter_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sitter_reviews ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for sitter_profiles
CREATE POLICY "Users can view all active sitter profiles" 
ON public.sitter_profiles 
FOR SELECT 
USING (is_active = true OR user_id = auth.uid());

CREATE POLICY "Users can create their own sitter profile" 
ON public.sitter_profiles 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own sitter profile" 
ON public.sitter_profiles 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own sitter profile" 
ON public.sitter_profiles 
FOR DELETE 
USING (user_id = auth.uid());

-- Create RLS policies for sitter_services
CREATE POLICY "Users can view all sitter services" 
ON public.sitter_services 
FOR SELECT 
USING (true);

CREATE POLICY "Users can manage their own sitter services" 
ON public.sitter_services 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.sitter_profiles 
  WHERE id = sitter_services.sitter_id AND user_id = auth.uid()
));

-- Create RLS policies for sitter_photos
CREATE POLICY "Users can view all sitter photos" 
ON public.sitter_photos 
FOR SELECT 
USING (true);

CREATE POLICY "Users can manage their own sitter photos" 
ON public.sitter_photos 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.sitter_profiles 
  WHERE id = sitter_photos.sitter_id AND user_id = auth.uid()
));

-- Create RLS policies for sitter_bookings
CREATE POLICY "Users can view their own bookings" 
ON public.sitter_bookings 
FOR SELECT 
USING (sitter_id = auth.uid() OR owner_id = auth.uid());

CREATE POLICY "Pet owners can create bookings" 
ON public.sitter_bookings 
FOR INSERT 
WITH CHECK (owner_id = auth.uid() AND EXISTS (
  SELECT 1 FROM public.pet_profiles 
  WHERE id = sitter_bookings.pet_id AND user_id = auth.uid()
));

CREATE POLICY "Sitters and owners can update bookings" 
ON public.sitter_bookings 
FOR UPDATE 
USING (sitter_id = auth.uid() OR owner_id = auth.uid());

-- Create RLS policies for sitter_reviews
CREATE POLICY "Users can view all reviews" 
ON public.sitter_reviews 
FOR SELECT 
USING (true);

CREATE POLICY "Pet owners can create reviews for completed bookings" 
ON public.sitter_reviews 
FOR INSERT 
WITH CHECK (owner_id = auth.uid() AND EXISTS (
  SELECT 1 FROM public.sitter_bookings 
  WHERE id = sitter_reviews.booking_id 
  AND owner_id = auth.uid() 
  AND status = 'completed'
));

-- Create foreign key constraints
ALTER TABLE public.sitter_services 
ADD CONSTRAINT sitter_services_sitter_id_fkey 
FOREIGN KEY (sitter_id) REFERENCES public.sitter_profiles(id) ON DELETE CASCADE;

ALTER TABLE public.sitter_photos 
ADD CONSTRAINT sitter_photos_sitter_id_fkey 
FOREIGN KEY (sitter_id) REFERENCES public.sitter_profiles(id) ON DELETE CASCADE;

ALTER TABLE public.sitter_bookings 
ADD CONSTRAINT sitter_bookings_pet_id_fkey 
FOREIGN KEY (pet_id) REFERENCES public.pet_profiles(id) ON DELETE CASCADE;

ALTER TABLE public.sitter_reviews 
ADD CONSTRAINT sitter_reviews_booking_id_fkey 
FOREIGN KEY (booking_id) REFERENCES public.sitter_bookings(id) ON DELETE CASCADE;

-- Create updated_at trigger
CREATE TRIGGER update_sitter_profiles_updated_at
BEFORE UPDATE ON public.sitter_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sitter_bookings_updated_at
BEFORE UPDATE ON public.sitter_bookings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();