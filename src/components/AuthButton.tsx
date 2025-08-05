
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { User, Session } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const AuthButton = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Redirect to dashboard on successful sign in
        if (event === 'SIGNED_IN' && session) {
          navigate('/dashboard');
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({
          title: 'Error signing out',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Signed out',
          description: 'You have been successfully signed out.',
        });
        // Navigate to top of landing page
        window.location.href = '/';
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    }
  };

  if (user) {
    return (
      <div className="flex flex-col gap-2 w-full">
        <Button 
          onClick={() => navigate('/dashboard')}
          size="default"
          className="w-full text-sm px-4 py-2 text-white hover:opacity-90"
          style={{ backgroundColor: '#A8DAB5' }}
        >
          Dashboard
        </Button>
        <Button 
          onClick={handleSignOut}
          variant="outline"
          size="default"
          className="w-full text-sm px-4 py-2"
          style={{ 
            borderColor: '#FFB3A7', 
            color: '#FFB3A7',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#FFB3A7';
            e.currentTarget.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#FFB3A7';
          }}
        >
          Sign Out
        </Button>
      </div>
    );
  }

  return (
    <Button 
      onClick={() => navigate('/auth')}
      size="default"
      className="text-sm sm:text-lg px-4 py-2 sm:px-8 sm:py-3 text-white hover:opacity-90"
      style={{ backgroundColor: '#FFB3A7' }}
    >
      Get Started
    </Button>
  );
};

export default AuthButton;
