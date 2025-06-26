
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Gift } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';
import { 
  validateDealTitle, 
  validateDealDescription, 
  validateDealTerms, 
  sanitizeInput, 
  INPUT_LIMITS 
} from '@/utils/validation';

type BusinessProfile = Tables<'business_profiles'>;
type Deal = Tables<'deals'>;

interface CreateDealModalProps {
  businessProfile: BusinessProfile;
  onClose: () => void;
  onCreated: (deal: Deal) => void;
}

const CreateDealModal: React.FC<CreateDealModalProps> = ({ businessProfile, onClose, onCreated }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    terms: '',
    discount_percentage: '',
    discount_amount: '',
    valid_until: '',
    max_redemptions: '',
    is_active: true,
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    if (typeof value === 'string') {
      const sanitizedValue = sanitizeInput(value);
      setFormData(prev => ({ ...prev, [field]: sanitizedValue }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Title validation
    const titleValidation = validateDealTitle(formData.title);
    if (!titleValidation.isValid) {
      newErrors.title = titleValidation.error!;
    }

    // Description validation
    const descriptionValidation = validateDealDescription(formData.description);
    if (!descriptionValidation.isValid) {
      newErrors.description = descriptionValidation.error!;
    }

    // Terms validation
    const termsValidation = validateDealTerms(formData.terms);
    if (!termsValidation.isValid) {
      newErrors.terms = termsValidation.error!;
    }

    // Discount validation
    if (!formData.discount_percentage && !formData.discount_amount) {
      newErrors.discount = "Please specify either a percentage or amount discount.";
    }

    // Percentage validation
    if (formData.discount_percentage) {
      const percentage = parseInt(formData.discount_percentage);
      if (isNaN(percentage) || percentage < 1 || percentage > 100) {
        newErrors.discount_percentage = "Discount percentage must be between 1 and 100.";
      }
    }

    // Amount validation
    if (formData.discount_amount) {
      const amount = parseFloat(formData.discount_amount);
      if (isNaN(amount) || amount <= 0) {
        newErrors.discount_amount = "Discount amount must be greater than 0.";
      }
    }

    // Max redemptions validation
    if (formData.max_redemptions) {
      const maxRedemptions = parseInt(formData.max_redemptions);
      if (isNaN(maxRedemptions) || maxRedemptions < 1) {
        newErrors.max_redemptions = "Max redemptions must be a positive number.";
      }
    }

    // Valid until validation
    if (formData.valid_until) {
      const selectedDate = new Date(formData.valid_until);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.valid_until = "Valid until date must be in the future.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors below and try again.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const dealData = {
        business_id: businessProfile.id,
        title: formData.title,
        description: formData.description,
        terms: formData.terms || null,
        discount_percentage: formData.discount_percentage ? parseInt(formData.discount_percentage) : null,
        discount_amount: formData.discount_amount ? parseFloat(formData.discount_amount) : null,
        valid_until: formData.valid_until || null,
        max_redemptions: formData.max_redemptions ? parseInt(formData.max_redemptions) : null,
        is_active: formData.is_active,
      };

      const { data, error } = await supabase
        .from('deals')
        .insert(dealData)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Deal Created!",
        description: "Your deal is now live and available to pet owners.",
      });

      onCreated(data);
    } catch (error) {
      console.error('Error creating deal:', error);
      toast({
        title: "Error",
        description: "Failed to create deal. Please try again.",
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
            <Gift className="w-5 h-5 text-green-600" />
            Create New Deal
          </DialogTitle>
          <DialogDescription>
            Create an exclusive offer for pet owners in your area
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Deal Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="20% Off First Grooming Session"
              maxLength={INPUT_LIMITS.DEAL_TITLE.max}
              required
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className="text-sm text-red-500 mt-1">{errors.title}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              {formData.title.length}/{INPUT_LIMITS.DEAL_TITLE.max} characters
            </p>
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe your offer in detail..."
              rows={3}
              maxLength={INPUT_LIMITS.DEAL_DESCRIPTION.max}
              required
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p className="text-sm text-red-500 mt-1">{errors.description}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              {formData.description.length}/{INPUT_LIMITS.DEAL_DESCRIPTION.max} characters
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="discount_percentage">Discount %</Label>
              <Input
                id="discount_percentage"
                type="number"
                min="1"
                max="100"
                value={formData.discount_percentage}
                onChange={(e) => handleInputChange('discount_percentage', e.target.value)}
                placeholder="20"
                className={errors.discount_percentage ? 'border-red-500' : ''}
              />
              {errors.discount_percentage && (
                <p className="text-sm text-red-500 mt-1">{errors.discount_percentage}</p>
              )}
            </div>

            <div>
              <Label htmlFor="discount_amount">Discount Amount ($)</Label>
              <Input
                id="discount_amount"
                type="number"
                min="0"
                step="0.01"
                value={formData.discount_amount}
                onChange={(e) => handleInputChange('discount_amount', e.target.value)}
                placeholder="15.00"
                className={errors.discount_amount ? 'border-red-500' : ''}
              />
              {errors.discount_amount && (
                <p className="text-sm text-red-500 mt-1">{errors.discount_amount}</p>
              )}
            </div>
          </div>

          {errors.discount && (
            <p className="text-sm text-red-500">{errors.discount}</p>
          )}

          <div>
            <Label htmlFor="terms">Terms & Conditions</Label>
            <Textarea
              id="terms"
              value={formData.terms}
              onChange={(e) => handleInputChange('terms', e.target.value)}
              placeholder="Valid for new customers only. Cannot be combined with other offers."
              rows={2}
              maxLength={INPUT_LIMITS.DEAL_TERMS.max}
              className={errors.terms ? 'border-red-500' : ''}
            />
            {errors.terms && (
              <p className="text-sm text-red-500 mt-1">{errors.terms}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              {formData.terms.length}/{INPUT_LIMITS.DEAL_TERMS.max} characters
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="valid_until">Valid Until (Optional)</Label>
              <Input
                id="valid_until"
                type="date"
                value={formData.valid_until}
                onChange={(e) => handleInputChange('valid_until', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className={errors.valid_until ? 'border-red-500' : ''}
              />
              {errors.valid_until && (
                <p className="text-sm text-red-500 mt-1">{errors.valid_until}</p>
              )}
            </div>

            <div>
              <Label htmlFor="max_redemptions">Max Redemptions</Label>
              <Input
                id="max_redemptions"
                type="number"
                min="1"
                value={formData.max_redemptions}
                onChange={(e) => handleInputChange('max_redemptions', e.target.value)}
                placeholder="100"
                className={errors.max_redemptions ? 'border-red-500' : ''}
              />
              {errors.max_redemptions && (
                <p className="text-sm text-red-500 mt-1">{errors.max_redemptions}</p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => handleInputChange('is_active', checked)}
            />
            <Label htmlFor="is_active">Make deal active immediately</Label>
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
              {loading ? 'Creating...' : 'Create Deal'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateDealModal;
