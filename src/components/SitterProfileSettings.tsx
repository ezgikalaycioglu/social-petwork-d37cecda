import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Settings, DollarSign, MapPin, FileText, Loader2, Sparkles, PawPrint, Share2, Copy, Check } from 'lucide-react';

interface SitterProfile {
  id: string;
  rate_per_day: number | null;
  currency: string;
  bio: string | null;
  location: string | null;
  is_active: boolean;
  headline?: string | null;
  years_experience?: string | null;
  accepted_pet_types?: string[] | null;
}

interface SitterProfileSettingsProps {
  sitterProfile: SitterProfile;
  onUpdate: () => void;
}

const currencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone' },
  { code: 'DKK', symbol: 'kr', name: 'Danish Krone' },
];

const petTypes = [
  'Dogs', 'Cats', 'Rabbits', 'Birds', 'Reptiles', 'Fish', 'Small Mammals', 'Exotic Pets'
];

const experienceLevels = [
  { value: '0-1', label: '0-1 years' },
  { value: '1-3', label: '1-3 years' },
  { value: '3-5', label: '3-5 years' },
  { value: '5-10', label: '5-10 years' },
  { value: '10+', label: '10+ years' },
];

const SitterProfileSettings = ({ sitterProfile, onUpdate }: SitterProfileSettingsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    rate_per_day: sitterProfile.rate_per_day?.toString() || '',
    currency: sitterProfile.currency || 'USD',
    bio: sitterProfile.bio || '',
    location: sitterProfile.location || '',
    is_active: sitterProfile.is_active,
    headline: sitterProfile.headline || '',
    years_experience: sitterProfile.years_experience || '',
    accepted_pet_types: sitterProfile.accepted_pet_types || [],
  });
  
  const { toast } = useToast();

  const publicProfileUrl = `${window.location.origin}/sitter/profile/${sitterProfile.id}`;

  useEffect(() => {
    setFormData({
      rate_per_day: sitterProfile.rate_per_day?.toString() || '',
      currency: sitterProfile.currency || 'USD',
      bio: sitterProfile.bio || '',
      location: sitterProfile.location || '',
      is_active: sitterProfile.is_active,
      headline: sitterProfile.headline || '',
      years_experience: sitterProfile.years_experience || '',
      accepted_pet_types: sitterProfile.accepted_pet_types || [],
    });
  }, [sitterProfile]);

  const handlePetTypeChange = (petType: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      accepted_pet_types: checked 
        ? [...prev.accepted_pet_types, petType]
        : prev.accepted_pet_types.filter(t => t !== petType)
    }));
  };

  const copyProfileLink = async () => {
    try {
      await navigator.clipboard.writeText(publicProfileUrl);
      setCopied(true);
      toast({ title: "Link copied!", description: "Share it on social media." });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Failed to copy", variant: "destructive" });
    }
  };

  const handleSave = async () => {
    setLoading(true);

    try {
      const updateData: Record<string, unknown> = {
        currency: formData.currency,
        bio: formData.bio.trim() || null,
        location: formData.location.trim() || null,
        is_active: formData.is_active,
        headline: formData.headline.trim() || null,
        years_experience: formData.years_experience || null,
        accepted_pet_types: formData.accepted_pet_types.length > 0 ? formData.accepted_pet_types : null,
        updated_at: new Date().toISOString(),
      };

      // Only update rate if it's provided and valid
      if (formData.rate_per_day.trim()) {
        const rate = parseFloat(formData.rate_per_day);
        if (isNaN(rate) || rate < 0) {
          toast({
            title: "Invalid Rate",
            description: "Please enter a valid rate per day (must be a positive number).",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
        updateData.rate_per_day = rate;
      } else {
        updateData.rate_per_day = null;
      }

      const { error } = await supabase
        .from('sitter_profiles')
        .update(updateData)
        .eq('id', sitterProfile.id);

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: "Your sitter profile has been updated successfully.",
      });

      setIsOpen(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedCurrency = currencies.find(c => c.code === formData.currency);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="w-4 h-4 mr-2" />
          Edit Profile
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Sitter Profile Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4 overflow-y-auto flex-1 pb-24">
          {/* Share Profile Link */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Share2 className="w-5 h-5 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <Label className="text-base font-medium">Share Your Profile</Label>
                  <p className="text-sm text-muted-foreground truncate">{publicProfileUrl}</p>
                </div>
                <Button variant="outline" size="sm" onClick={copyProfileLink}>
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Headline & Experience */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="w-5 h-5" />
                Your Brand
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="headline">Headline (max 140 characters)</Label>
                <Input
                  id="headline"
                  placeholder="e.g., The Dog Whisperer of Stockholm 🐕"
                  maxLength={140}
                  value={formData.headline}
                  onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">{formData.headline.length}/140 characters</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="experience">Years of Experience</Label>
                <Select value={formData.years_experience} onValueChange={(value) => setFormData({ ...formData, years_experience: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    {experienceLevels.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Pet Types */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <PawPrint className="w-5 h-5" />
                Pet Types You Accept
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {petTypes.map((petType) => (
                  <div key={petType} className="flex items-center space-x-2">
                    <Checkbox
                      id={petType}
                      checked={formData.accepted_pet_types.includes(petType)}
                      onCheckedChange={(checked) => handlePetTypeChange(petType, checked as boolean)}
                    />
                    <Label htmlFor={petType} className="text-sm font-normal cursor-pointer">
                      {petType}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Rate and Currency */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <DollarSign className="w-5 w-5" />
                Pricing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rate">Rate per Day</Label>
                  <Input
                    id="rate"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Enter your daily rate"
                    value={formData.rate_per_day}
                    onChange={(e) => setFormData({ ...formData, rate_per_day: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
                    <SelectTrigger>
                      <SelectValue>
                        {selectedCurrency ? `${selectedCurrency.symbol} ${selectedCurrency.name}` : 'Select currency'}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency.code} value={currency.code}>
                          {currency.symbol} {currency.name} ({currency.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {formData.rate_per_day && selectedCurrency && (
                <div className="text-sm text-muted-foreground">
                  Display: {selectedCurrency.symbol}{formData.rate_per_day} per day
                </div>
              )}
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="w-5 h-5" />
                Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="location">Your Location</Label>
                <Input
                  id="location"
                  placeholder="e.g., San Francisco, CA"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Bio */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="w-5 h-5" />
                About You
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell pet owners about your experience and why you love caring for pets..."
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Profile Status */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Profile Active</Label>
                  <div className="text-sm text-muted-foreground">
                    Make your profile visible to pet owners looking for sitters
                  </div>
                </div>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sticky Footer */}
        <div className="sticky bottom-0 inset-x-0 bg-white/90 backdrop-blur border-t px-4 py-3 pb-[calc(80px+env(safe-area-inset-bottom))] z-[100]">
          <div className="flex justify-between sm:justify-end gap-2">
            <Button 
              variant="ghost" 
              onClick={() => setIsOpen(false)} 
              disabled={loading}
              className="h-11 rounded-full px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={loading}
              className="h-11 rounded-full px-5 text-sm font-medium bg-primary text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SitterProfileSettings;