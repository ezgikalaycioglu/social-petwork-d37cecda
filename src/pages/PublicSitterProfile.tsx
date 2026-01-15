import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { 
  MapPin, 
  Star, 
  ShieldCheck, 
  Clock, 
  Users, 
  Calendar,
  MessageCircle,
  ArrowLeft,
  PawPrint,
  Heart
} from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface SitterProfile {
  id: string;
  user_id: string;
  bio: string | null;
  location: string | null;
  rate_per_day: number | null;
  currency: string;
  headline: string | null;
  years_experience: string | null;
  accepted_pet_types: string[] | null;
  is_verified: boolean | null;
  response_time: string | null;
  is_active: boolean | null;
}

interface UserProfile {
  display_name: string | null;
  city: string | null;
  avatar_url?: string | null;
}

interface SitterService {
  service_type: string;
}

interface SitterPhoto {
  photo_url: string;
  is_primary: boolean | null;
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer_name?: string;
}

interface PetProfile {
  id: string;
  name: string;
  breed: string;
  profile_photo_url: string | null;
}

export default function PublicSitterProfile() {
  const { sitterId } = useParams<{ sitterId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [sitter, setSitter] = useState<SitterProfile | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [services, setServices] = useState<SitterService[]>([]);
  const [photos, setPhotos] = useState<SitterPhoto[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [sitterPets, setSitterPets] = useState<PetProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sitterId) {
      fetchSitterData();
    }
  }, [sitterId]);

  const fetchSitterData = async () => {
    try {
      // Fetch sitter profile with related data
      const { data: sitterData, error: sitterError } = await supabase
        .from('sitter_profiles')
        .select(`
          *,
          sitter_services(service_type),
          sitter_photos(photo_url, is_primary)
        `)
        .eq('id', sitterId)
        .eq('is_active', true)
        .single();

      if (sitterError) throw sitterError;

      setSitter(sitterData);
      setServices(sitterData.sitter_services || []);
      setPhotos(sitterData.sitter_photos || []);

      // Fetch user profile
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('display_name, city')
        .eq('id', sitterData.user_id)
        .single();

      // Also check profiles table for avatar
      const { data: authProfileData } = await supabase
        .from('profiles')
        .select('avatar_url, full_name')
        .eq('id', sitterData.user_id)
        .single();

      setUserProfile({
        display_name: profileData?.display_name || authProfileData?.full_name || 'Pet Sitter',
        city: profileData?.city,
        avatar_url: authProfileData?.avatar_url
      });

      // Fetch reviews
      const { data: reviewsData } = await supabase
        .from('sitter_reviews')
        .select('id, rating, comment, created_at, owner_id')
        .eq('sitter_id', sitterId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (reviewsData && reviewsData.length > 0) {
        const ownerIds = reviewsData.map(r => r.owner_id);
        const { data: ownerProfiles } = await supabase
          .from('user_profiles')
          .select('id, display_name')
          .in('id', ownerIds);

        const enrichedReviews = reviewsData.map(review => ({
          ...review,
          reviewer_name: ownerProfiles?.find(p => p.id === review.owner_id)?.display_name || 'Pet Parent'
        }));
        setReviews(enrichedReviews);
      }

      // Fetch sitter's own pets
      const { data: petsData } = await supabase
        .from('pet_profiles')
        .select('id, name, breed, profile_photo_url')
        .eq('user_id', sitterData.user_id)
        .limit(6);

      setSitterPets(petsData || []);

    } catch (error) {
      console.error('Error fetching sitter:', error);
      toast({
        title: "Profile not found",
        description: "This sitter profile doesn't exist or is inactive.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getCurrencySymbol = (currency: string) => {
    const symbols: Record<string, string> = {
      'USD': '$', 'EUR': '€', 'GBP': '£', 'SEK': 'kr', 'TRY': '₺'
    };
    return symbols[currency] || currency;
  };

  const handleContactSitter = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    navigate(`/sitter/${sitterId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!sitter) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 p-4">
        <PawPrint className="w-16 h-16 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Profile Not Found</h1>
        <p className="text-muted-foreground text-center">
          This sitter profile doesn't exist or is currently inactive.
        </p>
        <Button onClick={() => navigate('/find-sitter')}>
          Find Other Sitters
        </Button>
      </div>
    );
  }

  const displayName = userProfile?.display_name || 'Pet Sitter';
  const primaryPhoto = photos.find(p => p.is_primary)?.photo_url || photos[0]?.photo_url || userProfile?.avatar_url;
  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
    : null;
  const hasReviews = reviews.length > 0;

  // Mock data for stats (to be replaced with real data later)
  const repeatClients = Math.floor(Math.random() * 20) + 5;

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile-first layout */}
      <div className="max-w-2xl mx-auto">
        
        {/* Back button - only show if there's history */}
        <div className="p-4 pb-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="text-muted-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        {/* Hero Profile Card */}
        <div className="p-6 text-center">
          <div className="relative inline-block">
            <Avatar className="w-28 h-28 border-4 border-background shadow-xl">
              <AvatarImage src={primaryPhoto || undefined} alt={displayName} />
              <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {sitter.is_verified && (
              <div className="absolute -bottom-1 -right-1 bg-accent text-accent-foreground rounded-full p-1.5 shadow-lg">
                <ShieldCheck className="w-5 h-5" />
              </div>
            )}
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-2xl font-bold">{displayName}</h1>
              {sitter.is_verified && (
                <Badge variant="secondary" className="bg-accent/10 text-accent">
                  Verified
                </Badge>
              )}
            </div>
            
            {sitter.headline && (
              <p className="text-muted-foreground text-lg">{sitter.headline}</p>
            )}

            <div className="flex items-center justify-center gap-1 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{sitter.location || userProfile?.city || 'Location not specified'}</span>
            </div>

            {/* Rating */}
            {hasReviews ? (
              <div className="flex items-center justify-center gap-2">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{averageRating?.toFixed(1)}</span>
                </div>
                <span className="text-muted-foreground">({reviews.length} reviews)</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Star className="w-4 h-4" />
                <span className="text-sm">New sitter</span>
              </div>
            )}
          </div>
        </div>

        {/* Stats Row */}
        <div className="px-6 pb-6">
          <Card className="rounded-2xl">
            <CardContent className="p-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {sitter.years_experience || '1+'}
                  </div>
                  <div className="text-xs text-muted-foreground">Years Exp</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">{repeatClients}</div>
                  <div className="text-xs text-muted-foreground">Repeat Clients</div>
                </div>
                <div>
                  <div className="text-sm font-bold text-primary flex items-center justify-center gap-1">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {sitter.response_time || 'Within hours'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Services & Rates */}
        <div className="px-6 pb-6">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Services & Rates
          </h2>
          <div className="space-y-3">
            {services.length > 0 ? (
              services.map((service, index) => (
                <Card key={index} className="rounded-xl">
                  <CardContent className="p-4 flex justify-between items-center">
                    <div>
                      <p className="font-medium">{service.service_type}</p>
                      {sitter.accepted_pet_types && sitter.accepted_pet_types.length > 0 && (
                        <p className="text-sm text-muted-foreground">
                          {sitter.accepted_pet_types.slice(0, 3).join(', ')}
                          {sitter.accepted_pet_types.length > 3 && ' +more'}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-primary">
                        {getCurrencySymbol(sitter.currency)}{sitter.rate_per_day}
                      </p>
                      <p className="text-xs text-muted-foreground">per day</p>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="rounded-xl">
                <CardContent className="p-4 flex justify-between items-center">
                  <p className="font-medium">Pet Sitting</p>
                  <div className="text-right">
                    <p className="text-xl font-bold text-primary">
                      {getCurrencySymbol(sitter.currency)}{sitter.rate_per_day || 'Contact'}
                    </p>
                    <p className="text-xs text-muted-foreground">per day</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* About Me */}
        <div className="px-6 pb-6">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Heart className="w-5 h-5 text-coral" />
            About Me
          </h2>
          <Card className="rounded-xl">
            <CardContent className="p-4">
              <p className="text-muted-foreground leading-relaxed">
                {sitter.bio || 'This sitter hasn\'t added a bio yet.'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Photo Gallery */}
        {photos.length > 0 && (
          <div className="px-6 pb-6">
            <h2 className="text-lg font-semibold mb-3">Gallery</h2>
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex gap-3">
                {photos.map((photo, index) => (
                  <div 
                    key={index} 
                    className="w-40 h-40 flex-shrink-0 rounded-xl overflow-hidden"
                  >
                    <img
                      src={photo.photo_url}
                      alt={`Gallery ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        )}

        {/* My Pack (Sitter's own pets) */}
        {sitterPets.length > 0 && (
          <div className="px-6 pb-6">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              My Pack
            </h2>
            <p className="text-sm text-muted-foreground mb-3">
              Meet my own fur babies! I'm a pet parent too.
            </p>
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex gap-3">
                {sitterPets.map((pet) => (
                  <Card key={pet.id} className="w-28 flex-shrink-0 rounded-xl overflow-hidden">
                    <div className="aspect-square">
                      {pet.profile_photo_url ? (
                        <img
                          src={pet.profile_photo_url}
                          alt={pet.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <PawPrint className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-2 text-center">
                      <p className="font-medium text-sm truncate">{pet.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{pet.breed}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        )}

        {/* Reviews */}
        <div className="px-6 pb-6">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400" />
            What Owners Say
          </h2>
          <div className="space-y-3">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <Card key={review.id} className="rounded-xl">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {review.reviewer_name?.charAt(0) || 'P'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">{review.reviewer_name}</span>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${
                                  i < review.rating 
                                    ? 'fill-yellow-400 text-yellow-400' 
                                    : 'text-muted'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {review.comment || 'Great experience!'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {format(new Date(review.created_at), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="rounded-xl">
                <CardContent className="p-6 text-center">
                  <Star className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="font-medium text-muted-foreground">No reviews yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Be the first to book and leave a review!
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Spacer for sticky CTA */}
        <div className="h-24" />

        {/* Sticky CTA */}
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t p-4 safe-area-pb">
          <div className="max-w-2xl mx-auto flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={handleContactSitter}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Message
            </Button>
            <Button 
              className="flex-1 bg-primary hover:bg-primary/90"
              onClick={handleContactSitter}
            >
              Book Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
