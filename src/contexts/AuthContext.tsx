import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { handleAuthError } from '@/utils/authErrorHandler';
import analyticsService from '@/services/AnalyticsService';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

  // Check if pet onboarding should be shown
  const checkPetOnboarding = useCallback(async (userId: string) => {
    try {
      // Check localStorage first
      const localStorageKey = `petOnboardingShown:${userId}`;
      const shownInLocalStorage = localStorage.getItem(localStorageKey) === '1';
      
      if (shownInLocalStorage) {
        return; // Already shown
      }

      // Check user metadata
      const { data: userData } = await supabase.auth.getUser();
      const metadataShown = userData?.user?.user_metadata?.petOnboardingShown === true;
      
      if (metadataShown) {
        // Sync to localStorage
        localStorage.setItem(localStorageKey, '1');
        return; // Already shown
      }

      // Check if user has any pets
      const { count, error } = await supabase
        .from('pet_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (error) {
        console.error('Error checking pets:', error);
        return;
      }

      // If user has no pets and hasn't seen onboarding, redirect
      if (count === 0) {
        // Set flag in localStorage immediately
        localStorage.setItem(localStorageKey, '1');
        
        // Try to set in user metadata (non-blocking)
        supabase.auth.updateUser({
          data: { petOnboardingShown: true }
        }).catch(err => console.warn('Could not update user metadata:', err));
        
        // Navigate to my-pets with openCreate flag
        navigate('/my-pets?openCreate=true');
      }
    } catch (error) {
      console.error('Error in pet onboarding check:', error);
    }
  }, [navigate]);

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

        // Check pet onboarding after auth is established
        if (activeSession?.user) {
          setTimeout(() => checkPetOnboarding(activeSession.user.id), 500);
        }
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

        // Check pet onboarding on sign in
        if (newSession?.user) {
          setTimeout(() => checkPetOnboarding(newSession.user.id), 500);
        }

      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        setUser(null);
        analyticsService.trackEvent('User Logged Out');
        analyticsService.reset();
      }
    });

    return () => subscription.unsubscribe();
  }, [checkPetOnboarding]);

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