import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ArrowLeft, Star, MapPin, CalendarIcon, MessageCircle } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";

interface SitterData {
  id: string;
  user_id: string;
  bio: string;
  location: string;
  rate_per_day: number;
  display_name?: string;
  sitter_services: {
    service_type: string;
  }[];
  sitter_photos: {
    photo_url: string;
    is_primary: boolean;
  }[];
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  reviewer_name?: string;
  pet_name?: string;
}

interface Pet {
  id: string;
  name: string;
}

function ReviewCard({ review }: { review: Review }) {
  const reviewerName = review.reviewer_name || 'Anonymous';
  const petName = review.pet_name || 'Pet';

  return (
    <Card className="rounded-xl">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <Avatar className="w-10 h-10">
            <AvatarFallback>{reviewerName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className="font-medium text-sm">{reviewerName}</span>
              <span className="text-xs text-muted-foreground">with {petName}</span>
            </div>
            <div className="flex items-center space-x-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">{review.comment}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {format(new Date(review.created_at), 'MMM d, yyyy')}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SitterProfile() {
  const { sitterId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [sitter, setSitter] = useState<SitterData | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userPets, setUserPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Booking form state
  const [selectedPet, setSelectedPet] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  useEffect(() => {
    if (sitterId) {
      fetchSitterData();
      fetchReviews();
      if (user) {
        fetchUserPets();
      }
    }
  }, [sitterId, user]);

  const fetchSitterData = async () => {
    try {
      const { data, error } = await supabase
        .from('sitter_profiles')
        .select(`
          *,
          sitter_services(service_type),
          sitter_photos(photo_url, is_primary)
        `)
        .eq('id', sitterId)
        .eq('is_active', true)
        .single();

      if (error) throw error;

      // Get user profile separately
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('display_name, email')
        .eq('id', data.user_id)
        .single();

      const displayName = userProfile?.display_name && userProfile.display_name.trim() 
        ? userProfile.display_name 
        : userProfile?.email?.split('@')[0] || 'Pet Sitter';

      const enrichedSitter = {
        ...data,
        display_name: displayName
      };

      setSitter(enrichedSitter);
    } catch (error) {
      console.error('Error fetching sitter:', error);
      toast({
        title: "Error",
        description: "Sitter not found",
        variant: "destructive",
      });
      navigate('/find-sitter');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const { data: reviewsData, error } = await supabase
        .from('sitter_reviews')
        .select(`
          *,
          sitter_bookings(
            pet_id,
            owner_id
          )
        `)
        .eq('sitter_id', sitterId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get user profiles and pet names separately
      if (reviewsData && reviewsData.length > 0) {
        const ownerIds = reviewsData.map(review => review.owner_id);
        const petIds = reviewsData.map(review => review.sitter_bookings?.pet_id).filter(Boolean);

        const { data: ownerProfiles } = await supabase
          .from('user_profiles')
          .select('id, display_name')
          .in('id', ownerIds);

        const { data: petProfiles } = await supabase
          .from('pet_profiles')
          .select('id, name')
          .in('id', petIds);

        const enrichedReviews = reviewsData.map(review => ({
          ...review,
          reviewer_name: ownerProfiles?.find(p => p.id === review.owner_id)?.display_name,
          pet_name: petProfiles?.find(p => p.id === review.sitter_bookings?.pet_id)?.name
        }));

        setReviews(enrichedReviews);
      } else {
        setReviews([]);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const fetchUserPets = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('pet_profiles')
        .select('id, name')
        .eq('user_id', user.id);

      if (error) throw error;
      setUserPets(data || []);
    } catch (error) {
      console.error('Error fetching user pets:', error);
    }
  };

  const calculateTotal = () => {
    if (!dateRange?.from || !dateRange?.to || !sitter) return 0;
    const days = differenceInDays(dateRange.to, dateRange.from) + 1;
    return days * sitter.rate_per_day;
  };

  const handleBookingRequest = async () => {
    if (!user || !sitter || !selectedPet || !dateRange?.from || !dateRange?.to) {
      toast({
        title: "Missing Information",
        description: "Please select a pet and dates for your booking.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('sitter_bookings')
        .insert({
          sitter_id: sitter.id,
          owner_id: user.id,
          pet_id: selectedPet,
          start_date: format(dateRange.from, 'yyyy-MM-dd'),
          end_date: format(dateRange.to, 'yyyy-MM-dd'),
          total_price: calculateTotal(),
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Booking Request Sent!",
        description: "Your booking request has been sent to the sitter.",
      });

      navigate('/my-bookings');
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: "Error",
        description: "Failed to send booking request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-teal/5 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!sitter) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-teal/5 flex items-center justify-center">
        <p>Sitter not found</p>
      </div>
    );
  }

  const displayName = sitter.display_name || 'Sitter';
  const primaryPhoto = sitter.sitter_photos.find(p => p.is_primary)?.photo_url || 
                       sitter.sitter_photos[0]?.photo_url;
  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 5.0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-teal/5">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/find-sitter')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Search
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Photo Gallery */}
            <Card className="rounded-2xl shadow-lg">
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {sitter.sitter_photos.map((photo, index) => (
                    <div
                      key={index}
                      className={`aspect-square rounded-xl overflow-hidden ${
                        index === 0 ? 'md:col-span-2 md:row-span-2' : ''
                      }`}
                    >
                      <img
                        src={photo.photo_url}
                        alt={`Sitter photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* About Me */}
            <Card className="rounded-2xl shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">About Me</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{sitter.bio}</p>
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card className="rounded-2xl shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">Reviews ({reviews.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No reviews yet. Be the first to book!
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Action Panel */}
          <div className="lg:col-span-1">
            <Card className="rounded-2xl shadow-lg sticky top-8">
              <CardContent className="p-6 space-y-6">
                {/* Sitter Info */}
                <div className="text-center">
                  <Avatar className="w-20 h-20 mx-auto mb-4">
                    <AvatarImage src={primaryPhoto} alt={displayName} />
                    <AvatarFallback className="text-xl">
                      {displayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-bold">{displayName}</h2>
                  <div className="flex items-center justify-center space-x-1 mt-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{sitter.location}</span>
                  </div>
                  <div className="flex items-center justify-center space-x-1 mt-2">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{averageRating.toFixed(1)}</span>
                    <span className="text-muted-foreground">({reviews.length} reviews)</span>
                  </div>
                </div>

                {/* Services & Prices */}
                <div>
                  <h3 className="font-semibold mb-3">Services & Rates</h3>
                  <div className="space-y-2">
                    {sitter.sitter_services.map((service, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm">{service.service_type}</span>
                        <span className="font-medium">${sitter.rate_per_day}/day</span>
                      </div>
                    ))}
                  </div>
                </div>

                {user && (
                  <>
                    {/* Booking Form */}
                    <div className="space-y-4 border-t pt-6">
                      <h3 className="font-semibold">Book This Sitter</h3>
                      
                      <div className="space-y-2">
                        <Label>Select Your Pet</Label>
                        <Select value={selectedPet} onValueChange={setSelectedPet}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a pet" />
                          </SelectTrigger>
                          <SelectContent>
                            {userPets.map((pet) => (
                              <SelectItem key={pet.id} value={pet.id}>
                                {pet.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Select Dates</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !dateRange?.from && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {dateRange?.from ? (
                                dateRange?.to ? (
                                  <>
                                    {format(dateRange.from, "LLL dd")} -{" "}
                                    {format(dateRange.to, "LLL dd")}
                                  </>
                                ) : (
                                  format(dateRange.from, "LLL dd, y")
                                )
                              ) : (
                                <span>Pick dates</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              initialFocus
                              mode="range"
                              defaultMonth={dateRange?.from}
                              selected={dateRange}
                              onSelect={setDateRange}
                              numberOfMonths={1}
                              className="pointer-events-auto"
                              disabled={(date) => date < new Date()}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      {dateRange?.from && dateRange?.to && (
                        <div className="bg-muted/50 p-3 rounded-lg">
                          <div className="flex justify-between text-sm">
                            <span>
                              {differenceInDays(dateRange.to!, dateRange.from!) + 1} days
                            </span>
                            <span className="font-medium">
                              ${calculateTotal()}
                            </span>
                          </div>
                        </div>
                      )}

                      <Button
                        onClick={handleBookingRequest}
                        disabled={!selectedPet || !dateRange?.from || !dateRange?.to || submitting}
                        className="w-full bg-coral hover:bg-coral/90"
                      >
                        {submitting ? "Sending..." : "Request to Book"}
                      </Button>
                    </div>

                    <Button variant="outline" className="w-full">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Contact Sitter
                    </Button>
                  </>
                )}

                {!user && (
                  <div className="text-center pt-6 border-t">
                    <p className="text-sm text-muted-foreground mb-4">
                      Sign in to book this sitter
                    </p>
                    <Button onClick={() => navigate('/auth')} className="w-full">
                      Sign In
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}