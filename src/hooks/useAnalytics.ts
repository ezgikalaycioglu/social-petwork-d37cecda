
import { useCallback } from 'react';
import analyticsService, { AnalyticsEvent, EventProperties } from '@/services/AnalyticsService';

/**
 * Custom hook for analytics tracking
 * Provides a convenient way to track events from React components
 */
export const useAnalytics = () => {
  const trackEvent = useCallback(<T extends AnalyticsEvent>(
    eventName: T,
    properties?: T extends keyof EventProperties ? EventProperties[T] : Record<string, any>
  ) => {
    analyticsService.trackEvent(eventName, properties);
  }, []);

  const trackPageView = useCallback((pageName: string, path?: string) => {
    analyticsService.trackPageView(pageName, path);
  }, []);

  const setUserProperties = useCallback((properties: Record<string, any>) => {
    analyticsService.setUserProperties(properties);
  }, []);

  return {
    trackEvent,
    trackPageView,
    setUserProperties,
    isInitialized: analyticsService.isInitialized(),
  };
};
