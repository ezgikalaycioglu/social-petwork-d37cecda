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
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, Star, MapPin, CalendarIcon, MessageCircle, AlertCircle } from "lucide-react";
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
  currency: string;
  display_name?: string;
  profile_photo_url?: string | null;
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
    <div className="py-3 border-b last:border-0 last:pb-0 first:pt-0">
      <div className="flex items-start gap-3">
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarFallback className="text-xs bg-primary/10 text-primary">
            {reviewerName.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-medium text-sm truncate">{reviewerName}</span>
              <span className="text-xs text-muted-foreground">with {petName}</span>
            </div>
            <div className="flex items-center gap-0.5 flex-shrink-0">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted'
                  }`}
                />
              ))}
            </div>
          </div>
          {review.comment && (
            <p className="text-sm text-muted-foreground">{review.comment}</p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            {format(new Date(review.created_at), 'MMM d, yyyy')}
          </p>
        </div>
      </div>
    </div>
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
  const [messageToSitter, setMessageToSitter] = useState("");

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
      // Get pet name for the message
      const selectedPetData = userPets.find(p => p.id === selectedPet);
      const petName = selectedPetData?.name || 'my pet';
      const startDateStr = format(dateRange.from, 'MMM d, yyyy');
      const endDateStr = format(dateRange.to, 'MMM d, yyyy');
      
      // Build the initial message
      let initialMessage = `Hi! I'd like to book pet sitting from ${startDateStr} to ${endDateStr} for ${petName}.`;
      if (messageToSitter.trim()) {
        initialMessage += `\n\n${messageToSitter.trim()}`;
      }

      // Create the booking
      const { data: booking, error: bookingError } = await supabase
        .from('sitter_bookings')
        .insert({
          sitter_id: sitter.id,
          owner_id: user.id,
          pet_id: selectedPet,
          start_date: format(dateRange.from, 'yyyy-MM-dd'),
          end_date: format(dateRange.to, 'yyyy-MM-dd'),
          total_price: calculateTotal(),
          status: 'pending',
          initial_message: initialMessage
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Create or find conversation using the database function
      const { data: conversationId, error: convError } = await supabase
        .rpc('find_or_create_conversation', {
          user_a: user.id,
          user_b: sitter.user_id,
          linked_booking_id: booking.id
        });

      if (convError) throw convError;

      // Send the initial message
      const { error: msgError } = await supabase
        .from('sitter_messages')
        .insert({
          conversation_id: conversationId,
          sender_user_id: user.id,
          body: initialMessage
        });

      if (msgError) throw msgError;

      toast({
        title: "Booking Request Sent!",
        description: "Your booking request has been sent to the sitter. You can continue the conversation in messages.",
      });

      // Navigate to the chat
      navigate(`/messages/${conversationId}`);
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

  const handleOpenChat = async () => {
    if (!user || !sitter) {
      navigate('/auth');
      return;
    }

    try {
      // Find or create conversation
      const { data: conversationId, error } = await supabase
        .rpc('find_or_create_conversation', {
          user_a: user.id,
          user_b: sitter.user_id,
          linked_booking_id: null
        });

      if (error) throw error;

      navigate(`/messages/${conversationId}`);
    } catch (error) {
      console.error('Error opening chat:', error);
      toast({
        title: "Error",
        description: "Failed to open chat. Please try again.",
        variant: "destructive",
      });
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
  const primaryPhoto = sitter.profile_photo_url || 
                       sitter.sitter_photos.find(p => p.is_primary)?.photo_url || 
                       sitter.sitter_photos[0]?.photo_url;
  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : null;
  const hasReviews = reviews.length > 0;

  const getCurrencySymbol = (currency: string) => {
    const symbols: Record<string, string> = {
      'USD': '$', 'EUR': '€', 'GBP': '£', 'SEK': 'kr', 'TRY': '₺'
    };
    return symbols[currency] || currency;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-4 sm:py-6">
        {/* Back button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/find-sitter')}
          className="mb-4 -ml-2 text-muted-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to Search
        </Button>

        {/* Mobile: Stack, Desktop: Side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-4">
            
            {/* Profile Header Card */}
            <Card className="rounded-xl border-0 shadow-sm">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-start gap-4">
                  <Avatar className="w-16 h-16 sm:w-20 sm:h-20 border-2 border-background shadow-md flex-shrink-0">
                    <AvatarImage src={primaryPhoto} alt={displayName} />
                    <AvatarFallback className="text-lg sm:text-xl bg-primary/10 text-primary">
                      {displayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h1 className="text-lg sm:text-xl font-bold truncate">{displayName}</h1>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{sitter.location || 'Location not set'}</span>
                    </div>
                    {hasReviews ? (
                      <div className="flex items-center gap-1.5 mt-2">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold text-sm">{averageRating?.toFixed(1)}</span>
                        <span className="text-xs text-muted-foreground">({reviews.length} reviews)</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 mt-2 text-muted-foreground">
                        <Star className="w-4 h-4" />
                        <span className="text-sm">New sitter</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Photo Gallery - only show if photos exist */}
            {sitter.sitter_photos.length > 0 && (
              <Card className="rounded-xl border-0 shadow-sm">
                <CardContent className="p-3 sm:p-4">
                  <div className="grid grid-cols-3 gap-2">
                    {sitter.sitter_photos.slice(0, 6).map((photo, index) => (
                      <div
                        key={index}
                        className={`aspect-square rounded-lg overflow-hidden ${
                          index === 0 && sitter.sitter_photos.length > 1 ? 'col-span-2 row-span-2' : ''
                        }`}
                      >
                        <img
                          src={photo.photo_url}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* About Me */}
            {sitter.bio && (
              <Card className="rounded-xl border-0 shadow-sm">
                <CardContent className="p-4 sm:p-5">
                  <h2 className="font-semibold text-base mb-2">About Me</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">{sitter.bio}</p>
                </CardContent>
              </Card>
            )}

            {/* Reviews */}
            <Card className="rounded-xl border-0 shadow-sm">
              <CardContent className="p-4 sm:p-5">
                <h2 className="font-semibold text-base mb-3">Reviews ({reviews.length})</h2>
                <div className="space-y-3">
                  {reviews.length > 0 ? (
                    reviews.map((review) => (
                      <ReviewCard key={review.id} review={review} />
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No reviews yet. Be the first to book!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Panel - Sidebar on desktop, bottom on mobile */}
          <div className="lg:col-span-2">
            <Card className="rounded-xl border-0 shadow-sm lg:sticky lg:top-4">
              <CardContent className="p-4 sm:p-5 space-y-4">
                {/* Services & Rates */}
                <div>
                  <h3 className="font-semibold text-sm mb-2">Services & Rates</h3>
                  <div className="space-y-1.5">
                    {sitter.sitter_services.length > 0 ? (
                      sitter.sitter_services.map((service, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">{service.service_type}</span>
                          <span className="font-medium">{getCurrencySymbol(sitter.currency)}{sitter.rate_per_day}/day</span>
                        </div>
                      ))
                    ) : (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Pet Sitting</span>
                        <span className="font-medium">{getCurrencySymbol(sitter.currency)}{sitter.rate_per_day}/day</span>
                      </div>
                    )}
                  </div>
                </div>

                {user && (
                  <>
                    {/* Important Notice */}
                    <Alert className="bg-amber-50 border-amber-200">
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                      <AlertTitle className="text-amber-800 text-sm">Important Notice</AlertTitle>
                      <AlertDescription className="text-amber-700 text-xs">
                        PawCult only facilitates connections between pet owners and pet sitters. Payments are handled directly between users. If a booking is accepted, communication happens via in-app messaging. PawCult is not responsible for agreements, payments, or outcomes.
                      </AlertDescription>
                    </Alert>

                    {/* Booking Form */}
                    <div className="space-y-3 border-t pt-4">
                      <h3 className="font-semibold text-sm">Book This Sitter</h3>
                      
                      <div className="space-y-1.5">
                        <Label className="text-xs">Select Your Pet</Label>
                        <Select value={selectedPet} onValueChange={setSelectedPet}>
                          <SelectTrigger className="h-10">
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

                      <div className="space-y-1.5">
                        <Label className="text-xs">Select Dates</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full h-10 justify-start text-left font-normal",
                                !dateRange?.from && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {dateRange?.from ? (
                                dateRange?.to ? (
                                  <>
                                    {format(dateRange.from, "LLL dd")} - {format(dateRange.to, "LLL dd")}
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

                      <div className="space-y-1.5">
                        <Label className="text-xs">Message to Sitter (optional)</Label>
                        <Textarea
                          value={messageToSitter}
                          onChange={(e) => setMessageToSitter(e.target.value)}
                          placeholder="Hi! I'd like to book your services. My pet is friendly and..."
                          rows={3}
                          className="text-sm"
                        />
                      </div>

                      {dateRange?.from && dateRange?.to && (
                        <div className="bg-muted/50 p-2.5 rounded-lg">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              {differenceInDays(dateRange.to!, dateRange.from!) + 1} days
                            </span>
                            <span className="font-semibold">{getCurrencySymbol(sitter.currency)}{calculateTotal()}</span>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 pt-1">
                        <Button
                          onClick={handleBookingRequest}
                          disabled={!selectedPet || !dateRange?.from || !dateRange?.to || submitting}
                          className="flex-1 h-10 bg-coral hover:bg-coral/90"
                        >
                          {submitting ? "Sending..." : "Request Booking"}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-10 w-10 flex-shrink-0"
                          onClick={handleOpenChat}
                        >
                          <MessageCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                )}

                {!user && (
                  <div className="text-center pt-3 border-t">
                    <p className="text-xs text-muted-foreground mb-3">
                      Sign in to book this sitter
                    </p>
                    <Button onClick={() => navigate('/auth')} className="w-full h-10">
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