
import mixpanel from 'mixpanel-browser';

/**
 * Type definitions for analytics events
 */
export type AnalyticsEvent = 
  // Authentication Events
  | 'User Signed Up'
  | 'User Logged In'
  | 'User Logged Out'
  // Pet Profile Events
  | 'Pet Profile Created'
  | 'Pet Profile Viewed'
  | 'Pet Profile Edited'
  // Adventure Events
  | 'Adventure Created'
  | 'Adventure Viewed'
  // Social Events
  | 'Playdate Requested'
  | 'Playdate Accepted'
  | 'Playdate Declined'
  | 'Ready to Play Toggled'
  | 'Friend Request Sent'
  | 'Friend Request Accepted'
  // Deals Events
  | 'Deal Viewed'
  | 'Deal Claimed'
  | 'Business Profile Viewed'
  // Navigation Events
  | 'Page Viewed'
  | 'Feature Accessed';

/**
 * Properties for specific events
 */
export interface EventProperties {
  'Pet Profile Created': {
    pet_breed: string;
    pet_age?: number;
    pet_gender?: string;
    has_profile_photo: boolean;
    personality_traits_count: number;
  };
  'Pet Profile Viewed': {
    pet_id: string;
    pet_breed: string;
    is_own_pet: boolean;
  };
  'Adventure Created': {
    pet_id: string;
    photo_count: number;
    has_description: boolean;
    tagged_pets_count: number;
  };
  'Playdate Requested': {
    requester_pet_id: string;
    recipient_pet_id: string;
    event_type: string;
  };
  'Playdate Accepted': {
    event_id: string;
    pet_id: string;
  };
  'Ready to Play Toggled': {
    pet_id: string;
    is_available: boolean;
  };
  'Deal Viewed': {
    deal_id: string;
    business_name: string;
    deal_category: string;
    discount_type: 'percentage' | 'amount';
    discount_value: number;
  };
  'Deal Claimed': {
    deal_id: string;
    business_name: string;
    deal_category: string;
    redemption_code: string;
  };
  'Page Viewed': {
    page_name: string;
    path: string;
  };
  // Generic fallback for events without specific properties
  [key: string]: Record<string, any>;
}

/**
 * User properties for identification
 */
export interface UserProperties {
  $email?: string;
  $name?: string;
  $created?: string;
  pet_count?: number;
  city?: string;
  neighborhood?: string;
  user_type?: 'pet_owner' | 'business';
}

/**
 * Centralized analytics service using Mixpanel
 * Provides type-safe event tracking and user identification
 */
class AnalyticsService {
  private initialized = false;
  private mixpanelToken: string | null = null;

  /**
   * Initialize the analytics service
   * Should be called once when the application starts
   */
  init(): void {
    // In a real app, you'd get this from environment variables
    // For now, we'll use a placeholder - you'll need to replace this with your actual token
    this.mixpanelToken = process.env.REACT_APP_MIXPANEL_TOKEN || 'YOUR_MIXPANEL_TOKEN';
    
    if (!this.mixpanelToken || this.mixpanelToken === 'YOUR_MIXPANEL_TOKEN') {
      console.warn('Mixpanel token not found. Analytics will not work properly.');
      return;
    }

    try {
      mixpanel.init(this.mixpanelToken, {
        debug: process.env.NODE_ENV === 'development',
        track_pageview: true,
        persistence: 'localStorage',
        batch_requests: true,
      });
      
      this.initialized = true;
      console.log('Analytics service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize analytics service:', error);
    }
  }

  /**
   * Identify a user and set their properties
   * Should be called after user authentication
   */
  identifyUser(userId: string, properties?: UserProperties): void {
    if (!this.initialized) {
      console.warn('Analytics service not initialized');
      return;
    }

    try {
      mixpanel.identify(userId);
      
      if (properties) {
        mixpanel.people.set(properties);
      }
      
      console.log('User identified:', userId);
    } catch (error) {
      console.error('Failed to identify user:', error);
    }
  }

  /**
   * Track an event with optional properties
   * Provides type safety for known events
   */
  trackEvent<T extends AnalyticsEvent>(
    eventName: T,
    properties?: T extends keyof EventProperties ? EventProperties[T] : Record<string, any>
  ): void {
    if (!this.initialized) {
      console.warn('Analytics service not initialized');
      return;
    }

    try {
      const eventProperties = {
        ...properties,
        timestamp: new Date().toISOString(),
        source: 'web_app',
      };

      mixpanel.track(eventName, eventProperties);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Event tracked:', eventName, eventProperties);
      }
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }

  /**
   * Set user properties without tracking an event
   */
  setUserProperties(properties: UserProperties): void {
    if (!this.initialized) {
      console.warn('Analytics service not initialized');
      return;
    }

    try {
      mixpanel.people.set(properties);
    } catch (error) {
      console.error('Failed to set user properties:', error);
    }
  }

  /**
   * Track page views
   */
  trackPageView(pageName: string, path?: string): void {
    this.trackEvent('Page Viewed', {
      page_name: pageName,
      path: path || window.location.pathname,
    });
  }

  /**
   * Reset analytics (useful for logout)
   */
  reset(): void {
    if (!this.initialized) return;

    try {
      mixpanel.reset();
      console.log('Analytics reset');
    } catch (error) {
      console.error('Failed to reset analytics:', error);
    }
  }

  /**
   * Check if analytics is properly initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();
export default analyticsService;
