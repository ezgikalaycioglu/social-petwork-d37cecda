import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { validateEmail } from '@/utils/validation';
import { useSecurity } from '@/hooks/useSecurity';
import { Eye, EyeOff, PawPrint, ArrowLeft, Mail, Lock } from 'lucide-react';
import authIllustration from '@/assets/auth-pets-illustration.jpg';
import SocialLogin from '@/components/SocialLogin';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const { checkRateLimit, logSecurityEvent, generateCSRFToken } = useSecurity();

  useEffect(() => {
    // Check if this is a password reset callback
    const resetParam = searchParams.get('reset');
    if (resetParam === 'true') {
      setIsPasswordReset(true);
      return;
    }

    // Check for mode passed via navigation state
    const state = location.state as { mode?: 'signup' | 'login' } | null;
    if (state?.mode === 'signup') {
      setIsSignUp(true);
    } else if (state?.mode === 'login') {
      setIsSignUp(false);
    }
  }, [searchParams, location.state]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Check rate limiting for authentication attempts
    const rateLimitCheck = await checkRateLimit(email, {
      action: isSignUp ? 'signup' : 'signin',
      maxAttempts: 5,
      windowMinutes: 15
    });

    if (!rateLimitCheck.allowed) {
      await logSecurityEvent({
        event_type: 'rate_limit_exceeded',
        email,
        details: { action: isSignUp ? 'signup' : 'signin' },
        severity: 'medium'
      });
      
      toast({
        title: "Too many attempts",
        description: "Please wait before trying again.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        toast({
          title: "Account created!",
          description: "You can now sign in with your credentials.",
        });
        
        // Redirect to dashboard after successful signup
        navigate('/dashboard');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        
        // Redirect to dashboard after successful login
        navigate('/dashboard');
      }
    } catch (error: any) {
      // Log failed authentication attempts
      await logSecurityEvent({
        event_type: 'failed_login',
        email,
        details: { 
          error: error.message,
          action: isSignUp ? 'signup' : 'signin'
        },
        severity: 'medium'
      });

      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth?reset=true`,
      });

      if (error) throw error;

      toast({
        title: "Reset link sent!",
        description: "Please check your email for the password reset link.",
      });

      setShowForgotPassword(false);
      setResetEmail('');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setResetLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast({
        title: "Password updated!",
        description: "Your password has been successfully updated.",
      });

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formTitleId = 'auth-form-title';

  return (
    <div className="min-h-[100dvh] bg-background">
      {/* Back Button - Desktop only */}
      <Button
        variant="ghost"
        onClick={() => navigate('/', { state: { fromAuth: true } })}
        className="absolute top-4 left-4 z-10 hidden lg:flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        <span className="text-sm font-medium">Back to Home</span>
      </Button>

      <div className="flex min-h-[100dvh]">
        {/* Left Panel - Illustration (Desktop only, hidden < 1024px) */}
        <div className="hidden lg:flex flex-1 items-center justify-center p-8 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/10" style={{ minWidth: 'min(44vw, 640px)' }}>
          <div className="relative bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-sm rounded-3xl p-8 shadow-xl max-w-lg">
            <img 
              src={authIllustration} 
              alt="Happy pets community" 
              className="w-full max-w-md mx-auto rounded-2xl shadow-lg"
            />
            <div className="mt-6 text-center space-y-3">
              <h2 className="text-2xl font-semibold text-foreground tracking-tight">
                Join the Pet Community
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Connect with fellow pet lovers, share adventures, and create lasting friendships.
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <PawPrint className="h-5 w-5 text-primary" aria-hidden="true" />
                <span className="text-xs text-muted-foreground">•</span>
                <PawPrint className="h-5 w-5 text-accent" aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Auth Form */}
        <div className="flex-1 grid place-items-center p-4 pt-8 pb-[calc(env(safe-area-inset-bottom)+16px)]">
          <div className="w-full max-w-[420px] md:max-w-[460px] space-y-6">
            {/* Mobile Header with Logo */}
            <div className="flex items-center justify-center gap-2 lg:hidden">
              <PawPrint className="h-7 w-7 text-primary" aria-hidden="true" />
              <span className="text-xl font-semibold text-foreground">PawCult</span>
            </div>

            {/* Auth Card */}
            <div className="bg-white rounded-2xl shadow-lg/10 shadow-lg border border-gray-100 overflow-hidden">
              {/* Gradient strip at top */}
              <div className="h-1.5 bg-gradient-to-r from-[#EEF0FF] to-[#EAF6F6] rounded-t-2xl" />
              
              {/* Card Header */}
              <div className="px-6 pt-6 pb-4 md:px-8 md:pt-8 text-center">
                <h1 
                  id={formTitleId}
                  className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground"
                >
                  {isPasswordReset 
                    ? 'Reset Your Password' 
                    : (isSignUp ? 'Create Account' : 'Sign In')
                  }
                </h1>
                <p className="mt-2 text-muted-foreground text-sm md:text-base">
                  {isPasswordReset 
                    ? 'Enter your new password below'
                    : (isSignUp 
                      ? 'Join our pet-loving community today' 
                      : 'Welcome back to PawCult'
                    )
                  }
                </p>
              </div>
              
              {/* Card Content */}
              <div className="px-6 pb-6 md:px-8 md:pb-8">
                {isPasswordReset ? (
                  // Password Reset Form
                  <form 
                    onSubmit={handlePasswordReset} 
                    className="space-y-4"
                    role="form"
                    aria-labelledby={formTitleId}
                  >
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="new-password" className="sr-only">New Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" aria-hidden="true" />
                          <Input
                            id="new-password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="New Password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            minLength={6}
                            className="pl-10 pr-12 h-12 rounded-xl border-gray-200 focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-foreground focus:outline-none focus:text-foreground transition-colors"
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                          >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password" className="sr-only">Confirm Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" aria-hidden="true" />
                          <Input
                            id="confirm-password"
                            type="password"
                            placeholder="Confirm New Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            minLength={6}
                            className="pl-10 h-12 rounded-xl border-gray-200 focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      aria-busy={loading}
                      className="w-full h-12 bg-primary hover:bg-primary/90 text-white rounded-xl font-medium transition-all"
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Updating...</span>
                        </div>
                      ) : (
                        'Update Password'
                      )}
                    </Button>
                  </form>
                ) : (
                  // Normal Sign In/Up Form
                  <div className="space-y-4">
                    <form 
                      onSubmit={handleAuth} 
                      className="space-y-4"
                      role="form"
                      aria-labelledby={formTitleId}
                    >
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="email" className="sr-only">Email address</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" aria-hidden="true" />
                            <Input
                              id="email"
                              type="email"
                              placeholder="Email address"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              required
                              className="pl-10 h-12 rounded-xl border-gray-200 focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="password" className="sr-only">Password</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" aria-hidden="true" />
                            <Input
                              id="password"
                              type={showPassword ? 'text' : 'password'}
                              placeholder="Password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              required
                              className="pl-10 pr-12 h-12 rounded-xl border-gray-200 focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-foreground focus:outline-none focus:text-foreground transition-colors"
                              aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        disabled={loading}
                        aria-busy={loading}
                        className="w-full h-12 bg-primary hover:bg-primary/90 text-white rounded-xl font-medium transition-all"
                      >
                        {loading ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Loading...</span>
                          </div>
                        ) : (
                          isSignUp ? 'Create Account' : 'Sign In'
                        )}
                      </Button>
                    </form>

                    {/* Forgot Password Link - only show on sign in */}
                    {!isSignUp && !showForgotPassword && (
                      <div className="text-center">
                        <button
                          onClick={() => setShowForgotPassword(true)}
                          className="text-sm text-primary hover:underline focus:outline-none focus:underline transition-colors"
                        >
                          Forgot your password?
                        </button>
                      </div>
                    )}

                    {/* Social Login Options */}
                    <SocialLogin mode={isSignUp ? 'signup' : 'signin'} />

                    {/* Forgot Password Form */}
                    {showForgotPassword && (
                      <div 
                        className="p-5 bg-gray-50 rounded-xl border border-gray-100"
                        role="region"
                        aria-live="polite"
                      >
                        <h3 className="text-base font-medium text-foreground mb-3">Reset Password</h3>
                        <form onSubmit={handleForgotPassword} className="space-y-3">
                          <div className="relative">
                            <Label htmlFor="reset-email" className="sr-only">Email address</Label>
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" aria-hidden="true" />
                            <Input
                              id="reset-email"
                              type="email"
                              placeholder="Enter your email address"
                              value={resetEmail}
                              onChange={(e) => setResetEmail(e.target.value)}
                              required
                              className="pl-10 h-12 rounded-xl border-gray-200 bg-white focus:ring-2 focus:ring-primary/30 focus:border-primary"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              type="submit"
                              disabled={resetLoading}
                              aria-busy={resetLoading}
                              className="flex-1 h-10 bg-primary hover:bg-primary/90 text-white rounded-xl font-medium"
                            >
                              {resetLoading ? (
                                <div className="flex items-center gap-2">
                                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                  <span>Sending...</span>
                                </div>
                              ) : (
                                'Send Reset Link'
                              )}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                setShowForgotPassword(false);
                                setResetEmail('');
                              }}
                              className="h-10 rounded-xl border-gray-200 hover:bg-gray-50"
                            >
                              Cancel
                            </Button>
                          </div>
                        </form>
                      </div>
                    )}

                    {/* Toggle Sign In/Up */}
                    <div className="text-center pt-4 border-t border-gray-100">
                      <p className="text-muted-foreground text-sm">
                        {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                        {' '}
                        <button
                          onClick={() => {
                            setIsSignUp(!isSignUp);
                            setShowForgotPassword(false);
                            setResetEmail('');
                          }}
                          className="text-primary hover:underline font-medium focus:outline-none focus:underline transition-colors"
                        >
                          {isSignUp ? 'Sign In' : 'Sign Up'}
                        </button>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Back Link */}
            <div className="text-center lg:hidden">
              <button
                onClick={() => navigate('/', { state: { fromAuth: true } })}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
