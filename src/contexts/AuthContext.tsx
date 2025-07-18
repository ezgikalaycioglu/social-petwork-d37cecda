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

  // Initial session check
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        analyticsService.init();

        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Initial session error:", error);
          await handleAuthError(error);
        }

        const activeSession = data?.session || null;
        setSession(activeSession);
        setUser(activeSession?.user || null);
      } catch (error) {
        console.error("Unexpected error while initializing auth:", error);
        await handleAuthError(error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (event === 'SIGNED_IN') {
        setSession(newSession);
        setUser(newSession?.user || null);

        try {
          analyticsService.trackEvent('User Logged In', {
            user_id: newSession?.user.id,
            email: newSession?.user.email,
          });
        } catch (e) {
          console.warn('Analytics login event failed');
        }

      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        setUser(null);
        analyticsService.trackEvent('User Logged Out');
        analyticsService.reset();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
    } catch (error) {
      console.error('Error during sign out:', error);
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
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};