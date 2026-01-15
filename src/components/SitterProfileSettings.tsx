import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Settings, DollarSign, MapPin, FileText, Loader2, Sparkles, PawPrint, Link, Copy, Check, X, Power } from 'lucide-react';
import { LocationAutocomplete } from '@/components/LocationAutocomplete';

interface SitterProfile {
  id: string;
  name: string | null;
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
    name: sitterProfile.name || '',
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
      name: sitterProfile.name || '',
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
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Failed to copy", variant: "destructive" });
    }
  };

  const handleSave = async () => {
    setLoading(true);

    try {
      const updateData: Record<string, unknown> = {
        name: formData.name.trim() || null,
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
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="w-4 h-4" />
          Edit Profile
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-[560px] md:max-w-[640px] max-h-[86vh] flex flex-col p-0 rounded-2xl bg-background shadow-lg gap-0 mx-auto">
        {/* Sticky Header */}
        <div 
          className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border px-4 sm:px-5 py-3 flex items-center flex-shrink-0"
          role="heading" 
          aria-level={2}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Settings className="w-[18px] h-[18px] text-primary" />
            </div>
            <h2 className="text-base font-semibold text-foreground">Sitter Profile Settings</h2>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-5 space-y-5 pb-28">
          
          {/* Section 1: Share Your Profile */}
          <Card className="rounded-xl border border-border focus-within:ring-2 focus-within:ring-ring/20 transition-shadow" aria-labelledby="share-profile-title">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-3">
                <Link className="w-[18px] h-[18px] text-primary" />
                <h3 id="share-profile-title" className="text-sm font-semibold text-foreground">Share Your Profile</h3>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={publicProfileUrl}
                  className="h-11 rounded-xl px-4 bg-muted/50 text-sm text-muted-foreground flex-1 border-border"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyProfileLink}
                  className="min-h-[44px] min-w-[44px] h-11 w-11 p-0 rounded-xl border-border hover:border-muted-foreground/30 hover:bg-muted focus:ring-2 focus:ring-ring"
                  aria-label="Copy profile link"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-primary" />
                  ) : (
                    <Copy className="w-4 h-4 text-muted-foreground" />
                  )}
                </Button>
                <span aria-live="polite" className="sr-only">
                  {copied && "Link copied to clipboard"}
                </span>
              </div>
              {copied && (
                <p className="text-xs text-primary mt-2 font-medium">Copied!</p>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-xl border border-border focus-within:ring-2 focus-within:ring-ring/20 transition-shadow" aria-labelledby="brand-title">
            <CardContent className="p-4 sm:p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-[18px] h-[18px] text-primary" />
                <h3 id="brand-title" className="text-sm font-semibold text-foreground">Your Brand</h3>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-foreground">Display Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Your name as shown to pet owners"
                  className="h-11 rounded-xl px-4 border-border hover:border-muted-foreground/30 focus:ring-2 focus:ring-ring focus:border-primary transition-colors"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="headline" className="text-sm font-medium text-foreground">Headline</Label>
                  <span className="text-xs text-muted-foreground">{formData.headline.length}/140</span>
                </div>
                <Input
                  id="headline"
                  value={formData.headline}
                  onChange={(e) => setFormData({ ...formData, headline: e.target.value.slice(0, 140) })}
                  placeholder="e.g., The Dog Whisperer of Stockholm 🐕"
                  maxLength={140}
                  className="h-11 rounded-xl px-4 border-border hover:border-muted-foreground/30 focus:ring-2 focus:ring-ring focus:border-primary transition-colors"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience" className="text-sm font-medium text-foreground">Years of Experience</Label>
                <Select
                  value={formData.years_experience}
                  onValueChange={(value) => setFormData({ ...formData, years_experience: value })}
                >
                  <SelectTrigger id="experience" className="h-11 rounded-xl px-4 border-border hover:border-muted-foreground/30 focus:ring-2 focus:ring-ring">
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {experienceLevels.map((level) => (
                      <SelectItem key={level.value} value={level.value} className="rounded-lg">
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Pet Types You Accept */}
          <Card className="rounded-xl border border-border focus-within:ring-2 focus-within:ring-ring/20 transition-shadow" aria-labelledby="pet-types-title">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-4">
                <PawPrint className="w-[18px] h-[18px] text-primary" />
                <h3 id="pet-types-title" className="text-sm font-semibold text-foreground">Pet Types You Accept</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {petTypes.map((petType) => (
                  <label
                    key={petType}
                    className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-muted-foreground/30 hover:bg-muted/50 cursor-pointer transition-colors min-h-[44px] has-[:checked]:border-primary has-[:checked]:bg-primary/5 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring"
                  >
                    <Checkbox
                      id={petType}
                      checked={formData.accepted_pet_types.includes(petType)}
                      onCheckedChange={(checked) => handlePetTypeChange(petType, checked as boolean)}
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <span className="text-sm font-medium text-foreground">{petType}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Section 4: Pricing */}
          <Card className="rounded-xl border border-border focus-within:ring-2 focus-within:ring-ring/20 transition-shadow" aria-labelledby="pricing-title">
            <CardContent className="p-4 sm:p-5 space-y-4">
              <div className="flex items-center gap-2">
                <DollarSign className="w-[18px] h-[18px] text-primary" />
                <h3 id="pricing-title" className="text-sm font-semibold text-foreground">Pricing</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rate" className="text-sm font-medium text-foreground">Rate per Day</Label>
                  <Input
                    id="rate"
                    type="number"
                    value={formData.rate_per_day}
                    onChange={(e) => setFormData({ ...formData, rate_per_day: e.target.value })}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="h-11 rounded-xl px-4 border-border hover:border-muted-foreground/30 focus:ring-2 focus:ring-ring focus:border-primary transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency" className="text-sm font-medium text-foreground">Currency</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) => setFormData({ ...formData, currency: value })}
                  >
                    <SelectTrigger id="currency" className="h-11 rounded-xl px-4 border-border hover:border-muted-foreground/30 focus:ring-2 focus:ring-ring">
                      <SelectValue>
                        {selectedCurrency ? `${selectedCurrency.symbol} ${selectedCurrency.code}` : 'Select currency'}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {currencies.map((currency) => (
                        <SelectItem key={currency.code} value={currency.code} className="rounded-lg">
                          {currency.symbol} {currency.name} ({currency.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {formData.rate_per_day && selectedCurrency && (
                <p className="text-xs text-muted-foreground">
                  Display: {selectedCurrency.symbol}{formData.rate_per_day} per day
                </p>
              )}
            </CardContent>
          </Card>

          {/* Section 5: Location */}
          <Card className="rounded-xl border border-border focus-within:ring-2 focus-within:ring-ring/20 transition-shadow" aria-labelledby="location-title">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-[18px] h-[18px] text-primary" />
                <h3 id="location-title" className="text-sm font-semibold text-foreground">Location</h3>
              </div>
              <LocationAutocomplete
                value={formData.location}
                onChange={(value) => setFormData({ ...formData, location: value })}
                placeholder="Search for your location..."
                onLocationSelect={(loc) => setFormData({ ...formData, location: loc.display_name })}
                className="h-11 rounded-xl"
              />
            </CardContent>
          </Card>

          {/* Section 6: About You */}
          <Card className="rounded-xl border border-border focus-within:ring-2 focus-within:ring-ring/20 transition-shadow" aria-labelledby="about-title">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-[18px] h-[18px] text-primary" />
                <h3 id="about-title" className="text-sm font-semibold text-foreground">About You</h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="bio" className="text-sm font-medium text-foreground sr-only">Bio</Label>
                  <span className="text-xs text-muted-foreground ml-auto">{formData.bio.length}/500</span>
                </div>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value.slice(0, 500) })}
                  placeholder="Tell pet owners about yourself, your experience, and why you love caring for pets..."
                  maxLength={500}
                  rows={4}
                  className="min-h-[120px] max-h-[200px] rounded-xl px-4 py-3 border-border hover:border-muted-foreground/30 focus:ring-2 focus:ring-ring focus:border-primary transition-colors resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Section 7: Profile Active */}
          <Card className="rounded-xl border border-border focus-within:ring-2 focus-within:ring-ring/20 transition-shadow" aria-labelledby="status-title">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Power className="w-[18px] h-[18px] text-primary" />
                  </div>
                  <div>
                    <h3 id="status-title" className="text-sm font-semibold text-foreground">Profile Active</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formData.is_active ? 'Your profile is visible to pet owners' : 'Your profile is hidden'}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  className="min-h-[44px] min-w-[44px] data-[state=checked]:bg-primary"
                  aria-label="Toggle profile visibility"
                />
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Sticky Footer */}
        <div className="sticky bottom-0 z-20 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 border-t border-border px-4 sm:px-5 py-3 flex-shrink-0">
          <div className="flex flex-col sm:flex-row sm:justify-end gap-2">
            <Button 
              variant="ghost" 
              onClick={() => setIsOpen(false)}
              disabled={loading}
              className="h-11 w-full sm:w-auto px-5 text-muted-foreground hover:text-foreground hover:bg-muted focus:ring-2 focus:ring-ring rounded-xl font-medium order-2 sm:order-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={loading}
              className="h-11 w-full sm:w-auto px-6 bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-2 focus:ring-ring rounded-xl font-medium order-1 sm:order-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SitterProfileSettings;
