import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Settings, User, Bell, Loader2, LogOut, Globe, Smartphone, ChevronDown, Shield, ExternalLink, Trash2, Eye, EyeOff } from 'lucide-react';
import Layout from '@/components/Layout';
import type { Tables } from '@/integrations/supabase/types';
import PushNotificationSettings from '@/components/PushNotificationSettings';
import { useAuth } from '@/contexts/AuthContext';
import PWAInstallContent from '@/components/PWAInstallContent';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

type UserProfile = Tables<'user_profiles'>;
type NotificationPreferences = Tables<'notification_preferences'>;

interface SettingsFormData {
  displayName: string;
  city: string;
  neighborhood: string;
  playdateRequests: boolean;
  playdateConfirmations: boolean;
  eventReminders: boolean;
  newFollowerAlerts: boolean;
  weeklyNewsletter: boolean;
  isPrivate: boolean;
}

const UserSettings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signOut } = useAuth();
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const form = useForm<SettingsFormData>({
    defaultValues: {
      displayName: '',
      city: '',
      neighborhood: '',
      playdateRequests: true,
      playdateConfirmations: true,
      eventReminders: true,
      newFollowerAlerts: true,
      weeklyNewsletter: false,
      isPrivate: false,
    },
  });

  useEffect(() => {
    checkAuthAndLoadSettings();
  }, []);

  const checkAuthAndLoadSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/auth');
        return;
      }

      setUserId(user.id);
      await loadUserSettings(user.id);
    } catch (error) {
      console.error('Error checking auth:', error);
      navigate('/auth');
    } finally {
      setLoading(false);
    }
  };

  const loadUserSettings = async (userId: string) => {
    try {
      // Load user profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      // Load notification preferences
      const { data: preferences, error: preferencesError } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (preferencesError && preferencesError.code !== 'PGRST116') {
        throw preferencesError;
      }

      // Populate form with existing data
      form.reset({
        displayName: profile?.display_name || '',
        city: profile?.city || '',
        neighborhood: profile?.neighborhood || '',
        playdateRequests: preferences?.playdate_requests ?? true,
        playdateConfirmations: preferences?.playdate_confirmations ?? true,
        eventReminders: preferences?.event_reminders ?? true,
        newFollowerAlerts: preferences?.new_follower_alerts ?? true,
        weeklyNewsletter: preferences?.weekly_newsletter ?? false,
        isPrivate: profile?.is_private ?? false,
      });
    } catch (error) {
      console.error('Error loading user settings:', error);
      toast({
        title: "Error",
        description: "Failed to load your settings.",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: SettingsFormData) => {
    if (!userId) return;

    setSaving(true);
    try {
      // Update user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          id: userId,
          display_name: data.displayName || null,
          city: data.city || null,
          neighborhood: data.neighborhood || null,
          is_private: data.isPrivate,
          updated_at: new Date().toISOString(),
        });

      if (profileError) throw profileError;

      // Update notification preferences
      const { error: preferencesError } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: userId,
          playdate_requests: data.playdateRequests,
          playdate_confirmations: data.playdateConfirmations,
          event_reminders: data.eventReminders,
          new_follower_alerts: data.newFollowerAlerts,
          weekly_newsletter: data.weeklyNewsletter,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });

      if (preferencesError) throw preferencesError;

      toast({
        title: "Success",
        description: "Your settings have been saved successfully!",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save your settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    localStorage.setItem('preferred-language', languageCode);
    toast({
      title: t('common.save'),
      description: t('settings.language') + ' changed successfully!',
    });
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: t('settings.signOut'),
        description: "You have been successfully signed out.",
      });
      navigate('/');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };


  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-green-600" />
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              <Settings className="w-8 h-8" />
              {t('settings.title')}
            </h1>
            <p className="text-gray-600 mt-1">Manage your account and notification preferences</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Profile Information Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    {t('settings.profileInformation')}
                  </CardTitle>
                  <CardDescription>
                    Update your personal information and location details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="displayName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('settings.displayName')}</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your display name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('settings.city')}</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your city" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="neighborhood"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('settings.neighborhood')}</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your neighborhood" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Regional Settings Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    {t('settings.regionalSettings')}
                  </CardTitle>
                  <CardDescription>
                    {t('settings.selectLanguage')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t('settings.language')}</label>
                      <Select value={i18n.language} onValueChange={handleLanguageChange}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={t('settings.selectLanguage')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">{t('languages.en')}</SelectItem>
                          <SelectItem value="tr">{t('languages.tr')}</SelectItem>
                          <SelectItem value="sv">{t('languages.sv')}</SelectItem>
                          <SelectItem value="es">{t('languages.es')}</SelectItem>
                          <SelectItem value="fr">{t('languages.fr')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* PWA Install Guide Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="w-5 h-5" />
                    Get the App Experience
                  </CardTitle>
                  <CardDescription>
                    Learn how to install PawCult on your device for the best experience
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Collapsible>
                    <CollapsibleTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">
                        App Installation Guide
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-4">
                      <PWAInstallContent />
                    </CollapsibleContent>
                  </Collapsible>
                </CardContent>
              </Card>

              {/* Push Notifications Section */}
              <PushNotificationSettings />

              {/* Notification Preferences Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    {t('settings.notificationPreferences')}
                  </CardTitle>
                  <CardDescription>
                    Choose which notifications you'd like to receive
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="playdateRequests"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">{t('settings.playdateRequests')}</FormLabel>
                          <div className="text-sm text-gray-600">
                            Get notified when someone sends your pet a playdate request
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="playdateConfirmations"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">{t('settings.playdateConfirmations')}</FormLabel>
                          <div className="text-sm text-gray-600">
                            Get notified when your playdate requests are accepted or declined
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="eventReminders"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">{t('settings.eventReminders')}</FormLabel>
                          <div className="text-sm text-gray-600">
                            Get reminded about upcoming events and activities
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="newFollowerAlerts"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">{t('settings.newFollowerAlerts')}</FormLabel>
                          <div className="text-sm text-gray-600">
                            Get notified when someone follows you or your pets
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="weeklyNewsletter"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">{t('settings.weeklyNewsletter')}</FormLabel>
                          <div className="text-sm text-gray-600">
                            Receive weekly updates and pet care tips
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Privacy Settings Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Privacy Settings
                  </CardTitle>
                  <CardDescription>
                    Control who can see your content and pets
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="isPrivate"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base flex items-center gap-2">
                            {field.value ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            Private Account
                          </FormLabel>
                          <div className="text-sm text-gray-600">
                            When enabled, your pets won't appear in discovery and your tweets will be hidden from public feeds
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Account Management Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trash2 className="w-5 h-5" />
                    Account Management
                  </CardTitle>
                  <CardDescription>
                    Permanently delete your account and all associated data
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Trash2 className="h-5 w-5 text-destructive mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-destructive">Danger Zone</p>
                        <p className="text-muted-foreground mt-1">
                          Account deletion requires secure verification and cannot be undone.
                        </p>
                      </div>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => navigate('/delete-account')}
                    className="w-full"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete My Account
                  </Button>
                </CardContent>
              </Card>

              {/* Privacy & Legal Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Privacy & Legal
                  </CardTitle>
                  <CardDescription>
                    Review our privacy policy and data handling practices
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/privacy')}
                    className="w-full justify-between"
                  >
                    Privacy Policy
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>

              {/* Mobile Sign Out Button */}
              <div className="block md:hidden">
                <Card>
                  <CardContent className="pt-6">
                    <Button
                      type="button"
                      onClick={handleSignOut}
                      variant="destructive"
                      className="w-full flex items-center justify-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      {t('settings.signOut')}
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving Changes...
                    </>
                  ) : (
                    t('settings.saveChanges')
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </Layout>
  );
};

export default UserSettings;
