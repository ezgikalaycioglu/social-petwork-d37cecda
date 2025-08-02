
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useSecurity } from '@/hooks/useSecurity';
import { LocationAutocomplete } from '@/components/LocationAutocomplete';
import { Building2, ChevronDown, Check } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';
import { 
  validateBusinessProfile, 
  sanitizeInput, 
  APPROVED_BUSINESS_CATEGORIES,
  INPUT_LIMITS
} from '@/utils/validation';

// International phone codes
const COUNTRY_CODES = [
  { code: '+1', country: 'US/Canada', flag: '🇺🇸' },
  { code: '+44', country: 'United Kingdom', flag: '🇬🇧' },
  { code: '+33', country: 'France', flag: '🇫🇷' },
  { code: '+49', country: 'Germany', flag: '🇩🇪' },
  { code: '+34', country: 'Spain', flag: '🇪🇸' },
  { code: '+39', country: 'Italy', flag: '🇮🇹' },
  { code: '+31', country: 'Netherlands', flag: '🇳🇱' },
  { code: '+46', country: 'Sweden', flag: '🇸🇪' },
  { code: '+47', country: 'Norway', flag: '🇳🇴' },
  { code: '+45', country: 'Denmark', flag: '🇩🇰' },
  { code: '+41', country: 'Switzerland', flag: '🇨🇭' },
  { code: '+43', country: 'Austria', flag: '🇦🇹' },
  { code: '+32', country: 'Belgium', flag: '🇧🇪' },
  { code: '+351', country: 'Portugal', flag: '🇵🇹' },
  { code: '+353', country: 'Ireland', flag: '🇮🇪' },
  { code: '+358', country: 'Finland', flag: '🇫🇮' },
  { code: '+7', country: 'Russia', flag: '🇷🇺' },
  { code: '+48', country: 'Poland', flag: '🇵🇱' },
  { code: '+420', country: 'Czech Republic', flag: '🇨🇿' },
  { code: '+36', country: 'Hungary', flag: '🇭🇺' },
  { code: '+30', country: 'Greece', flag: '🇬🇷' },
  { code: '+90', country: 'Turkey', flag: '🇹🇷' },
  { code: '+86', country: 'China', flag: '🇨🇳' },
  { code: '+81', country: 'Japan', flag: '🇯🇵' },
  { code: '+82', country: 'South Korea', flag: '🇰🇷' },
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+61', country: 'Australia', flag: '🇦🇺' },
  { code: '+64', country: 'New Zealand', flag: '🇳🇿' },
  { code: '+27', country: 'South Africa', flag: '🇿🇦' },
  { code: '+55', country: 'Brazil', flag: '🇧🇷' },
  { code: '+52', country: 'Mexico', flag: '🇲🇽' },
  { code: '+54', country: 'Argentina', flag: '🇦🇷' },
  { code: '+56', country: 'Chile', flag: '🇨🇱' },
  { code: '+57', country: 'Colombia', flag: '🇨🇴' },
  { code: '+51', country: 'Peru', flag: '🇵🇪' },
  { code: '+971', country: 'UAE', flag: '🇦🇪' },
  { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦' },
  { code: '+972', country: 'Israel', flag: '🇮🇱' },
  { code: '+20', country: 'Egypt', flag: '🇪🇬' },
  { code: '+234', country: 'Nigeria', flag: '🇳🇬' },
  { code: '+254', country: 'Kenya', flag: '🇰🇪' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬' },
  { code: '+60', country: 'Malaysia', flag: '🇲🇾' },
  { code: '+66', country: 'Thailand', flag: '🇹🇭' },
  { code: '+84', country: 'Vietnam', flag: '🇻🇳' },
  { code: '+63', country: 'Philippines', flag: '🇵🇭' },
  { code: '+62', country: 'Indonesia', flag: '🇮🇩' },
  { code: '+93', country: 'Afghanistan', flag: '🇦🇫' },
  { code: '+355', country: 'Albania', flag: '🇦🇱' },
  { code: '+244', country: 'Angola', flag: '🇦🇴' },
  { code: '+1264', country: 'Anguilla', flag: '🇦🇮' },
  { code: '+376', country: 'Andorra', flag: '🇦🇩' },
  { code: '+297', country: 'Aruba', flag: '🇦🇼' },
];

type BusinessProfile = Tables<'business_profiles'>;

interface BusinessProfileFormProps {
  profile?: BusinessProfile | null;
  onClose: () => void;
  onSave: (profile: BusinessProfile) => void;
}

const BusinessProfileForm: React.FC<BusinessProfileFormProps> = ({ profile, onClose, onSave }) => {
  const { toast } = useToast();
  const { checkRateLimit, logSecurityEvent, generateCSRFToken } = useSecurity();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    business_name: profile?.business_name || '',
    email: profile?.email || '',
    address: profile?.address || '',
    business_category: profile?.business_category || '',
    description: profile?.description || '',
    phone: profile?.phone || '',
    website: profile?.website || '',
  });
  
  const [phoneCode, setPhoneCode] = useState('+1');
  const [phoneCodeOpen, setPhoneCodeOpen] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    let sanitizedValue = sanitizeInput(value);
    
    // For website field, remove any http:// or https:// prefix since we prepend https://
    if (field === 'website') {
      sanitizedValue = sanitizedValue.replace(/^https?:\/\//, '');
      // Ensure website starts with www. if it doesn't already have it and it's not empty
      if (sanitizedValue && !sanitizedValue.startsWith('www.')) {
        sanitizedValue = `www.${sanitizedValue}`;
      }
    }
    
    setFormData(prev => ({ ...prev, [field]: sanitizedValue }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Perform comprehensive validation
    const validation = validateBusinessProfile(formData);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      toast({
        title: "Validation Error",
        description: "Please fix the errors below and try again.",
        variant: "destructive",
      });
      return;
    }

    // Check rate limiting for business profile creation/updates
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const rateLimitCheck = await checkRateLimit(user.id, {
      action: 'business_profile_update',
      maxAttempts: 3,
      windowMinutes: 10
    });

    if (!rateLimitCheck.allowed) {
      await logSecurityEvent({
        event_type: 'rate_limit_exceeded',
        user_id: user.id,
        details: { action: 'business_profile_update' },
        severity: 'medium'
      });
      
      toast({
        title: "Too many attempts",
        description: "Please wait before trying again.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const businessData = {
        user_id: user.id,
        ...formData,
        // Store the complete phone number with country code
        phone: formData.phone ? `${phoneCode} ${formData.phone}` : '',
        // Store the complete website URL
        website: formData.website ? `https://${formData.website}` : '',
      };

      let result;
      if (profile) {
        // Update existing profile
        result = await supabase
          .from('business_profiles')
          .update(businessData)
          .eq('id', profile.id)
          .select()
          .single();
      } else {
        // Create new profile
        result = await supabase
          .from('business_profiles')
          .insert(businessData)
          .select()
          .single();
      }

      if (result.error) throw result.error;

      toast({
        title: "Success",
        description: profile ? "Business profile updated successfully!" : "Business profile created successfully!",
      });

      onSave(result.data);
    } catch (error) {
      console.error('Error saving business profile:', error);
      toast({
        title: "Error",
        description: "Failed to save business profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-green-600" />
            {profile ? 'Edit Business Profile' : 'Create Business Profile'}
          </DialogTitle>
          <DialogDescription>
            {profile ? 'Update your business information' : 'Set up your business profile to start offering deals'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="business_name">Business Name *</Label>
              <Input
                id="business_name"
                value={formData.business_name}
                onChange={(e) => handleInputChange('business_name', e.target.value)}
                placeholder="Pawsome Pet Services"
                maxLength={INPUT_LIMITS.BUSINESS_NAME.max}
                required
                className={errors.business_name ? 'border-red-500' : ''}
              />
              {errors.business_name && (
                <p className="text-sm text-red-500 mt-1">{errors.business_name}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {formData.business_name.length}/{INPUT_LIMITS.BUSINESS_NAME.max} characters
              </p>
            </div>

            <div>
              <Label htmlFor="email">Business Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="contact@pawsome.com"
                maxLength={INPUT_LIMITS.EMAIL.max}
                required
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">{errors.email}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {formData.email.length}/{INPUT_LIMITS.EMAIL.max} characters
              </p>
            </div>

            <div>
              <Label htmlFor="business_category">Business Category *</Label>
              <Select
                value={formData.business_category}
                onValueChange={(value) => handleInputChange('business_category', value)}
              >
                <SelectTrigger className={errors.business_category ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select your business category" />
                </SelectTrigger>
                <SelectContent>
                  {APPROVED_BUSINESS_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.business_category && (
                <p className="text-sm text-red-500 mt-1">{errors.business_category}</p>
              )}
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <LocationAutocomplete
                value={formData.address}
                onChange={(value) => handleInputChange('address', value)}
                placeholder="Enter business address"
                className={errors.address ? 'border-red-500' : ''}
                onLocationSelect={(location) => {
                  // Store the full address with coordinates for future use
                  console.log('Selected business location:', location);
                }}
              />
              {errors.address && (
                <p className="text-sm text-red-500 mt-1">{errors.address}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {formData.address.length}/{INPUT_LIMITS.ADDRESS.max} characters
              </p>
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <div className="flex gap-2">
                <Popover open={phoneCodeOpen} onOpenChange={setPhoneCodeOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={phoneCodeOpen}
                      className="w-32 justify-between"
                    >
                      {phoneCode ? (
                        <span className="flex items-center gap-2">
                          <span>{COUNTRY_CODES.find(country => country.code === phoneCode)?.flag}</span>
                          <span>{phoneCode}</span>
                        </span>
                      ) : (
                        "Select..."
                      )}
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-0">
                    <Command>
                      <CommandInput placeholder="Search country code..." />
                      <CommandList className="max-h-60">
                        <CommandEmpty>No country code found.</CommandEmpty>
                        <CommandGroup>
                          {COUNTRY_CODES.map((country) => (
                            <CommandItem
                              key={country.code}
                              value={`${country.code} ${country.country}`}
                              onSelect={() => {
                                setPhoneCode(country.code);
                                setPhoneCodeOpen(false);
                              }}
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${
                                  phoneCode === country.code ? "opacity-100" : "opacity-0"
                                }`}
                              />
                              <span className="flex items-center gap-2">
                                <span>{country.flag}</span>
                                <span>{country.code}</span>
                                <span className="text-muted-foreground">({country.country})</span>
                              </span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="555-123-4567"
                  maxLength={INPUT_LIMITS.PHONE.max}
                  className={`flex-1 ${errors.phone ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.phone && (
                <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                International format: {phoneCode} {formData.phone} ({formData.phone.length}/{INPUT_LIMITS.PHONE.max} characters)
              </p>
            </div>

            <div>
              <Label htmlFor="website">Website</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">
                  https://
                </span>
                <Input
                  id="website"
                  type="text"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="example.com or www.example.com"
                  maxLength={INPUT_LIMITS.WEBSITE.max}
                  className={`pl-20 ${errors.website ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.website && (
                <p className="text-sm text-red-500 mt-1">{errors.website}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Full URL: https://{formData.website} ({formData.website.length}/{INPUT_LIMITS.WEBSITE.max} characters)
              </p>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Tell customers about your business..."
                rows={3}
                maxLength={INPUT_LIMITS.DESCRIPTION.max}
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && (
                <p className="text-sm text-red-500 mt-1">{errors.description}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {formData.description.length}/{INPUT_LIMITS.DESCRIPTION.max} characters
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {loading ? 'Saving...' : (profile ? 'Update Profile' : 'Create Profile')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BusinessProfileForm;
