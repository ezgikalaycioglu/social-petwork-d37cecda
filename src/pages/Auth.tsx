import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { validateEmail } from '@/utils/validation';
import { useSecurity } from '@/hooks/useSecurity';
import { Eye, EyeOff, Heart, PawPrint, ArrowLeft, Mail, Lock, User } from 'lucide-react';
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
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const { checkRateLimit, logSecurityEvent, generateCSRFToken } = useSecurity();

  useEffect(() => {
    // Check if this is a password reset callback
    const resetParam = searchParams.get('reset');
    if (resetParam === 'true') {
      setIsPasswordReset(true);
    }
  }, [searchParams]);

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

  return (
    <div className="min-h-screen bg-background font-sans tracking-tighter leading-relaxed">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => navigate('/', { state: { fromAuth: true } })}
        className="absolute top-6 left-6 z-10 flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors duration-200"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="hidden lg:flex text-sm font-medium">Back to Home</span>
      </Button>

      <div className="flex min-h-screen">
        {/* Left Panel - Illustration */}
        <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary-light via-accent-light to-coral-light items-center justify-center p-12">
          <div className="max-w-lg text-center space-y-8">
            <img 
              src={authIllustration} 
              alt="Happy pets community" 
              className="w-full max-w-md mx-auto rounded-2xl shadow-2xl"
            />
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-foreground">
                Join the Pet Community
              </h2>
              <p className="text-lg text-muted-foreground">
                Connect with fellow pet lovers, share adventures, and create lasting friendships for you and your furry friends.
              </p>
              <div className="flex items-center justify-center gap-4 text-primary">
                <PawPrint className="h-6 w-6" />
                <Heart className="h-5 w-5 text-coral" />
                <PawPrint className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Auth Form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md space-y-8">
            {/* Header */}
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-2 mb-4">
                <PawPrint className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold text-foreground">PawCult</h1>
              </div>
            </div>

            {/* Auth Card */}
            <Card className="bg-white shadow-2xl border-2 border-border/20 rounded-2xl overflow-hidden">
              <CardHeader className="text-center pb-6 bg-gradient-to-r from-primary-light to-accent-light">
                <div className="space-y-2">
                  <CardTitle className="text-2xl font-bold text-foreground transition-all duration-500">
                    {isPasswordReset 
                      ? 'Reset Your Password' 
                      : (isSignUp ? 'Create Account' : 'Welcome Back')
                    }
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {isPasswordReset 
                      ? 'Enter your new password below'
                      : (isSignUp 
                        ? 'Join our pet-loving community today' 
                        : 'Sign in to your account'
                      )
                    }
                  </CardDescription>
                </div>
              </CardHeader>
              
              <CardContent className="p-8">
                {isPasswordReset ? (
                  // Password Reset Form
                  <form onSubmit={handlePasswordReset} className="space-y-6">
                    <div className="space-y-4">
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="New Password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                          minLength={6}
                          className="pl-10 pr-12 h-12 text-lg rounded-xl border-2 bg-background focus:shadow-lg transition-all duration-300"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                      
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                        <Input
                          type="password"
                          placeholder="Confirm New Password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          minLength={6}
                          className="pl-10 h-12 text-lg rounded-xl border-2 bg-background focus:shadow-lg transition-all duration-300"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-12 bg-primary hover:bg-primary-hover text-primary-foreground rounded-xl text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      {loading ? 'Updating...' : 'Update Password'}
                    </Button>
                  </form>
                ) : (
                  // Normal Sign In/Up Form
                  <div className="space-y-6">
                    <form onSubmit={handleAuth} className="space-y-6">
                      <div className="space-y-4">
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                          <Input
                            type="email"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="pl-10 h-12 text-lg rounded-xl border-2 bg-background focus:shadow-lg transition-all duration-300"
                          />
                        </div>
                        
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="pl-10 pr-12 h-12 text-lg rounded-xl border-2 bg-background focus:shadow-lg transition-all duration-300"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full h-12 bg-primary hover:bg-primary-hover text-primary-foreground rounded-xl text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      >
                        {loading ? (
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                            Loading...
                          </div>
                        ) : (
                          isSignUp ? 'Create Account' : 'Sign In'
                        )}
                      </Button>
                    </form>

                    {/* Social Login Options */}
                    <SocialLogin mode={isSignUp ? 'signup' : 'signin'} />

                    {/* Forgot Password Link - only show on sign in */}
                    {!isSignUp && !showForgotPassword && (
                      <div className="text-center">
                        <button
                          onClick={() => setShowForgotPassword(true)}
                          className="text-sm text-primary hover:text-primary-hover underline transition-colors"
                        >
                          Forgot your password?
                        </button>
                      </div>
                    )}

                    {/* Forgot Password Form */}
                    {showForgotPassword && (
                      <div className="p-6 bg-primary-light rounded-2xl border border-primary/10 animate-fade-in">
                        <h3 className="text-lg font-semibold text-foreground mb-4">Reset Password</h3>
                        <form onSubmit={handleForgotPassword} className="space-y-4">
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                            <Input
                              type="email"
                              placeholder="Enter your email address"
                              value={resetEmail}
                              onChange={(e) => setResetEmail(e.target.value)}
                              required
                              className="pl-10 h-12 rounded-xl border-2 bg-white"
                            />
                          </div>
                          <div className="flex gap-3">
                            <Button
                              type="submit"
                              disabled={resetLoading}
                              className="flex-1 bg-primary hover:bg-primary-hover text-primary-foreground rounded-xl"
                            >
                              {resetLoading ? 'Sending...' : 'Send Reset Link'}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                setShowForgotPassword(false);
                                setResetEmail('');
                              }}
                              className="rounded-xl border-primary/20"
                            >
                              Cancel
                            </Button>
                          </div>
                        </form>
                      </div>
                    )}

                    {/* Toggle Sign In/Up */}
                    <div className="text-center pt-4 border-t border-border/20">
                      <p className="text-muted-foreground mb-3">
                        {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                      </p>
                      <button
                        onClick={() => {
                          setIsSignUp(!isSignUp);
                          setShowForgotPassword(false);
                          setResetEmail('');
                        }}
                        className="text-primary hover:text-primary-hover font-medium transition-all duration-300 transform hover:scale-105"
                      >
                        {isSignUp ? 'Sign In' : 'Sign Up'}
                      </button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Mobile Illustration */}
            <div className="lg:hidden text-center">
              <img 
                src={authIllustration} 
                alt="Happy pets community" 
                className="w-48 h-48 mx-auto rounded-2xl shadow-lg object-cover"
              />
              <p className="mt-4 text-muted-foreground text-sm">
                Join the pet community today!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
