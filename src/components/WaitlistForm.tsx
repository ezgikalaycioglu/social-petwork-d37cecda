import React, { useState } from 'react';
import { Mail, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';

const WaitlistForm = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email: string) => {
    // Check if email contains both "@" and "." characters
    return email.includes('@') && email.includes('.');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address with "@" and "." characters');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error: insertError } = await supabase
        .from('waitlist_subscribers')
        .insert({ email: email.trim().toLowerCase() });

      if (insertError) {
        if (insertError.code === '23505') {
          setError('This email is already on our waitlist!');
        } else {
          setError('Something went wrong. Please try again.');
        }
      } else {
        setIsSuccess(true);
        setEmail('');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-green-50 rounded-xl border border-green-200">
        <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
          <Check className="w-6 h-6 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-green-800 mb-2">
          Thanks for joining!
        </h3>
        <p className="text-green-700 text-center">
          We'll be in touch soon with updates. 🎉
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
            className="w-full h-12 text-base border-2 border-gray-200 focus:border-primary"
            style={{ 
              borderColor: error ? '#ef4444' : undefined
            }}
          />
          {error && (
            <p className="text-sm text-red-600 mt-1 ml-1">{error}</p>
          )}
        </div>
        
        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-12 px-6 text-base font-semibold text-white whitespace-nowrap"
          style={{ 
            background: 'linear-gradient(135deg, #FFB3A7 0%, #A8DAB5 100%)',
            boxShadow: '0 4px 15px rgba(255, 179, 167, 0.3)'
          }}
        >
          <Mail className="w-4 h-4 mr-2" />
          {isSubmitting ? 'Joining...' : 'Join the Waitlist'}
        </Button>
      </form>
    </div>
  );
};

export default WaitlistForm;