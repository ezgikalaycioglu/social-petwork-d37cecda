
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { handleAuthError } from '@/utils/authErrorHandler';
import analyticsService from '@/services/AnalyticsService';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize analytics once
    analyticsService.init();

    // Get initial session
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting initial session:', error);
          const authErrorHandled = await handleAuthError(error);
          if (authErrorHandled.shouldSignOut) {
            setSession(null);
            setUser(null);
            setLoading(false);
            return;
          }
        }
        
        if (session) {
          setSession(session);
          setUser(session.user);
        }
      } catch (error) {
        console.error('Unexpected error getting session:', error);
        await handleAuthError(error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setLoading(true);
        
        if (event === 'SIGNED_IN' && session?.user) {
          setSession(session);
          setUser(session.user);
          
          // Track login event
          analyticsService.trackEvent('User Logged In', {
            user_id: session.user.id,
            email: session.user.email || undefined,
          });

          // Identify user for analytics with error handling
          try {
            const { data: userProfile, error: profileError } = await supabase
              .from('user_profiles')
              .select('display_name, city, neighborhood')
              .eq('id', session.user.id)
              .single();

            // Handle potential auth errors in profile fetch
            if (profileError) {
              const authErrorHandled = await handleAuthError(profileError);
              if (authErrorHandled.shouldSignOut) {
                setSession(null);
                setUser(null);
                setLoading(false);
                return;
              }
            }

            const { count: petCount, error: petCountError } = await supabase
              .from('pet_profiles')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', session.user.id);

            // Handle potential auth errors in pet count fetch
            if (petCountError) {
              const authErrorHandled = await handleAuthError(petCountError);
              if (authErrorHandled.shouldSignOut) {
                setSession(null);
                setUser(null);
                setLoading(false);
                return;
              }
            }

            analyticsService.identifyUser(session.user.id, {
              $email: session.user.email || undefined,
              $name: userProfile?.display_name || undefined,
              $created: session.user.created_at,
              pet_count: petCount || 0,
              city: userProfile?.city || undefined,
              neighborhood: userProfile?.neighborhood || undefined,
              user_type: 'pet_owner',
            });
          } catch (error) {
            console.error('Error fetching user data for analytics:', error);
            // Fallback analytics identification
            analyticsService.identifyUser(session.user.id, {
              $email: session.user.email || undefined,
              $created: session.user.created_at,
              user_type: 'pet_owner',
            });
          }
        } else if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          analyticsService.trackEvent('User Logged Out');
          analyticsService.reset();
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
      // Force clean logout even if API call fails
      setSession(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
