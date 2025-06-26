
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAnalytics } from '@/hooks/useAnalytics';

/**
 * Example component demonstrating various analytics tracking patterns
 * This is for documentation purposes and shows how to integrate analytics
 */
const AnalyticsExample: React.FC = () => {
  const { trackEvent } = useAnalytics();

  const handlePetProfileView = (petId: string, breed: string, isOwnPet: boolean) => {
    trackEvent('Pet Profile Viewed', {
      pet_id: petId,
      pet_breed: breed,
      is_own_pet: isOwnPet,
    });
  };

  const handleAdventureCreated = (petId: string, photoCount: number, hasDescription: boolean) => {
    trackEvent('Adventure Created', {
      pet_id: petId,
      photo_count: photoCount,
      has_description: hasDescription,
      tagged_pets_count: 0,
    });
  };

  const handlePlaydateRequest = (requesterPetId: string, recipientPetId: string) => {
    trackEvent('Playdate Requested', {
      requester_pet_id: requesterPetId,
      recipient_pet_id: recipientPetId,
      event_type: 'playdate',
    });
  };

  const handleDealView = (dealId: string, businessName: string, category: string) => {
    trackEvent('Deal Viewed', {
      deal_id: dealId,
      business_name: businessName,
      deal_category: category,
      discount_type: 'percentage',
      discount_value: 20,
    });
  };

  const handleReadyToPlayToggle = (petId: string, isAvailable: boolean) => {
    trackEvent('Ready to Play Toggled', {
      pet_id: petId,
      is_available: isAvailable,
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Analytics Integration Examples</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            onClick={() => handlePetProfileView('pet-123', 'Golden Retriever', true)}
            variant="outline"
          >
            Track Pet Profile View
          </Button>

          <Button
            onClick={() => handleAdventureCreated('pet-123', 3, true)}
            variant="outline"
          >
            Track Adventure Created
          </Button>

          <Button
            onClick={() => handlePlaydateRequest('pet-123', 'pet-456')}
            variant="outline"
          >
            Track Playdate Request
          </Button>

          <Button
            onClick={() => handleDealView('deal-123', 'PetCo', 'food')}
            variant="outline"
          >
            Track Deal View
          </Button>

          <Button
            onClick={() => handleReadyToPlayToggle('pet-123', true)}
            variant="outline"
          >
            Track Ready to Play Toggle
          </Button>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold mb-2">Usage Instructions:</h4>
          <ul className="text-sm space-y-1 text-gray-600">
            <li>• Import useAnalytics hook in your components</li>
            <li>• Call trackEvent with type-safe event names and properties</li>
            <li>• Page views are tracked automatically in main pages</li>
            <li>• User identification happens automatically on login</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalyticsExample;
