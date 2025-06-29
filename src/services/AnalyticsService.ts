
import mixpanel from 'mixpanel-browser';

export type AnalyticsEvent = 
  | 'User Logged In'
  | 'User Logged Out' 
  | 'Pet Profile Created'
  | 'Pet Profile Updated'
  | 'Pet Profile Viewed'
  | 'Adventure Logged'
  | 'Adventure Created'
  | 'Friend Request Sent'
  | 'Friend Request Accepted'
  | 'Playdate Requested'
  | 'Event Created'
  | 'Deal Claimed'
  | 'Deal Viewed'
  | 'Ready to Play Toggled'
  | 'Feature Accessed'
  | 'Page Viewed';

export interface EventProperties {
  'User Logged In': { user_id: string; email?: string };
  'User Logged Out': {};
  'Pet Profile Created': { pet_breed: string; pet_age?: number; pet_gender: string; has_profile_photo: boolean; personality_traits_count: number };
  'Pet Profile Updated': { pet_id: string; changes?: string[] };
  'Pet Profile Viewed': { pet_id: string; viewer_id?: string; pet_breed?: string; is_own_pet?: boolean };
  'Adventure Logged': { pet_id: string; adventure_type?: string };
  'Adventure Created': { pet_id: string; photo_count: number; has_description: boolean; tagged_pets_count?: number };
  'Friend Request Sent': { requester_pet_id: string; recipient_pet_id: string };
  'Friend Request Accepted': { requester_pet_id: string; recipient_pet_id: string };
  'Playdate Requested': { requester_pet_id: string; recipient_pet_id: string; event_type?: string };
  'Event Created': { event_type: string; location?: string };
  'Deal Claimed': { deal_id: string; business_id: string };
  'Deal Viewed': { deal_id: string; business_name?: string; deal_category?: string; discount_type?: string; discount_value?: number };
  'Ready to Play Toggled': { pet_id: string; is_available: boolean };
  'Feature Accessed': { feature_name: string; source?: string };
  'Page Viewed': { page_name: string; path?: string };
}

class AnalyticsService {
  private initialized = false;
  private available = false;

  init(): void {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        console.log('Analytics: Not in browser environment, skipping initialization');
        return;
      }

      // For now, we'll disable Mixpanel initialization to prevent errors
      // Users can enable this later when they have a proper Mixpanel token
      console.log('Analytics: Service ready (tracking disabled for development)');
      this.initialized = true;
      this.available = false; // Disabled for now
    } catch (error) {
      console.warn('Analytics initialization failed:', error);
      this.initialized = true;
      this.available = false;
    }
  }

  trackEvent<T extends AnalyticsEvent>(
    eventName: T, 
    properties?: T extends keyof EventProperties ? EventProperties[T] : Record<string, any>
  ): void {
    if (!this.available) {
      console.log('Analytics Event (disabled):', eventName, properties);
      return;
    }

    try {
      mixpanel.track(eventName, {
        ...properties,
        timestamp: new Date().toISOString(),
        source: 'social_petwork'
      });
    } catch (error) {
      console.warn('Analytics tracking failed:', error);
    }
  }

  trackPageView(pageName: string, path?: string): void {
    this.trackEvent('Page Viewed', { page_name: pageName, path });
  }

  identifyUser(userId: string, properties?: Record<string, any>): void {
    if (!this.available) {
      console.log('Analytics Identify (disabled):', userId, properties);
      return;
    }

    try {
      mixpanel.identify(userId);
      if (properties) {
        mixpanel.people.set(properties);
      }
    } catch (error) {
      console.warn('Analytics identification failed:', error);
    }
  }

  setUserProperties(properties: Record<string, any>): void {
    if (!this.available) {
      console.log('Analytics User Properties (disabled):', properties);
      return;
    }

    try {
      mixpanel.people.set(properties);
    } catch (error) {
      console.warn('Analytics user properties update failed:', error);
    }
  }

  reset(): void {
    if (!this.available) {
      console.log('Analytics Reset (disabled)');
      return;
    }

    try {
      mixpanel.reset();
    } catch (error) {
      console.warn('Analytics reset failed:', error);
    }
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  isAvailable(): boolean {
    return this.available;
  }
}

// Export singleton instance
const analyticsService = new AnalyticsService();
export default analyticsService;
