
import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { handleAuthError } from '@/utils/authErrorHandler';
import { PawPrint } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Validate the current session when the protected route loads
    const validateSession = async () => {
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session validation error in ProtectedRoute:', sessionError);
          const authErrorHandled = await handleAuthError(sessionError, navigate);
          if (authErrorHandled.shouldSignOut) {
            return;
          }
        }

        // If we have a user but no valid session, something is wrong
        if (user && !sessionData?.session) {
          console.warn('User present but no valid session - signing out');
          await supabase.auth.signOut();
          navigate('/auth');
        }
      } catch (error) {
        console.error('Error validating session in ProtectedRoute:', error);
        const authErrorHandled = await handleAuthError(error, navigate);
        if (!authErrorHandled.shouldSignOut) {
          navigate('/auth');
        }
      }
    };

    if (user && !loading) {
      validateSession();
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <PawPrint className="w-8 h-8 animate-spin mx-auto mb-4 text-green-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
