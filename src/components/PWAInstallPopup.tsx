import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import PWAInstallContent from '@/components/PWAInstallContent';

const PWAInstallPopup = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [isVisible, setIsVisible] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Only show on mobile and if user is logged in
    if (!isMobile || !user) return;

    checkShouldShow();
  }, [user, isMobile]);

  const checkShouldShow = async () => {
    if (!user) return;

    try {
      const { data: preferences, error } = await supabase
        .from('notification_preferences')
        .select('hide_pwa_popup')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking PWA popup preference:', error);
        return;
      }

      // Show popup if preference doesn't exist or is false
      if (!preferences?.hide_pwa_popup) {
        // Show popup with a slight delay
        setTimeout(() => {
          setIsVisible(true);
        }, 2000);
      }
    } catch (error) {
      console.error('Error checking PWA popup preference:', error);
    }
  };

  const handleClose = async () => {
    if (dontShowAgain) {
      setLoading(true);
      try {
        await saveDontShowPreference();
      } catch (error) {
        console.error('Error saving preference:', error);
        toast({
          title: "Error",
          description: "Failed to save preference. The popup may appear again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
    setIsVisible(false);
  };

  const saveDontShowPreference = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('notification_preferences')
      .upsert({
        user_id: user.id,
        hide_pwa_popup: true,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      throw error;
    }

    toast({
      title: "Preference saved",
      description: "You won't see this popup again.",
    });
  };

  if (!isVisible || !isMobile || !user) {
    return null;
  }

  return (
    <Dialog open={isVisible} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-lg w-full max-h-[90vh] overflow-y-auto [&>button[data-dialog-close]]:hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Get the App Experience
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <PWAInstallContent />

          {/* Don't show again checkbox */}
          <div className="flex items-center space-x-2 pt-4 border-t">
            <Checkbox
              id="dont-show-again"
              checked={dontShowAgain}
              onCheckedChange={(checked) => setDontShowAgain(checked === true)}
            />
            <label
              htmlFor="dont-show-again"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Do not show this again
            </label>
          </div>

          {/* Close button */}
          <Button
            onClick={handleClose}
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Saving...' : 'Got it!'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PWAInstallPopup;