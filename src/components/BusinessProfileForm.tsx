
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useSecurity } from '@/hooks/useSecurity';
import { LocationAutocomplete } from '@/components/LocationAutocomplete';
import { Building2 } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';
import { 
  validateBusinessProfile, 
  sanitizeInput, 
  APPROVED_BUSINESS_CATEGORIES,
  INPUT_LIMITS
} from '@/utils/validation';

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

  const handleInputChange = (field: string, value: string) => {
    const sanitizedValue = sanitizeInput(value);
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
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="(555) 123-4567"
                maxLength={INPUT_LIMITS.PHONE.max}
                className={errors.phone ? 'border-red-500' : ''}
              />
              {errors.phone && (
                <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {formData.phone.length}/{INPUT_LIMITS.PHONE.max} characters
              </p>
            </div>

            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="https://www.pawsome.com"
                maxLength={INPUT_LIMITS.WEBSITE.max}
                className={errors.website ? 'border-red-500' : ''}
              />
              {errors.website && (
                <p className="text-sm text-red-500 mt-1">{errors.website}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {formData.website.length}/{INPUT_LIMITS.WEBSITE.max} characters
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
