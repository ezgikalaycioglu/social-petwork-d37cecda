
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
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
      const { data: { session }, error } = await supabase.auth.getSession();
      if (session) {
        setSession(session);
        setUser(session.user);
      }
      setLoading(false);
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

          // Identify user for analytics
          try {
            const { data: userProfile } = await supabase
              .from('user_profiles')
              .select('display_name, city, neighborhood')
              .eq('id', session.user.id)
              .single();

            const { count: petCount } = await supabase
              .from('pet_profiles')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', session.user.id);

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
    await supabase.auth.signOut();
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
