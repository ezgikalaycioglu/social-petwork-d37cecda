import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Star, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface BookingDetails {
  id: string;
  start_date: string;
  end_date: string;
  owner_id: string;
  sitter_id: string;
  status: string;
  pet: {
    name: string;
  };
  sitter: {
    id: string;
    name: string;
    user_id: string;
  };
}

const ReviewBooking = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [existingReview, setExistingReview] = useState<boolean>(false);

  useEffect(() => {
    if (!user || !bookingId) return;
    fetchBookingDetails();
    checkExistingReview();
  }, [user, bookingId]);

  const fetchBookingDetails = async () => {
    if (!bookingId) return;

    try {
      const { data, error } = await supabase
        .from('sitter_bookings')
        .select(`
          id,
          start_date,
          end_date,
          owner_id,
          sitter_id,
          status,
          pet_id
        `)
        .eq('id', bookingId)
        .single();

      if (error) throw error;

      // Fetch pet details
      const { data: pet } = await supabase
        .from('pet_profiles')
        .select('name')
        .eq('id', data.pet_id)
        .single();

      // Fetch sitter details
      const { data: sitter } = await supabase
        .from('sitter_profiles')
        .select('id, name, user_id')
        .eq('id', data.sitter_id)
        .single();

      setBooking({
        ...data,
        pet: pet || { name: 'Unknown Pet' },
        sitter: sitter || { id: data.sitter_id, name: 'Unknown Sitter', user_id: '' },
      });
    } catch (error) {
      console.error('Error fetching booking:', error);
      toast.error('Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  const checkExistingReview = async () => {
    if (!bookingId) return;

    const { data } = await supabase
      .from('sitter_reviews')
      .select('id')
      .eq('booking_id', bookingId)
      .single();

    if (data) {
      setExistingReview(true);
    }
  };

  const handleSubmitReview = async () => {
    if (!booking || !user || rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (booking.owner_id !== user.id) {
      toast.error('Only the pet owner can leave a review');
      return;
    }

    if (booking.status !== 'completed') {
      toast.error('You can only review completed bookings');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from('sitter_reviews').insert({
        booking_id: booking.id,
        sitter_id: booking.sitter.id,
        owner_id: user.id,
        rating,
        comment: reviewText.trim() || null,
      });

      if (error) throw error;

      toast.success('Review submitted successfully!');
      navigate('/pet-sitters');
    } catch (error: any) {
      console.error('Error submitting review:', error);
      toast.error(error.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="container max-w-lg mx-auto p-4">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Please log in to leave a review.</p>
          <Button onClick={() => navigate('/auth')} className="mt-4">
            Sign In
          </Button>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container max-w-lg mx-auto p-4 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="container max-w-lg mx-auto p-4">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Booking not found.</p>
          <Button onClick={() => navigate('/pet-sitters')} className="mt-4">
            Back to Pet Sitters
          </Button>
        </Card>
      </div>
    );
  }

  if (booking.owner_id !== user.id) {
    return (
      <div className="container max-w-lg mx-auto p-4">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Only the pet owner can leave a review.</p>
          <Button onClick={() => navigate('/pet-sitters')} className="mt-4">
            Back to Pet Sitters
          </Button>
        </Card>
      </div>
    );
  }

  if (booking.status !== 'completed') {
    return (
      <div className="container max-w-lg mx-auto p-4">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            You can only review completed bookings. Current status: {booking.status}
          </p>
          <Button onClick={() => navigate('/pet-sitters')} className="mt-4">
            Back to Pet Sitters
          </Button>
        </Card>
      </div>
    );
  }

  if (existingReview) {
    return (
      <div className="container max-w-lg mx-auto p-4">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">You have already reviewed this booking.</p>
          <Button onClick={() => navigate('/pet-sitters')} className="mt-4">
            Back to Pet Sitters
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-lg mx-auto p-4 pb-24">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-bold">Leave a Review</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Review for {booking.sitter.name || 'Pet Sitter'}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {booking.pet.name} • {format(new Date(booking.start_date), 'MMM d')} - {format(new Date(booking.end_date), 'MMM d, yyyy')}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Star Rating */}
          <div>
            <label className="text-sm font-medium mb-2 block">How would you rate this experience?</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`w-10 h-10 transition-colors ${
                      star <= (hoverRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                {rating === 1 && 'Poor'}
                {rating === 2 && 'Fair'}
                {rating === 3 && 'Good'}
                {rating === 4 && 'Very Good'}
                {rating === 5 && 'Excellent'}
              </p>
            )}
          </div>

          {/* Review Text */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Write a review (optional)
            </label>
            <Textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share your experience with this pet sitter..."
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {reviewText.length}/500 characters
            </p>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmitReview}
            disabled={rating === 0 || submitting}
            className="w-full"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Review'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReviewBooking;
