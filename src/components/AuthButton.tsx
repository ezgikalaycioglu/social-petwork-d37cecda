
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
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

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
        navigate('/');
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
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">
          Welcome, {user.email}
        </span>
        <Button 
          onClick={handleSignOut}
          variant="outline"
          size="sm"
          style={{ 
            borderColor: '#FFB3A7', 
            color: '#FFB3A7',
          }}
          className="hover:text-white"
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#FFB3A7';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
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
      style={{ backgroundColor: '#FFB3A7' }}
      className="text-white hover:opacity-90"
    >
      Get Started
    </Button>
  );
};

export default AuthButton;
