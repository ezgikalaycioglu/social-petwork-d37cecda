
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface RateLimitOptions {
  action: string;
  windowMinutes?: number;
  maxAttempts?: number;
}

interface SecurityEventData {
  event_type: 'failed_login' | 'suspicious_access' | 'data_breach_attempt' | 'rate_limit_exceeded';
  user_id?: string;
  email?: string;
  details?: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export const useSecurity = () => {
  const checkRateLimit = useCallback(async (
    identifier: string,
    options: RateLimitOptions
  ): Promise<{ allowed: boolean; attemptsRemaining: number; error?: string }> => {
    try {
      const { data, error } = await supabase.functions.invoke('rate-limit', {
        body: {
          identifier,
          action: options.action,
          window_minutes: options.windowMinutes || 15,
          max_attempts: options.maxAttempts || 5,
        },
      });

      if (error) {
        console.error('Rate limit check error:', error);
        return { allowed: true, attemptsRemaining: 0, error: error.message };
      }

      return {
        allowed: data.allowed,
        attemptsRemaining: data.attempts_remaining,
      };
    } catch (error: any) {
      console.error('Rate limit check failed:', error);
      return { allowed: true, attemptsRemaining: 0, error: error.message };
    }
  }, []);

  const logSecurityEvent = useCallback(async (eventData: SecurityEventData) => {
    try {
      const { error } = await supabase.functions.invoke('security-monitor', {
        body: eventData,
      });

      if (error) {
        console.error('Security event logging error:', error);
      }
    } catch (error) {
      console.error('Security event logging failed:', error);
    }
  }, []);

  const generateCSRFToken = useCallback((): string => {
    // Generate a random token for CSRF protection
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }, []);

  const validateCSRFToken = useCallback((token: string, storedToken: string): boolean => {
    return token === storedToken && token.length === 64;
  }, []);

  return {
    checkRateLimit,
    logSecurityEvent,
    generateCSRFToken,
    validateCSRFToken,
  };
};
