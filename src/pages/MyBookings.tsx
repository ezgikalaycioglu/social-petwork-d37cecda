import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, Check, X, Star, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Booking {
  id: string;
  start_date: string;
  end_date: string;
  total_price: number;
  status: string;
  special_instructions?: string;
  created_at: string;
  sitter_id: string;
  owner_id: string;
  
  // Currency from sitter profile
  currency?: string;
  
  // For bookings as owner - sitter's user_id for chat
  sitter_user_id?: string;
  sitter_display_name?: string;
  sitter_phone_number?: string;
  sitter_photos?: {
    photo_url: string;
    is_primary: boolean;
  }[];
  
  // For bookings as sitter
  owner_display_name?: string;
  owner_phone_number?: string;
  
  // Pet info
  pet_profiles: {
    name: string;
    profile_photo_url?: string;
  } | null;
}

interface BookingCardProps {
  booking: Booking;
  userRole: 'owner' | 'sitter';
  onStatusUpdate: (bookingId: string, status: string) => void;
  onReview: (bookingId: string) => void;
  onOpenChat: (booking: Booking) => void;
  cancellingId: string | null;
}

// Format price with correct currency symbol
const formatPrice = (amount: number, currency: string = 'USD') => {
  const currencySymbols: Record<string, string> = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'SEK': 'kr',
    'NOK': 'kr',
    'DKK': 'kr',
    'CAD': 'C$',
    'AUD': 'A$',
  };
  
  const symbol = currencySymbols[currency] || currency;
  
  // For Nordic currencies, symbol comes after the number
  if (['SEK', 'NOK', 'DKK'].includes(currency)) {
    return `${amount} ${symbol}`;
  }
  return `${symbol}${amount}`;
};

function BookingCard({ booking, userRole, onStatusUpdate, onReview, onOpenChat, cancellingId }: BookingCardProps) {
  const otherPersonName = userRole === 'owner' 
    ? booking.sitter_display_name || 'Sitter'
    : booking.owner_display_name || 'Pet Owner';
  
  const otherPersonPhone = userRole === 'owner'
    ? booking.sitter_phone_number
    : booking.owner_phone_number;

  const otherPersonPhoto = userRole === 'owner'
    ? booking.sitter_photos?.find(p => p.is_primary)?.photo_url || booking.sitter_photos?.[0]?.photo_url
    : undefined;

  const petName = booking.pet_profiles?.name || 'Pet';
  const petPhoto = booking.pet_profiles?.profile_photo_url;
  
  const isBookingConfirmed = booking.status === 'accepted' || booking.status === 'confirmed';
  const isCancelling = cancellingId === booking.id;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'accepted': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'declined': return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'accepted': return 'Accepted';
      case 'completed': return 'Completed';
      case 'declined': return 'Declined';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  return (
    <Card 
      className="rounded-2xl shadow-sm border cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onOpenChat(booking)}
    >
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          {/* Profile Picture */}
          <Avatar className="w-12 h-12">
            <AvatarImage src={otherPersonPhoto} alt={otherPersonName} />
            <AvatarFallback>{otherPersonName.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>

          <div className="flex-1">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold">{otherPersonName}</h3>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Avatar className="w-5 h-5">
                    <AvatarImage src={petPhoto} alt={petName} />
                    <AvatarFallback className="text-xs">{petName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span>with {petName}</span>
                </div>
              </div>
              <Badge className={getStatusColor(booking.status)}>
                {getStatusText(booking.status)}
              </Badge>
            </div>

            {/* Dates and Price */}
            <div className="mb-4">
              <p className="text-sm font-medium">
                {format(new Date(booking.start_date), 'MMM d')} - {format(new Date(booking.end_date), 'MMM d, yyyy')}
              </p>
              <p className="text-lg font-bold text-primary">{formatPrice(booking.total_price, booking.currency)}</p>
              
              {/* Phone Number - Only visible when booking is confirmed */}
              {isBookingConfirmed && otherPersonPhone && (
                <div className="mt-2 p-2 bg-teal-50 rounded-lg border border-teal-200">
                  <p className="text-sm text-gray-600">Contact Phone:</p>
                  <p className="text-base font-semibold text-teal-600">{otherPersonPhone}</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
              {booking.status === 'pending' && userRole === 'sitter' && (
                <>
                  <Button
                    size="sm"
                    onClick={() => onStatusUpdate(booking.id, 'accepted')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onStatusUpdate(booking.id, 'declined')}
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Decline
                  </Button>
                </>
              )}

              {/* Cancel button for owners on pending/accepted bookings */}
              {(booking.status === 'pending' || booking.status === 'accepted') && userRole === 'owner' && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-300 text-red-600 hover:bg-red-50"
                      disabled={isCancelling}
                    >
                      {isCancelling ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <X className="w-4 h-4 mr-1" />
                          Cancel
                        </>
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Cancel Booking Request?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to cancel this booking request? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => onStatusUpdate(booking.id, 'cancelled')}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Yes, Cancel
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}

              {booking.status === 'accepted' && (
                <Button size="sm" variant="outline" onClick={() => onOpenChat(booking)}>
                  <MessageCircle className="w-4 h-4 mr-1" />
                  Message
                </Button>
              )}

              {booking.status === 'completed' && userRole === 'owner' && (
                <Button
                  size="sm"
                  onClick={() => onReview(booking.id)}
                  className="bg-yellow-500 hover:bg-yellow-600"
                >
                  <Star className="w-4 h-4 mr-1" />
                  Leave Review
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function MyBookings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [ownerBookings, setOwnerBookings] = useState<Booking[]>([]);
  const [sitterBookings, setSitterBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    if (!user) return;

    try {
      // Fetch bookings as owner
      const { data: ownerData, error: ownerError } = await supabase
        .from('sitter_bookings')
        .select(`
          *,
          pet_profiles!fk_sitter_bookings_pet_profiles(name, profile_photo_url)
        `)
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (ownerError) throw ownerError;

      // Get sitter profiles for owner bookings
      let enrichedOwnerData: Booking[] = [];
      if (ownerData && ownerData.length > 0) {
        const sitterIds = [...new Set(ownerData.map(booking => booking.sitter_id))];
        
        // Note: sitter_id in bookings refers to sitter_profiles.id, not user_id
        // We need to get the sitter profile to find the user_id and currency
        const { data: sitterProfilesData } = await supabase
          .from('sitter_profiles')
          .select('id, user_id, currency')
          .in('id', sitterIds);

        // Get user profiles using the user_ids from sitter_profiles
        const sitterUserIds = sitterProfilesData?.map(sp => sp.user_id) || [];
        const { data: sitterUserProfiles } = await supabase
          .from('user_profiles')
          .select('id, display_name, phone_number')
          .in('id', sitterUserIds);

        const { data: sitterPhotos } = await supabase
          .from('sitter_profiles')
          .select(`
            id,
            user_id,
            sitter_photos(photo_url, is_primary)
          `)
          .in('id', sitterIds);

        enrichedOwnerData = ownerData.map(booking => {
          const sitterProfileData = sitterProfilesData?.find(sp => sp.id === booking.sitter_id);
          const sitterUserProfile = sitterUserProfiles?.find(p => p.id === sitterProfileData?.user_id);
          const sitterPhotoData = sitterPhotos?.find(sp => sp.id === booking.sitter_id);
          return {
            ...booking,
            sitter_user_id: sitterProfileData?.user_id,
            currency: sitterProfileData?.currency || 'USD',
            sitter_display_name: sitterUserProfile?.display_name,
            sitter_phone_number: sitterUserProfile?.phone_number,
            sitter_photos: sitterPhotoData?.sitter_photos || []
          };
        });
      }

      setOwnerBookings(enrichedOwnerData);

      // Fetch bookings as sitter
      const { data: sitterData, error: sitterError } = await supabase
        .from('sitter_bookings')
        .select(`
          *,
          pet_profiles!fk_sitter_bookings_pet_profiles(name, profile_photo_url)
        `)
        .eq('sitter_id', user.id)
        .order('created_at', { ascending: false });

      if (sitterError) throw sitterError;

      // Get owner profiles for sitter bookings
      let enrichedSitterData: Booking[] = [];
      if (sitterData && sitterData.length > 0) {
        const ownerIds = [...new Set(sitterData.map(booking => booking.owner_id))];
        const { data: ownerProfiles } = await supabase
          .from('user_profiles')
          .select('id, display_name, phone_number')
          .in('id', ownerIds);

        // Get the sitter's own currency for display
        const { data: ownSitterProfile } = await supabase
          .from('sitter_profiles')
          .select('id, currency')
          .eq('user_id', user.id)
          .single();

        enrichedSitterData = sitterData.map(booking => {
          const ownerProfile = ownerProfiles?.find(p => p.id === booking.owner_id);
          return {
            ...booking,
            currency: ownSitterProfile?.currency || 'USD',
            owner_display_name: ownerProfile?.display_name,
            owner_phone_number: ownerProfile?.phone_number
          };
        });
      }

      setSitterBookings(enrichedSitterData);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast({
        title: "Error",
        description: "Failed to load bookings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId: string, status: string) => {
    if (status === 'cancelled') {
      setCancellingId(bookingId);
    }
    
    try {
      const { error } = await supabase
        .from('sitter_bookings')
        .update({ status })
        .eq('id', bookingId);

      if (error) throw error;

      toast({
        title: status === 'cancelled' ? "Booking Cancelled" : "Booking Updated",
        description: status === 'cancelled' 
          ? "Your booking request has been cancelled."
          : `Booking has been ${status}`,
      });

      fetchBookings(); // Refresh the data
    } catch (error) {
      console.error('Error updating booking:', error);
      toast({
        title: "Error",
        description: "Failed to update booking",
        variant: "destructive",
      });
    } finally {
      setCancellingId(null);
    }
  };

  const handleReview = (bookingId: string) => {
    // Navigate to review form or open review modal
    navigate(`/review/${bookingId}`);
  };

  const handleOpenChat = async (booking: Booking) => {
    if (!user) return;
    
    try {
      // Determine the other user ID based on role
      const otherUserId = booking.owner_id === user.id 
        ? booking.sitter_user_id  // When I'm the owner, chat with sitter
        : booking.owner_id;       // When I'm the sitter, chat with owner
      
      if (!otherUserId) {
        toast({
          title: "Error",
          description: "Could not find the other user for this booking.",
          variant: "destructive",
        });
        return;
      }
      
      // Find or create conversation
      const { data: conversationId, error } = await supabase
        .rpc('find_or_create_conversation', {
          user_a: user.id,
          user_b: otherUserId,
          linked_booking_id: booking.id
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-teal/5 flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="mb-4">Please sign in to view your bookings.</p>
          <Button onClick={() => navigate('/auth')}>Sign In</Button>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-teal/5 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-teal/5">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center text-primary">
              My Bookings
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <Tabs defaultValue="owner" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="owner">My Requests as Owner</TabsTrigger>
                <TabsTrigger value="sitter">My Jobs as Sitter</TabsTrigger>
              </TabsList>

              <TabsContent value="owner" className="space-y-4">
                {ownerBookings.filter(b => b.status !== 'cancelled').length > 0 ? (
                  ownerBookings
                    .filter(b => b.status !== 'cancelled')
                    .map((booking) => (
                      <BookingCard
                        key={booking.id}
                        booking={booking}
                        userRole="owner"
                        onStatusUpdate={handleStatusUpdate}
                        onReview={handleReview}
                        onOpenChat={handleOpenChat}
                        cancellingId={cancellingId}
                      />
                    ))
                ) : (
                  <div className="text-center py-12">
                    <p className="text-lg text-muted-foreground mb-4">
                      No booking requests yet
                    </p>
                    <Button onClick={() => navigate('/find-sitter')}>
                      Find a Sitter
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="sitter" className="space-y-4">
                {sitterBookings.length > 0 ? (
                  sitterBookings.map((booking) => (
                    <BookingCard
                      key={booking.id}
                      booking={booking}
                      userRole="sitter"
                      onStatusUpdate={handleStatusUpdate}
                      onReview={handleReview}
                      onOpenChat={handleOpenChat}
                      cancellingId={cancellingId}
                    />
                  ))
                ) : (
                  <div className="text-center py-12">
                    <p className="text-lg text-muted-foreground mb-4">
                      No sitting jobs yet
                    </p>
                    <Button onClick={() => navigate('/become-sitter')}>
                      Become a Sitter
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}