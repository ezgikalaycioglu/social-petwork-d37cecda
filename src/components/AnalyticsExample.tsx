
import React from 'react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const AnalyticsExample: React.FC = () => {
  const { trackEvent, trackPageView } = useAnalytics();

  const handlePetProfileViewed = () => {
    trackEvent('Pet Profile Viewed', {
      pet_id: 'example-pet-id',
      viewer_id: 'example-viewer-id',
      pet_breed: 'Golden Retriever',
      is_own_pet: false
    });
  };

  const handleAdventureCreated = () => {
    trackEvent('Adventure Created', {
      pet_id: 'example-pet-id',
      photo_count: 3,
      has_description: true,
      tagged_pets_count: 2
    });
  };

  const handlePlaydateRequested = () => {
    trackEvent('Playdate Requested', {
      requester_pet_id: 'requester-pet-id',
      recipient_pet_id: 'recipient-pet-id',
      event_type: 'walk'
    });
  };

  const handleDealViewed = () => {
    trackEvent('Deal Viewed', {
      deal_id: 'example-deal-id',
      business_name: 'Pet Store',
      deal_category: 'food',
      discount_type: 'percentage',
      discount_value: 20
    });
  };

  const handleReadyToPlayToggled = () => {
    trackEvent('Ready to Play Toggled', {
      pet_id: 'example-pet-id',
      is_available: true
    });
  };

  const handlePageView = () => {
    trackPageView('Analytics Example', '/analytics-example');
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Analytics Example</CardTitle>
        <CardDescription>
          Test analytics tracking with sample events
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Button onClick={handlePetProfileViewed} variant="outline">
            Track Pet Profile View
          </Button>
          
          <Button onClick={handleAdventureCreated} variant="outline">
            Track Adventure Created
          </Button>
          
          <Button onClick={handlePlaydateRequested} variant="outline">
            Track Playdate Request
          </Button>
          
          <Button onClick={handleDealViewed} variant="outline">
            Track Deal Viewed
          </Button>
          
          <Button onClick={handleReadyToPlayToggled} variant="outline">
            Track Ready to Play
          </Button>
          
          <Button onClick={handlePageView} variant="outline">
            Track Page View
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalyticsExample;
