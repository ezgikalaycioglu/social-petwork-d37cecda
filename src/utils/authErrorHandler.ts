
import { supabase } from '@/integrations/supabase/client';
import { PostgrestError } from '@supabase/supabase-js';

export interface AuthError {
  isAuthError: boolean;
  shouldSignOut: boolean;
}

export const checkAuthError = (error: any): AuthError => {
  if (!error) return { isAuthError: false, shouldSignOut: false };

  // Check for common authentication error patterns
  const isJWTExpired = error.message?.includes('JWT expired') || 
                       error.message?.includes('invalid JWT') ||
                       error.message?.includes('token has expired');
  
  const isAuthCode = error.code === 'PGRST301' || // JWT expired
                     error.code === 'PGRST302' || // JWT invalid
                     error.status === 401;        // Unauthorized

  const isAuthMessage = error.message?.toLowerCase().includes('invalid session') ||
                        error.message?.toLowerCase().includes('unauthorized') ||
                        error.message?.toLowerCase().includes('authentication');

  return {
    isAuthError: isJWTExpired || isAuthCode || isAuthMessage,
    shouldSignOut: isJWTExpired || isAuthCode || isAuthMessage
  };
};

export const handleAuthError = async (error: any, navigate?: (path: string) => void) => {
  console.error('Authentication error detected:', error);
  
  const authErrorCheck = checkAuthError(error);
  
  if (authErrorCheck.shouldSignOut) {
    try {
      // Sign out to clear invalid session
      await supabase.auth.signOut();
      console.log('User signed out due to invalid session');
      
      // Redirect to auth page if navigate function is provided
      if (navigate) {
        navigate('/auth');
      } else {
        // Fallback: force page reload to auth page
        window.location.href = '/auth';
      }
    } catch (signOutError) {
      console.error('Error during sign out:', signOutError);
      // Force redirect even if sign out fails
      window.location.href = '/auth';
    }
  }
  
  return authErrorCheck;
};
